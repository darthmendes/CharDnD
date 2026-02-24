# Backend/services/ItemService.py

from typing import Dict, Any, Optional, Tuple
from ..models.item import Item
from ..models.character import CharacterInventory
from ..models import session
from ..constants import ITEM_TYPES, PACK_DEFINITIONS


class ItemService:

    @classmethod
    def new(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        is_valid, error_msg = cls._validate_item_data(data)
        if not is_valid:
            return {"success": False, "error": error_msg}

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
        if 'name' not in data or not data['name'].strip():
            return False, "Item name is required and cannot be empty."

        if 'item_type' not in data:
            return False, "Item type is required."

        if data['item_type'] not in ITEM_TYPES:
            return False, f"Invalid item type: '{data['item_type']}'. Must be one of: {', '.join(sorted(ITEM_TYPES))}"

        return True, ""

    # [RESTORED] Add item without character validation
    @classmethod
    def add_item_to_character(cls, char_id: int, item_id: int, quantity: int = 1) -> Dict[str, Any]:
        try:
            cls._add_or_update_inventory(char_id, item_id, quantity)
            session.commit()
            return {"success": True, "message": "Item added to inventory."}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Failed to add item: {str(e)}"}

    # [RESTORED] Add pack without character validation
    @classmethod
    def add_pack_to_character(cls, char_id: int, pack_name: str) -> Dict[str, Any]:
        if pack_name not in PACK_DEFINITIONS:
            return {"success": False, "error": f"Unknown pack: {pack_name}"}
        
        try:
            for item_name, qty in PACK_DEFINITIONS[pack_name]:
                item = session.query(Item).filter_by(name=item_name).first()
                if not item:
                    return {"success": False, "error": f"Required item '{item_name}' not found in database."}
                cls._add_or_update_inventory(char_id, item.id, qty)
            
            session.commit()
            return {"success": True, "message": f"{pack_name} added to inventory."}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": str(e)}

    @classmethod
    def _add_or_update_inventory(cls, char_id: int, item_id: int, quantity: int) -> None:
        existing = session.query(CharacterInventory).filter_by(
            characterID=char_id,
            itemID=item_id
        ).first()
        if existing:
            existing.quantity += quantity
        else:
            inv_entry = CharacterInventory(
                characterID=char_id,
                itemID=item_id,
                quantity=quantity
            )
            # Set initial charges if item has max_charges
            item = cls.get_by_id(item_id)
            if item and item.max_charges:
                inv_entry.current_charges = item.max_charges
            session.add(inv_entry)

    # ✅ NEW: Delete inventory item
    @classmethod
    def delete_inventory_item(cls, inventory_id: int, char_id: int) -> Dict[str, Any]:
        try:
            inv_entry = session.query(CharacterInventory).filter_by(
                id=inventory_id,
                characterID=char_id
            ).first()
            if not inv_entry:
                return {"success": False, "error": "Inventory item not found"}
            session.delete(inv_entry)
            session.commit()
            return {"success": True, "message": "Item deleted from inventory"}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Failed to delete item: {str(e)}"}

    # ✅ NEW: Update item charges
    @classmethod
    def update_item_charges(cls, inventory_id: int, char_id: int, new_charges: int) -> Dict[str, Any]:
        try:
            inv_entry = session.query(CharacterInventory).filter_by(
                id=inventory_id,
                characterID=char_id
            ).first()
            if not inv_entry:
                return {"success": False, "error": "Inventory item not found"}
            
            # Validate charges don't exceed max
            item = inv_entry.item
            if item.max_charges and new_charges > item.max_charges:
                return {"success": False, "error": f"Charges cannot exceed {item.max_charges}"}
            
            inv_entry.current_charges = max(0, new_charges)
            session.commit()
            return {"success": True, "message": "Charges updated"}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Failed to update charges: {str(e)}"}

    # ✅ NEW: Remove one item from inventory
    @classmethod
    def remove_one_item(cls, inventory_id: int, char_id: int) -> Dict[str, Any]:
        try:
            inv_entry = session.query(CharacterInventory).filter_by(
                id=inventory_id,
                characterID=char_id
            ).first()
            if not inv_entry:
                return {"success": False, "error": "Inventory item not found"}
            
            if inv_entry.quantity > 1:
                inv_entry.quantity -= 1
                session.commit()
                return {"success": True, "message": "Item quantity decreased by 1"}
            else:
                # If quantity is 1, delete the entire entry
                session.delete(inv_entry)
                session.commit()
                return {"success": True, "message": "Item removed from inventory"}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Failed to remove item: {str(e)}"}

    # ✅ NEW: Equip armor/shield item
    @classmethod
    def equip_item(cls, inventory_id: int, char_id: int) -> Dict[str, Any]:
        try:
            inv_entry = session.query(CharacterInventory).filter_by(
                id=inventory_id,
                characterID=char_id
            ).first()
            if not inv_entry:
                return {"success": False, "error": "Inventory item not found"}
            
            item = inv_entry.item
            if item.item_type != "Armor":
                return {"success": False, "error": "Only armor items can be equipped"}
            
            # Get item category to determine slot type
            item_category = item.item_category or ""
            
            # Unequip conflicting items based on armor type
            if "Shield" in item_category:
                # Unequip any other shields
                conflicting = session.query(CharacterInventory).join(Item).filter(
                    CharacterInventory.characterID == char_id,
                    CharacterInventory.is_equipped == True,
                    Item.item_category.contains("Shield")
                ).all()
            else:
                # Unequip any other armor (but not shields)
                conflicting = session.query(CharacterInventory).join(Item).filter(
                    CharacterInventory.characterID == char_id,
                    CharacterInventory.is_equipped == True,
                    ~Item.item_category.contains("Shield"),
                    Item.item_type == "Armor"
                ).all()
            
            for conflict in conflicting:
                conflict.is_equipped = False
            
            # Equip the new item
            inv_entry.is_equipped = True
            session.commit()
            return {"success": True, "message": f"{item.name} equipped"}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Failed to equip item: {str(e)}"}

    # ✅ NEW: Unequip armor/shield item
    @classmethod
    def unequip_item(cls, inventory_id: int, char_id: int) -> Dict[str, Any]:
        try:
            inv_entry = session.query(CharacterInventory).filter_by(
                id=inventory_id,
                characterID=char_id
            ).first()
            if not inv_entry:
                return {"success": False, "error": "Inventory item not found"}
            
            inv_entry.is_equipped = False
            session.commit()
            return {"success": True, "message": f"{inv_entry.item.name} unequipped"}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Failed to unequip item: {str(e)}"}