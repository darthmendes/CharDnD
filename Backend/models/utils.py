from sqlalchemy import PickleType
import json

class JSONType(PickleType):
    """
    Custom JSON type for storing JSON objects in the database.
    
    This type serializes Python objects to JSON strings for storage
    and deserializes them back to Python objects when retrieved.
    """
    
    def __init__(self, *args, **kwargs):
        super(JSONType, self).__init__(*args, **kwargs)

    def process_bind_param(self, value, dialect):
        """Convert Python object to JSON string for database storage."""
        if value is not None:
            value = json.dumps(value, ensure_ascii=True)
        return value

    def process_result_value(self, value, dialect):
        """Convert JSON string from database back to Python object."""
        if value is not None:
            value = json.loads(value)
        return value
