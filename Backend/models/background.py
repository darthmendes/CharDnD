from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from . import Base

class Background(Base):
    __tablename__ = "backgrounds"    
    id = Column("backgroundID", Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)

    characters = relationship("Character", back_populates="background")
    equipment = relationship(
        "BackgroundEquipment",
        back_populates="background",
        cascade="all, delete-orphan",
    )
    proficiencies = relationship(
        "BackgroundProficiency",
        back_populates="background",
        cascade="all, delete-orphan",
    )
    details = relationship(
        "BackgroundDetails",
        back_populates="background",
        cascade="all, delete-orphan",
        uselist=False,
    )

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description
            }


class BackgroundDetails(Base):
    __tablename__ = "backgroundDetails"

    backgroundID = Column(
            Integer,
            ForeignKey("backgrounds.backgroundID"),
            primary_key=True,
    )
    featureName = Column(String, nullable=False)
    featureDescription = Column(String, nullable=False)
    startingEquipment = Column(JSON, nullable=False, default=list)
    startingGold = Column(Integer, nullable=False, default=0)

    background = relationship("Background", back_populates="details")
    
class BackgroundEquipment(Base):
    __tablename__ = "backgroundEquipment"
    backgroundID = Column(Integer, ForeignKey("backgrounds.backgroundID"), primary_key=True)
    itemID = Column(Integer, ForeignKey("items.itemID"), primary_key=True)
    quantity = Column(Integer, default=1)
    isChoice = Column(Boolean, default=False)
    choiceNum = Column(Integer, default=1)
    choiceGroup = Column(String, nullable=False)

    background = relationship("Background", back_populates="equipment")
    item = relationship("Item", back_populates="background_equipment")
    
from .proficiencies import BackgroundProficiency as BackgroundProficiencies