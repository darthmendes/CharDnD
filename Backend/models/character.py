from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Numeric, JSON
from sqlalchemy.orm import relationship, synonym
from . import Base


class Character(Base):
    __tablename__ = "characters"
    
    id = Column("characterID", Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    abilityScores = Column(JSON, default={})
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    curr_hp = Column(Integer, default=0)
    max_hp = Column(Integer, default=0)
    tmp_hp = Column(Integer, default=0)
    speciesID = Column(Integer, ForeignKey("species.speciesID"), nullable=False)
    backgroundID = Column(Integer, ForeignKey("backgrounds.backgroundID"), nullable=False)
    subspecies = Column(String)
    proficient_skills = Column(JSON, default=list)
    proficient_weapons = Column(JSON, default=list)
    proficient_tools = Column(JSON, default=list)
    known_languages = Column(JSON, default=list)
    hit_points = Column(Integer, default=0)
    spell_slots = Column(JSON, default=dict)
    spell_slots_expended = Column(JSON, default=dict)
    spellcasting_ability = Column(String)

    age = Column(Integer)
    alignment = Column(String)
    description = Column(String)
    experiencePoints = Column(Integer, default=0)
    hp = Column(Integer, default=0)
    tmpHp = Column(Integer, default=0)
    maxhp = Column(Integer, default=0)
    money = Column(Numeric(10, 2), default=0)
    inspiration = Column(Integer, default=0)
    strength = Column(Integer, default=10)
    dexterity = Column(Integer, default=10)
    constitution = Column(Integer, default=10)
    charisma = Column(Integer, default=10)
    intelligence = Column(Integer, default=10)
    wisdom = Column(Integer, default=10)

    species = relationship("Species", back_populates="characters")
    background = relationship("Background", back_populates="characters")
    inventory = relationship("Inventory", back_populates="character")
    conditions = relationship("CharacterConditions", back_populates="character")
    feats = relationship("CharacterFeats", back_populates="character")
    class_associations = relationship("CharacterClass", back_populates="character")
    spells = relationship("CharacterSpell", back_populates="character")
    spell_slot_usage = relationship("CharacterSpellSlot", back_populates="character")
    proficiencies = relationship("CharacterProficiency", back_populates="character")
    traits = relationship("CharacterTraits", back_populates="character")
    user_characters = relationship("UserCharacter", back_populates="character")
    notes = relationship("CharacterNote", back_populates="character")
    feature_uses = relationship("CharacterFeatureUse", back_populates="character")

    def to_dict(self):
        ability_scores = self.abilityScores or {
            "str": self.strength,
            "dex": self.dexterity,
            "con": self.constitution,
            "cha": self.charisma,
            "int": self.intelligence,
            "wis": self.wisdom,
        }
        return {
            "id": self.id,
            "name": self.name,
            "speciesID": self.speciesID,
            "backgroundID": self.backgroundID,
            "age": self.age,
            "alignment": self.alignment,
            "description": self.description,
            "level": self.level,
            "xp": self.xp,
            "curr_hp": self.curr_hp,
            "max_hp": self.max_hp,
            "tmp_hp": self.tmp_hp,
            "abilityScores": ability_scores,
            "strength": ability_scores.get("str", self.strength),
            "dexterity": ability_scores.get("dex", self.dexterity),
            "constitution": ability_scores.get("con", self.constitution),
            "charisma": ability_scores.get("cha", self.charisma),
            "intelligence": ability_scores.get("int", self.intelligence),
            "wisdom": ability_scores.get("wis", self.wisdom),
            "experiencePoints": self.experiencePoints,
            "hp": self.hp,
            "tmpHp": self.tmpHp,
            "maxhp": self.maxhp,
            "money": self.money,
            "inspiration": self.inspiration,
            "classes": [assoc.to_dict() if hasattr(assoc, "to_dict") else {
                "classID": getattr(assoc, "classID", None),
                "classLevel": getattr(assoc, "classLevel", None),
                "subclassID": getattr(assoc, "subclassID", None),
            } for assoc in self.class_associations],
        }

class Inventory(Base):
    __tablename__ = "inventory"
    id = Column("inventoryEntryID", Integer, primary_key=True, autoincrement=True)
    characterID = Column(Integer, ForeignKey("characters.characterID"), nullable=False)
    itemID = Column(Integer, ForeignKey("items.itemID"), nullable=False)
    quantity = Column(Integer, default=1)
    isEquipped = Column(Boolean, default=False)
    is_equipped = synonym("isEquipped")
    isAttuned = Column(Boolean, default=False)
    is_attuned = synonym("isAttuned")
    charges = Column(Integer, default=0)
    current_charges = synonym("charges")

    character = relationship("Character", back_populates="inventory")
    item = relationship("Item", back_populates="inventory_entries")

class CharacterConditions(Base):
    __tablename__ = "characterConditions"
    characterID = Column(Integer, ForeignKey("characters.characterID"), primary_key=True)
    conditionID = Column(Integer, ForeignKey("conditions.conditionID"), primary_key=True)
    value = Column(Integer)
    source = Column(String, nullable=True)

    character = relationship("Character", back_populates="conditions")
    condition = relationship("Conditions", back_populates="character_conditions")

class CharacterFeats(Base):
    __tablename__ = "characterFeats"
    characterID = Column(Integer, ForeignKey("characters.characterID"), primary_key=True)
    featsID = Column(Integer, ForeignKey("feats.featID"), primary_key=True)
    lvlAcquired = Column(Integer)
    source = Column(String, nullable=True)

    character = relationship("Character", back_populates="feats")
    feat = relationship("Feats", back_populates="character_feats")

class CharacterClass(Base):
    __tablename__ = "characterClasses"
    characterID = Column(Integer, ForeignKey("characters.characterID"), primary_key=True)
    classID = Column(Integer, ForeignKey("classes.classID"), primary_key=True)
    subclassID = Column(Integer, ForeignKey("subclasses.subclassID"), nullable=True)
    classLevel = Column(Integer, default=1)
    level = synonym("classLevel")
    hitDiceLeft = Column(Integer, default=1)

    character = relationship("Character", back_populates="class_associations")
    dndclass = relationship("DnDclass", back_populates="character_assoc")
    subclass = relationship("Subclass", back_populates="character_classes")

    def to_dict(self):
        return {
            "classID": self.classID,
            "className": self.dndclass.name if self.dndclass else None,
            "classLevel": self.classLevel,
            "level": self.classLevel,
            "subclassID": self.subclassID,
            "subclass": self.subclass.name if self.subclass else None,
        }

class CharacterSpell(Base):
    __tablename__ = "characterSpell"
    characterID = Column(Integer, ForeignKey("characters.characterID"), primary_key=True)
    spellID = Column(Integer, ForeignKey("spells.spellID"), primary_key=True)
    isPrepared = Column(Boolean, default=False)    
    character = relationship("Character", back_populates="spells")
    spell = relationship("Spell", back_populates="character_spells")

CharacterInventory = Inventory