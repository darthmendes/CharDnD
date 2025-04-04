from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from . import Base
from .utils import JSONType

class DnDclass(Base):
    __tablename__ = "dndclass"    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    hit_dice = Column(Integer, nullable=False) 
    saving_throws = Column(JSONType)

    class_features = relationship("ClassFeatures", back_populates= "dndclass")
    class_equipment = relationship("ClassEquipment", back_populates="dndclass")
    character_assoc = relationship("CharacterClass", back_populates="dndclass")

    guaranteed_proficiencies = relationship(
        "EntityProficiency",
        primaryjoin="and_(DnDclass.id == foreign(EntityProficiency.sourceID), EntityProficiency.sourceType == 'class')",
        viewonly=True
    )

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'class_features':[ep.features.to_dict() for ep in self.class_features]
        }


class ClassEquipment(Base):
    __tablename__ = "class_equipment"
    id = Column(Integer, primary_key=True, autoincrement=True)
    classID = Column(Integer, ForeignKey("dndclass.id"), nullable=False)
    itemID = Column(Integer, ForeignKey("items.id"), nullable=False)
    quantity = Column(Integer, default=1)

    dndclass = relationship("DnDclass", back_populates= "class_equipment")
    item = relationship("Item", back_populates="class_entries")

class ClassFeatures(Base):
    __tablename__ = "class_features"
    id = Column(Integer, primary_key=True, autoincrement=True)
    classID = Column(Integer, ForeignKey("dndclass.id"), nullable=False)
    featureID = Column(Integer, ForeignKey("features.id"), nullable=False)
    level = Column(Integer, nullable = False)   
    
    dndclass = relationship("DnDclass", back_populates= "class_features")
    features = relationship("Features", back_populates="classFeatures")