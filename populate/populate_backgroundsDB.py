"""Seed the 2014 Player's Handbook background rules and relationships."""

from Backend.models import (
    Background,
    BackgroundDetails,
    BackgroundEquipment,
    Item,
    Proficiency,
    session,
)
from Backend.models.proficiencies import BackgroundProficiency


ARTISAN_TOOLS = [
    "Alchemist's Supplies",
    "Brewer's Supplies",
    "Calligrapher's Supplies",
    "Carpenter's Tools",
    "Cartographer's Tools",
    "Cobbler's Tools",
    "Cook's Utensils",
    "Glassblower's Tools",
    "Jeweler's Tools",
    "Leatherworker's Tools",
    "Mason's Tools",
    "Painter's Supplies",
    "Potter's Tools",
    "Smith's Tools",
    "Tinker's Tools",
    "Weaver's Tools",
    "Woodcarver's Tools",
]

GAMING_SETS = [
    "Dice Set",
    "Dragonchess Set",
    "Playing Card Set",
    "Three-Dragon Ante Set",
]

MUSICAL_INSTRUMENTS = [
    "Bagpipes",
    "Drum",
    "Dulcimer",
    "Flute",
    "Lute",
    "Lyre",
    "Horn",
    "Pan Flute",
    "Shawm",
    "Viol",
]

BACKGROUND_DATA = [
    {
        "name": "Acolyte",
        "description": "You served a temple or another religious community.",
        "skills": ["Insight", "Religion"],
        "tools": [],
        "tool_choices": [],
        "language_choices": 2,
        "feature_name": "Shelter of the Faithful",
        "feature_description": "Members of your faith can offer you and your companions basic aid and lodging.",
        "fixed_equipment": [
            {"name": "Holy Symbol", "quantity": 1},
            {"name": "Incense", "quantity": 5},
            {"name": "Vestments", "quantity": 1},
            {"name": "Common Clothes", "quantity": 1},
            {"name": "Belt Pouch", "quantity": 1},
        ],
        "equipment_choices": [
            {"group": "Prayer Item", "count": 1, "options": ["Prayer Book", "Prayer Wheel"]},
        ],
        "tool_equipment_choices": [],
        "starting_gold": 15,
    },
    {
        "name": "Charlatan",
        "description": "You made a living through deception and false identities.",
        "skills": ["Deception", "Sleight of Hand"],
        "tools": ["Disguise Kit", "Forgery Kit"],
        "tool_choices": [],
        "language_choices": 0,
        "feature_name": "False Identity",
        "feature_description": "You have an established alternate identity and the documents and disguises to support it.",
        "fixed_equipment": [
            {"name": "Fine Clothes", "quantity": 1},
            {"name": "Disguise Kit", "quantity": 1},
            {"name": "Belt Pouch", "quantity": 1},
        ],
        "equipment_choices": [
            {
                "group": "Tools of the Con",
                "count": 1,
                "options": [
                    "Charlatan's Colored Bottles",
                    "Weighted Dice",
                    "Marked Cards",
                    "Imaginary Duke's Signet Ring",
                ],
            },
        ],
        "tool_equipment_choices": [],
        "starting_gold": 15,
    },
    {
        "name": "Criminal",
        "description": "You have experience in illegal work and underworld contacts.",
        "skills": ["Deception", "Stealth"],
        "tools": ["Thieves' Tools"],
        "tool_choices": [{"group": "Gaming Set", "count": 1, "options": GAMING_SETS}],
        "language_choices": 0,
        "feature_name": "Criminal Contact",
        "feature_description": "You have a reliable contact who can pass messages to the criminal underworld.",
        "fixed_equipment": [
            {"name": "Crowbar", "quantity": 1},
            {"name": "Dark Common Clothes with Hood", "quantity": 1},
            {"name": "Belt Pouch", "quantity": 1},
        ],
        "equipment_choices": [],
        "tool_equipment_choices": [],
        "starting_gold": 15,
    },
    {
        "name": "Entertainer",
        "description": "You earn a living performing for an audience.",
        "skills": ["Acrobatics", "Performance"],
        "tools": ["Disguise Kit"],
        "tool_choices": [
            {"group": "Musical Instrument", "count": 1, "options": MUSICAL_INSTRUMENTS},
        ],
        "language_choices": 0,
        "feature_name": "By Popular Demand",
        "feature_description": "You can usually find a place to perform and receive modest support from an appreciative audience.",
        "fixed_equipment": [
            {"name": "Costume", "quantity": 1},
            {"name": "Belt Pouch", "quantity": 1},
        ],
        "equipment_choices": [
            {
                "group": "Admirer's Favor",
                "count": 1,
                "options": ["Love Letter", "Lock of Hair", "Admirer's Trinket"],
            },
        ],
        "tool_equipment_choices": ["Musical Instrument"],
        "starting_gold": 15,
    },
    {
        "name": "Folk Hero",
        "description": "You rose from ordinary folk by standing up to a threat or injustice.",
        "skills": ["Animal Handling", "Survival"],
        "tools": ["Vehicles (land)"],
        "tool_choices": [{"group": "Artisan's Tools", "count": 1, "options": ARTISAN_TOOLS}],
        "language_choices": 0,
        "feature_name": "Rustic Hospitality",
        "feature_description": "Common folk are inclined to shelter you and help you, though they will not risk their lives for you.",
        "fixed_equipment": [
            {"name": "Shovel", "quantity": 1},
            {"name": "Iron Pot", "quantity": 1},
            {"name": "Common Clothes", "quantity": 1},
            {"name": "Belt Pouch", "quantity": 1},
        ],
        "equipment_choices": [],
        "tool_equipment_choices": ["Artisan's Tools"],
        "starting_gold": 10,
    },
    {
        "name": "Guild Artisan",
        "description": "You trained in a craft and belong to a professional guild.",
        "skills": ["Insight", "Persuasion"],
        "tools": [],
        "tool_choices": [{"group": "Artisan's Tools", "count": 1, "options": ARTISAN_TOOLS}],
        "language_choices": 1,
        "feature_name": "Guild Membership",
        "feature_description": "Your guild can provide limited support, introductions, and help with disputes involving your trade.",
        "fixed_equipment": [
            {"name": "Guild Introduction Letter", "quantity": 1},
            {"name": "Traveler's Clothes", "quantity": 1},
            {"name": "Belt Pouch", "quantity": 1},
        ],
        "equipment_choices": [],
        "tool_equipment_choices": ["Artisan's Tools"],
        "starting_gold": 15,
    },
    {
        "name": "Hermit",
        "description": "You lived in seclusion, pursuing quiet study or contemplation.",
        "skills": ["Medicine", "Religion"],
        "tools": ["Herbalism Kit"],
        "tool_choices": [],
        "language_choices": 1,
        "feature_name": "Discovery",
        "feature_description": "Your isolation led to a unique discovery; work with the DM to determine its nature and significance.",
        "fixed_equipment": [
            {"name": "Scroll Case", "quantity": 1},
            {"name": "Research Notes", "quantity": 1},
            {"name": "Winter Blanket", "quantity": 1},
            {"name": "Common Clothes", "quantity": 1},
            {"name": "Herbalism Kit", "quantity": 1},
            {"name": "Belt Pouch", "quantity": 1},
        ],
        "equipment_choices": [],
        "tool_equipment_choices": [],
        "starting_gold": 5,
    },
    {
        "name": "Noble",
        "description": "You were raised among wealth, influence, and social privilege.",
        "skills": ["History", "Persuasion"],
        "tools": [],
        "tool_choices": [{"group": "Gaming Set", "count": 1, "options": GAMING_SETS}],
        "language_choices": 1,
        "feature_name": "Position of Privilege",
        "feature_description": "People of high standing are inclined to receive you, while others may assume you are entitled to special treatment.",
        "fixed_equipment": [
            {"name": "Fine Clothes", "quantity": 1},
            {"name": "Signet Ring", "quantity": 1},
            {"name": "Scroll of Pedigree", "quantity": 1},
            {"name": "Purse", "quantity": 1},
        ],
        "equipment_choices": [],
        "tool_equipment_choices": [],
        "starting_gold": 25,
    },
    {
        "name": "Outlander",
        "description": "You grew up far from settled lands and learned to survive in the wild.",
        "skills": ["Athletics", "Survival"],
        "tools": [],
        "tool_choices": [
            {"group": "Musical Instrument", "count": 1, "options": MUSICAL_INSTRUMENTS},
        ],
        "language_choices": 1,
        "feature_name": "Wanderer",
        "feature_description": "You remember geography and can find food and fresh water for yourself and up to five others when the land provides it.",
        "fixed_equipment": [
            {"name": "Quarterstaff", "quantity": 1},
            {"name": "Hunting Trap", "quantity": 1},
            {"name": "Animal Trophy", "quantity": 1},
            {"name": "Traveler's Clothes", "quantity": 1},
            {"name": "Belt Pouch", "quantity": 1},
        ],
        "equipment_choices": [],
        "tool_equipment_choices": ["Musical Instrument"],
        "starting_gold": 10,
    },
    {
        "name": "Sage",
        "description": "You spent years studying history, magic, or other fields of knowledge.",
        "skills": ["Arcana", "History"],
        "tools": [],
        "tool_choices": [],
        "language_choices": 2,
        "feature_name": "Researcher",
        "feature_description": "You know how to locate knowledgeable people and libraries that may hold answers to difficult questions.",
        "fixed_equipment": [
            {"name": "Bottle of Black Ink", "quantity": 1},
            {"name": "Quill", "quantity": 1},
            {"name": "Dagger", "quantity": 1},
            {"name": "Colleague's Letter", "quantity": 1},
            {"name": "Common Clothes", "quantity": 1},
            {"name": "Belt Pouch", "quantity": 1},
        ],
        "equipment_choices": [],
        "tool_equipment_choices": [],
        "starting_gold": 10,
    },
    {
        "name": "Sailor",
        "description": "You worked aboard a seagoing vessel and know life at sea.",
        "skills": ["Athletics", "Perception"],
        "tools": ["Navigator's Tools", "Vehicles (water)"],
        "tool_choices": [],
        "language_choices": 0,
        "feature_name": "Ship's Passage",
        "feature_description": "You can often secure passage for yourself and companions on a sailing ship in exchange for work.",
        "fixed_equipment": [
            {"name": "Club", "quantity": 1},
            {"name": "Silk Rope (50 ft)", "quantity": 1},
            {"name": "Lucky Charm", "quantity": 1},
            {"name": "Common Clothes", "quantity": 1},
            {"name": "Belt Pouch", "quantity": 1},
        ],
        "equipment_choices": [],
        "tool_equipment_choices": [],
        "starting_gold": 10,
    },
    {
        "name": "Soldier",
        "description": "You trained and served in an organized military force.",
        "skills": ["Athletics", "Intimidation"],
        "tools": ["Vehicles (land)"],
        "tool_choices": [{"group": "Gaming Set", "count": 1, "options": GAMING_SETS}],
        "language_choices": 0,
        "feature_name": "Military Rank",
        "feature_description": "Soldiers who recognize your former rank may offer assistance and access to military resources.",
        "fixed_equipment": [
            {"name": "Rank Insignia", "quantity": 1},
            {"name": "Fallen Foe Trophy", "quantity": 1},
            {"name": "Common Clothes", "quantity": 1},
            {"name": "Belt Pouch", "quantity": 1},
        ],
        "equipment_choices": [
            {"group": "Gaming Gear", "count": 1, "options": ["Bone Dice", "Playing Cards"]},
        ],
        "tool_equipment_choices": [],
        "starting_gold": 10,
    },
    {
        "name": "Urchin",
        "description": "You survived alone on the streets of a city.",
        "skills": ["Sleight of Hand", "Stealth"],
        "tools": ["Disguise Kit", "Thieves' Tools"],
        "tool_choices": [],
        "language_choices": 0,
        "feature_name": "City Secrets",
        "feature_description": "You know hidden routes through cities and can guide your group between locations at twice the normal travel speed when not in combat.",
        "fixed_equipment": [
            {"name": "Dagger", "quantity": 1},
            {"name": "City Map", "quantity": 1},
            {"name": "Pet Mouse", "quantity": 1},
            {"name": "Family Token", "quantity": 1},
            {"name": "Common Clothes", "quantity": 1},
            {"name": "Belt Pouch", "quantity": 1},
        ],
        "equipment_choices": [],
        "tool_equipment_choices": [],
        "starting_gold": 10,
    },
]


def _ensure_proficiency_catalog():
    if session.query(Proficiency).filter_by(type="language").count() == 0:
        from populate.populate_languagesDB import add_languages
        add_languages()

    required_skills = {
        name
        for background in BACKGROUND_DATA
        for name in background["skills"]
    }
    required_tools = {
        name
        for background in BACKGROUND_DATA
        for name in background["tools"]
    }
    required_tools.update(
        option
        for background in BACKGROUND_DATA
        for choice in background["tool_choices"]
        for option in choice["options"]
    )
    existing = {
        (proficiency.type, proficiency.name)
        for proficiency in session.query(Proficiency).all()
    }
    if any(("skill", name) not in existing for name in required_skills) or any(
        ("tool", name) not in existing for name in required_tools
    ):
        from populate.populate_proficienciesDB import add_proficiencies
        if not add_proficiencies():
            raise RuntimeError("Could not seed the background proficiency catalog.")


def _get_proficiency_catalog():
    return {
        (proficiency.type, proficiency.name): proficiency
        for proficiency in session.query(Proficiency).all()
    }


def _equipment_item_names():
    names = {
        entry["name"]
        for background in BACKGROUND_DATA
        for entry in background["fixed_equipment"]
    }
    for background in BACKGROUND_DATA:
        for choice in background["equipment_choices"]:
            names.update(choice["options"])
        for group in background["tool_equipment_choices"]:
            choice = next(
                (choice for choice in background["tool_choices"] if choice["group"] == group),
                None,
            )
            if choice is None:
                raise ValueError(
                    f"{background['name']} references unknown tool choice group '{group}'."
                )
            names.update(choice["options"])
    return names


def _ensure_equipment_catalog():
    required_names = _equipment_item_names()
    existing_names = {
        name for (name,) in session.query(Item.name).all()
    }
    if required_names.issubset(existing_names):
        return

    from populate.populate_itemDB import add_items
    add_items()
    existing_names = {
        name for (name,) in session.query(Item.name).all()
    }
    missing_names = sorted(required_names - existing_names)
    if missing_names:
        raise RuntimeError(
            "Could not seed background equipment items: " + ", ".join(missing_names)
        )


def _add_equipment(background, item_catalog, name, quantity, choice_group=None, choice_count=None):
    item = item_catalog.get(name)
    if item is None:
        raise ValueError(f"Missing starting equipment item '{name}' for {background.name}.")
    background.equipment.append(
        BackgroundEquipment(
            item=item,
            quantity=quantity,
            isChoice=choice_group is not None,
            choiceNum=choice_count or 1,
            choiceGroup=choice_group or "Starting Equipment",
        )
    )


def _add_association(background, catalog, name, proficiency_type, **choice):
    proficiency = catalog.get((proficiency_type, name))
    if proficiency is None:
        raise ValueError(
            f"Missing {proficiency_type} proficiency '{name}' for {background.name}."
        )
    background.proficiencies.append(
        BackgroundProficiency(
            proficiency=proficiency,
            isChoice=choice.get("is_choice", False),
            choiceNumber=choice.get("choice_number"),
            choiceGroup=choice.get("choice_group"),
        )
    )


def populate_backgrounds():
    try:
        _ensure_proficiency_catalog()
        _ensure_equipment_catalog()
        catalog = _get_proficiency_catalog()
        item_catalog = {
            item.name: item for item in session.query(Item).all()
        }
        languages = sorted(
            [
                proficiency
                for (proficiency_type, _), proficiency in catalog.items()
                if proficiency_type == "language"
            ],
            key=lambda proficiency: proficiency.name,
        )
        if not languages:
            raise RuntimeError("No language proficiencies are available.")

        for data in BACKGROUND_DATA:
            background = session.query(Background).filter_by(name=data["name"]).first()
            if background is None:
                background = Background(name=data["name"])
                session.add(background)

            background.description = data["description"]
            if background.details is None:
                background.details = BackgroundDetails()
            background.details.featureName = data["feature_name"]
            background.details.featureDescription = data["feature_description"]
            background.details.startingEquipment = []
            background.details.startingGold = data["starting_gold"]

            background.proficiencies.clear()
            background.equipment.clear()
            session.flush()
            for skill in data["skills"]:
                _add_association(background, catalog, skill, "skill")
            for tool in data["tools"]:
                _add_association(background, catalog, tool, "tool")
            for choice in data["tool_choices"]:
                for option in choice["options"]:
                    _add_association(
                        background,
                        catalog,
                        option,
                        "tool",
                        is_choice=True,
                        choice_number=choice["count"],
                        choice_group=choice["group"],
                    )
            for language in languages if data["language_choices"] else []:
                _add_association(
                    background,
                    catalog,
                    language.name,
                    "language",
                    is_choice=True,
                    choice_number=data["language_choices"],
                    choice_group="Languages",
                )

            for entry in data["fixed_equipment"]:
                _add_equipment(
                    background,
                    item_catalog,
                    entry["name"],
                    entry.get("quantity", 1),
                )
            for choice in data["equipment_choices"]:
                for option in choice["options"]:
                    _add_equipment(
                        background,
                        item_catalog,
                        option,
                        1,
                        choice_group=choice["group"],
                        choice_count=choice["count"],
                    )
            for group in data["tool_equipment_choices"]:
                choice = next(
                    choice for choice in data["tool_choices"]
                    if choice["group"] == group
                )
                for option in choice["options"]:
                    _add_equipment(
                        background,
                        item_catalog,
                        option,
                        1,
                        choice_group=group,
                        choice_count=choice["count"],
                    )

        session.commit()
        print(f"[SUCCESS] Populated {len(BACKGROUND_DATA)} official 2014 backgrounds")
        return True
    except Exception:
        session.rollback()
        raise


if __name__ == "__main__":
    populate_backgrounds()
