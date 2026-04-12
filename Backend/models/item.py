from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Boolean, Text
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
    item_spells = relationship("ItemSpell", back_populates="item", cascade="all, delete-orphan")
    monster_gear = relationship("MonsterGear", back_populates="item")
   

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

class ItemSpell(Base):
    """
    Junction table linking Items to Spells they can cast.
    
    Tracks item-specific spell data like fixed DC, charges,
    and usage limits for magic items that cast spells.
    """
    __tablename__ = "item_spells"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    itemID = Column(Integer, ForeignKey("items.id"), nullable=False, index=True)
    spellID = Column(Integer, ForeignKey("spells.id"), nullable=False, index=True)
    
    # === Fixed Values (for items) ===
    save_dc_fixed = Column(Integer)  # Fixed DC (e.g., 15) - NULL if uses wielder's ability
    attack_bonus_fixed = Column(Integer)  # Fixed attack bonus - NULL if uses wielder's
    
    # === Usage Limits ===
    charges_per_cast = Column(Integer, default=1)  # Charges consumed per cast
    uses_per_day = Column(Integer)  # Max uses per day (NULL = unlimited)
    uses_remaining = Column(Integer)  # Remaining uses (reset on long rest)
    
    # === Requirements ===
    requires_attunement = Column(Boolean, default=False)  # Must be attuned to use
    requires_spellcasting_ability = Column(Boolean, default=False)  # Must be spellcaster
    
    # === Casting Details ===
    casting_modifier = Column(String)  # "use_item_dc", "use_wielder_ability"
    spell_save_ability = Column(String)  # Which ability for save DC
    
    # === Description ===
    notes = Column(Text)  # Special conditions or restrictions
    
    # === Relationships ===
    item = relationship("Item", back_populates="item_spells")
    spell = relationship("Spell", back_populates="item_spells")
    
    def to_dict(self):
        return {
            'id': self.id,
            'itemID': self.itemID,
            'spellID': self.spellID,
            'spell': self.spell.to_dict() if self.spell else None,
            'save_dc_fixed': self.save_dc_fixed,
            'attack_bonus_fixed': self.attack_bonus_fixed,
            'charges_per_cast': self.charges_per_cast,
            'uses_per_day': self.uses_per_day,
            'uses_remaining': self.uses_remaining,
            'requires_attunement': self.requires_attunement,
            'requires_spellcasting_ability': self.requires_spellcasting_ability,
            'casting_modifier': self.casting_modifier,
            'spell_save_ability': self.spell_save_ability,
            'notes': self.notes
        }