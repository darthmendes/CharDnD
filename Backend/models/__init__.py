# models/__init__.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from .config import DATABASES_PATH

DB_NAME = 'AppDB.sqlite'
Base = declarative_base()
engine = create_engine('sqlite:///%s'%(DATABASES_PATH + '\\' + DB_NAME))
Session = sessionmaker(bind=engine)
session = Session()

# Import all models here to ensure they are registered with Base
from .character import Character, CharacterClass, CharacterInventory
from .dndclass import DnDclass, ClassFeatures, ClassEquipment
from .item import Item
from .species import Species, SpeciesTraits
from .background import Background, BackgroundEquipment
from .features import Features
from .proficiencies import Proficiency, ProficiencyChoice, ProficiencyChoiceGroup
from .languages import Language, LanguageChoice, LanguageChoiceGroup

# Create all tables
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()