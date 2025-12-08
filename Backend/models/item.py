from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from . import Base

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    desc = Column(String)
    weight = Column(Integer)
    cost = Column(Integer)
    item_type = Column(String)          # e.g., "Weapon", "Armor", "Wondrous Item"
    item_category = Column(String)      # e.g., "Sword", "Chain Mail", "Potion"
    rarity = Column(String)             # e.g., "Common", "Rare", "Legendary"
    properties = Column(JSON)       # e.g., ["Finesse", "Versatile"]

    damage_dice = Column(String)        # e.g., "1d8", "2d6"
    damage_type = Column(String)        # e.g., "Slashing", "Radiant"
    special_abilities = Column(JSON)  # List[str]: e.g., ["Has 3 charges...", "Bonus action to shed light"]

    # Relationships
    inventory_entries = relationship("CharacterInventory", back_populates="item")
    background_entries = relationship("BackgroundEquipment", back_populates="item")
    class_entries = relationship("ClassEquipment", back_populates="item")
    item_choice = relationship("ItemChoice", back_populates="item")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "desc": self.desc,
            "weight": self.weight,
            "cost": self.cost,
            "type": self.item_type,              # ✅ renamed to "type" for frontend consistency
            "item_category": self.item_category,
            "rarity": self.rarity,
            "properties": self.properties or [],
            # ✅ Include new fields
            "damageDice": self.damage_dice,
            "damageType": self.damage_type,
            "specialAbilities": self.special_abilities or [],
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