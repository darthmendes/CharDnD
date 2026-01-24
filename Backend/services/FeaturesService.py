# Backend/services/FeaturesService.py

import logging
from typing import Dict, Any, Optional, List, Tuple
from sqlalchemy.exc import SQLAlchemyError
from ..models.features import Features, FeatureLevel
from ..models import session

__all__ = [
    'FeaturesService',
]

logger = logging.getLogger(__name__)


class FeaturesService:
    """
    Service layer for Features CRUD operations.
    Follows consistent return pattern: {"success": bool, "data"/"error"/"message": ...}
    """

    @classmethod
    def new(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new feature."""
        is_valid, error_msg = cls._validate_feature_data(data)
        if not is_valid:
            return {"success": False, "error": error_msg}
        
        if cls.get_by_name(data['name']):
            return {
                "success": False,
                "error": f"A feature with the name '{data['name']}' already exists."
            }
        
        try:
            new_feature = Features()
            valid_fields = {'name', 'desc', 'properties'}
            for key in valid_fields:
                if key in data:
                    setattr(new_feature, key, data[key])
            
            session.add(new_feature)
            session.commit()
            
            return {
                "success": True,
                "data": {
                    "id": new_feature.id,
                    "name": new_feature.name,
                    "message": "Feature created successfully."
                }
            }
        except SQLAlchemyError as e:
            session.rollback()
            logger.error(f"Database error creating feature: {str(e)}")
            return {"success": False, "error": f"Database error: {str(e)}"}
        except Exception as e:
            session.rollback()
            logger.error(f"Unexpected error creating feature: {str(e)}")
            return {"success": False, "error": f"Unexpected error: {str(e)}"}

    @classmethod
    def new_feature_level(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a feature level for a feature."""
        required = ['featureID', 'level']
        for field in required:
            if field not in data or data[field] is None:
                return {"success": False, "error": f"Missing required field: {field}"}
        
        # Validate feature exists
        feature = session.query(Features).get(data['featureID'])
        if not feature:
            return {"success": False, "error": "Feature not found."}
        
        try:
            new_level = FeatureLevel()
            valid_fields = {'featureID', 'level', 'attributes'}
            for key in valid_fields:
                if key in data:
                    setattr(new_level, key, data[key])
            
            session.add(new_level)
            session.commit()
            
            return {
                "success": True,
                "data": {
                    "id": new_level.id,
                    "level": new_level.level,
                    "message": "Feature level created successfully."
                }
            }
        except SQLAlchemyError as e:
            session.rollback()
            logger.error(f"Database error creating feature level: {str(e)}")
            return {"success": False, "error": f"Database error: {str(e)}"}
        except Exception as e:
            session.rollback()
            logger.error(f"Unexpected error creating feature level: {str(e)}")
            return {"success": False, "error": f"Unexpected error: {str(e)}"}

    @classmethod
    def get_by_id(cls, id: int) -> Optional[Features]:
        """Retrieve a feature by ID (with levels loaded)."""
        from sqlalchemy.orm import joinedload
        return session.query(Features).options(
            joinedload(Features.featureLevels)
        ).filter_by(id=id).first()

    @classmethod
    def get_by_name(cls, name: str) -> Optional[Features]:
        """Retrieve a feature by name (with levels loaded)."""
        from sqlalchemy.orm import joinedload
        return session.query(Features).options(
            joinedload(Features.featureLevels)
        ).filter_by(name=name).first()

    @classmethod
    def get_feature_level(cls, id: int) -> Optional[FeatureLevel]:
        """Retrieve a feature level by ID."""
        return session.query(FeatureLevel).get(id)

    @classmethod
    def delete(cls, id: int) -> Dict[str, Any]:
        """Delete a feature by ID (and its levels)."""
        feature = cls.get_by_id(id)
        if not feature:
            return {"success": False, "error": "Feature not found."}
        
        try:
            # Delete feature levels first
            session.query(FeatureLevel).filter_by(featureID=id).delete()
            session.delete(feature)
            session.commit()
            return {"success": True, "message": "Feature deleted successfully."}
        except SQLAlchemyError as e:
            session.rollback()
            logger.error(f"Database error deleting feature {id}: {str(e)}")
            return {"success": False, "error": f"Deletion failed: {str(e)}"}
        except Exception as e:
            session.rollback()
            logger.error(f"Unexpected error deleting feature {id}: {str(e)}")
            return {"success": False, "error": f"Unexpected error: {str(e)}"}

    @classmethod
    def delete_feature_level(cls, id: int) -> Dict[str, Any]:
        """Delete a feature level by ID."""
        level = cls.get_feature_level(id)
        if not level:
            return {"success": False, "error": "Feature level not found."}
        
        try:
            session.delete(level)
            session.commit()
            return {"success": True, "message": "Feature level deleted successfully."}
        except SQLAlchemyError as e:
            session.rollback()
            logger.error(f"Database error deleting feature level {id}: {str(e)}")
            return {"success": False, "error": f"Deletion failed: {str(e)}"}
        except Exception as e:
            session.rollback()
            logger.error(f"Unexpected error deleting feature level {id}: {str(e)}")
            return {"success": False, "error": f"Unexpected error: {str(e)}"}

    @classmethod
    def get_all(cls) -> List[Features]:
        """Retrieve all features (with levels)."""
        from sqlalchemy.orm import joinedload
        return session.query(Features).options(
            joinedload(Features.featureLevels)
        ).all()

    @classmethod
    def update(cls, id: int, **kwargs) -> Dict[str, Any]:
        """Update an existing feature."""
        feature = cls.get_by_id(id)
        if not feature:
            return {"success": False, "error": "Feature not found."}
        
        # Validate if name is being updated
        if 'name' in kwargs:
            existing = cls.get_by_name(kwargs['name'])
            if existing and existing.id != id:
                return {"success": False, "error": f"A feature with the name '{kwargs['name']}' already exists."}
            if not str(kwargs['name']).strip():
                return {"success": False, "error": "Feature name cannot be empty."}
        
        try:
            valid_fields = {'name', 'desc', 'properties'}
            for key, value in kwargs.items():
                if key in valid_fields:
                    setattr(feature, key, value)
            session.commit()
            return {"success": True, "message": "Feature updated successfully.", "id": feature.id}
        except SQLAlchemyError as e:
            session.rollback()
            logger.error(f"Database error updating feature {id}: {str(e)}")
            return {"success": False, "error": f"Update failed: {str(e)}"}
        except Exception as e:
            session.rollback()
            logger.error(f"Unexpected error updating feature {id}: {str(e)}")
            return {"success": False, "error": f"Unexpected error: {str(e)}"}

    @classmethod
    def _validate_feature_data(cls, data: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Validate feature data before creation.
        
        Args:
            data: Dictionary containing feature attributes to validate
            
        Returns:
            Tuple[bool, str]: (is_valid, error_message)
                - is_valid: True if all data is valid, False otherwise
                - error_message: Empty string if valid, otherwise descriptive error message
                
        Validates:
            - name: Required, non-empty string
            - desc: Optional string description
            - properties: Optional dict with feature-specific properties
        """
        if 'name' not in data or not str(data['name']).strip():
            return False, "Field 'name' is required and cannot be empty."
        
        # Validate desc (if present)
        if 'desc' in data and data['desc'] is not None:
            if not isinstance(data['desc'], str):
                return False, "desc must be a string."
        
        # Validate properties (if present)
        if 'properties' in data and data['properties'] is not None:
            if not isinstance(data['properties'], dict):
                return False, "properties must be a dictionary."
        
        return True, ""
