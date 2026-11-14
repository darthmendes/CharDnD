import logging

from sqlalchemy.exc import SQLAlchemyError

from Backend.models.character import Character
from Backend.models.species import Species
from Backend.models.traits import CharacterTraits, SpeciesTraits, Traits
from .BaseModelService import BaseModelService


logger = logging.getLogger(__name__)


class TraitsService(BaseModelService):
    model = Traits

    @classmethod
    def get_for_character(cls, character_id):
        return cls._get_associated_traits(
            CharacterTraits, "characterID", character_id, "character"
        )

    @classmethod
    def get_for_species(cls, species_id):
        return cls._get_associated_traits(
            SpeciesTraits, "speciesID", species_id, "species"
        )

    @classmethod
    def _get_associated_traits(cls, association_model, owner_field, owner_id, owner_kind):
        try:
            rows = cls.db_session.query(association_model).filter_by(
                **{owner_field: owner_id}
            ).all()
            return {"success": True, "data": [cls._serialize(row.trait) for row in rows]}
        except SQLAlchemyError as error:
            cls.db_session.rollback()
            logger.exception("Database error listing %s traits", owner_kind)
            return {"success": False, "error": str(error)}

    @classmethod
    def assign_to_character(cls, character_id, trait_id):
        return cls._assign(
            CharacterTraits, "characterID", character_id, Character, trait_id
        )

    @classmethod
    def assign_to_species(cls, species_id, trait_id):
        return cls._assign(
            SpeciesTraits, "speciesID", species_id, Species, trait_id
        )

    @classmethod
    def _assign(cls, association_model, owner_field, owner_id, owner_model, trait_id):
        try:
            owner = cls.db_session.query(owner_model).filter_by(id=owner_id).first()
            if owner is None:
                return {"success": False, "error": "Owner not found."}
            if cls.db_session.query(Traits).filter_by(id=trait_id).first() is None:
                return {"success": False, "error": "Trait not found."}

            filters = {owner_field: owner_id, "traitID": trait_id}
            if cls.db_session.query(association_model).filter_by(**filters).first():
                return {"success": False, "error": "Trait is already assigned."}
            cls.db_session.add(association_model(**filters))
            cls.db_session.commit()
            trait = cls.db_session.query(Traits).filter_by(id=trait_id).first()
            return {"success": True, "data": cls._serialize(trait)}
        except SQLAlchemyError as error:
            cls.db_session.rollback()
            logger.exception("Database error assigning trait")
            return {"success": False, "error": str(error)}

    @classmethod
    def remove_from_character(cls, character_id, trait_id):
        return cls._remove(CharacterTraits, "characterID", character_id, trait_id)

    @classmethod
    def remove_from_species(cls, species_id, trait_id):
        return cls._remove(SpeciesTraits, "speciesID", species_id, trait_id)

    @classmethod
    def _remove(cls, association_model, owner_field, owner_id, trait_id):
        try:
            association = cls.db_session.query(association_model).filter_by(
                **{owner_field: owner_id, "traitID": trait_id}
            ).first()
            if association is None:
                return {"success": False, "error": "Trait is not assigned."}
            cls.db_session.delete(association)
            cls.db_session.commit()
            return {"success": True, "message": "Trait removed."}
        except SQLAlchemyError as error:
            cls.db_session.rollback()
            logger.exception("Database error removing trait")
            return {"success": False, "error": str(error)}
