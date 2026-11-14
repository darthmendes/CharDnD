from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .utils import JSONType
from . import Base

class Conditions(Base):
    __tablename__ = "conditions"
    id = Column("conditionID", Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)

    character_conditions = relationship("CharacterConditions", back_populates="condition")

    def to_dict(self):
        return {
            "id":self.id,
            "name":self.name,
            "description":self.description
        }