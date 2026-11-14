from ..models.features import Features
from .BaseModelService import BaseModelService


class FeaturesService(BaseModelService):
    model = Features

    @classmethod
    def new(cls, data):
        name = data.get("name") if isinstance(data, dict) else None
        if not isinstance(name, str) or not name.strip():
            return {"success": False, "error": "A non-empty feature name is required."}

        existing = cls.get_by_field("name", name)
        if existing["success"]:
            return {
                "success": False,
                "error": "A feature with that name already exists.",
            }
        if existing.get("error") != "Record not found.":
            return existing
        return cls.create(data)

    @classmethod
    def get_byID(cls, feature_id):
        return cls.get_by_id(feature_id)

    @classmethod
    def get_by_name(cls, name):
        return cls.get_by_field("name", name)

    @classmethod
    def update(cls, feature_id, **changes):
        if "name" in changes and (
            not isinstance(changes["name"], str) or not changes["name"].strip()
        ):
            return {"success": False, "error": "Feature name cannot be empty."}
        return super().update(feature_id, changes)
