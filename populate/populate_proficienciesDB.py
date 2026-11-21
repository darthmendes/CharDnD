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
]


def add_proficiency(name, proficiency_type="tool", base_ability="None"):
    if session.query(Proficiency).filter_by(name=name).first():
        return
    session.add(Proficiency(
        name=name,
        description=f"{name} proficiency",
        type=proficiency_type,
        baseAbility=base_ability,
    ))


def add_proficiencies():
    try:
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
