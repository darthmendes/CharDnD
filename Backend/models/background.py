from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from . import Base

class Background(Base):
    __tablename__ = "backgrounds"    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    desc = Column(String)
    
    # Proficiencies and skill bonuses
    skill_proficiencies = Column(JSON, default=list)  # List of skills
    tool_proficiencies = Column(JSON, default=list)   # List of tools
    languages = Column(JSON, default=list)            # Number of languages to choose
    
    # Starting gold bonus
    starting_gold_bonus = Column(Integer, default=0)  # Additional gold

    characters = relationship("Character", back_populates="background")
    equipment = relationship("BackgroundEquipment", back_populates="background")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.desc,
            'skill_proficiencies': self.skill_proficiencies or [],
            'tool_proficiencies': self.tool_proficiencies or [],
            'languages': self.languages or [],
            'starting_gold_bonus': self.starting_gold_bonus or 0,
        }
    
class BackgroundEquipment(Base):
    __tablename__ = "background_equipment"
    id = Column(Integer, primary_key=True, autoincrement=True)
    backgroundID = Column(Integer, ForeignKey("backgrounds.id"), nullable=False)
    itemID = Column(Integer, ForeignKey("items.id"), nullable=False)
    quantity = Column(Integer, default=1)

    background = relationship("Background", back_populates="equipment")
    item = relationship("Item", back_populates="background_entries")
    