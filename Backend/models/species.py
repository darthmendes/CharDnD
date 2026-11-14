from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from . import Base
from .traits import SpeciesTraits

class Species(Base):
    __tablename__ = "species"
    
    id = Column("speciesID", Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    creatureType = Column(String, nullable=False)
    sizeID = Column(Integer, ForeignKey("creatureSizes.sizeID"), nullable=False)
    parent = Column(Integer, ForeignKey("species.speciesID"), nullable=True)

    size = relationship("CreatureSize", back_populates="species")
    parent_species = relationship(
        "Species",
        remote_side=[id],
        foreign_keys=[parent],
        back_populates="subspecies",
    )
    subspecies = relationship("Species", foreign_keys=[parent], back_populates="parent_species")
    characters = relationship("Character", back_populates="species")
    speeds = relationship("SpeciesSpeed", back_populates="species")
    traits = relationship("SpeciesTraits", back_populates="species")
    proficiencies = relationship("SpeciesProficiency", back_populates="species")

class SpeciesSpeed(Base):
    __tablename__ = "speciesSpeed"
    speciesID = Column(Integer, ForeignKey("species.speciesID"), primary_key=True)
    movTypeID = Column(Integer, ForeignKey("movementType.movTypeID"), primary_key=True)
    value = Column(Integer, default=30)

    species = relationship("Species", back_populates="speeds")
    movement_type = relationship("MovementType", back_populates="species_speeds")
