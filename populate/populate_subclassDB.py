"""
Populate core subclasses using the current Subclass model.
"""

from Backend.models import session
from Backend.models.dndclass import DnDclass, Subclass


SUBCLASS_DATA = [
    ("Barbarian", "Path of the Berserker"),
    ("Bard", "College of Lore"),
    ("Cleric", "Life Domain"),
    ("Druid", "Circle of the Moon"),
    ("Fighter", "Champion"),
    ("Monk", "Way of the Open Hand"),
    ("Paladin", "Oath of Devotion"),
    ("Ranger", "Hunter"),
    ("Rogue", "Thief"),
    ("Sorcerer", "Draconic Bloodline"),
    ("Warlock", "The Fiend"),
    ("Wizard", "School of Evocation"),
]


def populate_subclasses():
    try:
        count = 0
        for class_name, subclass_name in SUBCLASS_DATA:
            dndclass = session.query(DnDclass).filter_by(name=class_name).first()
            if not dndclass:
                continue
            existing = session.query(Subclass).filter_by(
                classID=dndclass.id,
                name=subclass_name,
            ).first()
            if not existing:
                session.add(Subclass(
                    classID=dndclass.id,
                    name=subclass_name,
                    subclass_flavor=subclass_name,
                ))
                count += 1
        session.commit()
        print(f"[SUCCESS] Added {count} subclasses")
        return True
    except Exception as exc:
        session.rollback()
        print(f"[ERROR] Failed to populate subclasses: {exc}")
        return False


if __name__ == "__main__":
    populate_subclasses()
