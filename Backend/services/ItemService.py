# Backend/services/ItemService.py

from typing import Dict, Any, Optional, Tuple
from ..models.item import Item
from ..models import session
from ..models.character import CharacterInventory
from ..constants import ITEM_TYPES, PACK_DEFINITIONS


class ItemService:

    @classmethod
    def new(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new item.
        Returns: {"success": bool, "error"?: str, "data"?: {"id": int, "name": str}}
        """
        # Validate input
        is_valid, error_msg = cls._validate_item_data(data)
        if not is_valid:
            return {"success": False, "error": error_msg}

        # Check for duplicate name
        if cls.get_by_name(data['name']):
            return {
                "success": False,
                "error": f"An item with the name '{data['name']}' already exists."
            }

        try:
            new_item = Item()
            for key, value in data.items():
                if hasattr(new_item, key):
                    setattr(new_item, key, value)
                else:
                    return {"success": False, "error": f"Invalid field: {key}"}
            
            session.add(new_item)
            session.commit()

            return {
                "success": True,
                "data": {
                    "id": new_item.id,
                    "name": new_item.name,
                    "message": "Item created successfully."
                }
            }

        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Database error: {str(e)}"}

    @classmethod
    def update(cls, name: str, **kwargs) -> Dict[str, Any]:
        item = cls.get_by_name(name)
        if not item:
            return {"success": False, "error": "Item not found."}

        # Validate item_type if being updated
        if 'item_type' in kwargs:
            if kwargs['item_type'] not in ITEM_TYPES:
                return {
                    "success": False,
                    "error": f"Invalid item type: '{kwargs['item_type']}'. Must be one of: {', '.join(sorted(ITEM_TYPES))}"
                }

        try:
            for key, value in kwargs.items():
                if hasattr(item, key):
                    setattr(item, key, value)
                else:
                    return {"success": False, "error": f"Invalid field: {key}"}
            session.commit()
            return {"success": True, "message": "Item updated successfully.", "id": item.id}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Update failed: {str(e)}"}

    @classmethod
    def get_by_id(cls, id: int) -> Optional[Item]:
        return session.query(Item).filter_by(id=id).first()

    @classmethod
    def get_by_name(cls, name: str) -> Optional[Item]:
        return session.query(Item).filter_by(name=name).first()

    @classmethod
    def delete(cls, id: int) -> Dict[str, Any]:
        item = cls.get_by_id(id)
        if not item:
            return {"success": False, "error": "Item not found."}

        try:
            session.delete(item)
            session.commit()
            return {"success": True, "message": "Item deleted successfully."}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Deletion failed: {str(e)}"}

    @classmethod
    def get_all(cls):
        return session.query(Item).all()

    @classmethod
    def _validate_item_data(cls, data: Dict[str, Any]) -> Tuple[bool, str]:
        # Required fields
        if 'name' not in data or not data['name'].strip():
            return False, "Item name is required and cannot be empty."

        if 'item_type' not in data:
            return False, "Item type is required."

        if data['item_type'] not in ITEM_TYPES:
            return False, f"Invalid item type: '{data['item_type']}'. Must be one of: {', '.join(sorted(ITEM_TYPES))}"

        return True, ""
    
    @classmethod
    def add_pack_to_character(cls, char_id: int, pack_name: str) -> dict:
        """Expands a predefined pack into individual inventory entries."""
        if pack_name not in PACK_DEFINITIONS:
            return {"success": False, "error": f"Unknown pack: {pack_name}"}
        
        try:
            for item_name, qty in PACK_DEFINITIONS[pack_name]:
                item = session.query(Item).filter_by(name=item_name).first()
                if not item:
                    return {"success": False, "error": f"Item '{item_name}' missing"}
                
                # Reuse add_item_to_character logic if possible
                cls._add_or_update_inventory(char_id, item.id, qty)
            
            session.commit()
            return {"success": True, "message": f"{pack_name} added"}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": str(e)}

    # Helper (private)
    @classmethod
    def _add_or_update_inventory(cls, char_id, item_id, quantity):
        existing = session.query(CharacterInventory).filter_by(
            characterID=char_id, itemID=item_id
        ).first()
        if existing:
            existing.quantity += quantity
        else:
            session.add(CharacterInventory(
                characterID=char_id,
                itemID=item_id,
                quantity=quantity
            ))