"""Seed the language proficiency catalog."""

from Backend.models import Proficiency, session


LANGUAGE_NAMES = [
    "Common",
    "Dwarvish",
    "Elvish",
    "Giant",
    "Gnomish",
    "Goblin",
    "Halfling",
    "Orc",
    "Abyssal",
    "Celestial",
    "Deep Speech",
    "Draconic",
    "Infernal",
    "Primordial",
    "Sylvan",
    "Undercommon",
]


def add_languages():
    try:
        catalog = {
            proficiency.name.strip().casefold(): proficiency
            for proficiency in session.query(Proficiency).filter_by(type="language").all()
        }

        for name in LANGUAGE_NAMES:
            normalized_name = name.casefold()
            if normalized_name not in catalog:
                proficiency = Proficiency(
                    name=name,
                    description=f"{name} language proficiency",
                    type="language",
                    baseAbility="None",
                )
                session.add(proficiency)
                catalog[normalized_name] = proficiency

        session.flush()
        session.commit()
        print(
            f"[SUCCESS] Language proficiency catalog ready: "
            f"{len(LANGUAGE_NAMES)} standard languages."
        )
        return True
    except Exception:
        session.rollback()
        raise


if __name__ == "__main__":
    add_languages()
