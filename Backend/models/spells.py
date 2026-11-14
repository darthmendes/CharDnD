# Backend/models/spell.py

from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from . import Base

class Spell(Base):
    __tablename__ = "spells"

    id = Column("spellID", Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=False)
    schoolID = Column(Integer, ForeignKey("spellSchools.schoolID"))
    level = Column(Integer, nullable=False)
    castingTime = Column(String, nullable=False)
    range = Column(String, nullable=False)
    duration = Column(String, nullable=False)
    hasVerbal = Column(Boolean, default=False)
    hasSomatic = Column(Boolean, default=False)
    materialComponents = Column(Text)
    isRitual = Column(Boolean, default=False)
    effectTypeID = Column(Integer, ForeignKey("spellEffectTypes.effectTypeID"))
    spellCategoryID = Column(Integer, ForeignKey("spellCategory.spellCategoryID"))

    spell_school = relationship("SpellSchool", back_populates="spells")
    effect_type = relationship("SpellEffectType", back_populates="spells")
    category = relationship("SpellCategory", back_populates="spells")
    class_spells = relationship("ClassSpell", back_populates="spell")
    character_spells = relationship("CharacterSpell", back_populates="spell")
    combat_effects = relationship("SpellCombatEffect", back_populates="spell")
    tag_associations = relationship("SpellTag", back_populates="spell")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'schoolID': self.schoolID,
            'level': self.level,
            'castingTime': self.castingTime,
            'range': self.range,
            'duration': self.duration,
            'hasVerbal': self.hasVerbal,
            'hasSomatic': self.hasSomatic,
            'materialComponents': self.materialComponents,
            'isRitual': self.isRitual,
            'effectTypeID': self.effectTypeID,
            'spellCategoryID': self.spellCategoryID,
        }