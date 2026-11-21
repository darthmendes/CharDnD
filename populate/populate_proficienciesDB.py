"""
Populate normalized proficiency records.
"""

from Backend.models import session
from Backend.models.proficiencies import Proficiency


PROFICIENCY_DATA = [
    ("Light Armor", "armor", "Strength"),
    ("Medium Armor", "armor", "Strength"),
    ("Shields", "armor", "Strength"),
    ("Clubs", "weapon", "Strength"),
    ("Daggers", "weapon", "Dexterity"),
    ("Darts", "weapon", "Dexterity"),
    ("Javelins", "weapon", "Strength"),
    ("Maces", "weapon", "Strength"),
    ("Quarterstaffs", "weapon", "Strength"),
    ("Scimitars", "weapon", "Dexterity"),
    ("Sickles", "weapon", "Strength"),
    ("Slings", "weapon", "Dexterity"),
    ("Spears", "weapon", "Strength"),
    ("Intelligence", "saving-throw", "Intelligence"),
    ("Wisdom", "saving-throw", "Wisdom"),
    ("Acrobatics", "skill", "Dexterity"),
    ("Animal Handling", "skill", "Wisdom"),
    ("Arcana", "skill", "Intelligence"),
    ("Athletics", "skill", "Strength"),
    ("Deception", "skill", "Charisma"),
    ("History", "skill", "Intelligence"),
    ("Insight", "skill", "Wisdom"),
    ("Intimidation", "skill", "Charisma"),
    ("Investigation", "skill", "Intelligence"),
    ("Medicine", "skill", "Wisdom"),
    ("Nature", "skill", "Intelligence"),
    ("Perception", "skill", "Wisdom"),
    ("Performance", "skill", "Charisma"),
    ("Persuasion", "skill", "Charisma"),
    ("Religion", "skill", "Intelligence"),
    ("Sleight of Hand", "skill", "Dexterity"),
    ("Stealth", "skill", "Dexterity"),
    ("Survival", "skill", "Wisdom"),
    ("Alchemist's Supplies", "tool", "None"),
    ("Brewer's Supplies", "tool", "None"),
    ("Calligrapher's Supplies", "tool", "None"),
    ("Carpenter's Tools", "tool", "None"),
    ("Cartographer's Tools", "tool", "None"),
    ("Cobbler's Tools", "tool", "None"),
    ("Cook's Utensils", "tool", "None"),
    ("Glassblower's Tools", "tool", "None"),
    ("Jeweler's Tools", "tool", "None"),
    ("Leatherworker's Tools", "tool", "None"),
    ("Mason's Tools", "tool", "None"),
    ("Painter's Supplies", "tool", "None"),
    ("Potter's Tools", "tool", "None"),
    ("Smith's Tools", "tool", "None"),
    ("Tinker's Tools", "tool", "None"),
    ("Weaver's Tools", "tool", "None"),
    ("Woodcarver's Tools", "tool", "None"),
    ("Disguise Kit", "tool", "None"),
    ("Forgery Kit", "tool", "None"),
    ("Herbalism Kit", "tool", "None"),
    ("Navigator's Tools", "tool", "None"),
    ("Poisoner's Kit", "tool", "None"),
    ("Thieves' Tools", "tool", "None"),
    ("Vehicles (land)", "tool", "None"),
    ("Vehicles (water)", "tool", "None"),
    ("Dice Set", "tool", "None"),
    ("Dragonchess Set", "tool", "None"),
    ("Playing Card Set", "tool", "None"),
    ("Three-Dragon Ante Set", "tool", "None"),
    ("Bagpipes", "tool", "None"),
    ("Drum", "tool", "None"),
    ("Dulcimer", "tool", "None"),
    ("Flute", "tool", "None"),
    ("Lute", "tool", "None"),
    ("Lyre", "tool", "None"),
    ("Horn", "tool", "None"),
    ("Pan Flute", "tool", "None"),
    ("Shawm", "tool", "None"),
    ("Viol", "tool", "None"),
]

RENAMED_PROFICIENCIES = {
    "Land Vehicles": "Vehicles (land)",
    "Water Vehicles": "Vehicles (water)",
}


def add_proficiency(name, proficiency_type="tool", base_ability="None"):
    existing = session.query(Proficiency).filter_by(
        name=name,
        type=proficiency_type,
    ).first()
    if existing:
        return
    session.add(Proficiency(
        name=name,
        description=f"{name} proficiency",
        type=proficiency_type,
        baseAbility=base_ability,
    ))


def add_proficiencies():
    try:
        for old_name, new_name in RENAMED_PROFICIENCIES.items():
            old_proficiency = session.query(Proficiency).filter_by(
                name=old_name,
                type="tool",
            ).first()
            new_proficiency = session.query(Proficiency).filter_by(
                name=new_name,
                type="tool",
            ).first()
            if old_proficiency and not new_proficiency:
                old_proficiency.name = new_name

        for name, proficiency_type, base_ability in PROFICIENCY_DATA:
            add_proficiency(name, proficiency_type, base_ability)
        session.commit()
        print("[SUCCESS] Proficiencies populated")
        return True
    except Exception as exc:
        session.rollback()
        print(f"[ERROR] Failed to populate proficiencies: {exc}")
        return False


if __name__ == "__main__":
    add_proficiencies()
