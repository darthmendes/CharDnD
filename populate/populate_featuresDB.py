from Backend.models.features import Features
from Backend.models import session

# ============================================================================
# === DWARF FEATURES ===
# ============================================================================
dwarf_features = [
    Features(
        name="Darkvision",
        desc="You can see in dim light within 60 feet as bright light, and in darkness as dim light. You can't discern color in darkness."
    ),
    Features(
        name="Dwarven Resilience",
        desc="Advantage on saving throws against poison and resistance to poison damage."
    ),
    Features(
        name="Stonecunning",
        desc="Double proficiency bonus on Intelligence (History) checks related to stonework."
    ),
    Features(
        name="Dwarven Combat Training",
        desc="You have proficiency with the battleaxe, handaxe, light hammer, and warhammer."
    ),
    Features(
        name="Tool Proficiency",
        desc="You gain proficiency with the artisan's tools of your choice: smith's tools, brewer's supplies, or mason's tools."
    ),
    Features(
        name="Ability Score Improvement",
        desc="When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
        properties={
            "n_choices": 1,
            "from": "ability_scores",
            "options": [
                {"choose": 2, "value": 1},
                {"choose": 1, "value": 2}
            ]
        }
    )
]

# ============================================================================
# === ELF FEATURES ===
# ============================================================================
elf_features = [
    Features(
        name="Fey Ancestry",
        desc="You have advantage on saving throws against being charmed, and magic can't put you to sleep."
    ),
    Features(
        name="Trance",
        desc="Elves don't need to sleep. Instead, they meditate deeply, remaining semiconscious, for 4 hours a day. After resting this way, you gain the same benefit that a human does from 8 hours of sleep."
    ),
    Features(
        name="Keen Senses",
        desc="You have proficiency in the Perception skill."
    ),
    Features(
        name="Elf Weapon Training",
        desc="You have proficiency with longswords, shortswords, shortbows, and longbows."
    ),
]

# ============================================================================
# === DROW (DARK ELF) FEATURES ===
# ============================================================================
drow_features = [
    Features(
        name="Superior Darkvision",
        desc="Your darkvision has a radius of 120 feet."
    ),
    Features(
        name="Sunlight Sensitivity",
        desc="You have disadvantage on attack rolls and Wisdom (Perception) checks that rely on sight when you, the target of your attack, or whatever you're trying to perceive is in direct sunlight."
    ),
    Features(
        name="Drow Magic",
        desc="You know the dancing lights cantrip. When you reach 3rd level, you can cast the faerie fire spell once per day. When you reach 5th level, you can also cast the darkness spell once per day."
    ),
    Features(
        name="Drow Weapon Training",
        desc="You have proficiency with rapiers, shortswords, and hand crossbows."
    ),
]

# ============================================================================
# === HALFLING FEATURES ===
# ============================================================================
halfling_features = [
    Features(
        name="Lucky",
        desc="When you roll a 1 on an attack roll, ability check, or saving throw, you can reroll the die and must use the new roll."
    ),
    Features(
        name="Brave",
        desc="You have advantage on saving throws against being frightened."
    ),
    Features(
        name="Halfling Nimbleness",
        desc="You can move through the space of any creature that is of a size larger than yours."
    ),
]

# ============================================================================
# === HUMAN FEATURES ===
# ============================================================================
human_features = [
    Features(
        name="Extra Language",
        desc="You speak Common and one extra language of your choice."
    ),
]

# ============================================================================
# === DRAGONBORN FEATURES (NEW) ===
# ============================================================================
dragonborn_features = [
    Features(
        name="Draconic Ancestry",
        desc="Choose a dragon type. You have resistance to the associated damage type and your breath weapon deals that damage type."
    ),
    Features(
        name="Breath Weapon",
        desc="You can exhale destructive energy. Each creature in a 15-foot cone must make a Dexterity saving throw. On a failed save, the creature takes 2d6 damage of your draconic ancestry type. The damage increases to 3d6 at 6th level, 4d6 at 11th level, and 5d6 at 16th level. You can use your breath weapon again after a short or long rest."
    ),
    Features(
        name="Damage Resistance",
        desc="You have resistance to one damage type based on your draconic ancestry (acid, cold, fire, lightning, or poison)."
    ),
]

# ============================================================================
# === GNOME FEATURES (NEW) ===
# ============================================================================
gnome_features = [
    Features(
        name="Gnome Cunning",
        desc="You have advantage on all Intelligence, Wisdom, and Charisma saving throws against magic."
    ),
    Features(
        name="Natural Illusionist",
        desc="You know the minor illusion cantrip. Intelligence is your spellcasting ability for it."
    ),
    Features(
        name="Speak with Small Beasts",
        desc="Through sounds and gestures, you can communicate simple ideas with Small or smaller beasts."
    ),
    Features(
        name="Artificer's Lore",
        desc="Whenever you make an Intelligence (History) check related to magic items, alchemical objects, or technological devices, you can add twice your proficiency bonus."
    ),
    Features(
        name="Tinker",
        desc="You have proficiency with artisan's tools (tinker's tools). You can spend 1 hour and 10 gp worth of materials to construct a Tiny clockwork device (AC 5, 1 hp)."
    ),
]

# ============================================================================
# === HALF-ELF FEATURES (NEW) ===
# ============================================================================
half_elf_features = [
    Features(
        name="Fey Ancestry",
        desc="You have advantage on saving throws against being charmed, and magic can't put you to sleep."
    ),
    Features(
        name="Skill Versatility",
        desc="You gain proficiency in two skills of your choice."
    ),
    Features(
        name="Darkvision",
        desc="You can see in dim light within 60 feet as bright light, and in darkness as dim light. You can't discern color in darkness."
    ),
]

# ============================================================================
# === HALF-ORC FEATURES (NEW) ===
# ============================================================================
half_orc_features = [
    Features(
        name="Menacing",
        desc="You gain proficiency in the Intimidation skill."
    ),
    Features(
        name="Relentless Endurance",
        desc="When you are reduced to 0 hit points but not killed outright, you can drop to 1 hit point instead. You can't use this feature again until you finish a long rest."
    ),
    Features(
        name="Savage Attacks",
        desc="When you score a critical hit with a melee weapon attack, you can roll one of the weapon's damage dice one additional time and add it to the extra damage of the critical hit."
    ),
]

# ============================================================================
# === TIEFLING FEATURES (NEW) ===
# ============================================================================
tiefling_features = [
    Features(
        name="Hellish Resistance",
        desc="You have resistance to fire damage."
    ),
    Features(
        name="Hellish Legacy",
        desc="You know the thaumaturgy cantrip. When you reach 3rd level, you can cast the hellish rebuke spell once per day as a 2nd-level spell. When you reach 5th level, you can also cast the darkness spell once per day."
    ),
    Features(
        name="Darkvision",
        desc="You can see in dim light within 60 feet as bright light, and in darkness as dim light. You can't discern color in darkness."
    ),
]

# ============================================================================
# === COMPILE ALL FEATURES ===
# ============================================================================
all_features = (
    dwarf_features + 
    elf_features + 
    drow_features + 
    halfling_features + 
    human_features +
    dragonborn_features +
    gnome_features +
    half_elf_features +
    half_orc_features +
    tiefling_features
)

def add_features():
    try:
        # Check for existing features to avoid duplicates
        existing_features = {f.name: f for f in session.query(Features).all()}
        
        features_to_add = []
        for feature in all_features:
            if feature.name not in existing_features:
                features_to_add.append(feature)
                print(f"  [NEW] {feature.name}")
            else:
                print(f"  [SKIP] {feature.name} (already exists)")
        
        if features_to_add:
            session.add_all(features_to_add)
            session.commit()
            print(f"\n[SUCCESS] Successfully added {len(features_to_add)} new features!")
        else:
            print(f"\n[INFO] All features already exist in database.")
        
        # Print feature breakdown
        print(f"\n📊 Feature Summary:")
        print(f"  - Dwarf: {len(dwarf_features)} features")
        print(f"  - Elf: {len(elf_features)} features")
        print(f"  - Drow: {len(drow_features)} features")
        print(f"  - Halfling: {len(halfling_features)} features")
        print(f"  - Human: {len(human_features)} features")
        print(f"  - Dragonborn: {len(dragonborn_features)} features")
        print(f"  - Gnome: {len(gnome_features)} features")
        print(f"  - Half-Elf: {len(half_elf_features)} features")
        print(f"  - Half-Orc: {len(half_orc_features)} features")
        print(f"  - Tiefling: {len(tiefling_features)} features")
        print(f"  - TOTAL: {len(all_features)} features")
        
    except Exception as e:
        session.rollback()
        print(f"[ERROR] Failed to add features: {e}")
        raise

if __name__ == "__main__":
    add_features()