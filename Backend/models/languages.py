from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .utils import JSONType
from . import Base

class Language(Base):
    __tablename__ = 'languages'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    type = Column(String)
    desc = Column(String)

    entity_languages = relationship("EntityLanguage", back_populates="language")
    choice_languages = relationship("LanguageChoice", back_populates="language")

    def to_dict(self):
        return {
            "id": self.id,
            "name" :self.name,
            "desc" : self.desc
        } 
    
class EntityLanguage(Base):
    __tablename__ = "entity_language"
    id = Column(Integer, primary_key=True, autoincrement=True)
    sourceType = Column(String, nullable=False) # species, class etc
    sourceID = Column(Integer, nullable=False)
    languageID = Column(Integer, ForeignKey("languages.id"), nullable=False)

    language = relationship("Language", back_populates="entity_languages")


class LanguageChoice(Base):
    __tablename__ = "language_choices"
    id = Column(Integer, primary_key=True, autoincrement=True)
    groupID = Column(Integer, ForeignKey("language_choice_groups.id"), nullable=False)
    languageID = Column(Integer, ForeignKey("languages.id"), nullable=False)

    group = relationship("LanguageChoiceGroup", back_populates="choices")
    language = relationship("Language", back_populates="choice_languages")

class LanguageChoiceGroup(Base):
    __tablename__ = "language_choice_groups"
    id = Column(Integer, primary_key=True, autoincrement=True)
    sourceType = Column(String, nullable=False)
    sourceID = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    n_choices = Column(Integer, default= 1)

    choices = relationship("LanguageChoice", back_populates="group")