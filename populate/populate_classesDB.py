"""
Populate the normalized DnDclass table.
"""

from Backend.models import session
from Backend.models.dndclass import DnDclass


CLASS_DATA = [
    ("Artificer", 8, "Intelligence"),
    ("Barbarian", 12, None),
    ("Bard", 8, "Charisma"),
    ("Cleric", 8, "Wisdom"),
    ("Druid", 8, "Wisdom"),
    ("Fighter", 10, None),
    ("Monk", 8, "Wisdom"),
    ("Paladin", 10, "Charisma"),
    ("Ranger", 10, "Wisdom"),
    ("Rogue", 8, None),
    ("Sorcerer", 6, "Charisma"),
    ("Warlock", 8, "Charisma"),
    ("Wizard", 6, "Intelligence"),
]


def populate_all_classes():
    try:
        existing = {name for (name,) in session.query(DnDclass.name).all()}
        classes = [
            DnDclass(name=name, hit_dice=hit_dice, spellcasting_ability=ability)
            for name, hit_dice, ability in CLASS_DATA
            if name not in existing
        ]
        session.add_all(classes)
        session.commit()
        print(f"[SUCCESS] Added {len(classes)} classes")
        return True
    except Exception as exc:
        session.rollback()
        print(f"[ERROR] Failed to populate classes: {exc}")
        return False


if __name__ == "__main__":
    populate_all_classes()
