from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .utils import JSONType
from . import Base

class Proficiency(Base):
    __tablename__ = "proficiencies"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    itemID = Column(String, ForeignKey("items.id"), nullable=True)

    entity_proficiencies = relationship("EntityProficiency", back_populates="proficiency")
    choice_proficiencies = relationship("ProficiencyChoice", back_populates="proficiency")

    def to_dict(self):
        return {
            "id":self.id,
            "name":self.name,
            "type":self.type,
            "itemID": self.itemID
        }

class EntityProficiency(Base):
    __tablename__ = "entity_proficiency"
    id = Column(Integer, primary_key=True, autoincrement=True)
    sourceType = Column(String, nullable=False) # species, class etc
    sourceID = Column(Integer, nullable=False)
    proficiencyID = Column(Integer, ForeignKey("proficiencies.id"), nullable=False)

    proficiency = relationship("Proficiency", back_populates="entity_proficiencies")

class ProficiencyChoice(Base):
    __tablename__ = "proficiency_choices"
    id = Column(Integer, primary_key=True, autoincrement=True)
    groupID = Column(Integer, ForeignKey("proficiency_choice_groups.id"), nullable=False)
    proficiencyID = Column(Integer, ForeignKey("proficiencies.id"), nullable=False)

    group = relationship("ProficiencyChoiceGroup", back_populates="choices")
    proficiency = relationship("Proficiency", back_populates="choice_proficiencies")

class ProficiencyChoiceGroup(Base):
    __tablename__ = "proficiency_choice_groups"
    id = Column(Integer, primary_key=True, autoincrement=True)
    sourceType = Column(String, nullable=False)
    sourceID = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    n_choices = Column(Integer, default= 1)

    choices = relationship("ProficiencyChoice", back_populates="group")
