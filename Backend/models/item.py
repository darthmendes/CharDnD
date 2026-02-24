from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from . import Base
from ..constants import ITEM_TYPES

VALID_TYPES_LIST = sorted(ITEM_TYPES)

class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    item_type = Column(String, nullable=False)
    item_category = Column(String)
    rarity = Column(String, default="common")
    desc = Column(String)
    weight = Column(Integer, default=0)
    cost = Column(Integer, default=0)
    
    # ✅ Weapon properties (simple keywords only)
    properties = Column(JSON, default=list)
    
    # ✅ NEW: Property metadata (all extra data in one JSON field)
    property_data = Column(JSON, default=dict)
    
    # Weapon-specific fields
    damage_dice = Column(String)
    damage_type = Column(String)
    special_abilities = Column(JSON, default=list)
    
    # Magical item fields
    max_charges = Column(Integer)
    current_charges = Column(Integer)
    charge_recharge = Column(String)
    on_hit_effect = Column(String)
    
    # Relationships
    inventory_entries = relationship("CharacterInventory", back_populates="item")
    class_entries = relationship("ClassEquipment", back_populates="item")
    background_entries = relationship("BackgroundEquipment", back_populates="item")
    item_choice = relationship("ItemChoice", back_populates="item")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'item_type': self.item_type,
            'item_category': self.item_category,
            'rarity': self.rarity,
            'desc': self.desc,
            'weight': self.weight,
            'cost': self.cost,
            'properties': self.properties or [],
            'property_data': self.property_data or {},  # ✅ NEW
            'damage_dice': self.damage_dice,
            'damage_type': self.damage_type,
            'special_abilities': self.special_abilities or [],
            'max_charges': self.max_charges,
            'current_charges': self.current_charges,
            'charge_recharge': self.charge_recharge,
            'on_hit_effect': self.on_hit_effect
        }

# --- Other classes unchanged ---
class ItemChoice(Base):
    __tablename__ = "itemchoice"
    id = Column(Integer, autoincrement=True, primary_key=True)
    groupID = Column(Integer, ForeignKey("itemchoicegroup.id"), nullable=False)
    itemID = Column(Integer, ForeignKey("items.id"), nullable=False)

    group = relationship("ItemChoiceGroup", back_populates="choices")
    item = relationship("Item", back_populates="item_choice")


class ItemChoiceGroup(Base):
    __tablename__ = "itemchoicegroup"
    id = Column(Integer, primary_key=True, autoincrement=True)
    sourceType = Column(String, nullable=False)
    sourceID = Column(Integer, nullable=False)
    name = Column(String)
    n_choices = Column(Integer, default=1)

    choices = relationship("ItemChoice", back_populates="group")