from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from config import DATABASES_PATH
DB_NAME = 'SpeciessDB.sqlite'
Base = declarative_base()

# Initialize database
engine = create_engine('sqlite:///%s'%(DATABASES_PATH + '\\' + DB_NAME), echo=False, connect_args={'check_same_thread': False})

class Species(Base):

    __tablename__ = "species"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    ability_score_increase = Column(String) #format {STR:1,DEX:1} where you add bonus to the specific ability score
    size = Column(String)
    speed = Column(Integer)
    traits = Column(String)
    languages = Column(String)

    # Starting CRUD funtions
    def new(**kwargs):
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
    
    def get(name):
        char = session.query(Species).filter_by(name=name).first()
        return char
    
    
    def delete(name):
        char = session.query(Species).filter_by(name=name).first()
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
