"""
Populate D&D 5e item database with all equipment needed for character creation.
- Includes all items required for standard packs (Explorer's, Dungeoneer's, Priest's)
- No abstract "pack" items — packs are expanded via backend logic
- All item types are valid: Tool, Wondrous Item, Weapon, Armor
- Cost stored in copper pieces (cp), weight in lbs (int)
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
         weight=3, cost=gp(5), properties=[], special_abilities=[]),
    Item(name="Smith's Tools", item_type="Tool", item_category="Artisan's Tools", rarity="common",
         desc="For metalworking. Proficiency adds bonus to crafting checks.",
         weight=8, cost=gp(20), properties=[], special_abilities=[]),
    Item(name="Brewer's Supplies", item_type="Tool", item_category="Artisan's Tools", rarity="common",
         desc="For brewing beer/ale. Proficiency adds bonus to brewing checks.",
         weight=9, cost=gp(20), properties=[], special_abilities=[]),
    Item(name="Mason's Tools", item_type="Tool", item_category="Artisan's Tools", rarity="common",
         desc="For stonework. Proficiency adds bonus to stonework checks.",
         weight=8, cost=gp(10), properties=[], special_abilities=[]),
    Item(name="Thieves' Tools", item_type="Tool", item_category="Tools", rarity="common",
         desc="For picking locks and disarming traps. Proficiency adds bonus to Dexterity checks.",
         weight=1, cost=gp(25), properties=[], special_abilities=[]),
    Item(name="Disguise Kit", item_type="Tool", item_category="Tools", rarity="common",
         desc="For creating disguises. Proficiency adds bonus to Deception checks.",
         weight=3, cost=gp(25), properties=[], special_abilities=[]),
    Item(name="Forgery Kit", item_type="Tool", item_category="Tools", rarity="common",
         desc="For creating fake documents. Proficiency adds bonus to Intelligence checks.",
         weight=5, cost=gp(15), properties=[], special_abilities=[]),

    # === ADVENTURING GEAR (Wondrous Item) ===
    Item(name="Backpack", item_type="Wondrous Item", item_category="Adventuring Gear", rarity="common",
         desc="A leather knapsack.", weight=5, cost=gp(2), properties=[], special_abilities=[]),
    Item(name="Bedroll", item_type="Wondrous Item", item_category="Adventuring Gear", rarity="common",
         desc="A blanket and bedroll.", weight=3, cost=gp(1), properties=[], special_abilities=[]),
    Item(name="Mess Kit", item_type="Wondrous Item", item_category="Adventuring Gear", rarity="common",
         desc="A tin plate, cup, and utensils.", weight=1, cost=gp(2), properties=[], special_abilities=[]),
    Item(name="Tinderbox", item_type="Wondrous Item", item_category="Adventuring Gear", rarity="common",
         desc="For lighting fires.", weight=1, cost=gp(5), properties=[], special_abilities=[]),
    Item(name="Torch", item_type="Wondrous Item", item_category="Adventuring Gear", rarity="common",
         desc="Burns for 1 hour.", weight=1, cost=cp(1), properties=[], special_abilities=[]),
    Item(name="Rations", item_type="Wondrous Item", item_category="Adventuring Gear", rarity="common",
         desc="One day of food.", weight=2, cost=gp(5), properties=[], special_abilities=[]),
    Item(name="Waterskin", item_type="Wondrous Item", item_category="Adventuring Gear", rarity="common",
         desc="Holds 1/2 gallon of liquid.", weight=5, cost=gp(2), properties=[], special_abilities=[]),
    Item(name="Hempen Rope (50 ft)", item_type="Wondrous Item", item_category="Adventuring Gear", rarity="common",
         desc="50 feet of hempen rope.", weight=10, cost=gp(1), properties=[], special_abilities=[]),
    Item(name="Crowbar", item_type="Wondrous Item", item_category="Adventuring Gear", rarity="common",
         desc="For leverage. Adds +2 to checks to pry things open.", weight=5, cost=gp(2), properties=[], special_abilities=[]),
    Item(name="Hammer", item_type="Wondrous Item", item_category="Adventuring Gear", rarity="common",
         desc="A standard hammer.", weight=3, cost=gp(1), properties=[], special_abilities=[]),
    Item(name="Piton", item_type="Wondrous Item", item_category="Adventuring Gear", rarity="common",
         desc="Iron spike for climbing.", weight=0, cost=gp(1), properties=[], special_abilities=[]),
    Item(name="Candle", item_type="Wondrous Item", item_category="Adventuring Gear", rarity="common",
         desc="Burns for 4 hours.", weight=0, cost=cp(1), properties=[], special_abilities=[]),
    Item(name="Alms Box", item_type="Wondrous Item", item_category="Religious Item", rarity="common",
         desc="A small box for collecting donations.", weight=1, cost=gp(5), properties=[], special_abilities=[]),
    Item(name="Censer", item_type="Wondrous Item", item_category="Religious Item", rarity="common",
         desc="For burning incense.", weight=1, cost=gp(2), properties=[], special_abilities=[]),
    Item(name="Vestments", item_type="Wondrous Item", item_category="Religious Item", rarity="common",
         desc="Ceremonial clothing.", weight=2, cost=gp(5), properties=[], special_abilities=[]),
    Item(name="Blanket", item_type="Wondrous Item", item_category="Adventuring Gear", rarity="common",
         desc="A wool blanket.", weight=1, cost=gp(1), properties=[], special_abilities=[]),

    # === ARMOR ===
    Item(name="Leather Armor", item_type="Armor", item_category="Light Armor", rarity="common",
         desc="AC = 11 + Dex modifier", weight=10, cost=gp(10),
         properties=[], special_abilities=["AC = 11 + Dex modifier"]),
    Item(name="Padded Armor", item_type="Armor", item_category="Light Armor", rarity="common",
         desc="AC = 11 + Dex modifier. Stealth at disadvantage.", weight=8, cost=gp(5),
         properties=["Stealth disadvantage"], special_abilities=["AC = 11 + Dex modifier"]),
    Item(name="Shield", item_type="Armor", item_category="Shield", rarity="common",
         desc="+2 to AC", weight=6, cost=gp(10),
         properties=[], special_abilities=["+2 to AC"]),

    # === WEAPONS ===
    Item(name="Club", item_type="Weapon", item_category="Simple Melee", rarity="common",
         desc="A simple wooden club.", weight=2, cost=sp(1), properties=["Light"],
         damage_dice="1d4", damage_type="bludgeoning", special_abilities=[]),
    Item(name="Dagger", item_type="Weapon", item_category="Simple Melee", rarity="common",
         desc="A small, sharp blade.", weight=1, cost=gp(2),
         properties=["Finesse", "Light", "Thrown (range 20/60)"],
         damage_dice="1d4", damage_type="piercing", special_abilities=[]),
    Item(name="Dart", item_type="Weapon", item_category="Simple Ranged", rarity="common",
         desc="A small, pointed missile.", weight=1, cost=cp(5),
         properties=["Finesse", "Thrown (range 20/60)"],
         damage_dice="1d4", damage_type="piercing", special_abilities=[]),
    Item(name="Javelin", item_type="Weapon", item_category="Simple Melee", rarity="common",
         desc="A light spear for throwing.", weight=2, cost=sp(5),
         properties=["Thrown (range 30/120)"],
         damage_dice="1d6", damage_type="piercing", special_abilities=[]),
    Item(name="Mace", item_type="Weapon", item_category="Simple Melee", rarity="common",
         desc="A heavy, blunt weapon.", weight=4, cost=gp(5), properties=[],
         damage_dice="1d6", damage_type="bludgeoning", special_abilities=[]),
    Item(name="Quarterstaff", item_type="Weapon", item_category="Simple Melee", rarity="common",
         desc="A simple, sturdy staff.", weight=4, cost=sp(2),
         properties=["Versatile (1d8)"],
         damage_dice="1d6", damage_type="bludgeoning", special_abilities=[]),
    Item(name="Scimitar", item_type="Weapon", item_category="Martial Melee", rarity="common",
         desc="A short sword with a curved blade.", weight=3, cost=gp(25),
         properties=["Finesse", "Light"],
         damage_dice="1d6", damage_type="slashing", special_abilities=[]),
    Item(name="Sickle", item_type="Weapon", item_category="Simple Melee", rarity="common",
         desc="A curved farming tool.", weight=2, cost=gp(1), properties=["Light"],
         damage_dice="1d4", damage_type="slashing", special_abilities=[]),
    Item(name="Sling", item_type="Weapon", item_category="Simple Ranged", rarity="common",
         desc="A leather cradle for stones.", weight=0, cost=sp(1),
         properties=["Ammunition (range 30/120)"],
         damage_dice="1d4", damage_type="bludgeoning", special_abilities=[]),
    Item(name="Spear", item_type="Weapon", item_category="Simple Melee", rarity="common",
         desc="A long shaft with a metal head.", weight=3, cost=gp(1),
         properties=["Thrown (range 20/60)", "Versatile (1d8)"],
         damage_dice="1d6", damage_type="piercing", special_abilities=[]),
]

def add_items():
    """Add items to DB, avoiding duplicates."""
    existing_names = {item.name for item in session.query(Item.name).all()}
    new_items = [item for item in items_to_add if item.name not in existing_names]
    
    if new_items:
        session.add_all(new_items)
        session.commit()
        print(f"[SUCCESS] Added {len(new_items)} items (e.g., Backpack, Torch, Rations, etc.)")
    else:
        print("[INFO] All items already exist.")

if __name__ == "__main__":
    add_items()