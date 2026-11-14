from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from . import Base


class User(Base):
    __tablename__ = "User"

    id = Column("userID", Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)

    characters = relationship("UserCharacter", back_populates="user")

class UserCharacter(Base):
    __tablename__ = "userCharacters"

    userID = Column(Integer, ForeignKey("User.userID"), primary_key=True)
    characterID = Column(Integer, ForeignKey("characters.characterID"), primary_key=True)
    creationDate = Column(DateTime)

    user = relationship("User", back_populates="characters")
    character = relationship("Character", back_populates="user_characters")

class Notes(Base):
    __tablename__ = "Notes"

    id = Column("noteID", Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    updateDate = Column(DateTime)
    text = Column(String)

    character_notes = relationship("CharacterNote", back_populates="note")

class CharacterNote(Base):
    __tablename__ = "characterNotes"

    characterID = Column(Integer, ForeignKey("characters.characterID"), primary_key=True)
    noteID = Column(Integer, ForeignKey("Notes.noteID"), primary_key=True)
    creationDate = Column(DateTime)

    character = relationship("Character", back_populates="notes")
    note = relationship("Notes", back_populates="character_notes")

class MovementType(Base):
    __tablename__ = "movementType"

    id = Column("movTypeID", Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(String)

    species_speeds = relationship("SpeciesSpeed", back_populates="movement_type")

class SpellCombatEffect(Base):
    __tablename__ = "spellCombatEffect"

    spellID = Column(Integer, ForeignKey("spells.spellID"), primary_key=True)
    baseDice = Column(String)
    upCastDiceCount = Column(Integer)
    upCastLevelInterval = Column(Integer)
    typeID = Column(Integer, ForeignKey("spellTypes.typeID"))
    savingThrow = Column(String)

    spell = relationship("Spell", back_populates="combat_effects")
    spell_type = relationship("SpellType", back_populates="combat_effects")

class SpellTag(Base):
    __tablename__ = "spellTags"

    spellID = Column(Integer, ForeignKey("spells.spellID"), primary_key=True)
    tagID = Column(Integer, ForeignKey("Tags.tagID"), primary_key=True)

    spell = relationship("Spell", back_populates="tag_associations")
    tag = relationship("Tag", back_populates="spell_associations")

class SpellSlotProgression(Base):
    __tablename__ = "spellSlotProgression"

    progressionID = Column(Integer, ForeignKey("casterProgression.progressionID"), primary_key=True)
    classLevel = Column(Integer, primary_key=True)
    spellLevel = Column(Integer, primary_key=True)
    slotCount = Column(Integer, nullable=False)

    caster_progression = relationship("CasterProgression", back_populates="spell_slot_progressions")

class CharacterSpellSlot(Base):
    __tablename__ = "characterSpellSlots"

    characterID = Column(Integer, ForeignKey("characters.characterID"), primary_key=True)
    slotLevel = Column(Integer, primary_key=True)
    expendedSlots = Column(Integer, nullable=False, default=0)

    character = relationship("Character", back_populates="spell_slot_usage")

class RechargeTrigger(Base):
    __tablename__ = "rechargeTrigger"

    id = Column("rechargeTriggerID", Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)

    magic_items = relationship("MagicItem", back_populates="recharge_trigger")

class SpellType(Base):
    __tablename__ = "spellTypes"

    id = Column("typeID", Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)

    combat_effects = relationship("SpellCombatEffect", back_populates="spell_type")

class SpellSchool(Base):
    __tablename__ = "spellSchools"

    id = Column("schoolID", Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(String)

    spells = relationship("Spell", back_populates="spell_school")

class SpellCategory(Base):
    __tablename__ = "spellCategory"

    id = Column("spellCategoryID", Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)

    spells = relationship("Spell", back_populates="category")

class SpellEffectType(Base):
    __tablename__ = "spellEffectTypes"

    id = Column("effectTypeID", Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)

    spells = relationship("Spell", back_populates="effect_type")

class CreatureSize(Base):
    __tablename__ = "creatureSizes"

    id = Column("sizeID", Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)
    value = Column(Integer, nullable=False)
    description = Column(String)

    species = relationship("Species", back_populates="size")

class EffectType(Base):
    __tablename__ = "effectTypes"

    id = Column("effectID", Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)

    item_effects = relationship("ItemEffects", back_populates="effect_type")

class CasterProgression(Base):
    __tablename__ = "casterProgression"

    id = Column("progressionID", Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)

    dndclasses = relationship("DnDclass", back_populates="caster_progression")
    spell_slot_progressions = relationship("SpellSlotProgression", back_populates="caster_progression")

class Tag(Base):
    __tablename__ = "Tags"

    id = Column("tagID", Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)

    item_associations = relationship("ItemTags", back_populates="tag")
    spell_associations = relationship("SpellTag", back_populates="tag")

class CharacterFeatureUse(Base):
    __tablename__ = "characterFeatureUses"

    characterID = Column(Integer, ForeignKey("characters.characterID"), primary_key=True)
    featureID = Column(Integer, ForeignKey("features.featureID"), primary_key=True)
    usesExpended = Column(Integer, nullable=False, default=0)

    character = relationship("Character", back_populates="feature_uses")
    feature = relationship("Features", back_populates="character_uses")