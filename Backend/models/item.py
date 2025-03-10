from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from . import Base
from .utils import JSONType 

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String,nullable=False)
    desc = Column(String)
    weight = Column(Integer)
    cost = Column(Integer)
    item_type = Column(String)
    item_category = Column(String)
    rarity = Column(String)
    properties = Column(JSONType)

    inventory_entries = relationship("CharacterInventory", back_populates="item")
    background_entries = relationship("BackgroundEquipment", back_populates="item")
    class_entries = relationship("ClassEquipment", back_populates="item")
    
    def to_dict(self):
        return {
            "id" : self.id,
            "name" : self.name,
            "desc" : self.desc,
            "weight" : self.weight,
            "cost" : self.cost,
            "item_type" : self.item_type,
            "item_category" : self.item_category,
            "rarity" : self.rarity,
            "properties" : self.properties
        }