from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from . import Base


class Character(Base):
    """
    Represents a D&D character with all core attributes.
    
    Attributes:
        id: Unique identifier
        name: Character name (must be unique)
        abilityScores: JSON object with str, dex, con, int, wis, cha scores
        xp: Experience points (default 300)
        level: Character level (default 1)
        curr_hp: Current hit points
        max_hp: Maximum hit points
        tmp_hp: Temporary hit points
        speciesID: Foreign key to species table
        backgroundID: Foreign key to backgrounds table
    """
    __tablename__ = "characters"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    abilityScores = Column(JSON, nullable=False)
    xp = Column(Integer, default=300)
    level = Column(Integer, default=1)
    curr_hp = Column(Integer)
    max_hp = Column(Integer)
    tmp_hp = Column(Integer)
    
    speciesID = Column(Integer, ForeignKey("species.id"))
    backgroundID = Column(Integer, ForeignKey("backgrounds.id"))

    # Relationships
    species = relationship("Species", back_populates="characters")
    background = relationship("Background", back_populates="characters")
    classes_assoc = relationship("CharacterClass", back_populates="character")
    inventory = relationship("CharacterInventory", back_populates="character")

    def __repr__(self) -> str:
        return f"Character('{self.name}', '{self.species}', '{self.level}')"
    
    def to_dict(self) -> dict:
        """Convert character to dictionary for API responses."""
        return {
            'id': self.id,
            'name': self.name,
            'species': self.species.name if self.species else None,
            'char_class': [{
                'name': c.dndclass.name,
                'level': c.level
            } for c in self.classes_assoc],
            'level': self.level,
            'xp': self.xp,
            'abilityScores': self.abilityScores,
            'background': self.background.to_dict() if self.background else None
        }

class CharacterClass(Base):
    """
    Association table mapping Characters to Classes.
    Supports multiclassing by tracking level per class.
    
    Attributes:
        id: Unique identifier
        characterID: Foreign key to characters table
        classID: Foreign key to dndclass table
        level: Level in this specific class
    """
    __tablename__ = "characterclass"
    
    id = Column(Integer, primary_key=True)
    characterID = Column(Integer, ForeignKey("characters.id"), nullable=False)
    classID = Column(Integer, ForeignKey("dndclass.id"), nullable=False)
    level = Column(Integer, default=1)

    character = relationship("Character", back_populates="classes_assoc")
    dndclass = relationship("DnDclass", back_populates="character_assoc")


class CharacterInventory(Base):
    """
    Tracks items in a character's inventory.
    
    Attributes:
        id: Unique identifier
        characterID: Foreign key to characters table
        itemID: Foreign key to items table
        quantity: Number of items (default 1)
    """
    __tablename__ = "characterinventory"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    characterID = Column(Integer, ForeignKey("characters.id"), nullable=False)
    itemID = Column(Integer, ForeignKey("items.id"), nullable=False)
    quantity = Column(Integer, default=1)

    character = relationship("Character", back_populates="inventory")
    item = relationship("Item", back_populates="inventory_entries")