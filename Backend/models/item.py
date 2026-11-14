from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from . import Base

class Item(Base):
    __tablename__ = "items"
    id = Column("itemID", Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    cost = Column(Integer, default=0)
    weight = Column(Integer, default=0)
    typeID = Column(Integer, ForeignKey("itemTypes.typeID"))
    categoryID = Column(Integer, ForeignKey("itemCategories.categoryID"))

    item_type = relationship("ItemTypes", back_populates="items")
    category = relationship("ItemCategories", back_populates="items")
    weapon_details = relationship("WeaponItem", back_populates="item")
    armor_details = relationship("ArmorItem", back_populates="item")
    magic_details = relationship("MagicItem", back_populates="item")
    inventory_entries = relationship("Inventory", back_populates="item")
    class_equipment = relationship("ClassEquipment", back_populates="item")
    background_equipment = relationship("BackgroundEquipment", back_populates="item")
    tag_associations = relationship("ItemTags", back_populates="item")

    def to_dict(self):
        return {
            "id":self.id,
            "name":self.name,
            "description":self.description,
            "cost":self.cost,
            "weight": self.weight
        } 

class WeaponItem(Base):
    __tablename__ = "weaponItem"
    itemID = Column(Integer, ForeignKey("items.itemID"), primary_key=True)
    dmgRoll = Column(String)
    dmgType = Column(String)
    range = Column(Integer)

    item = relationship("Item", back_populates="weapon_details")

class ArmorItem(Base):
    __tablename__ = "armorItem"
    itemID = Column(Integer, ForeignKey("items.itemID"), primary_key=True)
    baseAC = Column(Integer, default=10)
    minStrength = Column(Integer, default=10)
    armorCategory = Column(String)
    stealthDisadvantage = Column(Boolean, default=True)

    item = relationship("Item", back_populates="armor_details")

class MagicItem(Base):
    __tablename__ = "magicItem"
    
    itemID = Column(Integer, ForeignKey("items.itemID"), primary_key=True)
    attunement = Column(Boolean, default=False)
    maxCharges = Column(Integer)
    rechargeTriggerID = Column(Integer, ForeignKey("rechargeTrigger.rechargeTriggerID"))
    rechargeForm = Column(String)

    item = relationship("Item", back_populates="magic_details")
    recharge_trigger = relationship("RechargeTrigger", back_populates="magic_items")
    effects = relationship("ItemEffects", back_populates="magic_item")

class ItemTypes(Base):
    __tablename__ = "itemTypes"
    
    id = Column("typeID", Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)

    items = relationship("Item", back_populates="item_type")

class ItemCategories(Base):
    __tablename__ = "itemCategories"
    
    id = Column("categoryID", Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)

    items = relationship("Item", back_populates="category")

class ItemTags(Base):
    __tablename__ = "itemTags"
    itemID = Column(Integer, ForeignKey("items.itemID"), primary_key=True)
    tagID = Column(Integer, ForeignKey("Tags.tagID"), primary_key=True)

    item = relationship("Item", back_populates="tag_associations")
    tag = relationship("Tag", back_populates="item_associations")

class ItemEffects(Base):
    __tablename__ = "itemEffects"
    id = Column("itemEffectID", Integer, primary_key=True, autoincrement=True)
    itemID = Column(Integer, ForeignKey("magicItem.itemID"), nullable=False)
    effectID = Column(Integer, ForeignKey("effectTypes.effectID"), nullable=False)
    target = Column(String)
    value = Column(String)

    magic_item = relationship("MagicItem", back_populates="effects")
    effect_type = relationship("EffectType", back_populates="item_effects")
