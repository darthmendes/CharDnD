# Backend/models/species.py

from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from . import Base

class Species(Base):
    __tablename__ = "species"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    
    # Ability score modifiers
    ability_bonuses = Column(JSON, default=dict)
    ability_choices = Column(JSON, default=list)
    
    # Physical traits
    size = Column(String)  # "Small", "Medium", etc.
    age_adulthood = Column(Integer)  # Age of adulthood
    lifespan = Column(Integer)       # Typical lifespan
    alignment_tendency = Column(String)  # e.g., "Lawful Good"
    
    # Movement
    movement = Column(JSON, default=lambda: {"walk": 30})
    ignore_heavy_armor_speed_penalty = Column(Boolean, default=False)
    
    # Senses
    darkvision = Column(Integer, default=0)  # in feet
    
    # Relationships
    characters = relationship("Character", back_populates="species")
    subspecies = relationship("Subspecies", back_populates="parent_species")
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
            "ability_bonuses": self.ability_bonuses or {},
            "ability_choices": self.ability_choices or [],
            "size": self.size,
            "age_adulthood": self.age_adulthood,
            "lifespan": self.lifespan,
            "alignment_tendency": self.alignment_tendency,
            "movement": self.movement or {"walk": 30},
            "ignore_heavy_armor_speed_penalty": self.ignore_heavy_armor_speed_penalty,
            "darkvision": self.darkvision,
            "has_subspecies": len(self.subspecies) > 0,
            "subspecies": [s.to_dict() for s in self.subspecies],
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
            # Include traits with full feature details
            "traits": [trait.to_dict() for trait in self.traits],
            "languages": [ep.language.to_dict() for ep in self.languages],
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


class Subspecies(Base):
    __tablename__ = "subspecies"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    species_id = Column(Integer, ForeignKey("species.id"), nullable=False)
    name = Column(String, nullable=False)
    ability_bonuses = Column(JSON, default=dict)
    ability_choices = Column(JSON, default=list)
    movement = Column(JSON, default=None)
    darkvision = Column(Integer, default=None)
    hp_bonus_per_level = Column(Integer, default=0)

    parent_species = relationship("Species", back_populates="subspecies")
    traits = relationship("SpeciesTraits", back_populates="subspecies")
    guaranteed_proficiencies = relationship(
        "EntityProficiency",
        primaryjoin="and_(Subspecies.id == foreign(EntityProficiency.sourceID), EntityProficiency.sourceType == 'subspecies')",
        viewonly=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "ability_bonuses": self.ability_bonuses or {},
            "ability_choices": self.ability_choices or [],
            "movement": self.movement,
            "darkvision": self.darkvision,
            "hp_bonus_per_level": self.hp_bonus_per_level,
            "traits": [trait.to_dict() for trait in self.traits],
            "guaranteed_proficiencies": [ep.proficiency.to_dict() for ep in self.guaranteed_proficiencies],
        }


class SpeciesTraits(Base):
    __tablename__ = "species_traits"
    id = Column(Integer, primary_key=True, autoincrement=True)
    species_id = Column(Integer, ForeignKey("species.id"), nullable=True)
    subspecies_id = Column(Integer, ForeignKey("subspecies.id"), nullable=True)
    feature_id = Column(Integer, ForeignKey("features.id"), nullable=False)

    species = relationship("Species", back_populates="traits")
    subspecies = relationship("Subspecies", back_populates="traits")
    features = relationship("Features", back_populates="species_traits")

    def to_dict(self):
        """Return feature data directly (flattened structure for frontend)."""
        if self.features:
            return self.features.to_dict()
        return None