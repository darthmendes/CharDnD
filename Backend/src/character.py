from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from Backend.src.config import DATABASES_PATH
from Backend.src.utils import JSONType

DB_NAME = 'charactersDB.sqlite'
Base = declarative_base()

# Initialize database
engine = create_engine('sqlite:///%s'%(DATABASES_PATH + '\\' + DB_NAME), echo=False, connect_args={'check_same_thread': False})


class Character(Base):

    __tablename__ = "characters"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    species = Column(String, nullable=False)
    char_class = Column(String, nullable=False) # {class1: level, class2,level}
    level = Column(Integer, default=1)
    xp = Column(Integer, default=300)
    hp = Column(String) # {actual:0, max:0, tmp:0}
    abilityScores = Column(JSONType, nullable=False) # {STR:10, WIS: 10 ... }
    skills = Column(String) # list [skill1, skill2 ... ]
    equipment = Column(String) # list
    spells = Column(String) # ? understand better how to show known/prepared spells or if able to retrieve from other srcs
    languages = Column(String) # list
    background = Column(String) 
    alignment = Column(String)

    def __repr__(self):
        return f"Character('{self.name}', '{self.species}', '{self.char_class}', '{self.level}'"
    
    def to_dict(self):
        return {
            'id':self.id,
            'name': self.name,
            'species': self.species,
            'char_class': self.char_class,
            'level': self.level,
            'xp': self.xp,
            'hp': self.hp,
            'abilityScores': self.abilityScores,
            'skills': self.skills,
            'equipment': self.equipment,
            'spells': self.spells,
            'languages': self.languages,
            'background': self.background,
            'alignment': self.alignment,
            }

    # CRUD operations
    def new(kwargs):
        if not Character.is_valid(kwargs):
            return -1
        
        if Character.get(kwargs['name']):
            return -2
        
        new_char = Character()
        new_char.name = kwargs['name']
        new_char.species = kwargs['species']
        new_char.char_class = kwargs['char_class']
        new_char.level = kwargs['level']
        new_char.abilityScores = kwargs['abilityScores']
        
        session.add(new_char)
        session.commit()
        return 1

    def get(id):
        char = session.query(Character).filter_by(id=id).first()
        return char
                   
    def update(id, **kwargs):
        char = session.query(Character).filter_by(id=id).first()
        if char:
            for key, value in kwargs.items():
                setattr(char, key, value)
            session.commit()
            
            return {"message": "Character updated successfully"}
        return {"error": "Character not found"}

    def delete(id):
        char = session.query(Character).filter_by(id=id).first()
        if char:
            session.delete(char)
            session.commit()
            return {"message": "Character deleted successfully"}
        return {"error": "Character not found"}

    def get_all():
        return session.query(Character).all()
    
    # upon receiving a dataDict verifies if is is valid
    def is_valid(dataDict):
        if 'name' not in dataDict or 'species' not in dataDict or 'char_class' not in dataDict or 'level' not in dataDict:
            return False
        if 'abilityScores' not in dataDict:
            return False

        # check if all fields are filled correctly
        if not dataDict['name'] or not dataDict['species'] or not dataDict['char_class'] or not dataDict['level'] or not dataDict['abilityScores']:
            return False
        
        return True
                                                                        
                                                                        


Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()
