import logging
from collections.abc import Mapping

from sqlalchemy import inspect
from sqlalchemy.exc import SQLAlchemyError

from Backend.models import session


logger = logging.getLogger(__name__)


class BaseModelService:
    """Shared CRUD operations for services bound to a SQLAlchemy model."""

    model = None
    db_session = session

    @classmethod
    def _column_fields(cls):
        return [prop.key for prop in inspect(cls.model).column_attrs]

    @classmethod
    def _primary_key_fields(cls):
        mapper = inspect(cls.model)
        return [
            mapper.get_property_by_column(column).key
            for column in mapper.primary_key
        ]

    @classmethod
    def _serialize(cls, instance):
        return {
            field: getattr(instance, field)
            for field in cls._column_fields()
        }

    @classmethod
    def _identity_filter(cls, identifier):
        primary_key_fields = cls._primary_key_fields()

        if isinstance(identifier, Mapping):
            if set(identifier) != set(primary_key_fields):
                raise ValueError(
                    "Primary key must contain exactly: "
                    + ", ".join(primary_key_fields)
                )
            return dict(identifier)

        if len(primary_key_fields) == 1:
            return {primary_key_fields[0]: identifier}

        if isinstance(identifier, (tuple, list)) and len(identifier) == len(primary_key_fields):
            return dict(zip(primary_key_fields, identifier))

        raise ValueError(
            "Composite primary key requires a mapping or ordered tuple for: "
            + ", ".join(primary_key_fields)
        )

    @classmethod
    def _get_instance(cls, identifier):
        filters = cls._identity_filter(identifier)
        return cls.db_session.query(cls.model).filter_by(**filters).first()

    @classmethod
    def _validate_data(cls, data, allow_primary_key=False):
        if not isinstance(data, Mapping):
            raise ValueError("Data must be an object with mapped column fields.")

        fields = set(cls._column_fields())
        if not allow_primary_key:
            fields.difference_update(cls._primary_key_fields())

        invalid_fields = set(data) - fields
        if invalid_fields:
            raise ValueError(
                "Unknown or immutable field(s): "
                + ", ".join(sorted(invalid_fields))
            )

        return dict(data)

    @classmethod
    def get_all(cls, limit=None, offset=0):
        if limit is not None and (not isinstance(limit, int) or limit < 1):
            return {"success": False, "error": "limit must be a positive integer."}
        if not isinstance(offset, int) or offset < 0:
            return {"success": False, "error": "offset must be a non-negative integer."}

        try:
            query = cls.db_session.query(cls.model).offset(offset)
            if limit is not None:
                query = query.limit(limit)
            return {
                "success": True,
                "data": [cls._serialize(row) for row in query.all()],
            }
        except SQLAlchemyError as error:
            cls.db_session.rollback()
            logger.exception("Database error listing %s", cls.model.__tablename__)
            return {"success": False, "error": str(error)}

    @classmethod
    def get_by_id(cls, identifier):
        try:
            instance = cls._get_instance(identifier)
            if instance is None:
                return {"success": False, "error": "Record not found."}
            return {"success": True, "data": cls._serialize(instance)}
        except ValueError as error:
            return {"success": False, "error": str(error)}
        except SQLAlchemyError as error:
            cls.db_session.rollback()
            logger.exception("Database error reading %s", cls.model.__tablename__)
            return {"success": False, "error": str(error)}

    @classmethod
    def get_by_field(cls, field, value):
        if field not in cls._column_fields():
            return {"success": False, "error": "Unknown field: " + str(field)}

        try:
            instance = cls.db_session.query(cls.model).filter_by(**{field: value}).first()
            if instance is None:
                return {"success": False, "error": "Record not found."}
            return {"success": True, "data": cls._serialize(instance)}
        except SQLAlchemyError as error:
            cls.db_session.rollback()
            logger.exception(
                "Database error reading %s by %s",
                cls.model.__tablename__,
                field,
            )
            return {"success": False, "error": str(error)}

    @classmethod
    def create(cls, data):
        try:
            values = cls._validate_data(data, allow_primary_key=True)
            instance = cls.model(**values)
            cls.db_session.add(instance)
            cls.db_session.commit()
            cls.db_session.refresh(instance)
            return {"success": True, "data": cls._serialize(instance)}
        except ValueError as error:
            return {"success": False, "error": str(error)}
        except SQLAlchemyError as error:
            cls.db_session.rollback()
            logger.exception("Database error creating %s", cls.model.__tablename__)
            return {"success": False, "error": str(error)}

    @classmethod
    def update(cls, identifier, data):
        try:
            values = cls._validate_data(data)
            instance = cls._get_instance(identifier)
            if instance is None:
                return {"success": False, "error": "Record not found."}
            for field, value in values.items():
                setattr(instance, field, value)
            cls.db_session.commit()
            return {"success": True, "data": cls._serialize(instance)}
        except ValueError as error:
            return {"success": False, "error": str(error)}
        except SQLAlchemyError as error:
            cls.db_session.rollback()
            logger.exception("Database error updating %s", cls.model.__tablename__)
            return {"success": False, "error": str(error)}

    @classmethod
    def delete(cls, identifier):
        try:
            instance = cls._get_instance(identifier)
            if instance is None:
                return {"success": False, "error": "Record not found."}
            cls.db_session.delete(instance)
            cls.db_session.commit()
            return {"success": True, "message": "Record deleted successfully."}
        except ValueError as error:
            return {"success": False, "error": str(error)}
        except SQLAlchemyError as error:
            cls.db_session.rollback()
            logger.exception("Database error deleting %s", cls.model.__tablename__)
            return {"success": False, "error": str(error)}
