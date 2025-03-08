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
    # traits = Column(JSONType) # list 
    # starting_proficiencies = Column(JSONType) # list
    # starting_proficiencies_options = Column(JSONType) # {choose:1, list:[op1,op2,op3]}
    # languages = Column(JSONType) # list
    # languages_options = Column(JSONType)

    def to_dict(self):
        return {
            'id':self.id,
            'name':self.name,
            'size':self.size,
            'speed':self.speed,
            'abilityBonuses': self.ability_bonuses,
            'traits':self.traits}
        #     'languages':self.languages,
        #     'languages_options':self.languages_options
        # }

class SpeciesTraits(Base):
    __tablename__ = "species_traits"
    id = Column(Integer, primary_key=True, autoincrement=True)
    speciesID = Column(Integer, ForeignKey("species.id"), nullable=False)
    featureID = Column(Integer, ForeignKey("features.id"), nullable=False)