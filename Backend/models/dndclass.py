from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from . import Base

class DnDclass(Base):
    __tablename__ = "classes"
    id = Column("classID", Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    hit_dice = Column("hitDice", Integer, nullable=False) 
    description = Column(String)
    spellcasting_ability = Column("spellcastingAbility", String)
    caster_progression_id = Column("casterProgression",Integer,ForeignKey("casterProgression.progressionID"))

    # Relationships
    caster_progression = relationship("CasterProgression", back_populates="dndclasses")
    subclasses = relationship("Subclass", back_populates="parent_class")
    class_equipment = relationship("ClassEquipment", back_populates="dndclass")
    character_assoc = relationship("CharacterClass", back_populates="dndclass")
    class_spells = relationship("ClassSpell", back_populates="dndclass")
    proficiencies = relationship("ClassProficiency", back_populates="dndclass")
    features = relationship("Features", back_populates="dndclass")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'hit_dice': self.hit_dice,
            'spellcasting_ability': self.spellcasting_ability,
            'caster_progression_id': self.caster_progression_id,
            'subclasses': [sc.to_dict() for sc in self.subclasses],
        }


class Subclass(Base):
    __tablename__ = "subclasses"
    
    id = Column("subclassID", Integer, primary_key=True)
    classID = Column(Integer, ForeignKey("classes.classID"), nullable=False)
    name = Column(String, nullable=False)  # e.g., "Path of the Berserker"
    subclass_flavor = Column("Description", String)
    
    # Relationships
    parent_class = relationship("DnDclass", back_populates="subclasses")
    character_classes = relationship("CharacterClass", back_populates="subclass")
    features = relationship("Features", back_populates="subclass")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "subclass_flavor": self.subclass_flavor,
        }


class ClassEquipment(Base):
    __tablename__ = "classEquipment"
    classID = Column(Integer, ForeignKey("classes.classID"), primary_key=True)
    itemID = Column(Integer, ForeignKey("items.itemID"), primary_key=True)
    quantity = Column(Integer, default=1)
    isChoice = Column(Boolean, default=False)
    choiceNum = Column(Integer)
    choiceGroup = Column(String)

    dndclass = relationship("DnDclass", back_populates="class_equipment")
    item = relationship("Item", back_populates="class_equipment")


class ClassSpell(Base):
    """
    Junction table defining which spells each class can learn.
    
    This is the MASTER LIST of spell availability per class.
    """
    __tablename__ = "classSpell"
    
    classID = Column(Integer, ForeignKey("classes.classID"), primary_key=True, index=True)
    spellID = Column(Integer, ForeignKey("spells.spellID"), primary_key=True, index=True)
    min_level = Column(Integer, nullable=False, default=1, server_default="1")
    
    # Relationships
    dndclass = relationship("DnDclass", back_populates="class_spells")
    spell = relationship("Spell", back_populates="class_spells")
    
    def to_dict(self):
        return {
            'classID': self.classID,
            'spellID': self.spellID,
            'class': self.dndclass.to_dict() if self.dndclass else None,
            'spell': self.spell.to_dict() if self.spell else None
        }