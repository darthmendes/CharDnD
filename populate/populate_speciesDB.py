"""
Populate species and subspecies using the normalized Species model.
"""

from Backend.models import session
from Backend.models.extra import CreatureSize, MovementType
from Backend.models.species import Species, SpeciesSpeed


SPECIES_DATA = [
    ("Human", "Medium", 30, None),
    ("Elf", "Medium", 30, None),
    ("Dwarf", "Medium", 25, None),
    ("Halfling", "Small", 25, None),
    ("Dragonborn", "Medium", 30, None),
    ("Gnome", "Small", 25, None),
    ("Half-Elf", "Medium", 30, None),
    ("Half-Orc", "Medium", 30, None),
    ("Tiefling", "Medium", 30, None),
]

SUBSPECIES_DATA = [
    ("High Elf", "Elf"), ("Wood Elf", "Elf"), ("Dark Elf (Drow)", "Elf"),
    ("Hill Dwarf", "Dwarf"), ("Mountain Dwarf", "Dwarf"),
    ("Lightfoot Halfling", "Halfling"), ("Stout Halfling", "Halfling"),
    ("Forest Gnome", "Gnome"), ("Rock Gnome", "Gnome"),
]


def add_species_and_subspecies():
    try:
        medium = session.query(CreatureSize).filter_by(name="Medium").first()
        if not medium:
            medium = CreatureSize(name="Medium", value=5)
            session.add(medium)
            session.flush()

        small = session.query(CreatureSize).filter_by(name="Small").first()
        if not small:
            small = CreatureSize(name="Small", value=5)
            session.add(small)
            session.flush()

        walk = session.query(MovementType).filter_by(name="Walk").first()
        if not walk:
            walk = MovementType(name="Walk")
            session.add(walk)
            session.flush()

        existing = {name for (name,) in session.query(Species.name).all()}
        parent_species = {}
        for name, size_name, speed, _ in SPECIES_DATA:
            if name not in existing:
                size = medium if size_name == "Medium" else small
                species = Species(
                    name=name,
                    description=f"{name} playable species.",
                    creatureType="Humanoid",
                    sizeID=size.id,
                )
                session.add(species)
                session.flush()
            else:
                species = session.query(Species).filter_by(name=name).first()
            parent_species[name] = species
            if not session.query(SpeciesSpeed).filter_by(
                speciesID=species.id, movTypeID=walk.id
            ).first():
                session.add(SpeciesSpeed(speciesID=species.id, movTypeID=walk.id, value=speed))

        for name, parent_name in SUBSPECIES_DATA:
            if not session.query(Species).filter_by(name=name).first():
                parent = parent_species[parent_name]
                species = Species(
                    name=name,
                    description=f"{name} subspecies.",
                    creatureType="Humanoid",
                    sizeID=parent.sizeID,
                    parent=parent.id,
                )
                session.add(species)
                session.flush()
                session.add(SpeciesSpeed(
                    speciesID=species.id,
                    movTypeID=walk.id,
                    value=30 if parent_name != "Dwarf" and parent_name != "Halfling" else 25,
                ))

        session.commit()
        print("[SUCCESS] Species and subspecies populated")
        return True
    except Exception as exc:
        session.rollback()
        print(f"[ERROR] Failed to populate species: {exc}")
        return False


def add_species_traits():
    print("[INFO] Species traits are feature relationships; no legacy feature linkage table exists.")
    return True


if __name__ == "__main__":
    add_species_and_subspecies()
    add_species_traits()
