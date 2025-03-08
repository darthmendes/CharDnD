from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from . import Base

class Background(Base):
    __tablename__ = "backgrounds"    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    desc = Column(String)

    characters = relationship("Character", back_populates= "backgrounds")
    equipment = relationship("BackgroundEquipment", back_populates="backgrounds")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }
    
class BackgroundEquipment(Base):
    __tablename__ = "background_equipment"
    id = Column(Integer, primary_key=True, autoincrement=True)
    backgroundID = Column(Integer, ForeignKey("backgrounds.id"), nullable=False)
    itemID = Column(Integer, ForeignKey("items.id"), nullable=False)
    quantity = Column(Integer, default=1)
    