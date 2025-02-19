from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from Backend.src.config import DATABASES_PATH

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
    ability_scores = Column(String, nullable=False) # {STR:10, WIS: 10 ... }
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
            'name': self.name,
            'species': self.species,
            'char_class': self.char_class,
            'level': self.level,
            'xp': self.xp,
            'hp': self.hp,
            'ability_scores': self.ability_scores,
            'skills': self.skills,
            'equipment': self.equipment,
            'spells': self.spells,
            'languages': self.languages,
            'background': self.background,
            'alignment': self.alignment,
            }

    # CRUD operations
    def new(kwargs):
        print(kwargs)
        if not Character.is_valid(kwargs):
            return -1
        
        if Character.get(kwargs['name']):
            return -2
        
        new_char = Character()
        for key, value in kwargs.items():
            setattr(new_char, key, value)
        session.add(new_char)
        session.commit()
        return 1

    def get(name):
        char = session.query(Character).filter_by(name=name).first()
        return char
                   
    def update(name, **kwargs):
        char = session.query(Character).filter_by(name=name).first()
        if char:
            for key, value in kwargs.items():
                setattr(char, key, value)
            session.commit()
            
            return {"message": "Character updated successfully"}
        return {"error": "Character not found"}

    def delete(name):
        char = session.query(Character).filter_by(name=name).first()
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
        if 'ability_scores' not in dataDict:
            return False

        # check if all fields are filled correctly
        if not dataDict['name'] or not dataDict['species'] or not dataDict['char_class'] or not dataDict['level'] or not dataDict['ability_scores']:
            return False
        
        return True
                                                                        
                                                                        


Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()
