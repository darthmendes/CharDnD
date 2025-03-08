from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from . import Base

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String,nullable=False)
    desc = Column(String)
    weight = Column(Integer)
    cost = Column(Integer)

    inventory_entries = relationship("CharacterInventory", back_populates="item")
    background_entries = relationship("BackgroundEquipment", back_populates="item")
    class_entries = relationship("ClassEquipment", back_populates="item")