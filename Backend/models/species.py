from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .utils import JSONType
from . import Base

class Species(Base):

    __tablename__ = "species"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    ability_bonuses = Column(JSONType) #format {STR:1,DEX:1} where you add bonus to the specific ability score
    size = Column(String) 
    speed = Column(Integer)


    characters = relationship("Character", back_populates="species")
    traits = relationship("SpeciesTraits", back_populates="species")

    languages = relationship(
        "EntityLanguage",
        primaryjoin="and_(Species.id == foreign(EntityLanguage.sourceID), EntityLanguage.sourceType == 'species')",
        viewonly=True
        )
    
    optional_languages = relationship(
        "LanguageChoiceGroup",
        primaryjoin="and_(Species.id == foreign(LanguageChoiceGroup.sourceID), LanguageChoiceGroup.sourceType == 'species')",
        viewonly=True
    )

    guaranteed_proficiencies = relationship(
        "EntityProficiency",
        primaryjoin="and_(Species.id == foreign(EntityProficiency.sourceID), EntityProficiency.sourceType == 'species')",
        viewonly=True
    )

    optional_proficiencies = relationship(
        "ProficiencyChoiceGroup",
        primaryjoin="and_(Species.id == foreign(ProficiencyChoiceGroup.sourceID), ProficiencyChoiceGroup.sourceType == 'species')",
        viewonly=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "ability_bonuses": self.ability_bonuses,
            "size": self.size,
            "speed": self.speed,
            "guaranteed_proficiencies": [ep.proficiency.to_dict() for ep in self.guaranteed_proficiencies],
            "optional_proficiencies": [
                {
                    "group_id": group.id,
                    "name": group.name,
                    "n_choices": group.n_choices,
                    "options": [choice.proficiency.to_dict() for choice in group.choices]
                }
                for group in self.optional_proficiencies
            ],
            "traits" : [ep.features.to_dict() for ep in self.traits],
            "languages" : [ep.language.to_dict() for ep in self.languages],
            "optional_languages": [
                {
                    "group_id": group.id,
                    "name": group.name,
                    "n_choices": group.n_choices,
                    "options": [choice.language.to_dict() for choice in group.choices]
                }
                for group in self.optional_languages
            ]
        }

class SpeciesTraits(Base):
    __tablename__ = "species_traits"
    id = Column(Integer, primary_key=True, autoincrement=True)
    speciesID = Column(Integer, ForeignKey("species.id"), nullable=False)
    featureID = Column(Integer, ForeignKey("features.id"), nullable=False)

    species = relationship("Species", back_populates="traits")
    features = relationship("Features", back_populates="speciesTraits")
