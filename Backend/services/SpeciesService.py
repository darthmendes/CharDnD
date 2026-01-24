# Backend/services/SpeciesService.py

from typing import Dict, Any, Optional, List
from ..models.species import Species, Subspecies, SpeciesTraits
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
            valid_fields = {
                'name', 'ability_bonuses', 'ability_choices',
                'size', 'age_adulthood', 'lifespan', 'alignment_tendency',
                'movement', 'ignore_heavy_armor_speed_penalty', 'darkvision'
            }
            for key in valid_fields:
                if key in data:
                    setattr(new_spec, key, data[key])
            
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
    def new_subspecies(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new subspecies."""
        required = ['name', 'species_id']
        for field in required:
            if field not in data or not data[field]:
                return {"success": False, "error": f"Missing required field: {field}"}
        
        parent = session.query(Species).get(data['species_id'])
        if not parent:
            return {"success": False, "error": "Parent species not found."}
        
        existing = session.query(Subspecies).filter_by(
            species_id=data['species_id'],
            name=data['name']
        ).first()
        if existing:
            return {"success": False, "error": f"Subspecies '{data['name']}' already exists for this species."}
        
        try:
            new_sub = Subspecies()
            valid_fields = {
                'name', 'species_id',
                'ability_bonuses', 'ability_choices',
                'movement', 'darkvision', 'hp_bonus_per_level'
            }
            for key in valid_fields:
                if key in data:
                    setattr(new_sub, key, data[key])
            
            session.add(new_sub)
            session.commit()
            
            return {
                "success": True,
                "data": {
                    "id": new_sub.id,
                    "name": new_sub.name,
                    "message": "Subspecies created successfully."
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
            valid_fields = {
                'name', 'ability_bonuses', 'ability_choices',
                'size', 'age_adulthood', 'lifespan', 'alignment_tendency',
                'movement', 'ignore_heavy_armor_speed_penalty', 'darkvision'
            }
            for key, value in kwargs.items():
                if key in valid_fields:
                    setattr(species, key, value)
            session.commit()
            return {"success": True, "message": "Species updated successfully.", "id": species.id}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Update failed: {str(e)}"}

    @classmethod
    def update_subspecies(cls, id: int, **kwargs) -> Dict[str, Any]:
        """Update an existing subspecies."""
        sub = session.query(Subspecies).get(id)
        if not sub:
            return {"success": False, "error": "Subspecies not found."}
        
        try:
            valid_fields = {
                'name', 'ability_bonuses', 'ability_choices',
                'movement', 'darkvision', 'hp_bonus_per_level'
            }
            for key, value in kwargs.items():
                if key in valid_fields:
                    setattr(sub, key, value)
            session.commit()
            return {"success": True, "message": "Subspecies updated successfully.", "id": sub.id}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Update failed: {str(e)}"}

    @classmethod
    def get_by_id(cls, id: int) -> Optional[Species]:
        """Retrieve a species by ID (with subspecies and traits loaded)."""
        from sqlalchemy.orm import joinedload, selectinload
        return session.query(Species).options(
            joinedload(Species.subspecies).selectinload(Subspecies.traits).joinedload(SpeciesTraits.features),
            joinedload(Species.traits).joinedload(SpeciesTraits.features)
        ).filter_by(id=id).first()

    @classmethod
    def get_by_name(cls, name: str) -> Optional[Species]:
        """Retrieve a species by name (with subspecies and traits loaded)."""
        from sqlalchemy.orm import joinedload, selectinload
        return session.query(Species).options(
            joinedload(Species.subspecies).selectinload(Subspecies.traits).joinedload(SpeciesTraits.features),
            joinedload(Species.traits).joinedload(SpeciesTraits.features)
        ).filter_by(name=name).first()

    @classmethod
    def get_subspecies_by_id(cls, id: int) -> Optional[Subspecies]:
        """Retrieve a subspecies by ID."""
        return session.query(Subspecies).get(id)

    @classmethod
    def delete(cls, id: int) -> Dict[str, Any]:
        """Delete a species by ID (and its subspecies)."""
        species = cls.get_by_id(id)
        if not species:
            return {"success": False, "error": "Species not found."}
        
        try:
            session.query(Subspecies).filter_by(species_id=id).delete()
            session.delete(species)
            session.commit()
            return {"success": True, "message": "Species deleted successfully."}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Deletion failed: {str(e)}"}

    @classmethod
    def delete_subspecies(cls, id: int) -> Dict[str, Any]:
        """Delete a subspecies by ID."""
        sub = cls.get_subspecies_by_id(id)
        if not sub:
            return {"success": False, "error": "Subspecies not found."}
        
        try:
            session.delete(sub)
            session.commit()
            return {"success": True, "message": "Subspecies deleted successfully."}
        except Exception as e:
            session.rollback()
            return {"success": False, "error": f"Deletion failed: {str(e)}"}

    @classmethod
    def get_all(cls):
        from sqlalchemy.orm import joinedload, selectinload
        return session.query(Species).options(
            joinedload(Species.subspecies).selectinload(Subspecies.traits).joinedload(SpeciesTraits.features),
            joinedload(Species.traits).joinedload(SpeciesTraits.features)
        ).all()

    @classmethod
    def _validate_species_data(cls, data: Dict[str, Any]) -> tuple[bool, str]:
        """Validate species data before creation."""
        if 'name' not in data or not str(data['name']).strip():
            return False, "Field 'name' is required and cannot be empty."
        
        # Validate ability_bonuses
        if 'ability_bonuses' in data:
            if not isinstance(data['ability_bonuses'], dict):
                return False, "ability_bonuses must be a dictionary."
            for key, val in data['ability_bonuses'].items():
                if key not in {'STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'}:
                    return False, f"Invalid ability score key: {key}"
                if not isinstance(val, int) or val < 0:
                    return False, f"Ability bonus for {key} must be a non-negative integer."

        # Validate ability_choices
        if 'ability_choices' in data:
            if not isinstance(data['ability_choices'], list):
                return False, "ability_choices must be a list."
            for choice in data['ability_choices']:
                if not isinstance(choice, dict):
                    return False, "Each ability choice must be a dictionary."
                if 'n_choices' not in choice or 'bonus' not in choice or 'options' not in choice:
                    return False, "Each ability choice must have 'n_choices', 'bonus', and 'options'."
                if not isinstance(choice['n_choices'], int) or choice['n_choices'] <= 0:
                    return False, "'n_choices' must be a positive integer."
                if not isinstance(choice['bonus'], int) or choice['bonus'] <= 0:
                    return False, "'bonus' must be a positive integer."
                if not isinstance(choice['options'], list):
                    return False, "'options' must be a list of ability scores."
                for opt in choice['options']:
                    if opt not in {'STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'}:
                        return False, f"Invalid ability score in options: {opt}"

        # Validate movement
        if 'movement' in data:
            if not isinstance(data['movement'], dict):
                return False, "movement must be a dictionary (e.g., {'walk': 30})."
            for move_type, speed in data['movement'].items():
                if not isinstance(speed, int) or speed < 0:
                    return False, f"Movement speed for '{move_type}' must be a non-negative integer."

        # Validate darkvision
        if 'darkvision' in data:
            if not isinstance(data['darkvision'], int) or data['darkvision'] < 0:
                return False, "darkvision must be a non-negative integer (feet)."

        # Validate age/lifespan
        if 'age_adulthood' in data:
            if not isinstance(data['age_adulthood'], int) or data['age_adulthood'] < 0:
                return False, "age_adulthood must be a non-negative integer."
        if 'lifespan' in data:
            if not isinstance(data['lifespan'], int) or data['lifespan'] < 0:
                return False, "lifespan must be a non-negative integer."

        return True, ""