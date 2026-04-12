# backend/seeds/seed_class_spells_manual.py
"""
Manual seeder for ClassSpell relationships.
Maps all ~370 seeded spells (PHB+XGtE+TCoE) to their official classes.
"""

from sqlalchemy.orm import Session
from Backend.models.dndclass import ClassSpell
from Backend.models.spells import Spell
from Backend.models.dndclass import DnDclass

# ============================================================================
# === CONFIGURATION ===
# ============================================================================

# Map class names to database IDs (UPDATE THESE TO MATCH YOUR DB)
CLASSIDS = {
    "Artificer": 4,
    "Bard": 5,
    "Cleric": 3,
    "Druid": 2,
    "Fighter": 6,
    "Paladin": 7,
    "Ranger": 8,
    "Rogue": 9,
    "Sorcerer": 10,
    "Warlock": 11,
    "Wizard": 12,
}

# ============================================================================
# === MIN LEVEL CALCULATION ===
# ============================================================================

def get_min_level(spell_level: int, class_name: str) -> int:
    """
    Calculate the minimum class level to cast a spell of given level.
    Based on official D&D 5e spell slot progression.
    """
    if spell_level == 0:  # Cantrips
        return 1
    
    # Full Casters: Bard, Cleric, Druid, Sorcerer, Wizard
    if class_name in ["Bard", "Cleric", "Druid", "Sorcerer", "Wizard"]:
        return (spell_level * 2) - 1  # L1=1, L2=3, L3=5, L4=7, L5=9, L6=11, L7=13, L8=15, L9=17
    
    # Half Casters: Paladin, Ranger
    elif class_name in ["Paladin", "Ranger"]:
        mapping = {1: 2, 2: 5, 3: 9, 4: 13, 5: 17}
        return mapping.get(spell_level, 99)
    
    # Third Casters: Fighter (Eldritch Knight), Rogue (Arcane Trickster)
    elif class_name in ["Fighter", "Rogue"]:
        mapping = {1: 3, 2: 7, 3: 13, 4: 19}
        return mapping.get(spell_level, 99)
    
    # Artificer (unique progression)
    elif class_name == "Artificer":
        mapping = {1: 1, 2: 3, 3: 5, 4: 7, 5: 9}  # Artificer caps at 5th-level spells
        return mapping.get(spell_level, 99)
    
    return 1

# ============================================================================
# === SPELL-TO-CLASS MAPPING ===
# ============================================================================
# Format: "Spell Name": [{"class": "ClassName", "min_level": X, "subclass": None, "is_always_prepared": False}, ...]
# 
# Notes:
# - min_level is calculated automatically by get_min_level(), so you can omit it or override
# - subclass: None = available to all subclasses; set to "Life Domain", "Oath of Devotion", etc. for restrictions
# - is_always_prepared: True for Domain/Oath/Circle spells that are always prepared
cantrip_mapping = {
    # ==================== CANTRIPS (Level 0) ====================
    "Acid Splash": [
        {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Blade Ward": [
        {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Booming Blade": [
        {"class": "Artificer"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Chill Touch": [
        {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Control Flames": [
        {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Create Bonfire": [
        {"class": "Artificer"}, {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Dancing Lights": [
        {"class": "Artificer"}, {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Druidcraft": [
        {"class": "Druid"},
    ],
    "Eldritch Blast": [
        {"class": "Warlock"},
    ],
    "Encode Thoughts": [
        {"class": "Wizard"},
    ],
    "Fire Bolt": [
        {"class": "Artificer"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Friends": [
        {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Guidance": [
        {"class": "Artificer"}, {"class": "Cleric"}, {"class": "Druid"},
    ],
    "Light": [
        {"class": "Artificer"}, {"class": "Bard"}, {"class": "Cleric"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Mage Hand": [
        {"class": "Artificer"}, {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Mending": [
        {"class": "Artificer"}, {"class": "Bard"}, {"class": "Cleric"}, {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Message": [
        {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Minor Illusion": [
        {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Poison Spray": [
        {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Prestidigitation": [
        {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Produce Flame": [
        {"class": "Druid"},
    ],
    "Ray of Frost": [
        {"class": "Artificer"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Resistance": [
        {"class": "Artificer"}, {"class": "Cleric"}, {"class": "Druid"},
    ],
    "Sacred Flame": [
        {"class": "Cleric"},
    ],
    "Shillelagh": [
        {"class": "Druid"},
    ],
    "Shocking Grasp": [
        {"class": "Artificer"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Spare the Dying": [
        {"class": "Artificer"}, {"class": "Cleric"},
    ],
    "Thaumaturgy": [
        {"class": "Cleric"},
    ],
    "Thorn Whip": [
        {"class": "Druid"},
    ],
    "True Strike": [
        {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Vicious Mockery": [
        {"class": "Bard"},
    ],
    "Green-Flame Blade": [
        {"class": "Artificer"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Lightning Lure": [
        {"class": "Artificer"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Sword Burst": [
        {"class": "Artificer"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Thunderclap": [
        {"class": "Artificer"}, {"class": "Bard"}, {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Mind Sliver": [
        {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Frostbite": [
        {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Gust": [
        {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Infestation": [
        {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Mold Earth": [
        {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Primal Savagery": [
        {"class": "Druid"},
    ],
    "Shape Water": [
        {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Word of Radiance": [
        {"class": "Cleric"},
    ],
    "Magic Stone": [
        {"class": "Druid"}, {"class": "Warlock"},
    ],
    "Sapping Sting": [
        {"class": "Wizard"},
    ],
    "Toll the Dead": [{"class": "Cleric"}, {"class": "Warlock"}, {"class": "Wizard"}
    ]
}

lvl1_mapping = {
    # ==================== LEVEL 1 SPELLS ====================
    "Alarm": [
        {"class": "Artificer"}, {"class": "Ranger"}, {"class": "Wizard"},
    ],
    "Animal Friendship": [
        {"class": "Bard"}, {"class": "Druid"}, {"class": "Ranger"},
    ],
    "Armor of Agathys": [
        {"class": "Warlock"},
    ],
    "Arms of Hadar": [
        {"class": "Warlock"},
    ],
    "Bane": [
        {"class": "Bard"}, {"class": "Cleric"},
    ],
    "Beast Bond": [
        {"class": "Ranger"},
    ],
    "Bless": [
        {"class": "Cleric"}, {"class": "Paladin"},
    ],
    "Burning Hands": [
        {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Charm Person": [
        {"class": "Bard"}, {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Chromatic Orb": [
        {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Command": [
        {"class": "Cleric"}, {"class": "Paladin"},
    ],
    "Compelled Duel": [
        {"class": "Paladin"},
    ],
    "Comprehend Languages": [
        {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Create or Destroy Water": [
        {"class": "Cleric"}, {"class": "Druid"},
    ],
    "Cure Wounds": [
        {"class": "Bard"}, {"class": "Cleric"}, {"class": "Druid"}, {"class": "Paladin"}, {"class": "Ranger"},
    ],
    "Detect Evil and Good": [
        {"class": "Cleric"}, {"class": "Paladin"},
    ],
    "Detect Magic": [
        {"class": "Bard"}, {"class": "Cleric"}, {"class": "Druid"}, {"class": "Paladin"}, {"class": "Ranger"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Detect Poison and Disease": [
        {"class": "Cleric"}, {"class": "Druid"}, {"class": "Paladin"}, {"class": "Ranger"},
    ],
    "Disguise Self": [
        {"class": "Artificer"}, {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Dissonant Whispers": [
        {"class": "Bard"},
    ],
    "Divine Favor": [
        {"class": "Paladin"},
    ],
    "Ensnaring Strike": [
        {"class": "Ranger"},
    ],
    "Entangle": [
        {"class": "Druid"}, {"class": "Ranger"},
    ],
    "Expeditious Retreat": [
        {"class": "Artificer"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "False Life": [
        {"class": "Artificer"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Find Familiar": [
        {"class": "Wizard"},
    ],
    "Feather Fall": [
        {"class": "Artificer"}, {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Fog Cloud": [
        {"class": "Druid"}, {"class": "Ranger"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Goodberry": [
        {"class": "Druid"}, {"class": "Ranger"},
    ],
    "Grease": [
        {"class": "Artificer"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Guiding Bolt": [
        {"class": "Cleric"},
    ],
    "Healing Word": [
        {"class": "Bard"}, {"class": "Cleric"}, {"class": "Druid"},
    ],
    "Hellish Rebuke": [
        {"class": "Warlock"},
    ],
    "Heroism": [
        {"class": "Bard"}, {"class": "Paladin"},
    ],
    "Hideous Laughter": [
        {"class": "Bard"}, {"class": "Wizard"},
    ],
    "Hunter's Mark": [
        {"class": "Ranger"},
    ],
    "Identify": [
        {"class": "Bard"}, {"class": "Wizard"},
    ],
    "Illusory Script": [
        {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Jump": [
        {"class": "Druid"}, {"class": "Ranger"}, {"class": "Sorcerer"},
    ],
    "Longstrider": [
        {"class": "Bard"}, {"class": "Druid"}, {"class": "Ranger"},
    ],
    "Mage Armor": [
        {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Magic Missile": [
        {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Magic Weapon": [
        {"class": "Artificer"}, {"class": "Paladin"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Protection from Evil and Good": [
        {"class": "Cleric"}, {"class": "Paladin"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Purify Food and Drink": [
        {"class": "Cleric"}, {"class": "Druid"}, {"class": "Paladin"},
    ],
    "Ray of Sickness": [
        {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Sanctuary": [
        {"class": "Cleric"}, {"class": "Artificer"},
    ],
    "Shield": [
        {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Shield of Faith": [
        {"class": "Cleric"}, {"class": "Paladin"},
    ],
    "Silent Image": [
        {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Sleep": [
        {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Speak with Animals": [
        {"class": "Bard"}, {"class": "Druid"}, {"class": "Ranger"},
    ],
    "Thunderwave": [
        {"class": "Bard"}, {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Unseen Servant": [
        {"class": "Bard"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Witch Bolt": [
        {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Wrathful Smite": [
        {"class": "Paladin"},
    ],
    "Absorb Elements": [
        {"class": "Artificer"}, {"class": "Druid"}, {"class": "Ranger"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Catapult": [
        {"class": "Artificer"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Cause Fear": [
        {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Ceremonies": [
        {"class": "Cleric"}, {"class": "Paladin"},
    ],
    "Chaos Bolt": [
        {"class": "Sorcerer"},
    ],
    "Ice Knife": [
        {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Snare": [
        {"class": "Artificer"}, {"class": "Druid"}, {"class": "Ranger"}, {"class": "Wizard"},
    ],
    "Zephyr Strike": [
        {"class": "Ranger"},
    ],
    "Tasha's Caustic Brew": [
        {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Gift of Alacrity": [
        {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Summon Beast": [
        {"class": "Druid"}, {"class": "Ranger"},
    ],
    "Immersive Translation": [
        {"class": "Bard"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Faerie Fire": [
        {"class": "Bard"},
        {"class": "Druid"},
        {"class": "Ranger"}
    ],
    "Earth Tremor": [
        {"class": "Bard"},
        {"class": "Druid"},
        {"class": "Sorcerer"},
        {"class": "Wizard"}
    ],
    "Elemental Weapon": [
        {"class": "Artificer"},
        {"class": "Druid"},
        {"class": "Paladin"},
        {"class": "Ranger"}
    ],
    "Speak with Dead": [
        {"class": "Cleric"},
    ],
    "Crusader's Mantle": [
        {"class": "Paladin"},
    ],
    "Lightning Arrow": [
        {"class": "Ranger"},
    ],
}

lvl2_mapping = {
    # ==================== LEVEL 2 SPELLS ====================
    "Aid": [
        {"class": "Artificer"}, {"class": "Cleric"}, {"class": "Paladin"},
    ],
    "Alter Self": [
        {"class": "Artificer"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Animal Messenger": [
        {"class": "Bard"}, {"class": "Druid"}, {"class": "Ranger"},
    ],
    "Arcane Lock": [
        {"class": "Artificer"}, {"class": "Wizard"},
    ],
    "Augury": [
        {"class": "Cleric"},
    ],
    "Barkskin": [
        {"class": "Druid"}, {"class": "Ranger"},
    ],
    "Beast Sense": [
        {"class": "Druid"}, {"class": "Ranger"},
    ],
    "Blindness/Deafness": [
        {"class": "Bard"}, {"class": "Cleric"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Blur": [
        {"class": "Artificer"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Calm Emotions": [
        {"class": "Bard"}, {"class": "Cleric"},
    ],
    "Continual Flame": [
        {"class": "Artificer"}, {"class": "Cleric"}, {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Crown of Madness": [
        {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Darkvision": [
        {"class": "Artificer"}, {"class": "Druid"}, {"class": "Ranger"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Detect Thoughts": [
        {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Enhance Ability": [
        {"class": "Artificer"}, {"class": "Bard"}, {"class": "Cleric"}, {"class": "Druid"}, {"class": "Sorcerer"},
    ],
    "Enlarge/Reduce": [
        {"class": "Artificer"}, {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Find Steed": [
        {"class": "Paladin"},
    ],
    "Find Traps": [
        {"class": "Cleric"}, {"class": "Druid"}, {"class": "Ranger"},
    ],
    "Flaming Sphere": [
        {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Gentle Repose": [
        {"class": "Artificer"}, {"class": "Cleric"}, {"class": "Wizard"},
    ],
    "Gust of Wind": [
        {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Hold Person": [
        {"class": "Bard"}, {"class": "Cleric"}, {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Invisibility": [
        {"class": "Artificer"}, {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Knock": [
        {"class": "Artificer"}, {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Lesser Restoration": [
        {"class": "Artificer"}, {"class": "Bard"}, {"class": "Cleric"}, {"class": "Druid"}, {"class": "Paladin"}, {"class": "Ranger"},
    ],
    "Levitate": [
        {"class": "Artificer"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Locate Animals or Plants": [
        {"class": "Bard"}, {"class": "Druid"}, {"class": "Ranger"},
    ],
    "Locate Object": [
        {"class": "Bard"}, {"class": "Cleric"}, {"class": "Druid"}, {"class": "Paladin"}, {"class": "Ranger"}, {"class": "Wizard"},
    ],
    "Magic Mouth": [
        {"class": "Artificer"}, {"class": "Bard"}, {"class": "Wizard"},
    ],
    "Melf's Acid Arrow": [
        {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Mirror Image": [
        {"class": "Artificer"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Misty Step": [
        {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Moonbeam": [
        {"class": "Druid"},
    ],
    "Nystul's Magic Aura": [
        {"class": "Wizard"},
    ],
    "Pass without Trace": [
        {"class": "Druid"}, {"class": "Ranger"},
    ],
    "Phantasmal Force": [
        {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Prayer of Healing": [
        {"class": "Cleric"},
    ],
    "Protection from Poison": [
        {"class": "Artificer"}, {"class": "Cleric"}, {"class": "Druid"}, {"class": "Paladin"}, {"class": "Ranger"},
    ],
    "Ray of Enfeeblement": [
        {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Rope Trick": [
        {"class": "Artificer"}, {"class": "Wizard"},
    ],
    "Scorching Ray": [
        {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "See Invisibility": [
        {"class": "Artificer"}, {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Shatter": [
        {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Silence": [
        {"class": "Bard"}, {"class": "Cleric"}, {"class": "Ranger"},
    ],
    "Spider Climb": [
        {"class": "Artificer"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Spike Growth": [
        {"class": "Druid"}, {"class": "Ranger"},
    ],
    "Spiritual Weapon": [
        {"class": "Cleric"},
    ],
    "Suggestion": [
        {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Warding Bond": [
        {"class": "Cleric"},
    ],
    "Web": [
        {"class": "Artificer"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Zone of Truth": [
        {"class": "Bard"}, {"class": "Cleric"}, {"class": "Paladin"},
    ],
    "Aganazzar's Scorcher": [
        {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Dragon's Breath": [
        {"class": "Artificer"}, {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Earthbind": [
        {"class": "Artificer"}, {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Healing Spirit": [
        {"class": "Druid"}, {"class": "Ranger"},
    ],
    "Mind Spike": [
        {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Shadow Blade": [
        {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Skywrite": [
        {"class": "Artificer"}, {"class": "Bard"}, {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Tasha's Mind Whip": [
        {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Flame Blade": [
        {"class": "Druid"}
    ]
}

lvl3_mapping = {
    # ==================== LEVEL 3 SPELLS ====================
    "Animate Dead": [
        {"class": "Cleric"}, {"class": "Wizard"},
    ],
    "Bestow Curse": [
        {"class": "Bard"}, {"class": "Cleric"}, {"class": "Wizard"},
    ],
    "Beacon of Hope": [
        {"class": "Cleric"},
    ],
    "Blink": [
        {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Call Lightning": [
        {"class": "Druid"}, {"class": "Ranger"},
    ],
    "Catnap": [
        {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Clairvoyance": [
        {"class": "Bard"}, {"class": "Cleric"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Counterspell": [
        {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Create Food and Water": [
        {"class": "Cleric"}, {"class": "Paladin"},
    ],
    "Daylight": [
        {"class": "Cleric"}, {"class": "Druid"}, {"class": "Ranger"}, {"class": "Sorcerer"},
    ],
    "Dispel Magic": [
        {"class": "Bard"}, {"class": "Cleric"}, {"class": "Druid"}, {"class": "Paladin"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Erupting Earth": [
        {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Fear": [
        {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Feign Death": [
        {"class": "Bard"}, {"class": "Cleric"}, {"class": "Wizard"},
    ],
    "Fireball": [
        {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Flame Arrows": [
        {"class": "Artificer"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Fly": [
        {"class": "Artificer"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Gaseous Form": [
        {"class": "Artificer"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Glyph of Warding": [
        {"class": "Bard"}, {"class": "Cleric"}, {"class": "Wizard"},
    ],
    "Haste": [
        {"class": "Artificer"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Hunger of Hadar": [
        {"class": "Warlock"},
    ],
    "Hypnotic Pattern": [
        {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Leomund's Tiny Hut": [
        {"class": "Bard"}, {"class": "Wizard"},
    ],
    "Life Transference": [
        {"class": "Cleric"}, {"class": "Wizard"},
    ],
    "Lightning Bolt": [
        {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Magic Circle": [
        {"class": "Cleric"}, {"class": "Paladin"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Major Image": [
        {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Meld into Stone": [
        {"class": "Cleric"}, {"class": "Druid"},
    ],
    "Melf's Minute Meteors": [
        {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Nondetection": [
        {"class": "Bard"}, {"class": "Ranger"}, {"class": "Wizard"},
    ],
    "Phantom Steed": [
        {"class": "Wizard"},
    ],
    "Plant Growth": [
        {"class": "Bard"}, {"class": "Druid"}, {"class": "Ranger"},
    ],
    "Protection from Energy": [
        {"class": "Artificer"}, {"class": "Cleric"}, {"class": "Druid"}, {"class": "Ranger"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Remove Curse": [
        {"class": "Cleric"}, {"class": "Paladin"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Revivify": [
        {"class": "Artificer"}, {"class": "Cleric"}, {"class": "Paladin"},
    ],
    "Sending": [
        {"class": "Bard"}, {"class": "Cleric"}, {"class": "Wizard"},
    ],
    "Sleet Storm": [
        {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Slow": [
        {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Spirit Guardians": [
        {"class": "Cleric"},
    ],
    "Spirit Shroud": [
        {"class": "Cleric"}, {"class": "Paladin"}, {"class": "Warlock"},
    ],
    "Stinking Cloud": [
        {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Summon Fey": [
        {"class": "Druid"}, {"class": "Ranger"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Summon Lesser Demons": [
        {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Summon Shadowspawn": [
        {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Summon Undead": [
        {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Thunder Step": [
        {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Tiny Servant": [
        {"class": "Artificer"}, {"class": "Wizard"},
    ],
    "Tongues": [
        {"class": "Bard"}, {"class": "Cleric"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Vampiric Touch": [
        {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"},
    ],
    "Wall of Sand": [
        {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Wall of Water": [
        {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Water Breathing": [
        {"class": "Artificer"}, {"class": "Cleric"}, {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Water Walk": [
        {"class": "Artificer"}, {"class": "Cleric"}, {"class": "Druid"}, {"class": "Ranger"}, {"class": "Sorcerer"}, {"class": "Wizard"},
    ],
    "Wind Wall": [
        {"class": "Druid"}, {"class": "Ranger"},
    ],
    "Aura of Vitality": [
        {"class": "Bard"},
        {"class": "Cleric"},
        {"class": "Druid"}
    ],
    "Intellect Fortress": [
        {"class": "Bard"},
        {"class": "Sorcerer"},
        {"class": "Warlock"},
        {"class": "Wizard"}
    ],
    "Conjure Animals": [{"class": "Druid"}, {"class": "Ranger"}]
}

lvl4_mapping = {
    "Arcane Eye": [{"class": "Wizard"}],
    "Aura of Life": [{"class": "Paladin"}],
    "Aura of Purity": [{"class": "Paladin"}],
    "Banishment": [{"class": "Paladin"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Blight": [{"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Charm Monster": [{"class": "Bard"}, {"class": "Druid"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Compulsion": [{"class": "Bard"}],
    "Confusion": [{"class": "Bard"}, {"class": "Druid"}, {"class": "Wizard"}],
    "Conjure Minor Elementals": [{"class": "Druid"}, {"class": "Wizard"}],
    "Conjure Woodland Beings": [{"class": "Druid"}, {"class": "Ranger"}],
    "Control Water": [{"class": "Cleric"}, {"class": "Druid"}, {"class": "Wizard"}],
    "Death Ward": [{"class": "Cleric"}, {"class": "Paladin"}],
    "Dimension Door": [{"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Divination": [{"class": "Cleric"}, {"class": "Wizard"}],
    "Dominate Beast": [{"class": "Druid"}, {"class": "Ranger"}],
    "Elemental Bane": [{"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Evard's Black Tentacles": [{"class": "Wizard"}],
    "Fabricate": [{"class": "Wizard"}],
    "Find Greater Steed": [{"class": "Paladin"}],
    "Fire Shield": [{"class": "Wizard"}],
    "Freedom of Movement": [{"class": "Bard"}, {"class": "Cleric"}, {"class": "Druid"}, {"class": "Ranger"}],
    "Galder's Speedy Courier": [{"class": "Bard"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Giant Insect": [{"class": "Druid"}],
    "Grasping Vine": [{"class": "Druid"}, {"class": "Ranger"}],
    "Greater Invisibility": [{"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Wizard"}],
    "Guardian of Faith": [{"class": "Cleric"}],
    "Hallucinatory Terrain": [{"class": "Bard"}, {"class": "Druid"}, {"class": "Wizard"}],
    "Ice Storm": [{"class": "Sorcerer"}, {"class": "Wizard"}],
    "Leomund's Secret Chest": [{"class": "Wizard"}],
    "Locate Creature": [{"class": "Bard"}, {"class": "Cleric"}, {"class": "Druid"}, {"class": "Paladin"}, {"class": "Ranger"}, {"class": "Wizard"}],
    "Mordenkainen's Faithful Hound": [{"class": "Wizard"}],
    "Mordenkainen's Private Sanctum": [{"class": "Wizard"}],
    "Otiluke's Resilient Sphere": [{"class": "Wizard"}],
    "Phantasmal Killer": [{"class": "Bard"}, {"class": "Wizard"}],
    "Polymorph": [{"class": "Bard"}, {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Wizard"}],
    "Shadow of Moil": [{"class": "Warlock"}],
    "Sickening Radiance": [{"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Stone Shape": [{"class": "Cleric"}, {"class": "Druid"}, {"class": "Wizard"}],
    "Stoneskin": [{"class": "Druid"}, {"class": "Ranger"}, {"class": "Sorcerer"}, {"class": "Wizard"}],
    "Storm Sphere": [{"class": "Sorcerer"}, {"class": "Wizard"}],
    "Summon Aberration": [{"class": "Warlock"}, {"class": "Wizard"}],
    "Summon Construct": [{"class": "Artificer"}, {"class": "Wizard"}],
    "Summon Elemental": [{"class": "Druid"}, {"class": "Wizard"}],
    "Vitriolic Sphere": [{"class": "Sorcerer"}, {"class": "Wizard"}],
    "Wall of Fire": [{"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Wizard"}],
    "Watery Sphere": [{"class": "Sorcerer"}, {"class": "Wizard"}]
}
lvl5_mapping =  {
    "Animate Objects": [{"class": "Artificer"}, {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Wizard"}],
    "Antilife Shell": [{"class": "Druid"}],
    "Awaken": [{"class": "Druid"}],
    "Banishing Smite": [{"class": "Paladin"}],
    "Bigby's Hand": [{"class": "Wizard"}],
    "Circle of Power": [{"class": "Paladin"}],
    "Cloudkill": [{"class": "Sorcerer"}, {"class": "Wizard"}],
    "Commune": [{"class": "Cleric"}],
    "Commune with Nature": [{"class": "Druid"}, {"class": "Ranger"}],
    "Cone of Cold": [{"class": "Sorcerer"}, {"class": "Wizard"}],
    "Conjure Elemental": [{"class": "Druid"}, {"class": "Wizard"}],
    "Conjure Volley": [{"class": "Ranger"}],
    "Contact Other Plane": [{"class": "Warlock"}, {"class": "Wizard"}],
    "Contagion": [{"class": "Cleric"}, {"class": "Druid"}],
    "Control Winds": [{"class": "Druid"}, {"class": "Ranger"}, {"class": "Sorcerer"}, {"class": "Wizard"}],
    "Creation": [{"class": "Artificer"}, {"class": "Sorcerer"}, {"class": "Wizard"}],
    "Danse Macabre": [{"class": "Warlock"}, {"class": "Wizard"}],
    "Dawn": [{"class": "Cleric"}],
    "Destructive Wave": [{"class": "Paladin"}],
    "Dispel Evil and Good": [{"class": "Cleric"}, {"class": "Paladin"}, {"class": "Warlock"}],
    "Dominate Person": [{"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Wizard"}],
    "Dream": [{"class": "Bard"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Enervation": [{"class": "Sorcerer"}, {"class": "Wizard"}],
    "Far Step": [{"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Flame Strike": [{"class": "Cleric"}],
    "Geas": [{"class": "Bard"}, {"class": "Cleric"}, {"class": "Druid"}, {"class": "Paladin"}, {"class": "Wizard"}],
    "Greater Restoration": [{"class": "Artificer"}, {"class": "Bard"}, {"class": "Cleric"}, {"class": "Druid"}],
    "Hallow": [{"class": "Cleric"}],
    "Hold Monster": [{"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Holy Weapon": [{"class": "Paladin"}, {"class": "Ranger"}],
    "Immolation": [{"class": "Sorcerer"}, {"class": "Wizard"}],
    "Infernal Calling": [{"class": "Warlock"}, {"class": "Wizard"}],
    "Insect Plague": [{"class": "Cleric"}, {"class": "Druid"}],
    "Legend Lore": [{"class": "Bard"}, {"class": "Cleric"}, {"class": "Wizard"}],
    "Maelstrom": [{"class": "Druid"}],
    "Mass Cure Wounds": [{"class": "Bard"}, {"class": "Cleric"}, {"class": "Druid"}],
    "Mislead": [{"class": "Bard"}, {"class": "Wizard"}],
    "Modify Memory": [{"class": "Bard"}],
    "Negative Energy Flood": [{"class": "Warlock"}, {"class": "Wizard"}],
    "Passwall": [{"class": "Wizard"}],
    "Planar Binding": [{"class": "Bard"}, {"class": "Cleric"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Raise Dead": [{"class": "Bard"}, {"class": "Cleric"}, {"class": "Paladin"}],
    "Rary's Telepathic Bond": [{"class": "Wizard"}],
    "Reincarnate": [{"class": "Druid"}],
    "Scrying": [{"class": "Bard"}, {"class": "Cleric"}, {"class": "Druid"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Seeming": [{"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Wizard"}],
    "Skill Empowerment": [{"class": "Artificer"}, {"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Wizard"}],
    "Steel Wind Strike": [{"class": "Ranger"}, {"class": "Wizard"}],
    "Summon Draconic Spirit": [{"class": "Sorcerer"}, {"class": "Wizard"}],
    "Swift Quiver": [{"class": "Ranger"}],
    "Synaptic Static": [{"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Telekinesis": [{"class": "Artificer"}, {"class": "Sorcerer"}, {"class": "Wizard"}],
    "Teleportation Circle": [{"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Transmute Rock": [{"class": "Druid"}, {"class": "Wizard"}],
    "Tree Stride": [{"class": "Druid"}, {"class": "Ranger"}],
    "Wall of Force": [{"class": "Artificer"}, {"class": "Wizard"}],
    "Wall of Light": [{"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Wall of Stone": [{"class": "Druid"}, {"class": "Wizard"}],
    "Wrath of Nature": [{"class": "Druid"}, {"class": "Ranger"}]
}
lvl6_mapping = {
    "Summon Celestial": [{"class": "Cleric"}, {"class": "Paladin"}],
    "Arcane Gate": [{"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Blade Barrier": [{"class": "Cleric"}],
    "Bones of the Earth": [{"class": "Druid"}],
    "Chain Lightning": [{"class": "Sorcerer"}, {"class": "Wizard"}],
    "Circle of Death": [{"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Conjure Fey": [{"class": "Druid"}, {"class": "Warlock"}],
    "Contingency": [{"class": "Wizard"}],
    "Create Homunculus": [{"class": "Wizard"}],
    "Create Undead": [{"class": "Cleric"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Disintegrate": [{"class": "Sorcerer"}, {"class": "Wizard"}],
    "Drawmij's Instant Summons": [{"class": "Wizard"}],
    "Druid Grove": [{"class": "Druid"}],
    "Eyebite": [{"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Find the Path": [{"class": "Bard"}, {"class": "Cleric"}, {"class": "Druid"}],
    "Flesh to Stone": [{"class": "Warlock"}, {"class": "Wizard"}],
    "Forbiddance": [{"class": "Cleric"}],
    "Globe of Invulnerability": [{"class": "Wizard"}],
    "Guards and Wards": [{"class": "Wizard"}],
    "Harm": [{"class": "Cleric"}],
    "Heal": [{"class": "Cleric"}, {"class": "Druid"}],
    "Heroes' Feast": [{"class": "Bard"}, {"class": "Cleric"}, {"class": "Druid"}],
    "Investiture of Flame": [{"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Investiture of Ice": [{"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Investiture of Stone": [{"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Investiture of Wind": [{"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Magic Jar": [{"class": "Wizard"}],
    "Mass Suggestion": [{"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Mental Prison": [{"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Move Earth": [{"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Wizard"}],
    "Otiluke's Freezing Sphere": [{"class": "Sorcerer"}, {"class": "Wizard"}],
    "Otto's Irresistible Dance": [{"class": "Bard"}, {"class": "Wizard"}],
    "Planar Ally": [{"class": "Cleric"}],
    "Primordial Ward": [{"class": "Druid"}, {"class": "Wizard"}],
    "Programmed Illusion": [{"class": "Bard"}, {"class": "Wizard"}],
    "Scatter": [{"class": "Sorcerer"}, {"class": "Wizard"}],
    "Soul Cage": [{"class": "Warlock"}, {"class": "Wizard"}],
    "Summon Fiend": [{"class": "Warlock"}, {"class": "Wizard"}],
    "Sunbeam": [{"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Wizard"}],
    "Tasha's Otherworldly Guise": [{"class": "Warlock"}],
    "Tenser's Transformation": [{"class": "Wizard"}],
    "Transport via Plants": [{"class": "Druid"}, {"class": "Wizard"}],
    "True Seeing": [{"class": "Bard"}, {"class": "Cleric"}, {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Wall of Ice": [{"class": "Wizard"}],
    "Wall of Thorns": [{"class": "Druid"}],
    "Wind Walk": [{"class": "Druid"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Word of Recall": [{"class": "Cleric"}]
}
lvl7_mapping =  {
    "Crown of Stars": [{"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Delayed Blast Fireball": [{"class": "Sorcerer"}, {"class": "Wizard"}],
    "Divine Word": [{"class": "Cleric"}],
    "Draconic Transformation": [{"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Dream of the Blue Veil": [{"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Etherealness": [{"class": "Bard"}, {"class": "Cleric"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Finger of Death": [{"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Fire Storm": [{"class": "Cleric"}, {"class": "Druid"}, {"class": "Sorcerer"}],
    "Forcecage": [{"class": "Bard"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Mirage Arcane": [{"class": "Bard"}, {"class": "Druid"}, {"class": "Wizard"}],
    "Mordenkainen's Magnificent Mansion": [{"class": "Bard"}, {"class": "Wizard"}],
    "Mordenkainen's Sword": [{"class": "Bard"}, {"class": "Wizard"}],
    "Plane Shift": [{"class": "Cleric"}, {"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Power Word Pain": [{"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Prismatic Spray": [{"class": "Sorcerer"}, {"class": "Wizard"}],
    "Project Image": [{"class": "Bard"}, {"class": "Wizard"}],
    "Regenerate": [{"class": "Bard"}, {"class": "Cleric"}, {"class": "Druid"}],
    "Resurrection": [{"class": "Bard"}, {"class": "Cleric"}],
    "Reverse Gravity": [{"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Wizard"}],
    "Sequester": [{"class": "Wizard"}],
    "Simulacrum": [{"class": "Wizard"}],
    "Symbol": [{"class": "Bard"}, {"class": "Cleric"}, {"class": "Druid"}, {"class": "Warlock"}, {"class": "Wizard"}],
    "Teleport": [{"class": "Bard"}, {"class": "Sorcerer"}, {"class": "Wizard"}],
    "Temple of the Gods": [{"class": "Cleric"}],
    "Whirlwind": [{"class": "Druid"}, {"class": "Sorcerer"}, {"class": "Wizard"}]
}

lvl8_mapping =  {
    "Animal Shapes": [
        {"class" : "Druid"}
    ],
    "Antimagic Field": [
        {"class": "Cleric"},
        {"class": "Wizard"}
    ],
    "Antipathy/Sympathy": [
        {"class": "Bard"},
        {"class": "Druid"},
        {"class": "Wizard"}
    ],
    "Clone": [
        {"class": "Wizard"}
    ],
    "Control Weather": [
        {"class": "Cleric"},
        {"class": "Druid"},
        {"class": "Wizard"}
    ],
    "Demiplane": [
        {"class": "Sorcerer"},
        {"class": "Warlock"},
        {"class": "Wizard"}
    ],
    "Dominate Monster": [
        {"class": "Bard"},
        {"class": "Sorcerer"},
        {"class": "Warlock"},
        {"class": "Wizard"}
    ],
    "Earthquake": [
        {"class": "Cleric"},
        {"class": "Druid"},
        {"class": "Sorcerer"}
    ],
    "Feeblemind": [
        {"class": "Bard"},
        {"class": "Druid"},
        {"class": "Warlock"},
        {"class": "Wizard"}
    ],
    "Glibness": [
        {"class": "Bard"},
        {"class": "Warlock"}
    ],
    "Holy Aura": [
        {"class": "Cleric"}
    ],
    "Illusory Dragon": [
        {"class": "Sorcerer"},
        {"class": "Wizard"}
    ],
    "Incendiary Cloud": [
        {"class": "Sorcerer"},
        {"class": "Wizard"}
    ],
    "Maddening Darkness": [
        {"class": "Warlock"}
    ],
    "Maze": [
        {"class": "Wizard"}
    ],
    "Mind Blank": [
        {"class": "Bard"},
        {"class": "Wizard"}
    ],
    "Power Word Stun": [
        {"class": "Bard"},
        {"class": "Sorcerer"},
        {"class": "Warlock"},
        {"class": "Wizard"}
    ],
    "Sunburst": [
        {"class": "Druid"},
        {"class": "Sorcerer"},
        {"class": "Wizard"}
    ],
    "Telepathy": [
        {"class": "Bard"},
        {"class": "Sorcerer"},
        {"class": "Warlock"},
        {"class": "Wizard"}
    ],
    "Tsunami": [
        {"class": "Druid"}
    ]
}
lvl9_mapping = {
    "Astral Projection": [
        {"class": "Cleric"},
        {"class": "Warlock"},
        {"class": "Wizard"}
    ],
    "Blade of Disaster": [
        {"class": "Sorcerer"},
        {"class": "Warlock"},
        {"class": "Wizard"}
    ],
    "Foresight": [
        {"class": "Bard"},
        {"class": "Druid"},
        {"class": "Warlock"},
        {"class": "Wizard"}
    ],
    "Gate": [
        {"class": "Cleric"},
        {"class": "Sorcerer"},
        {"class": "Warlock"},
        {"class": "Wizard"}
    ],
    "Imprisonment": [
        {"class": "Warlock"},
        {"class": "Wizard"}
    ],
    "Invulnerability": [
        {"class": "Wizard"}
    ],
    "Mass Heal": [
        {"class": "Cleric"}
    ],
    "Mass Polymorph": [
        {"class": "Bard"},
        {"class": "Wizard"}
    ],
    "Meteor Swarm": [
        {"class": "Sorcerer"},
        {"class": "Wizard"}
    ],
    "Power Word Heal": [
        {"class": "Cleric"}
    ],
    "Power Word Kill": [
        {"class": "Bard"},
        {"class": "Sorcerer"},
        {"class": "Warlock"},
        {"class": "Wizard"}
    ],
    "Prismatic Wall": [
        {"class": "Wizard"}
    ],
    "Psychic Scream": [
        {"class": "Bard"},
        {"class": "Sorcerer"},
        {"class": "Warlock"},
        {"class": "Wizard"}
    ],
    "Shapechange": [
        {"class": "Druid"},
        {"class": "Wizard"}
    ],
    "Time Stop": [
        {"class": "Sorcerer"},
        {"class": "Wizard"}
    ],
    "True Polymorph": [
        {"class": "Bard"},
        {"class": "Warlock"},
        {"class": "Wizard"}
    ],
    "True Resurrection": [
        {"class": "Cleric"}, {"class" : "Druid"}
    ],
    "Weird": [
        {"class": "Wizard"}
    ],
    "Wish": [
        {"class": "Sorcerer"},
        {"class": "Wizard"}
    ],
    "Storm of Vengeance" : [
        {"class":"Druid"}
    ]
}
# ============================================================================
# === SEEDING FUNCTION ===
# ============================================================================

def seed_class_spells_manual(db: Session, SPELL_CLASS_MAPPING):
    """Manually seed class-spell relationships using verified mappings."""
    print("[INFO] Starting manual class-spell relationship seeding...")
    
    # Fetch classes and spells from DB
    db_classes = {c.name: c.id for c in db.query(DnDclass).all()}
    db_spells = {s.name: s.id for s in db.query(Spell).all()}
    
    print(f"[INFO] Found {len(db_classes)} classes and {len(db_spells)} spells in database")
    
    created = 0
    skipped = 0
    errors = 0
    
    for spell_name, class_configs in SPELL_CLASS_MAPPING.items():
        spellID = db_spells.get(spell_name)
        if not spellID:
            print(f"[WARNING] Spell not in DB: {spell_name}")
            errors += 1
            continue
        
        for config in class_configs:
            class_name = config.get("class")
            classID = db_classes.get(class_name)
            
            if not classID:
                print(f"[WARNING] Class not in DB: {class_name}")
                errors += 1
                continue
            
            # Calculate min_level (override if provided in config)
            spell_obj = db.query(Spell).get(spellID)
            spell_level = spell_obj.level if spell_obj else 0
            min_level = config.get("min_level") or get_min_level(spell_level, class_name)
            
            # Check for existing relationship
            existing = db.query(ClassSpell).filter_by(
                classID=classID,
                spellID=spellID,
                subclass=config.get("subclass")
            ).first()
            
            if existing:
                skipped += 1
                continue
            
            # Create new relationship
            class_spell = ClassSpell(
                classID=classID,
                spellID=spellID,
                min_level=min_level,
                subclass=config.get("subclass"),
                is_always_prepared=config.get("is_always_prepared", False)
            )
            
            db.add(class_spell)
            created += 1
    
    db.commit()
    
    print(f"\n[SUCCESS] Manual seeding complete!")
    print(f"   Created: {created} relationships")
    print(f"   Skipped: {skipped} existing")
    print(f"   Errors: {errors} (missing spells/classes)")
    
    return created, skipped, errors


# ============================================================================
# === RUNNER ===
# ============================================================================
# def seed_class_spells_filtered():
#     from sqlalchemy.orm import Session as SessionMaker
#     from Backend.models import engine
    
#     db = SessionMaker(bind=engine)
#     try:
#         seed_class_spells_manual(db)
#     except Exception as e:
#         db.rollback()
#         print(f"[ERROR] Error: {e}")
#         raise
#     finally:
#         db.close()
def make_all_matches():
    from sqlalchemy.orm import Session as SessionMaker
    from Backend.models import engine
    
    db = SessionMaker(bind=engine)
    try:
        seed_class_spells_manual(db, cantrip_mapping)
        seed_class_spells_manual(db, lvl1_mapping)
        seed_class_spells_manual(db, lvl2_mapping)
        seed_class_spells_manual(db, lvl3_mapping)
        seed_class_spells_manual(db, lvl4_mapping)
        seed_class_spells_manual(db, lvl5_mapping)
        seed_class_spells_manual(db, lvl6_mapping)
        seed_class_spells_manual(db, lvl7_mapping)
        seed_class_spells_manual(db, lvl8_mapping)
        seed_class_spells_manual(db, lvl9_mapping)
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error: {e}")
        raise
    finally:
        db.close()