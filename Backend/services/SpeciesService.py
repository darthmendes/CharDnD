import logging

from sqlalchemy.exc import SQLAlchemyError

from ..models.species import Species
from .BaseModelService import BaseModelService


logger = logging.getLogger(__name__)

SPECIES_LANGUAGE_RULES = {
    "Human": (["Common"], 1),
    "Elf": (["Common", "Elvish"], 0),
    "Dwarf": (["Common", "Dwarvish"], 0),
    "Halfling": (["Common", "Halfling"], 0),
    "Dragonborn": (["Common", "Draconic"], 0),
    "Gnome": (["Common", "Gnomish"], 0),
    "Half-Elf": (["Common", "Elvish"], 1),
    "Half-Orc": (["Common", "Orc"], 0),
    "Tiefling": (["Common", "Infernal"], 0),
}


class SpeciesService(BaseModelService):
    model = Species

    @classmethod
    def _serialize(cls, species):
        data = super()._serialize(species)
        subspecies = sorted(species.subspecies, key=lambda child: child.name)
        data["has_subspecies"] = bool(subspecies)
        data["subspecies"] = [
            {"id": child.id, "name": child.name}
            for child in subspecies
        ]

        rules_species = species
        if species.parent is not None:
            rules_species = species.parent_species
        languages, language_choices = SPECIES_LANGUAGE_RULES.get(
            rules_species.name,
            ([], 0),
        )
        data["languages"] = [{"name": language} for language in languages]
        data["language_choices"] = language_choices
        return data

    @classmethod
    def new(cls, data):
        is_valid, error = cls._validate_species_data(data, for_create=True)
        if not is_valid:
            return {"success": False, "error": error}

        existing = cls.get_by_field("name", data["name"])
        if existing["success"]:
            return {
                "success": False,
                "error": "A species with that name already exists.",
            }
        if existing.get("error") != "Record not found.":
            return existing
        return cls.create(data)

    @classmethod
    def new_subspecies(cls, data):
        if not isinstance(data, dict):
            return {"success": False, "error": "Data must be an object."}
        parent_id = data.get("speciesID")
        if parent_id is None:
            return {"success": False, "error": "Missing required field: speciesID"}

        parent = cls.get_by_id(parent_id)
        if not parent["success"]:
            return {"success": False, "error": "Parent species not found."}

        subspecies_data = dict(data)
        subspecies_data.pop("speciesID")
        subspecies_data["parent"] = parent_id
        return cls.new(subspecies_data)

    @classmethod
    def update(cls, species_id, **changes):
        is_valid, error = cls._validate_species_data(changes)
        if not is_valid:
            return {"success": False, "error": error}
        return super().update(species_id, changes)

    @classmethod
    def update_subspecies(cls, species_id, **changes):
        subspecies = cls.get_subspecies_byID(species_id)
        if not subspecies["success"]:
            return subspecies
        return cls.update(species_id, **changes)

    @classmethod
    def get_byID(cls, species_id):
        return cls.get_by_id(species_id)

    @classmethod
    def get_by_name(cls, name):
        return cls.get_by_field("name", name)

    @classmethod
    def get_subspecies_byID(cls, species_id):
        try:
            species = cls._get_instance(species_id)
            if species is None or species.parent is None:
                return {"success": False, "error": "Subspecies not found."}
            return {"success": True, "data": cls._serialize(species)}
        except ValueError as error:
            return {"success": False, "error": str(error)}
        except SQLAlchemyError as error:
            cls.db_session.rollback()
            logger.exception("Database error reading subspecies")
            return {"success": False, "error": str(error)}

    @classmethod
    def delete_subspecies(cls, species_id):
        subspecies = cls.get_subspecies_byID(species_id)
        if not subspecies["success"]:
            return subspecies
        return super().delete(species_id)

    @classmethod
    def _validate_species_data(cls, data, for_create=False):
        if not isinstance(data, dict):
            return False, "Data must be an object."

        if for_create:
            required = {"name", "creatureType", "sizeID"}
            missing = required - data.keys()
            if missing:
                return False, "Missing required field(s): " + ", ".join(sorted(missing))

        if "name" in data and (
            not isinstance(data["name"], str) or not data["name"].strip()
        ):
            return False, "Species name must be a non-empty string."

        if "creatureType" in data and (
            not isinstance(data["creatureType"], str) or not data["creatureType"].strip()
        ):
            return False, "creatureType must be a non-empty string."

        if "sizeID" in data and (
            not isinstance(data["sizeID"], int) or data["sizeID"] < 1
        ):
            return False, "sizeID must be a positive integer."

        if "parent" in data and data["parent"] is not None and (
            not isinstance(data["parent"], int) or data["parent"] < 1
        ):
            return False, "parent must be a positive integer or null."

        return True, ""
