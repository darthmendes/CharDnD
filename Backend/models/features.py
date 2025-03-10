from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from . import Base

class Features(Base):
    __tablename__ = "features"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    desc = Column(String)
    # missing rulings and etc like features that change AC or speed
    
    classFeatures = relationship("ClassFeatures", back_populates="features")
    speciesTraits = relationship("SpeciesTraits", back_populates="features")

    def to_dict(self):
        return {
            "id" : self.id,
            "name" : self.name,
            "desc" : self.desc
        }