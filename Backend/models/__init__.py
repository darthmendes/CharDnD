# models/__init__.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session

from ..config import BASE_DIR, DATABASE_NAME, DATABASE_PATH

DB_NAME = DATABASE_NAME
Base = declarative_base()
# Use os.path.join for cross-platform compatibility
db_path = os.path.join(BASE_DIR, DATABASE_PATH, DB_NAME)
engine = create_engine(f'sqlite:///{db_path}')

# Use scoped_session for thread-safe session management
Session = scoped_session(sessionmaker(bind=engine))
session = Session()

# Import all models here to ensure they are registered with Base
from .character import (
    Character,
    CharacterClass,
    CharacterConditions,
    CharacterFeats,
    CharacterInventory,
    CharacterSpell,
    Inventory,
)
from .dndclass import (
    ClassEquipment,
    ClassSpell,
    DnDclass,
    Subclass,
)
from .item import (
    ArmorItem,
    Item,
    ItemCategories,
    ItemEffects,
    ItemTags,
    ItemTypes,
    MagicItem,
    WeaponItem,
)
from .species import Species, SpeciesSpeed
from .background import (
    Background,
    BackgroundDetails,
    BackgroundEquipment,
    BackgroundProficiencies,
)
from .features import Features
from .proficiencies import (
    BackgroundProficiency,
    CharacterProficiency,
    ClassProficiency,
    FeatProficiency,
    Proficiency,
    SpeciesProficiency,
)
from .spells import Spell
from .feats import FeatBenefits, FeatPrerequisites, Feats
from .traits import CharacterTraits, SpeciesTraits, Traits
from .random import Conditions
from .extra import (
    CasterProgression,
    CharacterSpellSlot,
    CharacterFeatureUse,
    CharacterNote,
    CreatureSize,
    EffectType,
    MovementType,
    Notes,
    RechargeTrigger,
    SpellCategory,
    SpellCombatEffect,
    SpellEffectType,
    SpellSchool,
    SpellSlotProgression,
    SpellTag,
    SpellType,
    Tag,
    User,
    UserCharacter,
)
# Create all tables
Base.metadata.create_all(engine)