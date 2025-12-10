# D&D 5e official magic item types
ITEM_TYPES = {
    "Armor",
    "Potion",
    "Ring",
    "Rod",
    "Scroll",
    "Staff",
    "Tool",
    "Wand",
    "Weapon",
    "Wondrous Item"
}

# Backend/constants.py
# Map pack names to list of (item_name, quantity)
PACK_DEFINITIONS = {
    "Explorer's Pack": [
        ("Backpack", 1),
        ("Bedroll", 1),
        ("Mess Kit", 1),
        ("Tinderbox", 1),
        ("Torch", 10),
        ("Rations", 10),
        ("Waterskin", 1),
        ("Hempen Rope (50 ft)", 1),  # Ensure this item exists in DB
    ],
    "Dungeoneer's Pack": [
        ("Backpack", 1),
        ("Crowbar", 1),
        ("Hammer", 1),
        ("Piton", 10),
        ("Torch", 10),
        ("Rations", 10),
        ("Waterskin", 1),
        ("Hempen Rope (50 ft)", 1),
    ],
    "Priest's Pack": [
        ("Backpack", 1),
        ("Blanket", 1),
        ("Candle", 10),
        ("Tinderbox", 1),
        ("Alms Box", 1),
        ("Censer", 1),
        ("Vestments", 1),
        ("Rations", 2),
        ("Waterskin", 1),
    ],
}