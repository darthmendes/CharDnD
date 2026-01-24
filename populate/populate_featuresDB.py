from Backend.models.features import Features
from Backend.models import session

# Create features for Dwarf
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
        name="Ability Score Improvement",
        desc="When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. "
            "As normal, you can't increase an ability score above 20 using this feature.",
        properties={
            "n_choices":1,
            "from":"ability_scores",
            "options":[
                {"choose":2,
                 "value":1},
                 {"choose":1,
                  "value":2}
            ]
        }
    )
]

# Create features for Elf
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

# Create features for Drow (Dark Elf)
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

# Create features for Halfling
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

# Create features for Human
human_features = [
    Features(
        name="Extra Language",
        desc="You speak Common and one extra language of your choice."
    ),
]

all_features = dwarf_features + elf_features + drow_features + halfling_features + human_features

def add_features():
    try:
        session.add_all(all_features)
        session.commit()
        print(f"[SUCCESS] Successfully added {len(all_features)} features!")
        # Print feature breakdown
        print(f"  - Dwarf: {len(dwarf_features)} features")
        print(f"  - Elf: {len(elf_features)} features")
        print(f"  - Drow: {len(drow_features)} features")
        print(f"  - Halfling: {len(halfling_features)} features")
        print(f"  - Human: {len(human_features)} features")
    except Exception as e:
        session.rollback()
        print(f"[ERROR] Failed to add features: {e}")