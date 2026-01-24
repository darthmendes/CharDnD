from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from . import Base
from .utils import JSONType

class Features(Base):
    __tablename__ = "features"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    desc = Column(String)
    properties = Column(JSONType) # ac_modifiers, damage, class specifics, etcs
    
    classFeatures = relationship("ClassFeatures", back_populates="features")
    species_traits = relationship("SpeciesTraits", back_populates="features")
    featureLevels = relationship("FeatureLevel", back_populates="feature")

    def to_dict(self):
        return {
            "id" : self.id,
            "name" : self.name,
            "description" : self.desc,
            "feature_levels" : [ep.to_dict() for ep in self.featureLevels]
        }
    
class FeatureLevel(Base):
    __tablename__ = "feature_level"
    id= Column(Integer, primary_key=True, autoincrement=True)
    featureID = Column(Integer, ForeignKey("features.id"))
    level = Column(Integer, nullable=False)
    attributes = Column(JSONType)

    feature = relationship("Features", back_populates="featureLevels")
    
    def to_dict(self):
        return {
            "level":self.level,
            "attributes":self.attributes
        }