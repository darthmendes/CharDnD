from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from . import Base
from .utils import JSONType

class DnDclass(Base):
    __tablename__ = "dndclass"    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    hit_dice = Column(Integer, nullable=False) 
    saving_throws = Column(JSONType)
    
    # New fields for class preview
    primary_ability = Column(String)
    armor_proficiencies = Column(JSONType)
    weapon_proficiencies = Column(JSONType)
    tool_proficiencies = Column(JSONType)
    skill_choices = Column(JSONType)
    subclass_level = Column(Integer, default=3)  # Level at which subclass is chosen (default 3, Druid is 2)

    # Relationships
    subclasses = relationship("Subclass", back_populates="parent_class")
    class_features = relationship("ClassFeatures", back_populates="dndclass")
    class_equipment = relationship("ClassEquipment", back_populates="dndclass")
    character_assoc = relationship("CharacterClass", back_populates="dndclass")

    guaranteed_proficiencies = relationship(
        "EntityProficiency",
        primaryjoin="and_(DnDclass.id == foreign(EntityProficiency.sourceID), EntityProficiency.sourceType == 'class')",
        viewonly=True
    )

    def to_dict(self):
        # Include level information with features (for preview)
        # Only include class features, NOT subclass features (subclass features come from subclasses)
        seen = set()
        unique_features = []
        for cf in self.class_features:
            if cf.subclassID is None and cf.features and cf.features.name not in seen:
                seen.add(cf.features.name)
                feature_data = cf.features.to_dict()
                feature_data['level'] = cf.level  # Add the level at which feature is gained
                unique_features.append(feature_data)
        
        return {
            'id': self.id,
            'name': self.name,
            'hit_dice': self.hit_dice,
            'saving_throws': self.saving_throws or [],
            'primary_ability': self.primary_ability or "",
            'armor_proficiencies': self.armor_proficiencies or [],
            'weapon_proficiencies': self.weapon_proficiencies or [],
            'tool_proficiencies': self.tool_proficiencies or [],
            'skill_choices': self.skill_choices or {"n_choices": 0, "options": []},
            'subclass_level': self.subclass_level or 3,
            'subclasses': [sc.to_dict() for sc in self.subclasses],
            'class_features': unique_features
        }


class Subclass(Base):
    __tablename__ = "subclasses"
    
    id = Column(Integer, primary_key=True)
    class_id = Column(Integer, ForeignKey("dndclass.id"), nullable=False)
    name = Column(String, nullable=False)  # e.g., "Path of the Berserker"
    subclass_flavor = Column(String)       # e.g., "Primal Path"
    
    # Relationships
    parent_class = relationship("DnDclass", back_populates="subclasses")
    features = relationship("ClassFeatures", back_populates="subclass")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "subclass_flavor": self.subclass_flavor,
            "features": [
                {**cf.features.to_dict(), 'level': cf.level}
                for cf in self.features if cf.features
            ]
        }


class ClassEquipment(Base):
    __tablename__ = "class_equipment"
    id = Column(Integer, primary_key=True, autoincrement=True)
    classID = Column(Integer, ForeignKey("dndclass.id"), nullable=False)
    itemID = Column(Integer, ForeignKey("items.id"), nullable=False)
    quantity = Column(Integer, default=1)

    dndclass = relationship("DnDclass", back_populates="class_equipment")
    item = relationship("Item", back_populates="class_entries")


class ClassFeatures(Base):
    __tablename__ = "class_features"
    id = Column(Integer, primary_key=True, autoincrement=True)
    classID = Column(Integer, ForeignKey("dndclass.id"), nullable=True)
    subclassID = Column(Integer, ForeignKey("subclasses.id"), nullable=True)  # ✅ Added subclassID
    featureID = Column(Integer, ForeignKey("features.id"), nullable=False)
    level = Column(Integer, nullable=False)   

    dndclass = relationship("DnDclass", back_populates="class_features")
    subclass = relationship("Subclass", back_populates="features")
    features = relationship("Features", back_populates="classFeatures")