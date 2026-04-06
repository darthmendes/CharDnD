# Backend/services/SpellService.py
from Backend.models import session
from Backend.models.character import Character, CharacterClass, CharacterSpell
from Backend.models.spells import Spell
from typing import List
from .CharacterService import CharacterService

class SpellService:
    # ✅ PHB Multiclass Spellcaster Table
    MULTICLASS_SLOT_TABLE = {
        1:  {1: 2},
        2:  {1: 3},
        3:  {1: 4, 2: 2},
        4:  {1: 4, 2: 3},
        5:  {1: 4, 2: 3, 3: 2},
        6:  {1: 4, 2: 3, 3: 3},
        7:  {1: 4, 2: 3, 3: 3, 4: 1},
        8:  {1: 4, 2: 3, 3: 3, 4: 2},
        9:  {1: 4, 2: 3, 3: 3, 4: 3, 5: 1},
        10: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2},
        11: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1},
        12: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1},
        13: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1},
        14: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1},
        15: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1},
        16: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1},
        17: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1},
        18: {1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1},
        19: {1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1},
        20: {1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1}
    }
    @classmethod
    def get_all_spells(cls) -> List[Spell]:
        """Get all available spells."""
        return session.query(Spell).all()
    
    @staticmethod
    def calculate_spellcaster_level(classes: list) -> int:
        """
        Calculate total spellcaster level for multiclass characters.
        
        Rules:
        - Full casters (Bard, Cleric, Druid, Sorcerer, Wizard): 100%
        - Half casters (Paladin, Ranger): 50% (rounded down)
        - Third casters (Eldritch Knight, Arcane Trickster): 33% (rounded down)
        """
        full_casters = ['bard', 'cleric', 'druid', 'sorcerer', 'wizard']
        half_casters = ['paladin', 'ranger']
        third_casters = ['eldritch knight', 'arcane trickster']
        
        total = 0
        
        for cls in classes:
            class_name = cls.get('className', '').lower()
            level = cls.get('level', 0)
            subclass = cls.get('subclass', '').lower()
            
            if class_name in full_casters:
                total += level
            elif class_name in half_casters:
                total += level // 2
            elif class_name in ['fighter', 'rogue']:
                # Only count if they have the right subclass
                if subclass in third_casters:
                    total += level // 3
        
        return min(total, 20)  # Cap at 20
    
    @staticmethod
    def get_spell_slots(spellcaster_level: int) -> dict:
        """Get spell slots for a given spellcaster level."""
        if spellcaster_level < 1:
            return {}
        return SpellService.MULTICLASS_SLOT_TABLE.get(spellcaster_level, {})
    
    @staticmethod
    def calculate_spell_dc(character: dict, spellcasting_ability: str) -> int:
        """Calculate spell save DC: 8 + proficiency + ability modifier"""
        ability_score = character.get('abilityScores', {}).get(spellcasting_ability, 10)
        ability_modifier = (ability_score - 10) // 2
        proficiency_bonus = CharacterService.get_proficiency_bonus(character.get('level', 1))
        
        return 8 + proficiency_bonus + ability_modifier
    
    @staticmethod
    def calculate_spell_attack_bonus(character: dict, spellcasting_ability: str) -> int:
        """Calculate spell attack bonus: proficiency + ability modifier"""
        ability_score = character.get('abilityScores', {}).get(spellcasting_ability, 10)
        ability_modifier = (ability_score - 10) // 2
        proficiency_bonus = CharacterService.get_proficiency_bonus(character.get('level', 1))
        
        return proficiency_bonus + ability_modifier
    
    
    @staticmethod
    def get_spellcasting_ability(classes: list) -> str:
        """Determine primary spellcasting ability from classes."""
        ability_map = {
            'wizard': 'int',
            'cleric': 'wis',
            'druid': 'wis',
            'sorcerer': 'cha',
            'bard': 'cha',
            'paladin': 'cha',
            'ranger': 'wis',
            'warlock': 'cha'
        }
        
        # Return first spellcasting class's ability
        for cls in classes:
            class_name = cls.get('className', '').lower()
            if class_name in ability_map:
                return ability_map[class_name]
        
        return 'int'  # Default
    
    # ✅ Database operations
    @staticmethod
    def get_character_spell_slots(charID: int) -> dict:
        """Get character's spell slots with all calculations."""
        char = session.query(Character).filter_by(id=charID).first()
        if not char:
            return {"success": False, "error": "Character not found"}
        
        try:
            # Get all class levels
            classes = session.query(CharacterClass).filter_by(characterID=charID).all()
            classes_data = [{'className': c.dndclass.name, 'level': c.level, 'subclass': c.subclass} for c in classes]
            
            # Calculate spellcaster level
            spellcaster_level = SpellService.calculate_spellcaster_level(classes_data)
            
            # Get spell slots
            spell_slots = SpellService.get_spell_slots(spellcaster_level)
            
            # Get or initialize expended slots
            expended = char.spell_slots_expended or {str(k): 0 for k in spell_slots.keys()}
            
            # Calculate remaining
            remaining = {k: v - expended.get(str(k), 0) for k, v in spell_slots.items()}
            
            # Get spellcasting ability
            spellcasting_ability = SpellService.get_spellcasting_ability(classes_data)
            
            # Calculate DC and attack bonus
            spell_dc = SpellService.calculate_spell_dc(char.to_dict(), spellcasting_ability)
            spell_attack = SpellService.calculate_spell_attack_bonus(char.to_dict(), spellcasting_ability)
            
            return {
                "success": True,
                "data": {
                    'spell_slots': spell_slots,
                    'spell_slots_expended': expended,
                    'spell_slots_remaining': remaining,
                    'spellcaster_level': spellcaster_level,
                    'spellcasting_ability': spellcasting_ability,
                    'spell_save_dc': spell_dc,
                    'spell_attack_bonus': spell_attack
                }
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def update_expended_slots(charID: int, level: int, amount: int) -> dict:
        """Update expended spell slots."""
        try:
            char = session.query(Character).filter_by(id=charID).first()
            if not char:
                return {"success": False, "error": "Character not found"}
            
            level_str = str(level)
            
            # Initialize if needed
            if not char.spell_slots_expended:
                char.spell_slots_expended = {}
            
            # Update expended
            current = char.spell_slots_expended.get(level_str, 0)
            char.spell_slots_expended[level_str] = max(0, current + amount)
            
            session.commit()
            return {"success": True, "data": char.spell_slots_expended}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def get_character_spells(charID: int) -> dict:
        """Get all spells known by character."""
        try:
            spells = session.query(CharacterSpell).filter_by(characterID=charID).all()
            return {
                "success": True,
                "data": [s.to_dict() for s in spells]
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def add_spell_to_character(charID: int, spell_data: dict) -> dict:
        """Add a spell to character's known spells."""
        try:
            if 'spellID' not in spell_data:
                return {"success": False, "error": "Missing spellID"}
            
            # Verify spell exists
            spell = session.query(Spell).filter_by(id=spell_data['spellID']).first()
            if not spell:
                return {"success": False, "error": "Spell not found"}
            
            # Create character spell entry
            char_spell = CharacterSpell(
                characterID=charID,
                spellID=spell_data['spellID'],
                source=spell_data.get('source', 'class'),
                source_name=spell_data.get('source_name', ''),
                is_prepared=spell_data.get('is_prepared', False),
                always_prepared=spell_data.get('always_prepared', False)
            )
            
            session.add(char_spell)
            session.commit()
            
            return {"success": True, "data": char_spell.to_dict()}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def add_spells_bulk_to_character(charID: int, spell_ids: list, is_prepared: bool = True) -> dict:
        """Add multiple spells to character at once (much faster than one-by-one)."""
        try:
            if not spell_ids:
                return {"success": True, "data": [], "message": "No spells to add"}
            
            # Verify all spells exist
            spells = session.query(Spell).filter(Spell.id.in_(spell_ids)).all()
            if len(spells) != len(spell_ids):
                return {"success": False, "error": "One or more spells not found"}
            
            # Create all character spell entries at once
            char_spells = [
                CharacterSpell(
                    characterID=charID,
                    spellID=spell_id,
                    source='class',
                    source_name='',
                    is_prepared=is_prepared,  # Allow caller to specify prepared status
                    always_prepared=False
                )
                for spell_id in spell_ids
            ]
            
            # Bulk add and commit once
            session.add_all(char_spells)
            session.commit()
            
            return {"success": True, "data": [cs.to_dict() for cs in char_spells], "count": len(char_spells)}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def toggle_spell_prepared(charID: int, spellID: int) -> dict:
        """Toggle whether a spell is prepared."""
        try:
            char_spell = session.query(CharacterSpell).filter_by(
                characterID=charID,
                spellID=spellID
            ).first()
            
            if not char_spell:
                return {"success": False, "error": "Spell not found on character"}
            
            char_spell.is_prepared = not char_spell.is_prepared
            session.commit()
            
            return {"success": True, "data": {"is_prepared": char_spell.is_prepared}}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def calculate_prepare_limit(charID: int) -> dict:
        """
        Calculate spell prepare limit based on D&D 5e rules by class.
        
        Rules by class:
        - Cleric: Wisdom Mod + Cleric Level
        - Druid: Wisdom Mod + Druid Level
        - Paladin: Charisma Mod + Paladin Level / 2 (rounded down)
        - Ranger: Wisdom Mod + Ranger Level / 2 (rounded down)
        - Monk: Intelligence Mod + Monk Level / 2 (rounded down)
        - Artificer: Intelligence Mod + Artificer Level / 2 (rounded down)
        - Wizard: Intelligence Mod + Wizard Level (can prepare all known)
        - Bard, Sorcerer, Warlock: No limit (all known are prepared)
        """
        try:
            character = session.query(Character).filter_by(id=charID).first()
            if not character:
                return {"success": False, "error": "Character not found"}
            
            classes = session.query(CharacterClass).filter_by(characterID=charID).all()
            prepared_count = 0
            prepare_limit = None
            prepare_ability = None
            primary_spellcasting_class = None
            
            ability_scores = character.abilityScores or {}
            
            for char_class in classes:
                class_name = char_class.dndclass.name.lower()
                class_level = char_class.level
                
                # Classes with fixed prepare limits
                if class_name == 'cleric':
                    wis_mod = (ability_scores.get('wis', 10) - 10) // 2
                    limit = max(1, wis_mod + class_level)
                    prepare_limit = limit
                    prepare_ability = 'wis'
                    primary_spellcasting_class = 'Cleric'
                    
                elif class_name == 'druid':
                    wis_mod = (ability_scores.get('wis', 10) - 10) // 2
                    limit = max(1, wis_mod + class_level)
                    prepare_limit = limit
                    prepare_ability = 'wis'
                    primary_spellcasting_class = 'Druid'
                    
                elif class_name == 'paladin':
                    cha_mod = (ability_scores.get('cha', 10) - 10) // 2
                    limit = max(1, cha_mod + (class_level // 2))
                    prepare_limit = limit
                    prepare_ability = 'cha'
                    primary_spellcasting_class = 'Paladin'
                    
                elif class_name == 'ranger':
                    wis_mod = (ability_scores.get('wis', 10) - 10) // 2
                    limit = max(1, wis_mod + (class_level // 2))
                    prepare_limit = limit
                    prepare_ability = 'wis'
                    primary_spellcasting_class = 'Ranger'
                    
                elif class_name == 'monk':
                    int_mod = (ability_scores.get('int', 10) - 10) // 2
                    limit = max(0, int_mod + (class_level // 2))
                    prepare_limit = limit
                    prepare_ability = 'int'
                    primary_spellcasting_class = 'Monk'
                    
                elif class_name == 'artificer':
                    int_mod = (ability_scores.get('int', 10) - 10) // 2
                    limit = max(1, int_mod + (class_level // 2))
                    prepare_limit = limit
                    prepare_ability = 'int'
                    primary_spellcasting_class = 'Artificer'
                    
                elif class_name == 'wizard':
                    int_mod = (ability_scores.get('int', 10) - 10) // 2
                    limit = max(1, int_mod + class_level)
                    prepare_limit = limit
                    prepare_ability = 'int'
                    primary_spellcasting_class = 'Wizard'
                    
                elif class_name in ['bard', 'sorcerer', 'warlock']:
                    # No limit - all known spells are prepared
                    prepare_limit = float('inf')
                    primary_spellcasting_class = class_name.title()
            
            # Count currently prepared spells (EXCLUDE CANTRIPS)
            prepared_spells = session.query(CharacterSpell).filter(
                CharacterSpell.characterID == charID,
                CharacterSpell.is_prepared == True
            ).all()
            
            # Filter out cantrips from the count
            spell_ids = [cs.spellID for cs in prepared_spells]
            non_cantrip_spells = session.query(Spell).filter(
                Spell.id.in_(spell_ids),
                Spell.level > 0  # Exclude cantrips (level 0)
            ).all()
            prepared_count = len(non_cantrip_spells) if spell_ids else 0
            
            return {
                "success": True,
                "prepare_limit": prepare_limit if prepare_limit != float('inf') else None,
                "prepared_count": prepared_count,
                "prepare_ability": prepare_ability,
                "primary_spellcasting_class": primary_spellcasting_class,
                "unlimited": prepare_limit == float('inf')
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
        
