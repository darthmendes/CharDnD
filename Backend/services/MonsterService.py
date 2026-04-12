# Backend/services/MonsterService.py
from typing import Dict, Any, Optional, Tuple, List
from ..models.monster import Monster
from ..models import session

# Define constants locally (or import from ..constants if you prefer)
MONSTER_SIZES = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan']
MONSTER_TYPES = [
    'Aberration', 'Beast', 'Celestial', 'Construct', 'Dragon', 'Elemental',
    'Fey', 'Fiend', 'Giant', 'Humanoid', 'Monstrosity', 'Ooze', 'Plant', 'Undead'
]

class MonsterService:

    @classmethod
    def new(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        is_valid, error_msg = cls._validate_monster_data(data)
        if not is_valid:
            return {"success": False, "error": error_msg}

        if cls.get_by_name(data['name']):
            return {
                "success": False,
                "error": f"A monster with the name '{data['name']}' already exists."
            }

        try:
            new_monster = Monster()
            for key, value in data.items():
                if hasattr(new_monster, key):
                    setattr(new_monster, key, value)
                else:
                    return {"success": False, "error": f"Invalid field: {key}"}
            
            session.add(new_monster)
            session.commit()

            return {
                "success": True,
                "data": {
                    "id": new_monster.id,
                    "name": new_monster.name,
                    "message": "Monster created successfully."
                }
            }

        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Database error: {str(e)}"}

    @classmethod
    def update(cls, name: str, **kwargs) -> Dict[str, Any]:
        monster = cls.get_by_name(name)
        if not monster:
            return {"success": False, "error": "Monster not found."}

        if 'creature_type' in kwargs and kwargs['creature_type'] not in MONSTER_TYPES:
            return {
                "success": False,
                "error": f"Invalid monster type: '{kwargs['creature_type']}'. Must be one of: {', '.join(sorted(MONSTER_TYPES))}"
            }

        try:
            for key, value in kwargs.items():
                if hasattr(monster, key):
                    setattr(monster, key, value)
                else:
                    return {"success": False, "error": f"Invalid field: {key}"}
            session.commit()
            return {"success": True, "message": "Monster updated successfully.", "id": monster.id}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Update failed: {str(e)}"}

    @classmethod
    def get_byID(cls, id: int) -> Optional[Monster]:
        return session.query(Monster).filter_by(id=id).first()

    @classmethod
    def get_by_name(cls, name: str) -> Optional[Monster]:
        return session.query(Monster).filter_by(name=name).first()

    @classmethod
    def delete(cls, id: int) -> Dict[str, Any]:
        monster = cls.get_byID(id)
        if not monster:
            return {"success": False, "error": "Monster not found."}

        try:
            session.delete(monster)
            session.commit()
            return {"success": True, "message": "Monster deleted successfully."}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Deletion failed: {str(e)}"}

    @classmethod
    def get_all(cls) -> List[Monster]:
        return session.query(Monster).all()

    @classmethod
    def _validate_monster_data(cls, data: Dict[str, Any]) -> Tuple[bool, str]:
        if 'name' not in data or not data['name'].strip():
            return False, "Monster name is required and cannot be empty."
        if 'size' not in data:
            return False, "Monster size is required."
        if 'creature_type' not in data:
            return False, "Monster type is required."
        if data['size'] not in MONSTER_SIZES:
            return False, f"Invalid size: '{data['size']}'"
        if data['creature_type'] not in MONSTER_TYPES:
            return False, f"Invalid type: '{data['creature_type']}'"

        actions = data.get('actions')
        if actions is not None:
            if not isinstance(actions, dict):
                return False, "Actions must be a JSON object."
            
            valid_types = ['actions', 'bonus_actions', 'legendary_actions', 'reactions']
            for action_type in valid_types:
                action_list = actions.get(action_type, [])
                if not isinstance(action_list, list):
                    return False, f"'{action_type}' must be an array."
                for i, action in enumerate(action_list):
                    if not isinstance(action, dict) or not action.get('name', '').strip():
                        return False, f"Action #{i+1} in '{action_type}' requires a 'name'."

        return True, ""