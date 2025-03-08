# models/__init__.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from config import DATABASES_PATH

DB_NAME = 'AppDB.sqlite'
Base = declarative_base()
engine = create_engine('sqlite:///%s'%(DATABASES_PATH + '\\' + DB_NAME))
Session = sessionmaker(bind=engine)
session = Session()

# Import all models here to ensure they are registered with Base
from .character import Character, CharacterClassAssociation, CharacterInventory
from .dndclass import DnDClass, ClassFeature, ClassEquipment
from .item import Item, EquipmentCategory
from .species import Species, SpeciesFeature
from .background import Background, BackgroundEquipment

# Create all tables
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()