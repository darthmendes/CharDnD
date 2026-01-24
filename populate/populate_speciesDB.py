"""
Seed D&D 5e PHB species into the database.
Includes Humans, Elves, Dwarves, and Halflings with full subspecies and traits.
"""

from Backend.services.SpeciesService import SpeciesService
from Backend.models.features import Features
from Backend.models.species import Species, Subspecies, SpeciesTraits
from Backend.models import session

def add_species_and_subspecies():
    # === HUMAN (Variant Human) ===
    human_data = {
        "name": "Human",
        "ability_choices": [
            {
                "n_choices": 2,
                "bonus": 1,
                "options": ["STR", "DEX", "CON", "INT", "WIS", "CHA"]
            }
        ],
        "size": "Medium",
        "age_adulthood": 18,
        "lifespan": 80,
        "alignment_tendency": "Any",
        "movement": {"walk": 30},
        "darkvision": 0,
        "ignore_heavy_armor_speed_penalty": False
    }
    result = SpeciesService.new(human_data)
    if result["success"]:
        print(f"[SUCCESS] Created {result['data']['name']}")
    else:
        print(f"[ERROR] Failed to create Human: {result['error']}")

    # === ELF ===
    elf_data = {
        "name": "Elf",
        "ability_bonuses": {"DEX": 2},
        "size": "Medium",
        "age_adulthood": 100,
        "lifespan": 750,
        "alignment_tendency": "Chaotic Good",
        "movement": {"walk": 30},
        "darkvision": 60,
        "ignore_heavy_armor_speed_penalty": False
    }
    result = SpeciesService.new(elf_data)
    if result["success"]:
        elf_id = result['data']['id']
        print(f"[SUCCESS] Created {result['data']['name']}")
        
        # Add elf subspecies
        elf_subspecies = [
            {
                "name": "High Elf",
                "species_id": elf_id,
                "ability_bonuses": {"INT": 1}
            },
            {
                "name": "Wood Elf",
                "species_id": elf_id,
                "ability_bonuses": {"WIS": 1},
                "movement": {"walk": 35}
            },
            {
                "name": "Dark Elf (Drow)",
                "species_id": elf_id,
                "ability_bonuses": {"CHA": 1},
                "darkvision": 120
            }
        ]
        for sub_data in elf_subspecies:
            result = SpeciesService.new_subspecies(sub_data)
            if result["success"]:
                print(f"  [SUCCESS] Created subspecies {result['data']['name']}")
            else:
                print(f"  [ERROR] Failed to create subspecies: {result['error']}")
    else:
        print(f"[ERROR] Failed to create Elf: {result['error']}")

    # === DWARF ===
    dwarf_data = {
        "name": "Dwarf",
        "ability_bonuses": {"CON": 2},
        "size": "Medium",
        "age_adulthood": 50,
        "lifespan": 350,
        "alignment_tendency": "Lawful Good",
        "movement": {"walk": 25},
        "darkvision": 60,
        "ignore_heavy_armor_speed_penalty": True
    }
    result = SpeciesService.new(dwarf_data)
    if result["success"]:
        dwarf_id = result['data']['id']
        print(f"[SUCCESS] Created {result['data']['name']}")
        
        # Add dwarf subspecies
        dwarf_subspecies = [
            {
                "name": "Hill Dwarf",
                "species_id": dwarf_id,
                "ability_bonuses": {"WIS": 1}
            },
            {
                "name": "Mountain Dwarf",
                "species_id": dwarf_id,
                "ability_bonuses": {"STR": 2}
            }
        ]
        for sub_data in dwarf_subspecies:
            result = SpeciesService.new_subspecies(sub_data)
            if result["success"]:
                print(f"  [SUCCESS] Created subspecies {result['data']['name']}")
            else:
                print(f"  [ERROR] Failed to create subspecies: {result['error']}")
    else:
        print(f"[ERROR] Failed to create Dwarf: {result['error']}")

    # === HALFLING ===
    halfling_data = {
        "name": "Halfling",
        "ability_bonuses": {"DEX": 2},
        "size": "Small",
        "age_adulthood": 20,
        "lifespan": 150,
        "alignment_tendency": "Lawful Good",
        "movement": {"walk": 25},
        "darkvision": 0,
        "ignore_heavy_armor_speed_penalty": False
    }
    result = SpeciesService.new(halfling_data)
    if result["success"]:
        halfling_id = result['data']['id']
        print(f"[SUCCESS] Created {result['data']['name']}")
        
        # Add halfling subspecies
        halfling_subspecies = [
            {
                "name": "Lightfoot Halfling",
                "species_id": halfling_id,
                "ability_bonuses": {"CHA": 1}
            },
            {
                "name": "Stout Halfling",
                "species_id": halfling_id,
                "ability_bonuses": {"CON": 1}
            }
        ]
        for sub_data in halfling_subspecies:
            result = SpeciesService.new_subspecies(sub_data)
            if result["success"]:
                print(f"  [SUCCESS] Created subspecies {result['data']['name']}")
            else:
                print(f"  [ERROR] Failed to create subspecies: {result['error']}")
    else:
        print(f"[ERROR] Failed to create Halfling: {result['error']}")

    print("\n[SUCCESS] Species population complete!")
    print("[INFO] Remember to link proficiencies, languages, and traits via your existing systems.")

def add_species_traits():
    """Link trait features to species and subspecies."""
    try:
        # Get Elf species and its traits
        elf = session.query(Species).filter_by(name="Elf").first()
        if not elf:
            print("[ERROR] Elf species not found. Run add_species_and_subspecies() first.")
            return
        
        fey_ancestry = session.query(Features).filter_by(name="Fey Ancestry").first()
        trance = session.query(Features).filter_by(name="Trance").first()
        keen_senses = session.query(Features).filter_by(name="Keen Senses").first()

        # Link traits to Elf (base species)
        if elf and fey_ancestry:
            existing = session.query(SpeciesTraits).filter_by(
                species_id=elf.id, 
                feature_id=fey_ancestry.id
            ).first()
            if not existing:
                session.add(SpeciesTraits(species_id=elf.id, feature_id=fey_ancestry.id))
                print(f"  [SUCCESS] Linked trait: Fey Ancestry to Elf")
        
        if elf and trance:
            existing = session.query(SpeciesTraits).filter_by(
                species_id=elf.id, 
                feature_id=trance.id
            ).first()
            if not existing:
                session.add(SpeciesTraits(species_id=elf.id, feature_id=trance.id))
                print(f"  [SUCCESS] Linked trait: Trance to Elf")
        
        if elf and keen_senses:
            existing = session.query(SpeciesTraits).filter_by(
                species_id=elf.id, 
                feature_id=keen_senses.id
            ).first()
            if not existing:
                session.add(SpeciesTraits(species_id=elf.id, feature_id=keen_senses.id))
                print(f"  [SUCCESS] Linked trait: Keen Senses to Elf")

        # Link Drow-specific traits
        drow = session.query(Subspecies).filter_by(name="Dark Elf (Drow)").first()
        sunlight_sensitivity = session.query(Features).filter_by(name="Sunlight Sensitivity").first()
        drow_magic = session.query(Features).filter_by(name="Drow Magic").first()

        if drow and sunlight_sensitivity:
            existing = session.query(SpeciesTraits).filter_by(
                subspecies_id=drow.id, 
                feature_id=sunlight_sensitivity.id
            ).first()
            if not existing:
                session.add(SpeciesTraits(subspecies_id=drow.id, feature_id=sunlight_sensitivity.id))
                print(f"  [SUCCESS] Linked trait: Sunlight Sensitivity to Drow")
        
        if drow and drow_magic:
            existing = session.query(SpeciesTraits).filter_by(
                subspecies_id=drow.id, 
                feature_id=drow_magic.id
            ).first()
            if not existing:
                session.add(SpeciesTraits(subspecies_id=drow.id, feature_id=drow_magic.id))
                print(f"  [SUCCESS] Linked trait: Drow Magic to Drow")

        # Link Dwarf traits
        dwarf = session.query(Species).filter_by(name="Dwarf").first()
        if dwarf:
            darkvision = session.query(Features).filter_by(name="Darkvision").first()
            dwarven_resilience = session.query(Features).filter_by(name="Dwarven Resilience").first()
            stonecunning = session.query(Features).filter_by(name="Stonecunning").first()
            
            if dwarf and darkvision:
                existing = session.query(SpeciesTraits).filter_by(
                    species_id=dwarf.id, 
                    feature_id=darkvision.id
                ).first()
                if not existing:
                    session.add(SpeciesTraits(species_id=dwarf.id, feature_id=darkvision.id))
                    print(f"  [SUCCESS] Linked trait: Darkvision to Dwarf")
            
            if dwarf and dwarven_resilience:
                existing = session.query(SpeciesTraits).filter_by(
                    species_id=dwarf.id, 
                    feature_id=dwarven_resilience.id
                ).first()
                if not existing:
                    session.add(SpeciesTraits(species_id=dwarf.id, feature_id=dwarven_resilience.id))
                    print(f"  [SUCCESS] Linked trait: Dwarven Resilience to Dwarf")
            
            if dwarf and stonecunning:
                existing = session.query(SpeciesTraits).filter_by(
                    species_id=dwarf.id, 
                    feature_id=stonecunning.id
                ).first()
                if not existing:
                    session.add(SpeciesTraits(species_id=dwarf.id, feature_id=stonecunning.id))
                    print(f"  [SUCCESS] Linked trait: Stonecunning to Dwarf")

        # Link Halfling traits
        halfling = session.query(Species).filter_by(name="Halfling").first()
        if halfling:
            lucky = session.query(Features).filter_by(name="Lucky").first()
            brave = session.query(Features).filter_by(name="Brave").first()
            halfling_nimbleness = session.query(Features).filter_by(name="Halfling Nimbleness").first()
            
            if halfling and lucky:
                existing = session.query(SpeciesTraits).filter_by(
                    species_id=halfling.id, 
                    feature_id=lucky.id
                ).first()
                if not existing:
                    session.add(SpeciesTraits(species_id=halfling.id, feature_id=lucky.id))
                    print(f"  [SUCCESS] Linked trait: Lucky to Halfling")
            
            if halfling and brave:
                existing = session.query(SpeciesTraits).filter_by(
                    species_id=halfling.id, 
                    feature_id=brave.id
                ).first()
                if not existing:
                    session.add(SpeciesTraits(species_id=halfling.id, feature_id=brave.id))
                    print(f"  [SUCCESS] Linked trait: Brave to Halfling")
            
            if halfling and halfling_nimbleness:
                existing = session.query(SpeciesTraits).filter_by(
                    species_id=halfling.id, 
                    feature_id=halfling_nimbleness.id
                ).first()
                if not existing:
                    session.add(SpeciesTraits(species_id=halfling.id, feature_id=halfling_nimbleness.id))
                    print(f"  [SUCCESS] Linked trait: Halfling Nimbleness to Halfling")

        # Link Human traits
        human = session.query(Species).filter_by(name="Human").first()
        if human:
            extra_language = session.query(Features).filter_by(name="Extra Language").first()
            
            if human and extra_language:
                existing = session.query(SpeciesTraits).filter_by(
                    species_id=human.id, 
                    feature_id=extra_language.id
                ).first()
                if not existing:
                    session.add(SpeciesTraits(species_id=human.id, feature_id=extra_language.id))
                    print(f"  [SUCCESS] Linked trait: Extra Language to Human")

        session.commit()
        print("\n[SUCCESS] Species traits linking complete!")
    except Exception as e:
        session.rollback()
        print(f"[ERROR] Failed to link species traits: {e}")

if __name__ == "__main__":
    add_species_and_subspecies()
    add_species_traits()