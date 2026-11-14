from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from . import Base
from .utils import JSONType

class Features(Base):
    __tablename__ = "features"
    id = Column("featureID", Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    desc = Column("description", String)
    level = Column(Integer)
    classID = Column(Integer, ForeignKey("classes.classID"))
    subclassID = Column(Integer, ForeignKey("subclasses.subclassID"))
    type = Column(String)
    target = Column(String)
    values = Column(JSONType)

    dndclass = relationship("DnDclass", back_populates="features")
    subclass = relationship("Subclass", back_populates="features")
    character_uses = relationship("CharacterFeatureUse", back_populates="feature")
    
    def to_dict(self):
        return {
            "id" : self.id,
            "name" : self.name,
            "description" : self.desc,
            "level": self.level,
            "classID": self.classID,
            "subclassID": self.subclassID,
            "type": self.type,
            "target": self.target,
            "values": self.values,
        }