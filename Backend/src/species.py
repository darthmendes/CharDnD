from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from Backend.src.utils import JSONType

from Backend.src.config import DATABASES_PATH
DB_NAME = 'speciessDB.sqlite'
Base = declarative_base()

# Initialize database
engine = create_engine('sqlite:///%s'%(DATABASES_PATH + '\\' + DB_NAME), echo=False, connect_args={'check_same_thread': False})

class Species(Base):

    __tablename__ = "species"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    ability_bonuses = Column(JSONType) #format {STR:1,DEX:1} where you add bonus to the specific ability score
    size = Column(String) 
    speed = Column(Integer)
    traits = Column(JSONType) # list 
    starting_proficiencies = Column(JSONType) # list
    starting_proficiencies_options = Column(JSONType) # {choose:1, list:[op1,op2,op3]}
    languages = Column(JSONType) # list
    languages_options = Column(JSONType)
    subclasses = Column(JSONType)

    def to_dict(self):
        return {
            'id':self.id,
            'name':self.name,
            'size':self.size,
            'speed':self.speed,
            'abilityBonuses': self.ability_bonuses,
            'traits':self.traits,
            'languages':self.languages,
            'languages_options':self.languages_options,
            'subclasses':self.subclasses

        }


    # Starting CRUD funtions
    def new(kwargs):
        if not Species.is_valid(kwargs):
            return -1
        
        if Species.get(kwargs['name']):
            return -2
        
        new_spec = Species()
        for key, value in kwargs.items():
            setattr(new_spec, key, value)
        session.add(new_spec)
        session.commit()
        return 1
    
    def update(name, **kwargs):
        species = session.query(Species).filter_by(name=name).first()
        if species:
            for key, value in kwargs.items():
                setattr(species, key, value)
            session.commit()
            return {"message": "Species updated successfully", "id": species.id}
        return {"message": "Species not found", "id": None}
    
    def get(id):
        char = session.query(Species).filter_by(id=id).first()
        return char
    
    
    def delete(id):
        char = session.query(Species).filter_by(id=id).first()
        if char:
            session.delete(char)
            session.commit()
            return {"message": "Species deleted successfully"}
        return {"error": "Species not found"}

    def get_all():
        return session.query(Species).all()
        
    # upon receiving a dataDict verifies if is is valid
    def is_valid(dataDict):
        if 'name' not in dataDict or 'speed' not in dataDict:
            return False

        # check if all fields are filled correctly
        if not dataDict['name'] or not dataDict['speed']:
            return False
        
        return True

Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()
