from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from Backend.src.config import DATABASES_PATH
DB_NAME = 'ClassesDB.sqlite'
Base = declarative_base()

# Initialize database
engine = create_engine('sqlite:///%s'%(DATABASES_PATH + '\\' + DB_NAME), echo=False, connect_args={'check_same_thread': False})


class_hit_dice = {
            "Barbarian": 12,
            "Bard": 8,
            "Cleric": 8,
            "Druid": 8,
            "Fighter": 10,
            "Monk": 8,
            "Paladin": 10,
            "Ranger": 10,
            "Rogue": 8,
            "Sorcerer": 6,
            "Warlock": 8,
            "Wizard": 6,
        } 
class_prerequisites = {
            "Barbarian": {"Strength": 13},
            "Bard": {"Charisma": 13},
            "Cleric": {"Wisdom": 13},
            "Druid": {"Wisdom": 13},
            "Fighter": {"Strength": 13, "Dexterity": 13},
            "Monk": {"Dexterity": 13, "Wisdom": 13},
            "Paladin": {"Strength": 13, "Charisma": 13},
            "Ranger": {"Dexterity": 13, "Wisdom": 13},
            "Rogue": {"Dexterity": 13},
            "Sorcerer": {"Charisma": 13},
            "Warlock": {"Charisma": 13},
            "Wizard": {"Intelligence": 13},
        }

class Char_Class(Base):
    __tablename__ = "classes"    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    hit_dice = Column(String) 
    prerequisites = Column(String) # {STR: 10, WIS:13}

    features = Column(String) # list 

    proficiencies = Column(String)  # default : [op1, op2, ... ]
                                    # choices : {"choose": 2,
                                        #"type": "proficiencies",
                                        #"from": [op1, op2, ... ]

    saving_throws = Column(String)  # [STR, WIS, ... ]

    starting_equipment = Column(String) # { default : { option:quantity, op2:quant2,...}
                                        #   choices : [ {a:{op:quant}, b:[]}
                                        #               {a:[], b:[]}, ... ]
    class_levels = Column(String)   
    subclasses = Column(String)
    multiclassing = Column(String)  # {prerequisites : {score:value}, 
                                    #  proficiencies : [op1, op2, op3]}

    spellcasting = Column(String)   #{  level : val,
                                    #   spellcasting_ability : [INT, WIS ?],
                                    #   spells : {} }
    
        # Starting CRUD funtions
    def new(self,**kwargs):
        if not self.is_valid(kwargs):
            return -1
        
        if self.get(kwargs['name']):
            return -2
        
        new_ = Char_Class()
        for key, value in kwargs.items():
            setattr(new_, key, value)
        session.add(new_)
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
