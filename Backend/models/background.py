from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from . import Base

class Background(Base):
    __tablename__ = "background"    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)

    characters = relationship("Character", back_populates= "background")
    equipment = relationship("BackgroundEquipment", back_populates="background")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }