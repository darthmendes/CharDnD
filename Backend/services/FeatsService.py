import logging

from sqlalchemy.exc import SQLAlchemyError

from Backend.models.character import Character, CharacterFeats
from Backend.models.feats import Feats
from .BaseModelService import BaseModelService


logger = logging.getLogger(__name__)


class FeatsService(BaseModelService):
    model = Feats

    @classmethod
    def get_for_character(cls, character_id):
        try:
            rows = cls.db_session.query(CharacterFeats).filter_by(
                characterID=character_id
            ).all()
            return {
                "success": True,
                "data": [
                    {
                        "feat": cls._serialize(row.feat),
                        "lvlAcquired": row.lvlAcquired,
                        "source": row.source,
                    }
                    for row in rows
                ],
            }
        except SQLAlchemyError as error:
            cls.db_session.rollback()
            logger.exception("Database error listing character feats")
            return {"success": False, "error": str(error)}

    @classmethod
    def assign_to_character(cls, character_id, feat_id, level_acquired=None, source=None):
        if level_acquired is not None and (
            type(level_acquired) is not int or level_acquired < 1
        ):
            return {"success": False, "error": "level_acquired must be a positive integer."}

        try:
            if cls.db_session.query(Character).filter_by(id=character_id).first() is None:
                return {"success": False, "error": "Character not found."}
            if cls.db_session.query(Feats).filter_by(id=feat_id).first() is None:
                return {"success": False, "error": "Feat not found."}
            existing = cls.db_session.query(CharacterFeats).filter_by(
                characterID=character_id,
                featsID=feat_id,
            ).first()
            if existing is not None:
                return {"success": False, "error": "Feat is already assigned to this character."}

            association = CharacterFeats(
                characterID=character_id,
                featsID=feat_id,
                lvlAcquired=level_acquired,
                source=source,
            )
            cls.db_session.add(association)
            cls.db_session.commit()
            return {
                "success": True,
                "data": {
                    "feat": cls._serialize(association.feat),
                    "lvlAcquired": association.lvlAcquired,
                    "source": association.source,
                },
            }
        except SQLAlchemyError as error:
            cls.db_session.rollback()
            logger.exception("Database error assigning feat to character")
            return {"success": False, "error": str(error)}

    @classmethod
    def remove_from_character(cls, character_id, feat_id):
        try:
            association = cls.db_session.query(CharacterFeats).filter_by(
                characterID=character_id,
                featsID=feat_id,
            ).first()
            if association is None:
                return {"success": False, "error": "Feat is not assigned to this character."}
            cls.db_session.delete(association)
            cls.db_session.commit()
            return {"success": True, "message": "Feat removed from character."}
        except SQLAlchemyError as error:
            cls.db_session.rollback()
            logger.exception("Database error removing feat from character")
            return {"success": False, "error": str(error)}
