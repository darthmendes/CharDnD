from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from . import Base

class Traits(Base):
    __tablename__ = "traits"
    id = Column("traitID", Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)

    species_associations = relationship("SpeciesTraits", back_populates="trait")
    character_associations = relationship("CharacterTraits", back_populates="trait")

    def to_dict(self):
        return {
            "id":self.id,
            "name":self.name,
            "description":self.description
        }

class SpeciesTraits(Base):
    __tablename__ = "speciesTraits"
    speciesID = Column(Integer, ForeignKey("species.speciesID"), primary_key=True)
    traitID = Column(Integer, ForeignKey("traits.traitID"), primary_key=True)

    species = relationship("Species", back_populates="traits")
    trait = relationship("Traits", back_populates="species_associations")

class CharacterTraits(Base):
    __tablename__ = "characterTraits"
    characterID = Column(Integer, ForeignKey("characters.characterID"), primary_key=True)
    traitID = Column(Integer, ForeignKey("traits.traitID"), primary_key=True)

    character = relationship("Character", back_populates="traits")
    trait = relationship("Traits", back_populates="character_associations")


speciesTraits = SpeciesTraits
characterTraits = CharacterTraits