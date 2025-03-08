from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from . import Base
from .utils import JSONType

# Base table for storing character information
class Character(Base):

    __tablename__ = "characters"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    abilityScores = Column(JSONType, nullable=False)
    xp = Column(Integer, default=300)
    curr_hp = Column(Integer)
    max_hp = Column(Integer)
    tmp_hp = Column(Integer)
    
    speciesID = Column(Integer, ForeignKey("species.id"))
    backgroundID = Column(Integer, ForeignKey("backgrounds.id"))

    species = relationship("Species", back_populates="characters")
    background = relationship("Background", back_populates="characters")
    classes_assoc = relationship("CharacterClass", back_populates="characters")
    inventory = relationship("CharacterInventory", back_populates="characters")

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

# Table used to map Character to classes (used for multiclassing as well)                                                                       
class CharacterClass(Base):
    __tablename__ = "characterclass"
    id = Column(Integer, primary_key=True)
    characterID = Column(Integer, ForeignKey("characters.id"), nullable = False)
    classID = Column(Integer, ForeignKey("dndclass.id"), nullable=False)
    level = Column(Integer, default=1)

    character = relationship("Character", back_populates="classes_assoc")
    dndclass = relationship("DnDclass", back_populates="character_assoc")


class CharacterInventory(Base):
    __tablename__ = "characterinventory"
    id = Column(Integer, primary_key=True, autoincrement=True)
    characterID = Column(Integer, ForeignKey("characters.id"), nullable=False)
    itemID = Column(Integer, ForeignKey("items.id"), nullable=False)
    quantity = Column(Integer)