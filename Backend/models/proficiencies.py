from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from . import Base

class Proficiency(Base):
    __tablename__ = "proficiencies"
    id = Column("proficiencyID", Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    type = Column(String, nullable=False)
    baseAbility = Column(String, nullable=False)

    feat_associations = relationship("FeatProficiency", back_populates="proficiency")
    character_associations = relationship("CharacterProficiency", back_populates="proficiency")
    species_associations = relationship("SpeciesProficiency", back_populates="proficiency")
    background_associations = relationship("BackgroundProficiency", back_populates="proficiency")
    class_associations = relationship("ClassProficiency", back_populates="proficiency")

    def to_dict(self):
        return {
            "id":self.id,
            "name":self.name,
            "description":self.description,
            "type":self.type,
            "baseAbility": self.baseAbility
        }

class FeatProficiency(Base):
    __tablename__ = "featProficiencies"
    featID = Column(Integer, ForeignKey("feats.featID"), primary_key=True)
    proficiencyID = Column(Integer, ForeignKey("proficiencies.proficiencyID"), primary_key=True)

    feat = relationship("Feats", back_populates="proficiency_associations")
    proficiency = relationship("Proficiency", back_populates="feat_associations")

class CharacterProficiency(Base):
    __tablename__ = "characterProficiency"
    characterID = Column(Integer, ForeignKey("characters.characterID"), primary_key=True)
    proficiencyID = Column(Integer, ForeignKey("proficiencies.proficiencyID"), primary_key=True)

    character = relationship("Character", back_populates="proficiencies")
    proficiency = relationship("Proficiency", back_populates="character_associations")

class SpeciesProficiency(Base):
    __tablename__ = "speciesProficiency"
    speciesID = Column(Integer, ForeignKey("species.speciesID"), primary_key=True)
    proficiencyID = Column(Integer, ForeignKey("proficiencies.proficiencyID"), primary_key=True)

    species = relationship("Species", back_populates="proficiencies")
    proficiency = relationship("Proficiency", back_populates="species_associations")

class BackgroundProficiency(Base):
    __tablename__ = "backgroundProficiencies"
    backgroundID = Column(Integer, ForeignKey("backgrounds.backgroundID"), primary_key=True)
    proficiencyID = Column(Integer, ForeignKey("proficiencies.proficiencyID"), primary_key=True)
    isChoice = Column(Boolean, default=False)
    choiceNumber = Column(Integer)
    choiceGroup = Column(String)

    background = relationship("Background", back_populates="proficiencies")
    proficiency = relationship("Proficiency", back_populates="background_associations")


class ClassProficiency(Base):
    __tablename__ = "classProficiencies"

    classID = Column(Integer, ForeignKey("classes.classID"), primary_key=True)
    proficiencyID = Column(Integer, ForeignKey("proficiencies.proficiencyID"), primary_key=True)

    dndclass = relationship("DnDclass", back_populates="proficiencies")
    proficiency = relationship("Proficiency", back_populates="class_associations")
