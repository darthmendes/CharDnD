"""
Seed D&D 5e PHB species into the database.
Includes ALL core species: Humans, Elves, Dwarves, Halflings, Dragonborn, Gnomes, Half-Elves, Half-Orcs, Tieflings
with full subspecies and traits.
"""

from Backend.services.SpeciesService import SpeciesService
from Backend.models.features import Features
from Backend.models.species import Species, Subspecies, SpeciesTraits
from Backend.models import session

def add_species_and_subspecies():
    # === HUMAN ===
    human_data = {
        "name": "Human",
        "ability_bonuses": {"STR": 1, "DEX": 1, "CON": 1, "INT": 1, "WIS": 1, "CHA": 1},
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
        elfID = result['data']['id']
        print(f"[SUCCESS] Created {result['data']['name']}")
        
        elf_subspecies = [
            {
                "name": "High Elf",
                "speciesID": elfID,
                "ability_bonuses": {"INT": 1}
            },
            {
                "name": "Wood Elf",
                "speciesID": elfID,
                "ability_bonuses": {"WIS": 1},
                "movement": {"walk": 35}
            },
            {
                "name": "Dark Elf (Drow)",
                "speciesID": elfID,
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
        dwarfID = result['data']['id']
        print(f"[SUCCESS] Created {result['data']['name']}")
        
        dwarf_subspecies = [
            {
                "name": "Hill Dwarf",
                "speciesID": dwarfID,
                "ability_bonuses": {"WIS": 1}
            },
            {
                "name": "Mountain Dwarf",
                "speciesID": dwarfID,
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
        halflingID = result['data']['id']
        print(f"[SUCCESS] Created {result['data']['name']}")
        
        halfling_subspecies = [
            {
                "name": "Lightfoot Halfling",
                "speciesID": halflingID,
                "ability_bonuses": {"CHA": 1}
            },
            {
                "name": "Stout Halfling",
                "speciesID": halflingID,
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

    # === DRAGONBORN (NEW) ===
    dragonborn_data = {
        "name": "Dragonborn",
        "ability_bonuses": {"STR": 2, "CHA": 1},
        "size": "Medium",
        "age_adulthood": 15,
        "lifespan": 80,
        "alignment_tendency": "Good",
        "movement": {"walk": 30},
        "darkvision": 0,
        "ignore_heavy_armor_speed_penalty": False
    }
    result = SpeciesService.new(dragonborn_data)
    if result["success"]:
        print(f"[SUCCESS] Created {result['data']['name']}")
    else:
        print(f"[ERROR] Failed to create Dragonborn: {result['error']}")

    # === GNOME (NEW) ===
    gnome_data = {
        "name": "Gnome",
        "ability_bonuses": {"INT": 2},
        "size": "Small",
        "age_adulthood": 40,
        "lifespan": 500,
        "alignment_tendency": "Good",
        "movement": {"walk": 25},
        "darkvision": 60,
        "ignore_heavy_armor_speed_penalty": False
    }
    result = SpeciesService.new(gnome_data)
    if result["success"]:
        gnomeID = result['data']['id']
        print(f"[SUCCESS] Created {result['data']['name']}")
        
        gnome_subspecies = [
            {
                "name": "Forest Gnome",
                "speciesID": gnomeID,
                "ability_bonuses": {"DEX": 1}
            },
            {
                "name": "Rock Gnome",
                "speciesID": gnomeID,
                "ability_bonuses": {"CON": 1}
            },
            {
                "name": "Deep Gnome (Svirfneblin)",
                "speciesID": gnomeID,
                "ability_bonuses": {"DEX": 1},
                "darkvision": 120
            }
        ]
        for sub_data in gnome_subspecies:
            result = SpeciesService.new_subspecies(sub_data)
            if result["success"]:
                print(f"  [SUCCESS] Created subspecies {result['data']['name']}")
            else:
                print(f"  [ERROR] Failed to create subspecies: {result['error']}")
    else:
        print(f"[ERROR] Failed to create Gnome: {result['error']}")

    # === HALF-ELF (NEW) ===
    half_elf_data = {
        "name": "Half-Elf",
        "ability_bonuses": {"CHA": 2},
        "size": "Medium",
        "age_adulthood": 20,
        "lifespan": 180,
        "alignment_tendency": "Any",
        "movement": {"walk": 30},
        "darkvision": 60,
        "ignore_heavy_armor_speed_penalty": False
    }
    result = SpeciesService.new(half_elf_data)
    if result["success"]:
        print(f"[SUCCESS] Created {result['data']['name']}")
    else:
        print(f"[ERROR] Failed to create Half-Elf: {result['error']}")

    # === HALF-ORC (NEW) ===
    half_orc_data = {
        "name": "Half-Orc",
        "ability_bonuses": {"STR": 2, "CON": 1},
        "size": "Medium",
        "age_adulthood": 14,
        "lifespan": 75,
        "alignment_tendency": "Chaotic",
        "movement": {"walk": 30},
        "darkvision": 60,
        "ignore_heavy_armor_speed_penalty": False
    }
    result = SpeciesService.new(half_orc_data)
    if result["success"]:
        print(f"[SUCCESS] Created {result['data']['name']}")
    else:
        print(f"[ERROR] Failed to create Half-Orc: {result['error']}")

    # === TIEFLING (NEW) ===
    tiefling_data = {
        "name": "Tiefling",
        "ability_bonuses": {"CHA": 2, "INT": 1},
        "size": "Medium",
        "age_adulthood": 18,
        "lifespan": 100,
        "alignment_tendency": "Any",
        "movement": {"walk": 30},
        "darkvision": 60,
        "ignore_heavy_armor_speed_penalty": False
    }
    result = SpeciesService.new(tiefling_data)
    if result["success"]:
        print(f"[SUCCESS] Created {result['data']['name']}")
    else:
        print(f"[ERROR] Failed to create Tiefling: {result['error']}")

    print("\n[SUCCESS] Species population complete!")
    print("[INFO] Remember to link proficiencies, languages, and traits via your existing systems.")

def add_species_traits():
    """Link trait features to species and subspecies."""
    try:
        # === ELF TRAITS ===
        elf = session.query(Species).filter_by(name="Elf").first()
        if elf:
            fey_ancestry = session.query(Features).filter_by(name="Fey Ancestry").first()
            trance = session.query(Features).filter_by(name="Trance").first()
            keen_senses = session.query(Features).filter_by(name="Keen Senses").first()

            if elf and fey_ancestry:
                existing = session.query(SpeciesTraits).filter_by(speciesID=elf.id, featureID=fey_ancestry.id).first()
                if not existing:
                    session.add(SpeciesTraits(speciesID=elf.id, featureID=fey_ancestry.id))
                    print(f"  [SUCCESS] Linked trait: Fey Ancestry to Elf")
            
            if elf and trance:
                existing = session.query(SpeciesTraits).filter_by(speciesID=elf.id, featureID=trance.id).first()
                if not existing:
                    session.add(SpeciesTraits(speciesID=elf.id, featureID=trance.id))
                    print(f"  [SUCCESS] Linked trait: Trance to Elf")
            
            if elf and keen_senses:
                existing = session.query(SpeciesTraits).filter_by(speciesID=elf.id, featureID=keen_senses.id).first()
                if not existing:
                    session.add(SpeciesTraits(speciesID=elf.id, featureID=keen_senses.id))
                    print(f"  [SUCCESS] Linked trait: Keen Senses to Elf")

        # Drow-specific traits
        drow = session.query(Subspecies).filter_by(name="Dark Elf (Drow)").first()
        sunlight_sensitivity = session.query(Features).filter_by(name="Sunlight Sensitivity").first()
        drow_magic = session.query(Features).filter_by(name="Drow Magic").first()

        if drow and sunlight_sensitivity:
            existing = session.query(SpeciesTraits).filter_by(subspeciesID=drow.id, featureID=sunlight_sensitivity.id).first()
            if not existing:
                session.add(SpeciesTraits(subspeciesID=drow.id, featureID=sunlight_sensitivity.id))
                print(f"  [SUCCESS] Linked trait: Sunlight Sensitivity to Drow")
        
        if drow and drow_magic:
            existing = session.query(SpeciesTraits).filter_by(subspeciesID=drow.id, featureID=drow_magic.id).first()
            if not existing:
                session.add(SpeciesTraits(subspeciesID=drow.id, featureID=drow_magic.id))
                print(f"  [SUCCESS] Linked trait: Drow Magic to Drow")

        # === DWARF TRAITS ===
        dwarf = session.query(Species).filter_by(name="Dwarf").first()
        if dwarf:
            darkvision = session.query(Features).filter_by(name="Darkvision").first()
            dwarven_resilience = session.query(Features).filter_by(name="Dwarven Resilience").first()
            stonecunning = session.query(Features).filter_by(name="Stonecunning").first()
            dwarven_combat_training = session.query(Features).filter_by(name="Dwarven Combat Training").first()
            tool_proficiency = session.query(Features).filter_by(name="Tool Proficiency").first()
            
            traits_to_link = [
                (darkvision, "Darkvision"),
                (dwarven_resilience, "Dwarven Resilience"),
                (stonecunning, "Stonecunning"),
                (dwarven_combat_training, "Dwarven Combat Training"),
                (tool_proficiency, "Tool Proficiency")
            ]
            
            for trait_feature, trait_name in traits_to_link:
                if dwarf and trait_feature:
                    existing = session.query(SpeciesTraits).filter_by(speciesID=dwarf.id, featureID=trait_feature.id).first()
                    if not existing:
                        session.add(SpeciesTraits(speciesID=dwarf.id, featureID=trait_feature.id))
                        print(f"  [SUCCESS] Linked trait: {trait_name} to Dwarf")

        # === HALFLING TRAITS ===
        halfling = session.query(Species).filter_by(name="Halfling").first()
        if halfling:
            lucky = session.query(Features).filter_by(name="Lucky").first()
            brave = session.query(Features).filter_by(name="Brave").first()
            halfling_nimbleness = session.query(Features).filter_by(name="Halfling Nimbleness").first()
            
            traits_to_link = [
                (lucky, "Lucky"),
                (brave, "Brave"),
                (halfling_nimbleness, "Halfling Nimbleness")
            ]
            
            for trait_feature, trait_name in traits_to_link:
                if halfling and trait_feature:
                    existing = session.query(SpeciesTraits).filter_by(speciesID=halfling.id, featureID=trait_feature.id).first()
                    if not existing:
                        session.add(SpeciesTraits(speciesID=halfling.id, featureID=trait_feature.id))
                        print(f"  [SUCCESS] Linked trait: {trait_name} to Halfling")

        # === HUMAN TRAITS ===
        human = session.query(Species).filter_by(name="Human").first()
        if human:
            extra_language = session.query(Features).filter_by(name="Extra Language").first()
            
            if human and extra_language:
                existing = session.query(SpeciesTraits).filter_by(speciesID=human.id, featureID=extra_language.id).first()
                if not existing:
                    session.add(SpeciesTraits(speciesID=human.id, featureID=extra_language.id))
                    print(f"  [SUCCESS] Linked trait: Extra Language to Human")

        # === DRAGONBORN TRAITS (NEW) ===
        dragonborn = session.query(Species).filter_by(name="Dragonborn").first()
        if dragonborn:
            draconic_ancestry = session.query(Features).filter_by(name="Draconic Ancestry").first()
            breath_weapon = session.query(Features).filter_by(name="Breath Weapon").first()
            damage_resistance = session.query(Features).filter_by(name="Damage Resistance").first()
            
            traits_to_link = [
                (draconic_ancestry, "Draconic Ancestry"),
                (breath_weapon, "Breath Weapon"),
                (damage_resistance, "Damage Resistance")
            ]
            
            for trait_feature, trait_name in traits_to_link:
                if dragonborn and trait_feature:
                    existing = session.query(SpeciesTraits).filter_by(speciesID=dragonborn.id, featureID=trait_feature.id).first()
                    if not existing:
                        session.add(SpeciesTraits(speciesID=dragonborn.id, featureID=trait_feature.id))
                        print(f"  [SUCCESS] Linked trait: {trait_name} to Dragonborn")

        # === GNOME TRAITS (NEW) ===
        gnome = session.query(Species).filter_by(name="Gnome").first()
        if gnome:
            gnome_cunning = session.query(Features).filter_by(name="Gnome Cunning").first()
            
            if gnome and gnome_cunning:
                existing = session.query(SpeciesTraits).filter_by(speciesID=gnome.id, featureID=gnome_cunning.id).first()
                if not existing:
                    session.add(SpeciesTraits(speciesID=gnome.id, featureID=gnome_cunning.id))
                    print(f"  [SUCCESS] Linked trait: Gnome Cunning to Gnome")

        # Forest Gnome specific
        forest_gnome = session.query(Subspecies).filter_by(name="Forest Gnome").first()
        if forest_gnome:
            natural_illusionist = session.query(Features).filter_by(name="Natural Illusionist").first()
            speak_with_small_beasts = session.query(Features).filter_by(name="Speak with Small Beasts").first()
            
            traits_to_link = [
                (natural_illusionist, "Natural Illusionist"),
                (speak_with_small_beasts, "Speak with Small Beasts")
            ]
            
            for trait_feature, trait_name in traits_to_link:
                if forest_gnome and trait_feature:
                    existing = session.query(SpeciesTraits).filter_by(subspeciesID=forest_gnome.id, featureID=trait_feature.id).first()
                    if not existing:
                        session.add(SpeciesTraits(subspeciesID=forest_gnome.id, featureID=trait_feature.id))
                        print(f"  [SUCCESS] Linked trait: {trait_name} to Forest Gnome")

        # Rock Gnome specific
        rock_gnome = session.query(Subspecies).filter_by(name="Rock Gnome").first()
        if rock_gnome:
            artifice_lore = session.query(Features).filter_by(name="Artificer's Lore").first()
            tinker = session.query(Features).filter_by(name="Tinker").first()
            
            traits_to_link = [
                (artifice_lore, "Artificer's Lore"),
                (tinker, "Tinker")
            ]
            
            for trait_feature, trait_name in traits_to_link:
                if rock_gnome and trait_feature:
                    existing = session.query(SpeciesTraits).filter_by(subspeciesID=rock_gnome.id, featureID=trait_feature.id).first()
                    if not existing:
                        session.add(SpeciesTraits(subspeciesID=rock_gnome.id, featureID=trait_feature.id))
                        print(f"  [SUCCESS] Linked trait: {trait_name} to Rock Gnome")

        # === HALF-ELF TRAITS (NEW) ===
        half_elf = session.query(Species).filter_by(name="Half-Elf").first()
        if half_elf:
            fey_ancestry_half = session.query(Features).filter_by(name="Fey Ancestry").first()
            skill_versatility = session.query(Features).filter_by(name="Skill Versatility").first()
            
            traits_to_link = [
                (fey_ancestry_half, "Fey Ancestry"),
                (skill_versatility, "Skill Versatility")
            ]
            
            for trait_feature, trait_name in traits_to_link:
                if half_elf and trait_feature:
                    existing = session.query(SpeciesTraits).filter_by(speciesID=half_elf.id, featureID=trait_feature.id).first()
                    if not existing:
                        session.add(SpeciesTraits(speciesID=half_elf.id, featureID=trait_feature.id))
                        print(f"  [SUCCESS] Linked trait: {trait_name} to Half-Elf")

        # === HALF-ORC TRAITS (NEW) ===
        half_orc = session.query(Species).filter_by(name="Half-Orc").first()
        if half_orc:
            menacing = session.query(Features).filter_by(name="Menacing").first()
            relentless_endurance = session.query(Features).filter_by(name="Relentless Endurance").first()
            savage_attacks = session.query(Features).filter_by(name="Savage Attacks").first()
            
            traits_to_link = [
                (menacing, "Menacing"),
                (relentless_endurance, "Relentless Endurance"),
                (savage_attacks, "Savage Attacks")
            ]
            
            for trait_feature, trait_name in traits_to_link:
                if half_orc and trait_feature:
                    existing = session.query(SpeciesTraits).filter_by(speciesID=half_orc.id, featureID=trait_feature.id).first()
                    if not existing:
                        session.add(SpeciesTraits(speciesID=half_orc.id, featureID=trait_feature.id))
                        print(f"  [SUCCESS] Linked trait: {trait_name} to Half-Orc")

        # === TIEFLING TRAITS (NEW) ===
        tiefling = session.query(Species).filter_by(name="Tiefling").first()
        if tiefling:
            hellish_resistance = session.query(Features).filter_by(name="Hellish Resistance").first()
            hellish_legacy = session.query(Features).filter_by(name="Hellish Legacy").first()
            
            traits_to_link = [
                (hellish_resistance, "Hellish Resistance"),
                (hellish_legacy, "Hellish Legacy")
            ]
            
            for trait_feature, trait_name in traits_to_link:
                if tiefling and trait_feature:
                    existing = session.query(SpeciesTraits).filter_by(speciesID=tiefling.id, featureID=trait_feature.id).first()
                    if not existing:
                        session.add(SpeciesTraits(speciesID=tiefling.id, featureID=trait_feature.id))
                        print(f"  [SUCCESS] Linked trait: {trait_name} to Tiefling")

        session.commit()
        print("\n[SUCCESS] Species traits linking complete!")
    except Exception as e:
        session.rollback()
        print(f"[ERROR] Failed to link species traits: {e}")

if __name__ == "__main__":
    add_species_and_subspecies()
    add_species_traits()