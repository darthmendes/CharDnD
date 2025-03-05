from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from Backend.src.utils import JSONType
from Backend.src.config import DATABASES_PATH
DB_NAME = 'classesDB.sqlite'
Base = declarative_base()

# Initialize database
engine = create_engine('sqlite:///%s'%(DATABASES_PATH + '\\' + DB_NAME), echo=False, connect_args={'check_same_thread': False})

class Char_Class(Base):
    __tablename__ = "classes"    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    hit_dice = Column(String) 
    proficiency_choices = Column(JSONType)
    proficiencies = Column(JSONType)
    saving_throws = Column(JSONType) 
    starting_equipment = Column(JSONType) 
    starting_equipment_choices = Column(JSONType)
    multiclassing = Column(JSONType)
    subclasses = Column(JSONType)
    spellcasting = Column(JSONType)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }
    # Starting CRUD funtions
    def new(kwargs):
        if not Char_Class.is_valid(kwargs):
            return -1
        
        if Char_Class.get(kwargs['name']):
            return -2
        
        new_spec = Char_Class()
        for key, value in kwargs.items():
            setattr(new_spec, key, value)
        session.add(new_spec)
        session.commit()
        return 1
    
    def update(name, **kwargs):
        species = session.query(Char_Class).filter_by(name=name).first()
        if species:
            for key, value in kwargs.items():
                setattr(species, key, value)
            session.commit()
            return {"message": "Class updated successfully", "id": species.id}
        return {"message": "Class not found", "id": None}
    
    def get(name):
        char = session.query(Char_Class).filter_by(name=name).first()
        return char
    
    
    def delete(name):
        char = session.query(Char_Class).filter_by(name=name).first()
        if char:
            session.delete(char)
            session.commit()
            return {"message": "Class deleted successfully"}
        return {"error": "Class not found"}

    def get_all():
        return session.query(Char_Class).all()
    
    # upon receiving a dataDict verifies if is is valid
    def is_valid(dataDict):
        if 'name' not in dataDict:
            return False

        # check if all fields are filled correctly
        if not dataDict['name']:
            return False
        
        return True

Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()
