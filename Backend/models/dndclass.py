from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from . import Base

class DnDclass(Base):
    __tablename__ = "dnd_class"    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    hit_dice = Column(String) 

    class_features = relationship("ClassFeatures", back_populates= "dnd_class")
    class_equipment = relationship("ClassEquipment", back_populates="dnd_class")
    character_assoc = relationship("CharacterClass", back_populates="dnd_class")


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
