from models.dndclass import DnDclass
from models import session 

class ClassService:
        
    # Starting CRUD funtions
    def new(kwargs):
        if not DnDclass.is_valid(kwargs):
            return -1
        
        if DnDclass.get(kwargs['name']):
            return -2
        
        new_spec = DnDclass()
        for key, value in kwargs.items():
            setattr(new_spec, key, value)
        session.add(new_spec)
        session.commit()
        return 1
    
    def update(name, **kwargs):
        species = session.query(DnDclass).filter_by(name=name).first()
        if species:
            for key, value in kwargs.items():
                setattr(species, key, value)
            session.commit()
            return {"message": "Class updated successfully", "id": species.id}
        return {"message": "Class not found", "id": None}
    
    def get(name):
        char = session.query(DnDclass).filter_by(name=name).first()
        return char
    
    
    def delete(name):
        char = session.query(DnDclass).filter_by(name=name).first()
        if char:
            session.delete(char)
            session.commit()
            return {"message": "Class deleted successfully"}
        return {"error": "Class not found"}

    def get_all():
        return session.query(DnDclass).all()
    
    # upon receiving a dataDict verifies if is is valid
    def is_valid(dataDict):
        if 'name' not in dataDict:
            return False

        # check if all fields are filled correctly
        if not dataDict['name']:
            return False
        
        return True

