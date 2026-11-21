"""
Populate the normalized backgrounds table.
"""

from Backend.models import session
from Backend.models.background import Background


BACKGROUND_DATA = [
    ("Acolyte", "You have spent your life in the service of a temple."),
    ("Charlatan", "You have always had a way with people."),
    ("Criminal", "You are an experienced criminal with a history of breaking the law."),
    ("Entertainer", "You thrive in front of an audience."),
    ("Folk Hero", "You championed the people and stood up to oppression."),
    ("Guild Artisan", "You are a skilled member of a guild."),
    ("Hermit", "You lived in seclusion."),
    ("Noble", "You understand wealth, power, and privilege."),
    ("Outlander", "You grew up far from civilization."),
    ("Sage", "You spent years studying the lore of the multiverse."),
    ("Sailor", "You sailed on a seagoing vessel."),
    ("Soldier", "You are a hardened warrior who has seen combat."),
    ("Urchin", "You grew up on the streets alone and poor."),
]


def populate_backgrounds():
    try:
        existing = {name for (name,) in session.query(Background.name).all()}
        new_backgrounds = [
            Background(name=name, description=description)
            for name, description in BACKGROUND_DATA
            if name not in existing
        ]
        session.add_all(new_backgrounds)
        session.commit()
        print(f"[SUCCESS] Added {len(new_backgrounds)} backgrounds")
        return True
    except Exception as exc:
        session.rollback()
        print(f"[ERROR] Failed to populate backgrounds: {exc}")
        return False


if __name__ == "__main__":
    populate_backgrounds()
