
from Backend.models.monster import Monster, MonsterGear, MonsterHabitat, MonsterSpell
from Backend.models import session

monsters = [
    Monster(
        name = "Ape", page = 348,
        size = "Medium", creature_type = "Beast",
        challenge_rating = 0.5, xp_value = 100,
        armor_class = 12, hit_points = 19, hit_dice = "3d8 + 6",
        speeds = {"walk":"30 ft", "climb":"30 ft"},
        ability_scores = {"str":16, "dex":14, "con":14, "int":6, "wis":12, "cha":7},
        skills = {"athletics": 5, "perception": 3}, senses = {"passive_perception": 13},
        actions = [
            {"name": "Multiattack", "desc": "The Ape makes two Fist attacks."},
            {"name": "Fist",
             "desc": "Melee Attack Roll: +5, reach 5 ft. Hit: 5 (1d4 + 3) Bludgeoning damage.",
             "attack_bonus": 5,
             "damage_dice": "1d4+3",
             "damage_type": "bludgeoning"
            },
            {"name": "Rock (Recharge 6)",
             "desc": "Ranged Attack Roll: +5, range 25/50 ft. Hit: 10 (2d6 + 3) Bludgeoning damage.",
             "attack_bonus": 5,
             "damage_dice": "2d6+3",
             "damage_type": "bludgeoning"
            },
        ]
    ),
]

def add_monsters():
    """Add monsters to DB, avoiding duplicates."""
    existing_names = {item.name for item in session.query(Monster.name).all()}
    new_monsters = [item for item in monsters if item.name not in existing_names]
    
    if new_monsters:
        session.add_all(new_monsters)
        session.commit()
        print(f"[SUCCESS] Added {len(new_monsters)} monsters")
    else:
        print("[INFO] All monsters already exist.")

if __name__ == "__main__":
    add_monsters()