"""
Populate backgrounds into the database with skills, tools, and other benefits.
"""

from sqlalchemy.orm import Session
from Backend.models import engine, Base, Background

def populate_backgrounds():
    """Create and populate backgrounds"""
    session = Session(bind=engine)

    # === ACOLYTE ===
    acolyte = Background(
        name="Acolyte",
        desc="You have spent your life in the service of a temple to a specific god or pantheon of gods.",
        skill_proficiencies=["Insight", "Religion"],
        languages=1,
        starting_gold_bonus=15
    )
    session.add(acolyte)

    # === CHARLATAN ===
    charlatan = Background(
        name="Charlatan",
        desc="You have always had a way with people. You're charming and persuasive, but also deceptive.",
        skill_proficiencies=["Deception", "Sleight of Hand"],
        tool_proficiencies=["Disguise kit", "Forgery kit"],
        starting_gold_bonus=15
    )
    session.add(charlatan)

    # === CRIMINAL ===
    criminal = Background(
        name="Criminal",
        desc="You are an experienced criminal with a history of breaking the law.",
        skill_proficiencies=["Deception", "Stealth"],
        tool_proficiencies=["Thieves' tools", "Gaming set"],
        starting_gold_bonus=15
    )
    session.add(criminal)

    # === ENTERTAINER ===
    entertainer = Background(
        name="Entertainer",
        desc="You thrive in front of an audience. You know how to entertain crowds and make them care about your performance.",
        skill_proficiencies=["Acrobatics", "Performance"],
        tool_proficiencies=["Disguise kit", "Instrument (one of your choice)"],
        starting_gold_bonus=15
    )
    session.add(entertainer)

    # === FOLK HERO ===
    folk_hero = Background(
        name="Folk Hero",
        desc="You championed the people, stood up to the oppressors, and earned a place in their hearts.",
        skill_proficiencies=["Animal Handling", "Survival"],
        tool_proficiencies=["Artisan's tools (one of your choice)"],
        starting_gold_bonus=10
    )
    session.add(folk_hero)

    # === GUILD ARTISAN ===
    guild_artisan = Background(
        name="Guild Artisan",
        desc="You are a skilled member of a guild, closely associated with a particular craft or trade.",
        skill_proficiencies=["Insight", "Persuasion"],
        tool_proficiencies=["Artisan's tools (one of your choice)"],
        languages=1,
        starting_gold_bonus=15
    )
    session.add(guild_artisan)

    # === HERMIT ===
    hermit = Background(
        name="Hermit",
        desc="You lived in seclusion, either in a sheltered community such as a monastery or in the wilds.",
        skill_proficiencies=["Medicine", "Religion"],
        languages=1,
        starting_gold_bonus=5
    )
    session.add(hermit)

    # === NOBLE ===
    noble = Background(
        name="Noble",
        desc="You understand wealth, power, and privilege. You carry a noble title, and your family owns land and wields significant political influence.",
        skill_proficiencies=["Insight", "Persuasion"],
        languages=1,
        starting_gold_bonus=25
    )
    session.add(noble)

    # === OUTLANDER ===
    outlander = Background(
        name="Outlander",
        desc="You grew up in the wilds, far from civilization and the comforts of town and technology.",
        skill_proficiencies=["Athletics", "Survival"],
        languages=1,
        starting_gold_bonus=10
    )
    session.add(outlander)

    # === SAGE ===
    sage = Background(
        name="Sage",
        desc="You spent years learning the lore of the multiverse. You scoured manuscripts, studied scrolls, and listened to the greatest experts.",
        skill_proficiencies=["Arcana", "History"],
        languages=2,
        starting_gold_bonus=10
    )
    session.add(sage)

    # === SAILOR ===
    sailor = Background(
        name="Sailor",
        desc="You sailed on a seagoing vessel for years. You feel more comfortable on the water than on land.",
        skill_proficiencies=["Athletics", "Perception"],
        tool_proficiencies=["Navigator's tools", "Water vehicles"],
        starting_gold_bonus=10
    )
    session.add(sailor)

    # === SOLDIER ===
    soldier = Background(
        name="Soldier",
        desc="You are a hardened warrior who has seen combat in many campaigns. You know the horrors of battle and have the discipline and motivation of a professional warrior.",
        skill_proficiencies=["Athletics", "Intimidation"],
        tool_proficiencies=["Gaming set"],
        starting_gold_bonus=10
    )
    session.add(soldier)

    # === URCHIN ===
    urchin = Background(
        name="Urchin",
        desc="You grew up on the streets alone, orphaned, and poor. You have streetsmarts and survival instincts honed by years of living by your wits.",
        skill_proficiencies=["Sleight of Hand", "Stealth"],
        tool_proficiencies=["Thieves' tools", "Disguise kit"],
        starting_gold_bonus=10
    )
    session.add(urchin)

    try:
        session.commit()
        print("[SUCCESS] All backgrounds created successfully!")
        return True
    except Exception as e:
        session.rollback()
        print(f"[ERROR] Failed to populate backgrounds: {e}")
        return False
    finally:
        session.close()

if __name__ == "__main__":
    populate_backgrounds()
