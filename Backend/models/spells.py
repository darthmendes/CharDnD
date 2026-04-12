# Backend/models/spell.py

from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Boolean, Text
from sqlalchemy.orm import relationship
from . import Base

class Spell(Base):
    """
    D&D 5e Spell Model - Base spell information only.
    
    This table contains the master list of all spells available in the game.
    Character-specific and item-specific data is stored in junction tables.
    """
    __tablename__ = "spells"
    
    # === Core Identification ===
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True, index=True)
    level = Column(Integer, nullable=False)  # 0-9 (0 = cantrip)
    school = Column(String, nullable=False)  # Abjuration, Conjuration, etc.
    
    # === Casting Details ===
    casting_time = Column(String, nullable=False)  # "1 action", "1 bonus action", etc.
    range = Column(String, nullable=False)  # "60 feet", "Self", "Touch"
    components = Column(String, nullable=False)  # "V, S, M"
    material_components = Column(Text)  # Detailed material components
    duration = Column(String, nullable=False)  # "Instantaneous", "Concentration, up to 1 minute"
    concentration = Column(Boolean, default=False)
    ritual = Column(Boolean, default=False)
    
    # === Targeting ===
    target_type = Column(String, default="single")  # "single", "multiple", "aoe", "self"
    target_count = Column(Integer, default=1)  # Number of targets
    aoe_type = Column(String)  # "sphere", "cube", "cone", "line"
    aoe_size = Column(Integer)  # Size in feet
    
    # === Damage/Effects ===
    damage_dice = Column(String)  # "1d6", "8d6", "2d10+5"
    damage_type = Column(String)  # "acid", "fire", "cold", etc.
    damage_at_character_level = Column(Boolean, default=False)  # True for cantrips
    
    # === Scaling ===
    cantrip_scaling_levels = Column(JSON, default=[5, 11, 17])  # When cantrips scale
    cantrip_scaling_dice = Column(String)  # Additional dice per scale (e.g., "1d6")
    upcast_damage_per_slot = Column(String)  # For regular spells (e.g., "1d6")
    
    # === Saving Throws ===
    save_ability = Column(String)  # "dex", "wis", "con", "str", "int", "cha"
    save_half_on_success = Column(Boolean, default=False)
    
    # === Attacks ===
    requires_attack_roll = Column(Boolean, default=False)
    attack_type = Column(String)  # "spell_attack", "melee_spell_attack", "ranged_spell_attack"
    
    # === Healing ===
    healing_dice = Column(String)  # For healing spells
    healing_type = Column(String)  # "hit_points", "temporary_hit_points"
    
    # === Description ===
    description = Column(Text, nullable=False)
    higher_levels = Column(Text)  # "At Higher Levels" text
    
    # === Metadata ===
    source = Column(String, default="PHB")
    source_page = Column(Integer)
    
    # === Relationships ===
    character_spells = relationship("CharacterSpell", back_populates="spell")
    item_spells = relationship("ItemSpell", back_populates="spell")
    class_spells = relationship("ClassSpell", back_populates="spell")
    monster_spells = relationship("MonsterSpell", back_populates="spell")
    
    def to_dict(self):
        """Convert spell to dictionary for API responses."""
        return {
            'id': self.id,
            'name': self.name,
            'level': self.level,
            'school': self.school,
            'casting_time': self.casting_time,
            'range': self.range,
            'components': self.components,
            'material_components': self.material_components,
            'duration': self.duration,
            'concentration': self.concentration,
            'ritual': self.ritual,
            'target_type': self.target_type,
            'target_count': self.target_count,
            'aoe_type': self.aoe_type,
            'aoe_size': self.aoe_size,
            'damage_dice': self.damage_dice,
            'damage_type': self.damage_type,
            'damage_at_character_level': self.damage_at_character_level,
            'cantrip_scaling_levels': self.cantrip_scaling_levels or [5, 11, 17],
            'cantrip_scaling_dice': self.cantrip_scaling_dice,
            'upcast_damage_per_slot': self.upcast_damage_per_slot,
            'save_ability': self.save_ability,
            'save_half_on_success': self.save_half_on_success,
            'requires_attack_roll': self.requires_attack_roll,
            'attack_type': self.attack_type,
            'healing_dice': self.healing_dice,
            'healing_type': self.healing_type,
            'description': self.description,
            'higher_levels': self.higher_levels,
            'source': self.source,
            'source_page': self.source_page
        }