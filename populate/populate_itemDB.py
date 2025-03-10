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
    
]

def add_items():
    session.add_all(items)
    session.commit()