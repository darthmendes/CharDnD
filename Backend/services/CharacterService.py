from typing import Dict, Any, Optional, Tuple
from ..models.character import Character, CharacterClass
from ..models.species import Species
from ..models.dndclass import DnDclass
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

        dnd_class_obj = session.query(DnDclass).filter_by(name=data['char_class']).first()
        if not dnd_class_obj:
            return {"success": False, "error": f"Class '{data['char_class']}' not found."}

        try:
            # Create and add Character
            new_char = Character()
            new_char.name = data['name']
            new_char.species = species_obj
            new_char.level = data['level']
            new_char.abilityScores = data['abilityScores']
            
            session.add(new_char)
            session.flush()  # Assigns ID without committing

            # Create CharacterClass association
            character_class = CharacterClass(
                characterID=new_char.id,
                classID=dnd_class_obj.id,
                level=new_char.level
            )
            session.add(character_class)

            session.commit()

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
    def get_by_id(cls, id: int) -> Optional[Character]:
        return session.query(Character).filter_by(id=id).first()

    @classmethod
    def get_by_name(cls, name: str) -> Optional[Character]:
        return session.query(Character).filter_by(name=name).first()

    @classmethod
    def get_all(cls):
        return session.query(Character).all()

    @classmethod
    def update(cls, id: int, **kwargs) -> Dict[str, Any]:
        char = cls.get_by_id(id)
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
        char = cls.get_by_id(id)
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
        required_fields = ['name', 'species', 'char_class', 'level', 'abilityScores']
        for field in required_fields:
            if field not in data:
                return False, f"Missing required field: {field}"
            if not data[field]:  # Handles empty string, None, etc.
                return False, f"Field '{field}' cannot be empty."

        # Validate level
        if not isinstance(data['level'], int):
            return False, "Level must be an integer."
        if not (1 <= data['level'] <= 20):
            return False, "Level must be between 1 and 20."

        # Validate abilityScores
        valid, msg = cls._validate_ability_scores(data['abilityScores'])
        if not valid:
            return False, msg

        return True, ""

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