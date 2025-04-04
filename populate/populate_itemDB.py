from Backend.models.item import Item
from Backend.models import session

# Create features for Dwarf
items = [
    Item(
        name = "Herbalism Kit",
        desc = "This kit contains a variety of instruments such as clippers, mortar and pestle, and pouches and vials used by herbalists to create remedies and potions. "
                "Proficiency with this kit lets you add your proficiency bonus to any ability checks you make to identify or apply herbs. "
                "Also, proficiency with this kit is required to create antitoxin and any potion of healing.",
        weight = 3,
        cost = 5,
        item_type = "tool",
        item_category = "artisan_tools",
        rarity = "common",
        properties = {}
    ),
    Item(
        name = "Smith's Tools",
        desc = "These special tools include the items needed to pursue a craft or trade. "
                "Proficiency with a set of artisan's tools lets you add your proficiency bonus to any ability checks you make using the tools in your craft. "
                "Each type of artisan's tools requires a separate proficiency.",
        weight = 8,
        cost = 20,
        item_type = "tool",
        item_category = "artisan_tools",
        rarity = "common",
        properties = {}
    ),
    Item(
        name = "Brewer's Supplies",
        desc =  "These special tools include the items needed to pursue a craft or trade. "
                "Proficiency with a set of artisan's tools lets you add your proficiency bonus to any ability checks you make using the tools in your craft. "
                "Each type of artisan's tools requires a separate proficiency.",
        weight = 9,
        cost = 20,
        item_type = "tool",
        item_category = "artisan_tools",
        rarity = "common",
        properties = {}
    ),
    Item(
        name = "Mason's Tools",
        desc =  "These special tools include the items needed to pursue a craft or trade. "
                "Proficiency with a set of artisan's tools lets you add your proficiency bonus to any ability checks you make using the tools in your craft. "
                "Each type of artisan's tools requires a separate proficiency.",
        weight = 8,
        cost = 10,
        item_type = "tool",
        item_category = "artisan_tools",
        rarity = "common",
        properties = {}
    ),
    Item(
        name="Leather",
        item_type="armor",
        item_category="light-armor",
        rarity="common",
        desc="",
        weight=10,
        cost=10,
        properties={
            "ac":11
        },
    ),
    Item(
        name="Padded",
        item_type="armor",
        item_category="light-armor",
        rarity="common",
        desc="",
        weight=8,
        cost=5,
        properties={
            "ac":11,
            "stealth":"disadvantage"
        },
    ),
    Item(
        name="Shield",
        item_type="armor",
        item_category="shields",
        rarity="common",
        desc="",
        weight=6,
        cost=10,
        properties={
            "ac":2
        },
    ),
    Item(
        name="Club",
        item_type="weapon",
        item_category="simple",
        rarity="common",
        desc="",
        weight=2,
        cost=0.1,
        properties={
            "ranged": False,
            "damage":"1d4",
            "attributes":[
                "light"
            ],
            "damage_type":"bludgeoning"
        },
    ),
    Item(
        name="Dagger",
        item_type="weapon",
        item_category="simple",
        rarity="common",
        desc="",
        weight=1,
        cost=2,
        properties={
            "ranged": False,
            "damage":"1d4",
            "attributes":[
                "light",
                "finesse",
                "thrown"
            ],
            "range_dist": "20/60",
            "damage_type":"piercing"
        },
    ),
    Item(
        name="Dart",
        item_type="weapon",
        item_category="simple",
        rarity="common",
        desc="",
        weight=0.25,
        cost=0.05,
        properties={
            "ranged": True,
            "damage":"1d4",
            "attributes":[
                "finesse",
                "thrown",
                "vex"
            ],
            "range_dist": "20/60",
            "damage_type":"piercing"
        },
    ),
    Item(
        name="Javelin",
        item_type="weapon",
        item_category="simple",
        rarity="common",
        desc="",
        weight=2,
        cost=0.5,
        properties={
            "ranged": True,
            "damage":"1d6",
            "attributes":[
                "thrown",
                "Slow"
            ],
            "range_dist": "30/120",
            "damage_type":"piercing"
        },
    ),
    Item(
        name="Mace",
        item_type="weapon",
        item_category="simple",
        rarity="common",
        desc="",
        weight=4,
        cost=5,
        properties={
            "ranged": False,
            "damage":"1d6",
            "attributes":[
                "Sap"
            ],
            "damage_type":"bludgeoning"
        },
    ),
    Item(
        name="Quarterstaff",
        item_type="weapon",
        item_category = "simple",
        rarity="common",
        desc="",
        weight=4,
        cost=0.2,
        properties={
            "ranged":False,
            "damage":"1d6",
            "attributes":[
                "Topple",
                "Versatile"
            ],
            "versatile_damage":"1d8",
            "damage_type":"bludgeoning"
        }
    ),
    Item(
        name="Scimitar",
        item_type="weapon",
        item_category = "martial",
        rarity="common",
        desc="",
        weight=3,
        cost=25,
        properties={
            "ranged":False,
            "damage":"1d6",
            "attributes":[
                "Finesse",
                "Light",
                "Nick"
            ],
            "versatile_damage":"1d6",
            "damage_type":"slashing"
        }
    ), 
    Item(
        name="Sickle",
        item_type="weapon",
        item_category = "simple",
        rarity="common",
        desc="",
        weight=2,
        cost=1,
        properties={
            "ranged":False,
            "damage":"1d4",
            "attributes":[
                "Light",
                "Nick"
            ],
            "damage_type":"slashing"
        }
    ), 
    Item(
        name="Sling",
        item_type="weapon",
        item_category = "simple",
        rarity="common",
        desc="",
        weight=0,
        cost=0.1,
        properties={
            "ranged":True,
            "damage":"1d4",
            "attributes":[
                "Ammunition",
                "Slow"
            ],
            "damage_type":"bludgeoning"
        }
    ),
    Item(
        name="Spear",
        item_type="weapon",
        item_category = "simple",
        rarity="common",
        desc="",
        weight=3,
        cost=1,
        properties={
            "ranged":False,
            "damage":"1d6",
            "attributes":[
                "Thrown",
                "Sap",
                "Versatile"
            ],
            "versatile_damage":"1d8",
            "range_dist": "20/60",
            "damage_type":"piercing"
        }
    ),
    Item(
        name="Wooden Shield",
        item_type="armor",
        item_category = "shields",
        rarity="common",
        desc="",
        weight=6,
        cost=10,
        properties ={
            "ac":2
        }
    ),  
    Item(
        name="Simple weapon",
        item_type="category",
        properties={
            "ranged":True,
            "weapon_category":"simple"
        }
    ),
    Item(
        name="Simple melee weapon",
        item_type="category",
        properties={
            "ranged":False,
            "weapon_category":"simple"
        }
    ),
    Item(
        name="Explorer's Pack",
        item_type="category",
        item_category="Equipment Pack",
        weight=59,
        cost=10,
        properties={
            "Backpack":1,
            "Bedroll":1,
            "Mess Kit":1,
            "Tinderbox":1,
            "Torch":10,
            "Rations":10,
            "Waterskin":1,
            "Rope (ft)":50
        }
    ),
    Item(
        name="Druidic Focus",
        item_type="druidic-focus",
    )
]

def add_items():
    session.add_all(items)
    session.commit()