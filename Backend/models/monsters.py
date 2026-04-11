from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Boolean, Text, Float, DateTime
from sqlalchemy.orm import relationship
from . import Base

class Monster(Base):
    """
    D&D 5e Monster - Core stat block and metadata.
    Follows MM/PHB/XGtE structure with extensible JSON fields.
    """
    __tablename__ = "monsters"
    
    # === Core Identification ===
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, index=True)
    source = Column(String, default="MM")  # MM, VGM, MTF, XGtE, etc.
    page = Column(Integer)
    
    # === Stat Block Header ===
    size = Column(String)  # Tiny, Small, Medium, Large, Huge, Gargantuan
    creature_type = Column(String)  # aberration, beast, celestial, etc.
    subtype = Column(String)  # e.g., "shapechanger", "titan"
    alignment = Column(String)  # "lawful evil", "neutral good", etc.
    challenge_rating = Column(Float)  # 0, 0.125, 0.25, 0.5, 1, 2, ... 30
    xp_value = Column(Integer)  # Calculated from CR
    
    # === Defenses ===
    armor_class = Column(Integer)
    armor_desc = Column(String)  # "natural armor", "chain mail", etc.
    hit_points = Column(Integer)
    hit_dice = Column(String)  # "2d8 + 2", "10d10 + 30", etc.
    
    # Damage/Condition immunities/resistances/vulnerabilities
    damage_vulnerabilities = Column(JSON, default=list)  # ["bludgeoning", "fire"]
    damage_resistances = Column(JSON, default=list)
    damage_immunities = Column(JSON, default=list)
    condition_immunities = Column(JSON, default=list)  # ["charmed", "frightened"]
    
    # === Movement ===
    speeds = Column(JSON)  # {"walk": 30, "fly": 60, "hover": true, "swim": 20}
    
    # === Ability Scores ===
    ability_scores = Column(JSON, nullable=False)  # {"str": 10, "dex": 14, ...}
    
    # === Proficiencies ===
    saving_throws = Column(JSON, default=dict)  # {"dex": 5, "wis": 3}
    skills = Column(JSON, default=dict)  # {"perception": 6, "stealth": 4}
    
    # === Senses & Languages ===
    senses = Column(JSON)  # {"darkvision": 60, "blindsight": 10, "passive_perception": 13}
    languages = Column(JSON, default=list)  # ["Common", "Draconic", "Telepathy 120 ft."]
    
    # === Traits & Actions (Stored as JSON for flexibility) ===
    traits = Column(JSON, default=list)  # Array of trait objects
    actions = Column(JSON, default=list)  # Array of action objects
    bonus_actions = Column(JSON, default=list)
    reactions = Column(JSON, default=list)
    legendary_actions = Column(JSON, default=list)
    lair_actions = Column(JSON, default=list)
    mythic_actions = Column(JSON, default=list)  # Mordenkainen's monsters
    
    # === Spellcasting (if applicable) ===
    spellcasting_ability = Column(String)  # "int", "wis", "cha"
    spell_save_dc = Column(Integer)
    spell_attack_bonus = Column(Integer)
    spells_known = Column(JSON, default=list)  # Array of spell names/levels
    spells_prepared = Column(JSON, default=list)  # For prepared casters
    
    # === Ecology & Lore ===
    habitat = Column(String)  # "arctic", "dungeon", "urban", etc.
    climate = Column(String)
    organization = Column(String)  # "solitary", "pair", "gang (3-6)"
    treasure = Column(String)
    description = Column(Text)  # Flavor text, tactics, ecology
    special_lairs = Column(Text)  # Lair description + lair action details
    
    # === Metadata ===
    is_legendary = Column(Boolean, default=False)
    is_mythic = Column(Boolean, default=False)
    is_unique = Column(Boolean, default=False)  # Named NPCs like "Strahd"
    
    # === Relationships ===
    # Link to spells this monster can cast (many-to-many via junction)
    monster_spells = relationship("MonsterSpell", back_populates="monster")
    
    # Link to items this monster carries (many-to-many via junction)
    monster_gear = relationship("MonsterGear", back_populates="monster")
    
    # Link to environments/habitats (many-to-many)
    monster_habitats = relationship("MonsterHabitat", back_populates="monster")
    
    def to_dict(self):
        """Convert monster to dictionary for API responses."""
        return {
            'id': self.id,
            'name': self.name,
            'source': self.source,
            'page': self.page,
            'size': self.size,
            'type': f"{self.creature_type} ({self.subtype})" if self.subtype else self.creature_type,
            'alignment': self.alignment,
            'cr': self.challenge_rating,
            'xp': self.xp_value,
            'ac': self.armor_class,
            'ac_desc': self.armor_desc,
            'hp': self.hit_points,
            'hit_dice': self.hit_dice,
            'speed': self.speeds,
            'abilities': self.ability_scores,
            'saving_throws': self.saving_throws,
            'skills': self.skills,
            'damage_vulnerabilities': self.damage_vulnerabilities,
            'damage_resistances': self.damage_resistances,
            'damage_immunities': self.damage_immunities,
            'condition_immunities': self.condition_immunities,
            'senses': self.senses,
            'languages': self.languages,
            'traits': self.traits,
            'actions': self.actions,
            'bonus_actions': self.bonus_actions,
            'reactions': self.reactions,
            'legendary_actions': self.legendary_actions,
            'lair_actions': self.lair_actions,
            'mythic_actions': self.mythic_actions,
            'spellcasting': {
                'ability': self.spellcasting_ability,
                'save_dc': self.spell_save_dc,
                'attack_bonus': self.spell_attack_bonus,
                'spells_known': self.spells_known,
                'spells_prepared': self.spells_prepared
            } if self.spellcasting_ability else None,
            'ecology': {
                'habitat': self.habitat,
                'climate': self.climate,
                'organization': self.organization,
                'treasure': self.treasure,
                'description': self.description,
                'special_lairs': self.special_lairs
            },
            'flags': {
                'legendary': self.is_legendary,
                'mythic': self.is_mythic,
                'unique': self.is_unique
            }
        }
  
    
class MonsterSpell(Base):
    """
    Junction table linking Monsters to Spells they can cast.
    Tracks spell level, preparation status, and casting details.
    """
    __tablename__ = "monster_spells"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    monster_id = Column(Integer, ForeignKey("monsters.id"), nullable=False)
    spell_id = Column(Integer, ForeignKey("spells.id"), nullable=False)
    
    # Casting details
    spell_level = Column(Integer)  # 0-9 (0 = cantrip)
    is_at_will = Column(Boolean, default=False)
    uses_per_day = Column(Integer)  # 1/day, 3/day, etc.
    recharge = Column(String)  # "5-6", "short rest", etc.
    is_prepared = Column(Boolean, default=True)  # For prepared casters
    casting_notes = Column(Text)  # Special casting rules
    
    # Relationships
    monster = relationship("Monster", back_populates="monster_spells")
    spell = relationship("Spell", back_populates="monster_spells")
    
    def to_dict(self):
        return {
            'id': self.id,
            'spell': self.spell.to_dict() if self.spell else None,
            'level': self.spell_level,
            'at_will': self.is_at_will,
            'uses_per_day': self.uses_per_day,
            'recharge': self.recharge,
            'prepared': self.is_prepared,
            'notes': self.casting_notes
        }


class MonsterGear(Base):
    """
    Junction table for items/equipment monsters carry.
    Useful for loot tables and encounter building.
    """
    __tablename__ = "monster_gear"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    monster_id = Column(Integer, ForeignKey("monsters.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    
    quantity = Column(Integer, default=1)
    is_equipped = Column(Boolean, default=True)  # Worn/wielded vs. carried
    is_magic = Column(Boolean, default=False)
    loot_chance = Column(Integer, default=100)  # % chance to drop as loot
    
    monster = relationship("Monster", back_populates="monster_gear")
    item = relationship("Item", back_populates="monster_gear")
    
    def to_dict(self):
        return {
            'id': self.id,
            'item': self.item.to_dict() if self.item else None,
            'quantity': self.quantity,
            'equipped': self.is_equipped,
            'magic': self.is_magic,
            'loot_chance': self.loot_chance
        }


class MonsterHabitat(Base):
    """
    Many-to-many relationship for monster habitats/environments.
    Enables filtering monsters by terrain type.
    """
    __tablename__ = "monster_habitats"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    monster_id = Column(Integer, ForeignKey("monsters.id"), nullable=False)
    habitat_name = Column(String, nullable=False)  # "arctic", "forest", "dungeon", etc.
    frequency = Column(String, default="common")  # common, uncommon, rare
    
    monster = relationship("Monster", back_populates="monster_habitats")
    
    def to_dict(self):
        return {
            'habitat': self.habitat_name,
            'frequency': self.frequency
        }
    
