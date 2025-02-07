from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from config import DATABASES_PATH
DB_NAME = 'charactersDB.sqlite'
Base = declarative_base()

# Initialize database
engine = create_engine('sqlite:///%s'%(DATABASES_PATH + '\\' + DB_NAME), echo=False, connect_args={'check_same_thread': False})

class Character(Base):

    __tablename__ = "characters"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    race = Column(String, nullable=False)
    char_class = Column(String, nullable=False)
    level = Column(Integer, default=1)
    xp = Column(Integer, default=300)
    hp = Column(String)
    ability_scores = Column(String, nullable=False)
    skills = Column(String)
    equipment = Column(String)
    languages = Column(String)
    background = Column(String)
    alignment = Column(String)
    features = Column(String)

    def __repr__(self):
        return f"Character('{self.name}', '{self.race}', '{self.char_class}', '{self.level}'"
    
    def to_dict(self):
        return {
            'name': self.name,
            'race': self.race,
            'char_class': self.char_class,
            'level': self.level,
            'xp': self.xp,
            'hp': self.hp,
            'ability_scores': self.ability_scores,
            'skills': self.skills,
            'equipment': self.equipment,
            'languages': self.languages,
            'background': self.background,
            'alignment': self.alignment,
            'features': self.features
            }

    # CRUD operations
    def new(name, race, char_class, level, ability_scores, xp = 300, hp = '', skills='', equipment='',languages='',background='',alignment='',features=''):
        new_char = Character(name=name, race=race, char_class=char_class, level=level, xp=xp, hp=hp, 
                             ability_scores=ability_scores, skills = skills, equipment=equipment,
                             languages=languages, background=background, alignment=alignment, features=features)
        session.add(new_char)
        session.commit()
        return {"message": "Character created successfully", "id": new_char.id}

    def save(self):
        session.add(self)
        session.commit()

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
        if 'name' not in dataDict or 'race' not in dataDict or 'class' not in dataDict or 'level' not in dataDict:
            return False
        if 'ability_scores' not in dataDict:
            return False

        # check if all fields are filled correctly
        if not dataDict['name'] or not dataDict['race'] or not dataDict['class'] or not dataDict['level'] or not dataDict['ability_scores']:
            return False
        
        return True
                                                                        
                                                                        


Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()
