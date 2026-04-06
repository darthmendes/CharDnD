from typing import Dict, Any, Optional, Tuple
from ..models.character import Character, CharacterClass
from ..models.species import Species
from ..models.dndclass import DnDclass, ClassSpell
from ..models.background import Background  # ✅ Add this import
from ..models import session


class CharacterService:
    
    @classmethod
    def new(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Creates a new character.
        Returns a result dict with 'success' (bool) and optional 'data' or 'error'.
        """
        # Validate input structure
        is_valid, error_msg = cls._validate_character_data(data)
        if not is_valid:
            return {"success": False, "error": error_msg}

        # Check for duplicate name
        if cls.get_by_name(data['name']):
            return {
                "success": False,
                "error": f"A character with the name '{data['name']}' already exists."
            }

        # Fetch related entities
        species_obj = session.query(Species).filter_by(name=data['species']).first()
        if not species_obj:
            return {"success": False, "error": f"Species '{data['species']}' not found."}

        # Handle background
        background_obj = None
        if data.get('background'):
            background_obj = session.query(Background).filter_by(name=data['background']).first()
            if not background_obj:
                return {"success": False, "error": f"Background '{data['background']}' not found."}

        try:
            # Create and add Character
            new_char = Character()
            new_char.name = data['name']
            new_char.species = species_obj
            new_char.background = background_obj
            new_char.level = data['level']
            new_char.abilityScores = data['abilityScores']
            
            # ✅ NEW FIELDS
            new_char.subspecies = data.get('subspecies')
            new_char.proficient_skills = data.get('proficientSkills', [])
            new_char.proficient_weapons = data.get('proficientWeapons', [])
            new_char.proficient_tools = data.get('proficientTools', [])
            new_char.known_languages = data.get('knownLanguages', [])
            new_char.hit_points = data.get('hitPoints')
            
            session.add(new_char)
            session.flush()  # Assigns ID without committing

            # ✅ Handle MULTICLASS - create CharacterClass associations
            classes_data = data.get('classes', [])
            if classes_data:
                for cls_data in classes_data:
                    dnd_class_obj = session.query(DnDclass).filter_by(name=cls_data['className']).first()
                    if not dnd_class_obj:
                        return {"success": False, "error": f"Class '{cls_data['className']}' not found."}
                    
                    character_class = CharacterClass(
                        characterID=new_char.id,
                        classID=dnd_class_obj.id,
                        level=cls_data['level'],
                        subclass=cls_data.get('subclass', '')
                    )
                    session.add(character_class)
            else:
                # Handle single class (backward compatibility)
                dnd_class_obj = session.query(DnDclass).filter_by(name=data['char_class']).first()
                if not dnd_class_obj:
                    return {"success": False, "error": f"Class '{data['char_class']}' not found."}
                
                character_class = CharacterClass(
                    characterID=new_char.id,
                    classID=dnd_class_obj.id,
                    level=new_char.level
                )
                session.add(character_class)

            session.commit()

            # ✅ NEW: Add equipment items to character inventory after creation
            equipment = data.get('equipment', [])
            if equipment:
                from .ItemService import ItemService
                for item_data in equipment:
                    if 'id' in item_data:
                        # Item from database
                        ItemService.add_item_to_character(
                            new_char.id,
                            item_data['id'],
                            item_data.get('quantity', 1)
                        )
                    elif 'name' in item_data:
                        # Try to find item by name
                        from ..models.item import Item
                        item_obj = session.query(Item).filter_by(name=item_data['name']).first()
                        if item_obj:
                            ItemService.add_item_to_character(
                                new_char.id,
                                item_obj.id,
                                item_data.get('quantity', 1)
                            )

            # ✅ Auto-add class spells as KNOWN but UNPREPARED (user must prepare them manually)
            # Only add spells that character level qualifies for, exclude cantrips
            auto_spell_classes = ['Cleric', 'Druid']
            classes_to_load = [c for c in classes_data if c['className'] in auto_spell_classes] if classes_data else []
            
            if classes_to_load:
                from .SpellService import SpellService
                from ..models.spells import Spell
                
                spell_ids_to_add = set()
                for cls_data in classes_to_load:
                    # Get all spells for this class via ClassSpell junction table
                    class_obj = session.query(DnDclass).filter_by(name=cls_data['className']).first()
                    if class_obj:
                        class_level = cls_data.get('level', 1)
                        # Filter by: min_level <= character level AND spell level > 0 (exclude cantrips)
                        class_spells = session.query(ClassSpell).filter(
                            ClassSpell.classID == class_obj.id,
                            ClassSpell.min_level <= class_level
                        ).all()
                        for cs in class_spells:
                            # Check spell level to exclude cantrips
                            spell = session.query(Spell).filter_by(id=cs.spellID).first()
                            if spell and spell.level > 0:  # Only add non-cantrip spells
                                spell_ids_to_add.add(cs.spellID)
                
                # Add all spells as KNOWN but UNPREPARED (is_prepared=False)
                if spell_ids_to_add:
                    SpellService.add_spells_bulk_to_character(new_char.id, list(spell_ids_to_add), is_prepared=False)

            return {
                "success": True,
                "data": {
                    "id": new_char.id,
                    "name": new_char.name,
                    "message": "Character created successfully."
                }
            }

        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Database error: {str(e)}"}

    @classmethod
    def get_byID(cls, id: int) -> Optional[Character]:
        return session.query(Character).filter_by(id=id).first()

    @classmethod
    def get_by_name(cls, name: str) -> Optional[Character]:
        return session.query(Character).filter_by(name=name).first()

    @classmethod
    def get_all(cls):
        return session.query(Character).all()

    @classmethod
    def update(cls, id: int, **kwargs) -> Dict[str, Any]:
        char = cls.get_byID(id)
        if not char:
            return {"success": False, "error": "Character not found."}

        # Optional: validate updates (e.g., abilityScores format if included)
        if 'abilityScores' in kwargs:
            valid, msg = cls._validate_ability_scores(kwargs['abilityScores'])
            if not valid:
                return {"success": False, "error": msg}

        try:
            for key, value in kwargs.items():
                if hasattr(char, key):
                    setattr(char, key, value)
                else:
                    return {"success": False, "error": f"Invalid field: {key}"}
            session.commit()
            return {"success": True, "message": "Character updated successfully."}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Update failed: {str(e)}"}

    @classmethod
    def delete(cls, id: int) -> Dict[str, Any]:
        char = cls.get_byID(id)
        if not char:
            return {"success": False, "error": "Character not found."}

        try:
            session.delete(char)
            session.commit()
            return {"success": True, "message": "Character deleted successfully."}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Deletion failed: {str(e)}"}

    # --- Validation Helpers ---

    @classmethod
    def _validate_character_data(cls, data: Dict[str, Any]) -> Tuple[bool, str]:
        # Check if it's multiclass or single class
        if 'classes' in data and data['classes']:
            # Multiclass validation
            required_fields = ['name', 'species', 'classes', 'abilityScores']
        else:
            # Single class validation (backward compatibility)
            required_fields = ['name', 'species', 'char_class', 'level', 'abilityScores']
        
        for field in required_fields:
            if field not in data:
                return False, f"Missing required field: {field}"
            if not data[field]:  # Handles empty string, None, etc.
                return False, f"Field '{field}' cannot be empty."

        # Validate abilityScores
        valid, msg = cls._validate_ability_scores(data['abilityScores'])
        if not valid:
            return False, msg

        # Validate multiclass data if present
        if 'classes' in data and data['classes']:
            if not isinstance(data['classes'], list):
                return False, "Classes must be an array."
            if len(data['classes']) == 0:
                return False, "At least one class is required."
            
            total_level = 0
            for cls in data['classes']:
                if 'className' not in cls or 'level' not in cls:
                    return False, "Each class must have 'className' and 'level'."
                if not isinstance(cls['level'], int) or cls['level'] < 1:
                    return False, "Class level must be a positive integer."
                total_level += cls['level']
            
            if total_level > 20:
                return False, "Total character level cannot exceed 20."

        return True, ""

    # ✅ Character-level utilities (used by multiple services)
    @staticmethod
    def get_proficiency_bonus(level: int) -> int:
        """Get proficiency bonus based on total character level."""
        if level <= 4:
            return 2
        elif level <= 8:
            return 3
        elif level <= 12:
            return 4
        elif level <= 16:
            return 5
        else:
            return 6
    
    @classmethod
    def _validate_ability_scores(cls, scores: Any) -> Tuple[bool, str]:
        if not isinstance(scores, dict):
            return False, "Ability scores must be a dictionary."

        required_abilities = {"str", "dex", "con", "int", "wis", "cha"}
        if set(scores.keys()) != required_abilities:
            return False, f"Ability scores must contain exactly: {sorted(required_abilities)}"

        for ability, value in scores.items():
            if not isinstance(value, int):
                return False, f"Ability score '{ability}' must be an integer."
            if not (1 <= value <= 30):
                return False, f"Ability score '{ability}' must be between 1 and 30."

        return True, ""