from typing import Dict, Any, Optional
from ..models.dndclass import DnDclass
from ..models import session


class ClassService:
    """
    Service layer for DnD Class CRUD operations.
    Follows consistent return pattern: {"success": bool, "data"/"error"/"message": ...}
    """
    
    @classmethod
    def new(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new DnD class."""
        is_valid, error_msg = cls._validate_class_data(data)
        if not is_valid:
            return {"success": False, "error": error_msg}
        
        if cls.get_by_name(data['name']):
            return {
                "success": False,
                "error": f"A class with the name '{data['name']}' already exists."
            }
        
        try:
            new_class = DnDclass()
            for key, value in data.items():
                if hasattr(new_class, key):
                    setattr(new_class, key, value)
                else:
                    return {"success": False, "error": f"Invalid field: {key}"}
            
            session.add(new_class)
            session.commit()
            
            return {
                "success": True,
                "data": {
                    "id": new_class.id,
                    "name": new_class.name,
                    "message": "Class created successfully."
                }
            }
        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Database error: {str(e)}"}
    
    @classmethod
    def update(cls, id: int, **kwargs) -> Dict[str, Any]:
        """Update an existing DnD class."""
        dnd_class = cls.get_by_id(id)
        if not dnd_class:
            return {"success": False, "error": "Class not found."}
        
        try:
            for key, value in kwargs.items():
                if hasattr(dnd_class, key):
                    setattr(dnd_class, key, value)
                else:
                    return {"success": False, "error": f"Invalid field: {key}"}
            session.commit()
            return {"success": True, "message": "Class updated successfully.", "id": dnd_class.id}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Update failed: {str(e)}"}
    
    @classmethod
    def get_by_id(cls, id: int) -> Optional[DnDclass]:
        """Retrieve a class by ID."""
        return session.query(DnDclass).filter_by(id=id).first()
    
    @classmethod
    def get_by_name(cls, name: str) -> Optional[DnDclass]:
        """Retrieve a class by name."""
        return session.query(DnDclass).filter_by(name=name).first()
    
    @classmethod
    def delete(cls, id: int) -> Dict[str, Any]:
        """Delete a class by ID."""
        dnd_class = cls.get_by_id(id)
        if not dnd_class:
            return {"success": False, "error": "Class not found."}
        
        try:
            session.delete(dnd_class)
            session.commit()
            return {"success": True, "message": "Class deleted successfully."}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Deletion failed: {str(e)}"}

    @classmethod
    def get_all(cls):
        """Retrieve all classes."""
        return session.query(DnDclass).all()
    
    @classmethod
    def _validate_class_data(cls, data: Dict[str, Any]) -> tuple[bool, str]:
        """Validate class data before creation."""
        if 'name' not in data:
            return False, "Missing required field: name"
        
        if not data['name'] or not str(data['name']).strip():
            return False, "Field 'name' cannot be empty."
        
        # Validate hit_dice if present
        if 'hit_dice' in data:
            if not isinstance(data['hit_dice'], int) or data['hit_dice'] < 4 or data['hit_dice'] > 12:
                return False, "Hit dice must be an integer between 4 and 12."
        
        return True, ""

