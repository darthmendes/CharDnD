from Backend.models.item import Item
from Backend.models import session

# Create features for Dwarf
items = [
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
    )
]

def add_items():
    session.add_all(items)
    session.commit()