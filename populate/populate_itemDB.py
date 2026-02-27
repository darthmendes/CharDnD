"""
Populate D&D 5e item database with all equipment needed for character creation.
- ✅ Properties stored as simple keywords only (Thrown, Versatile, Finesse, Light)
- ✅ Property metadata stored in property_data JSON field
- ✅ Skill modifiers structured for frontend display
- ✅ Attunement requirements properly flagged
- ✅ Scalable for any future weapon properties
"""
from Backend.models.item import Item
from Backend.models import session

# Helper: convert gp/sp/cp to copper pieces (cp)
def gp(amount): return int(amount * 100)
def sp(amount): return int(amount * 10)
def cp(amount): return int(amount)

# List of all concrete items (NO packs as items)
items_to_add = [
    # === TOOLS ===
    Item(name="Herbalism Kit", item_type="Tool", item_category="Artisan's Tools", rarity="common",
         desc="Used to create antitoxin and potions of healing. Proficiency adds bonus to herb checks.",
         weight=3, cost=gp(5), properties=[], 
         property_data={
             "tool_proficiencies": ["Herbalism Kit"]
         }, 
         special_abilities=[]),
    
    Item(name="Smith's Tools", item_type="Tool", item_category="Artisan's Tools", rarity="common",
         desc="For metalworking. Proficiency adds bonus to crafting checks.",
         weight=8, cost=gp(20), properties=[], 
         property_data={
             "tool_proficiencies": ["Smith's Tools"]
         }, 
         special_abilities=[]),
    
    Item(name="Thieves' Tools", item_type="Tool", item_category="Tools", rarity="common",
         desc="For picking locks and disarming traps. Proficiency adds bonus to Dexterity checks.",
         weight=1, cost=gp(25), properties=[], 
         property_data={
             "tool_proficiencies": ["Thieves' Tools"]
         }, 
         special_abilities=[]),
    
    Item(name="Disguise Kit", item_type="Tool", item_category="Tools", rarity="common",
         desc="For creating disguises. Proficiency adds bonus to Deception checks.",
         weight=3, cost=gp(25), properties=[], 
         property_data={
             "tool_proficiencies": ["Disguise Kit"]
         }, 
         special_abilities=[]),
    
    Item(name="Forgery Kit", item_type="Tool", item_category="Tools", rarity="common",
         desc="For creating fake documents. Proficiency adds bonus to Intelligence checks.",
         weight=5, cost=gp(15), properties=[], 
         property_data={
             "tool_proficiencies": ["Forgery Kit"]
         }, 
         special_abilities=[]),

    # === ADVENTURING GEAR ===
    Item(name="Backpack", item_type="Wondrous Item", item_category="Adventuring Gear", rarity="common",
         desc="A leather knapsack.", weight=5, cost=gp(2), properties=[], property_data={}, special_abilities=[]),
    
    Item(name="Bedroll", item_type="Wondrous Item", item_category="Adventuring Gear", rarity="common",
         desc="A blanket and bedroll.", weight=3, cost=gp(1), properties=[], property_data={}, special_abilities=[]),
    
    Item(name="Torch", item_type="Wondrous Item", item_category="Adventuring Gear", rarity="common",
         desc="Burns for 1 hour.", weight=1, cost=cp(1), properties=[], property_data={}, special_abilities=[]),
    
    Item(name="Rations", item_type="Wondrous Item", item_category="Adventuring Gear", rarity="common",
         desc="One day of food.", weight=2, cost=gp(5), properties=[], property_data={}, special_abilities=[]),
    
    Item(name="Waterskin", item_type="Wondrous Item", item_category="Adventuring Gear", rarity="common",
         desc="Holds 1/2 gallon of liquid.", weight=5, cost=gp(2), properties=[], property_data={}, special_abilities=[]),
    
    Item(name="Hempen Rope (50 ft)", item_type="Wondrous Item", item_category="Adventuring Gear", rarity="common",
         desc="50 feet of hempen rope.", weight=10, cost=gp(1), properties=[], property_data={}, special_abilities=[]),

    # === ARMOR ===
    Item(name="Leather Armor", item_type="Armor", item_category="Light Armor", rarity="common",
         desc="AC = 11 + Dex modifier", weight=10, cost=gp(10),
         properties=[], 
         property_data={
             "ac_base": 11, 
             "ac_type": "dex"
         }, 
         special_abilities=["AC = 11 + Dex modifier"]),
    
    Item(name="Padded Armor", item_type="Armor", item_category="Light Armor", rarity="common",
         desc="AC = 11 + Dex modifier. Stealth at disadvantage.", weight=8, cost=gp(5),
         properties=["Stealth Disadvantage"], 
         property_data={
             "ac_base": 11, 
             "ac_type": "dex"
         }, 
         special_abilities=["AC = 11 + Dex modifier"]),
    
    Item(name="Shield", item_type="Armor", item_category="Shield", rarity="common",
         desc="+2 to AC", weight=6, cost=gp(10),
         properties=[], 
         property_data={
             "ac_bonus": 2, 
             "ac_type": "shield"
         }, 
         special_abilities=["+2 to AC"]),

    # === WEAPONS - Simple Melee ===
    Item(name="Club", item_type="Weapon", item_category="Simple Melee", rarity="common",
         desc="A simple wooden club.", weight=2, cost=sp(1),
         properties=["Light"], property_data={},
         damage_dice="1d4", damage_type="bludgeoning", special_abilities=[]),
    
    # ✅ Dagger: Finesse + Light + Thrown
    Item(name="Dagger", item_type="Weapon", item_category="Simple Melee", rarity="common",
         desc="A small, sharp blade.", weight=1, cost=gp(2),
         properties=["Finesse", "Light", "Thrown"],
         property_data={
             "thrown": {"range": "20/60"}
         },
         damage_dice="1d4", damage_type="piercing", special_abilities=[]),
    
    # ✅ Dart: Finesse + Thrown
    Item(name="Dart", item_type="Weapon", item_category="Simple Ranged", rarity="common",
         desc="A small, pointed missile.", weight=1, cost=cp(5),
         properties=["Finesse", "Thrown"],
         property_data={
             "thrown": {"range": "20/60"}
         },
         damage_dice="1d4", damage_type="piercing", special_abilities=[]),
    
    # ✅ Javelin: Thrown
    Item(name="Javelin", item_type="Weapon", item_category="Simple Melee", rarity="common",
         desc="A light spear for throwing.", weight=2, cost=sp(5),
         properties=["Thrown"],
         property_data={
             "thrown": {"range": "30/120"}
         },
         damage_dice="1d6", damage_type="piercing", special_abilities=[]),
    
    Item(name="Mace", item_type="Weapon", item_category="Simple Melee", rarity="common",
         desc="A heavy, blunt weapon.", weight=4, cost=gp(5),
         properties=[], property_data={},
         damage_dice="1d6", damage_type="bludgeoning", special_abilities=[]),
    
    # ✅ Quarterstaff: Versatile
    Item(name="Quarterstaff", item_type="Weapon", item_category="Simple Melee", rarity="common",
         desc="A simple, sturdy staff.", weight=4, cost=sp(2),
         properties=["Versatile"],
         property_data={
             "versatile": {"damage_dice": "1d8"}
         },
         damage_dice="1d6", damage_type="bludgeoning",
         special_abilities=["Can be used one-handed (1d6) or two-handed (1d8)"]),
    
    Item(name="Scimitar", item_type="Weapon", item_category="Martial Melee", rarity="common",
         desc="A short sword with a curved blade.", weight=3, cost=gp(25),
         properties=["Finesse", "Light"], property_data={},
         damage_dice="1d6", damage_type="slashing", special_abilities=[]),
    
    Item(name="Sickle", item_type="Weapon", item_category="Simple Melee", rarity="common",
         desc="A curved farming tool.", weight=2, cost=gp(1),
         properties=["Light"], property_data={},
         damage_dice="1d4", damage_type="slashing", special_abilities=[]),
    
    # ✅ Sling: Ammunition
    Item(name="Sling", item_type="Weapon", item_category="Simple Ranged", rarity="common",
         desc="A leather cradle for stones.", weight=0, cost=sp(1),
         properties=["Ammunition"],
         property_data={
             "ammunition": {"range": "30/120"}
         },
         damage_dice="1d4", damage_type="bludgeoning", special_abilities=[]),
    
    # ✅ Spear: Thrown + Versatile (3 variants!)
    Item(name="Spear", item_type="Weapon", item_category="Simple Melee", rarity="common",
         desc="A melee weapon with a long shaft and metal head. Can be thrown or used two-handed.",
         weight=3, cost=gp(1),
         properties=["Thrown", "Versatile"],
         property_data={
             "thrown": {"range": "20/60"},
             "versatile": {"damage_dice": "1d8"}
         },
         damage_dice="1d6", damage_type="piercing",
         special_abilities=["Can be used one-handed (1d6) or two-handed (1d8)", "Can be thrown as a ranged attack (20/60)"]),
    
    # ✅ Light Crossbow: Ammunition + Loading + Two-Handed
    Item(name="Light Crossbow", item_type="Weapon", item_category="Simple Ranged", rarity="common",
         desc="A lightweight crossbow.", weight=5, cost=gp(25),
         properties=["Ammunition", "Loading", "Two-Handed"],
         property_data={
             "ammunition": {"range": "80/320"}
         },
         damage_dice="1d8", damage_type="piercing", special_abilities=[]),

    # === WEAPONS - Martial Melee ===
    # ✅ Battleaxe: Versatile
    Item(name="Battleaxe", item_type="Weapon", item_category="Martial Melee", rarity="common",
         desc="A heavy axe designed for combat.", weight=4, cost=gp(10),
         properties=["Versatile"],
         property_data={
             "versatile": {"damage_dice": "1d10"}
         },
         damage_dice="1d8", damage_type="slashing", special_abilities=[]),
    
    Item(name="Flail", item_type="Weapon", item_category="Martial Melee", rarity="common",
         desc="A ball-and-chain weapon.", weight=2, cost=gp(10),
         properties=[], property_data={},
         damage_dice="1d8", damage_type="bludgeoning", special_abilities=[]),
    
    Item(name="Glaive", item_type="Weapon", item_category="Martial Melee", rarity="common",
         desc="A polearm with a blade on the end.", weight=6, cost=gp(20),
         properties=["Heavy", "Reach", "Two-Handed"], property_data={},
         damage_dice="1d10", damage_type="slashing", special_abilities=[]),
    
    Item(name="Greataxe", item_type="Weapon", item_category="Martial Melee", rarity="common",
         desc="A large, two-handed axe.", weight=7, cost=gp(30),
         properties=["Heavy", "Two-Handed"], property_data={},
         damage_dice="1d12", damage_type="slashing", special_abilities=[]),
    
    Item(name="Greatclub", item_type="Weapon", item_category="Martial Melee", rarity="common",
         desc="A large, two-handed club.", weight=10, cost=sp(2),
         properties=["Two-Handed"], property_data={},
         damage_dice="1d8", damage_type="bludgeoning", special_abilities=[]),
    
    Item(name="Greatsword", item_type="Weapon", item_category="Martial Melee", rarity="common",
         desc="A large, two-handed sword.", weight=6, cost=gp(50),
         properties=["Heavy", "Two-Handed"], property_data={},
         damage_dice="2d6", damage_type="slashing", special_abilities=[]),
    
    Item(name="Halberd", item_type="Weapon", item_category="Martial Melee", rarity="common",
         desc="A polearm with an axe blade and hook.", weight=6, cost=gp(20),
         properties=["Heavy", "Reach", "Two-Handed"], property_data={},
         damage_dice="1d10", damage_type="slashing", special_abilities=[]),
    
    # ✅ Handaxe: Light + Thrown
    Item(name="Handaxe", item_type="Weapon", item_category="Martial Melee", rarity="common",
         desc="A small axe designed for throwing.", weight=2, cost=gp(5),
         properties=["Light", "Thrown"],
         property_data={
             "thrown": {"range": "20/60"}
         },
         damage_dice="1d6", damage_type="slashing", special_abilities=[]),
    
    Item(name="Lance", item_type="Weapon", item_category="Martial Melee", rarity="common",
         desc="A long spear used from horseback.", weight=6, cost=gp(10),
         properties=["Reach", "Special"], property_data={},
         damage_dice="1d12", damage_type="piercing", special_abilities=[]),
    
    # ✅ Longsword: Versatile
    Item(name="Longsword", item_type="Weapon", item_category="Martial Melee", rarity="common",
         desc="A straight, double-edged sword.", weight=3, cost=gp(15),
         properties=["Versatile"],
         property_data={
             "versatile": {"damage_dice": "1d10"}
         },
         damage_dice="1d8", damage_type="slashing", special_abilities=[]),
    
    Item(name="Maul", item_type="Weapon", item_category="Martial Melee", rarity="common",
         desc="A heavy, two-handed hammer.", weight=10, cost=gp(10),
         properties=["Heavy", "Two-Handed"], property_data={},
         damage_dice="2d6", damage_type="bludgeoning", special_abilities=[]),
    
    Item(name="Morningstar", item_type="Weapon", item_category="Martial Melee", rarity="common",
         desc="A spiked mace.", weight=4, cost=gp(15),
         properties=[], property_data={},
         damage_dice="1d8", damage_type="piercing", special_abilities=[]),
    
    Item(name="Pike", item_type="Weapon", item_category="Martial Melee", rarity="common",
         desc="A long spear-like weapon.", weight=18, cost=gp(5),
         properties=["Heavy", "Reach", "Two-Handed"], property_data={},
         damage_dice="1d10", damage_type="piercing", special_abilities=[]),
    
    Item(name="Rapier", item_type="Weapon", item_category="Martial Melee", rarity="common",
         desc="A slender, thrusting sword.", weight=2, cost=gp(25),
         properties=["Finesse"], property_data={},
         damage_dice="1d8", damage_type="piercing", special_abilities=[]),
    
    Item(name="Shortsword", item_type="Weapon", item_category="Martial Melee", rarity="common",
         desc="A short, thrusting sword.", weight=2, cost=gp(10),
         properties=["Finesse", "Light"], property_data={},
         damage_dice="1d6", damage_type="piercing", special_abilities=[]),
    
    # ✅ Trident: Thrown + Versatile
    Item(name="Trident", item_type="Weapon", item_category="Martial Melee", rarity="common",
         desc="A three-pronged spear.", weight=4, cost=gp(5),
         properties=["Thrown", "Versatile"],
         property_data={
             "thrown": {"range": "20/60"},
             "versatile": {"damage_dice": "1d8"}
         },
         damage_dice="1d6", damage_type="piercing", special_abilities=[]),
    
    Item(name="War Pick", item_type="Weapon", item_category="Martial Melee", rarity="common",
         desc="A pickaxe designed for combat.", weight=2, cost=gp(5),
         properties=[], property_data={},
         damage_dice="1d8", damage_type="piercing", special_abilities=[]),
    
    # ✅ Warhammer: Versatile
    Item(name="Warhammer", item_type="Weapon", item_category="Martial Melee", rarity="common",
         desc="A heavy hammer designed for combat.", weight=2, cost=gp(15),
         properties=["Versatile"],
         property_data={
             "versatile": {"damage_dice": "1d10"}
         },
         damage_dice="1d8", damage_type="bludgeoning", special_abilities=[]),
    
    Item(name="Whip", item_type="Weapon", item_category="Martial Melee", rarity="common",
         desc="A long, flexible whip.", weight=3, cost=gp(2),
         properties=["Finesse", "Reach"], property_data={},
         damage_dice="1d4", damage_type="slashing", special_abilities=[]),

    # === WEAPONS - Martial Ranged ===
    Item(name="Blowgun", item_type="Weapon", item_category="Martial Ranged", rarity="common",
         desc="A tube for shooting darts.", weight=1, cost=gp(10),
         properties=["Ammunition", "Loading"],
         property_data={
             "ammunition": {"range": "25/100"}
         },
         damage_dice="1", damage_type="piercing", special_abilities=[]),
    
    # ✅ Hand Crossbow: Ammunition + Light + Loading
    Item(name="Hand Crossbow", item_type="Weapon", item_category="Martial Ranged", rarity="common",
         desc="A small crossbow designed for one-handed use.", weight=3, cost=gp(75),
         properties=["Ammunition", "Light", "Loading"],
         property_data={
             "ammunition": {"range": "30/120"}
         },
         damage_dice="1d6", damage_type="piercing", special_abilities=[]),
    
    # ✅ Heavy Crossbow: Ammunition + Heavy + Loading + Two-Handed
    Item(name="Heavy Crossbow", item_type="Weapon", item_category="Martial Ranged", rarity="common",
         desc="A powerful crossbow requiring two hands.", weight=18, cost=gp(50),
         properties=["Ammunition", "Heavy", "Loading", "Two-Handed"],
         property_data={
             "ammunition": {"range": "100/400"}
         },
         damage_dice="1d10", damage_type="piercing", special_abilities=[]),
    
    # ✅ Longbow: Ammunition + Heavy + Two-Handed
    Item(name="Longbow", item_type="Weapon", item_category="Martial Ranged", rarity="common",
         desc="A large bow requiring two hands.", weight=2, cost=gp(50),
         properties=["Ammunition", "Heavy", "Two-Handed"],
         property_data={
             "ammunition": {"range": "150/600"}
         },
         damage_dice="1d8", damage_type="piercing", special_abilities=[]),
    
    # ✅ Net: Thrown + Special
    Item(name="Net", item_type="Weapon", item_category="Martial Ranged", rarity="common",
         desc="A net for restraining creatures.", weight=3, cost=gp(1),
         properties=["Thrown", "Special"],
         property_data={
             "thrown": {"range": "5/15"}
         },
         damage_dice="0", damage_type="",
         special_abilities=["On hit, target is restrained"]),

    # === MAGICAL ITEMS ===
    # ✅ Staff of Withering: Versatile + Magical Focus + Attunement
    Item(name="Staff of Withering", item_type="Weapon", item_category="Staff", rarity="rare",
         desc="Staff (arcane or druidic focus), rare (requires attunement by a cleric, druid or warlock). This staff has 3 charges and regains 1d3 expended charges daily at dawn.",
         weight=4, cost=gp(0),
         properties=["Versatile", "Magical Focus"],
         property_data={
             "versatile": {"damage_dice": "1d8"},
             "requires_attunement": True,
             "attunement_requirements": ["Cleric", "Druid", "Warlock"]
         },
         damage_dice="1d6", damage_type="bludgeoning",
         max_charges=3,
         charge_recharge="1d3",
         on_hit_effect="Expend 1 charge: +2d10 necrotic damage. Target must make DC 15 CON save or have disadvantage on STR/CON checks for 1 hour.",
         special_abilities=["Requires attunement by cleric, druid, or warlock", "3 charges (regain 1d3 at dawn)", "Can be used one-handed (1d6) or two-handed (1d8)"]),

    # ✅ Cloak of Tongues - Grants languages + Attunement
    Item(name="Cloak of Tongues", item_type="Wondrous Item", item_category="Wondrous Item", rarity="uncommon",
         desc="While wearing this cloak, you understand any spoken language that you hear. Moreover, creatures understand any spoken language you speak.",
         weight=1, cost=gp(0),
         properties=[], 
         property_data={
             "requires_attunement": True,
             "languages": ["Understand all spoken languages", "All speakers understand you"]
         }, 
         special_abilities=["Grants understanding of all languages"]),

    # ✅ Goggles of Night - Grants Darkvision trait
    Item(name="Goggles of Night", item_type="Wondrous Item", item_category="Wondrous Item", rarity="uncommon",
         desc="While wearing these dark lenses, you have darkvision out to 60 feet. If you already have darkvision, the range increases by 60 feet.",
         weight=0, cost=gp(0),
         properties=[], 
         property_data={
             "traits": [{
                 "name": "Darkvision",
                 "description": "Grants darkvision 60 ft. If you already have darkvision, the range increases by 60 feet."
             }]
         }, 
         special_abilities=["Grants darkvision 60 ft"]),

    # ✅ Gloves of Thievery - Grants tool proficiency + SKILL MODIFIER
    Item(name="Gloves of Thievery", item_type="Wondrous Item", item_category="Wondrous Item", rarity="uncommon",
         desc="These gloves are invisible while worn. You gain a +5 bonus to Dexterity (Sleight of Hand) checks.",
         weight=0, cost=gp(0),
         properties=[], 
         property_data={
             "tool_proficiencies": ["Thieves' Tools"],
             # ✅ STRUCTURED SKILL MODIFIER (frontend will read this)
             "skill_modifiers": [{
                 "skill": "Sleight of Hand",
                 "modifier": 5
             }]
         }, 
         special_abilities=["+5 bonus to Sleight of Hand checks"]),

    # ✅ Sentinel Shield - Grants weapon proficiency + Attunement
     Item(name="Sentinel Shield", item_type="Armor", item_category="Shield", rarity="uncommon",
          desc="While holding this shield, you have advantage on Wisdom (Perception) checks while awake. The shield grants weapon proficiency with martial weapons.",
          weight=6, cost=gp(0),
          properties=[], 
          property_data={
          "ac_bonus": 2,
          "requires_attunement": True,
          "weapon_proficiencies": ["Martial Weapons"],
          "skill_advantages": [{
               "skill": "Perception",
               "description": "Advantage on Perception checks while awake"
          }]
          }, 
          special_abilities=["Advantage on Perception checks", "Grants martial weapon proficiency"]),
          
    # ✅ Tome of Understanding - Grants language + Attunement
    Item(name="Tome of Understanding", item_type="Wondrous Item", item_category="Wondrous Item", rarity="very_rare",
         desc="This book contains knowledge of one language. An attuned creature can understand any spoken language.",
         weight=5, cost=gp(0),
         properties=[], 
         property_data={
             "requires_attunement": True,
             "languages": ["Draconic"]
         }, 
         special_abilities=["Grants understanding of Draconic"]),
]

def add_items():
    """Add items to DB, avoiding duplicates."""
    existing_names = {item.name for item in session.query(Item.name).all()}
    new_items = [item for item in items_to_add if item.name not in existing_names]
    
    if new_items:
        session.add_all(new_items)
        session.commit()
        print(f"[SUCCESS] Added {len(new_items)} items")
        print(f"✅ Properties format: Simple keywords only")
        print(f"✅ Property data stored in property_data JSON field")
        print(f"✅ Skill modifiers structured for frontend display")
        print(f"✅ Attunement requirements properly flagged")
    else:
        print("[INFO] All items already exist.")

if __name__ == "__main__":
    add_items()