from sqlalchemy import PickleType
import json

class JSONType(PickleType):
    '''
        JSON DB type is used to store JSON objects in the database
    '''
    def __init__(self, *args, **kwargs):        
        
        #kwargs['pickler'] = json
        super(JSONType, self).__init__(*args, **kwargs)

    def process_bind_param(self, value, dialect):
        if value is not None:
            value = json.dumps(value, ensure_ascii=True)
        return value

    def process_result_value(self, value, dialect):

        if value is not None:
            value = json.loads(value)
        return value
