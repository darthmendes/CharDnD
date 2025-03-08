from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from . import Base

class DnDclass(Base):
    __tablename__ = "dndclass"    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    hit_dice = Column(String) 

    class_features = relationship("ClassFeatures", back_populates= "dndclass")
    class_equipment = relationship("ClassEquipment", back_populates="dndclass")
    character_assoc = relationship("CharacterClass", back_populates="dndclass")


    # proficiency_choices = Column(JSONType)
    # proficiencies = Column(JSONType)
    # saving_throws = Column(JSONType) 
    # starting_equipment = Column(JSONType) 
    # starting_equipment_choices = Column(JSONType)
    # multiclassing = Column(JSONType)
    # subclasses = Column(JSONType)
    # spellcasting = Column(JSONType)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }


class ClassEquipment(Base):
    __tablename__ = "class_equipment"
    id = Column(Integer, primary_key=True, autoincrement=True)
    classID = Column(Integer, ForeignKey("dndclass.id"), nullable=False)
    itemID = Column(Integer, ForeignKey("items.id"), nullable=False)
    quantity = Column(Integer, default=1)

class ClassFeatures(Base):
    __tablename__ = "class_features"
    id = Column(Integer, primary_key=True, autoincrement=True)
    classID = Column(Integer, ForeignKey("dndclass.id"), nullable=False)
    featureID = Column(Integer, ForeignKey("features.id"), nullable=False)