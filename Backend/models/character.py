from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Boolean
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
        subspecies: Subspecies name (string)
        proficient_skills: JSON array of skill names
        proficient_weapons: JSON array of weapon/armor names  
        proficient_tools: JSON array of tool names
        known_languages: JSON array of language names
        hit_points: Manual hit points value
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
    
    # NEW FIELDS for enhanced character creation
    subspecies = Column(String)  # Subspecies name
    proficient_skills = Column(JSON, default=list)      # Skill proficiencies
    proficient_weapons = Column(JSON, default=list)     # Weapon/armor proficiencies  
    proficient_tools = Column(JSON, default=list)       # Tool proficiencies
    known_languages = Column(JSON, default=list)        # Language proficiencies
    hit_points = Column(Integer)                       # Manual HP value

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
            'subspecies': self.subspecies,  # ✅ NEW
            'background': self.background.to_dict() if self.background else None,
            'classes': [{
                'className': c.dndclass.name,
                'level': c.level,
                'subclass': getattr(c, 'subclass', ''),  # If you store subclass in CharacterClass
                'chosenSkills': []  # You might want to store this separately
            } for c in self.classes_assoc],
            'level': self.level,
            'xp': self.xp,
            'abilityScores': self.abilityScores,
            'proficientSkills': self.proficient_skills or [],      # ✅ NEW
            'proficientWeapons': self.proficient_weapons or [],    # ✅ NEW
            'proficientTools': self.proficient_tools or [],        # ✅ NEW  
            'knownLanguages': self.known_languages or [],          # ✅ NEW
            'hitPoints': self.hit_points,                         # ✅ NEW
            'hpMax': self.max_hp,
            'hpCurrent': self.curr_hp,
            'hpTmp': self.tmp_hp,
            'ac': 10,  # Placeholder - calculate based on armor
            'initiative': 0,  # Placeholder - calculate from DEX
            'speed': 30,  # Placeholder - calculate from species/class
            'savingThrows': {},  # Placeholder
            'passivePerception': 10,  # Placeholder
            'items': [{
                'id': inv_entry.item.id,
                'name': inv_entry.item.name,
                'type': inv_entry.item.item_type,
                'item_type': inv_entry.item.item_type,
                'damageDice': inv_entry.item.damage_dice,
                'damageType': inv_entry.item.damage_type,
                'desc': inv_entry.item.desc,
                'weight': inv_entry.item.weight,
                'cost': inv_entry.item.cost,
                'item_category': inv_entry.item.item_category,
                'rarity': inv_entry.item.rarity,
                'properties': inv_entry.item.properties or [],
                'property_data': inv_entry.item.property_data or {},  # ✅ NEW: Include property metadata
                'specialAbilities': inv_entry.item.special_abilities or [],
                'quantity': inv_entry.quantity,
                'maxCharges': inv_entry.item.max_charges,
                'currentCharges': inv_entry.current_charges,  # ✅ NEW: Include current charges
                'chargeRecharge': inv_entry.item.charge_recharge,
                'onHitEffect': inv_entry.item.on_hit_effect,
                'inventoryId': inv_entry.id,  # ✅ NEW: Include inventory entry ID for updates
                'is_equipped': inv_entry.is_equipped  # ✅ NEW: Include equipped status
            } for inv_entry in self.inventory]  # ✅ NEW: Include inventory items
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
        subclass: Subclass name for this class level
    """
    __tablename__ = "characterclass"
    
    id = Column(Integer, primary_key=True)
    characterID = Column(Integer, ForeignKey("characters.id"), nullable=False)
    classID = Column(Integer, ForeignKey("dndclass.id"), nullable=False)
    level = Column(Integer, default=1)
    subclass = Column(String)  # ✅ NEW: Store subclass per class

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
        current_charges: Current charges remaining (for items with max_charges)
        is_equipped: Whether the item is currently equipped (for armor/shields)
    """
    __tablename__ = "characterinventory"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    characterID = Column(Integer, ForeignKey("characters.id"), nullable=False)
    itemID = Column(Integer, ForeignKey("items.id"), nullable=False)
    quantity = Column(Integer, default=1)
    current_charges = Column(Integer, default=0)  # ✅ NEW: Track current charges
    is_equipped = Column(Boolean, default=False)  # ✅ NEW: Track if armor/shield is equipped

    character = relationship("Character", back_populates="inventory")
    item = relationship("Item", back_populates="inventory_entries")