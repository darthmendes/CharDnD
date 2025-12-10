from typing import Dict, Any, Optional
from ..models.species import Species
from ..models import session  


class SpeciesService:
    """
    Service layer for Species CRUD operations.
    Follows consistent return pattern: {"success": bool, "data"/"error"/"message": ...}
    """
    
    @classmethod
    def new(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new species."""
        is_valid, error_msg = cls._validate_species_data(data)
        if not is_valid:
            return {"success": False, "error": error_msg}
        
        if cls.get_by_name(data['name']):
            return {
                "success": False,
                "error": f"A species with the name '{data['name']}' already exists."
            }
        
        try:
            new_spec = Species()
            for key, value in data.items():
                if hasattr(new_spec, key):
                    setattr(new_spec, key, value)
                else:
                    return {"success": False, "error": f"Invalid field: {key}"}
            
            session.add(new_spec)
            session.commit()
            
            return {
                "success": True,
                "data": {
                    "id": new_spec.id,
                    "name": new_spec.name,
                    "message": "Species created successfully."
                }
            }
        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Database error: {str(e)}"}
    
    @classmethod
    def update(cls, id: int, **kwargs) -> Dict[str, Any]:
        """Update an existing species."""
        species = cls.get_by_id(id)
        if not species:
            return {"success": False, "error": "Species not found."}
        
        try:
            for key, value in kwargs.items():
                if hasattr(species, key):
                    setattr(species, key, value)
                else:
                    return {"success": False, "error": f"Invalid field: {key}"}
            session.commit()
            return {"success": True, "message": "Species updated successfully.", "id": species.id}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Update failed: {str(e)}"}
    
    @classmethod
    def get_by_id(cls, id: int) -> Optional[Species]:
        """Retrieve a species by ID."""
        return session.query(Species).filter_by(id=id).first()
    
    @classmethod
    def get_by_name(cls, name: str) -> Optional[Species]:
        """Retrieve a species by name."""
        return session.query(Species).filter_by(name=name).first()
    
    @classmethod
    def delete(cls, id: int) -> Dict[str, Any]:
        """Delete a species by ID."""
        species = cls.get_by_id(id)
        if not species:
            return {"success": False, "error": "Species not found."}
        
        try:
            session.delete(species)
            session.commit()
            return {"success": True, "message": "Species deleted successfully."}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Deletion failed: {str(e)}"}

    @classmethod
    def get_all(cls):
        """Retrieve all species."""
        return session.query(Species).all()
    
    @classmethod
    def _validate_species_data(cls, data: Dict[str, Any]) -> tuple[bool, str]:
        """Validate species data before creation."""
        if 'name' not in data:
            return False, "Missing required field: name"
        
        if not data['name'] or not str(data['name']).strip():
            return False, "Field 'name' cannot be empty."
        
        # Speed is optional in some cases, but validate if present
        if 'speed' in data and data['speed'] is not None:
            if not isinstance(data['speed'], int) or data['speed'] < 0:
                return False, "Speed must be a non-negative integer."
        
        return True, ""
