from Backend.models.features import Features, FeatureLevel
from Backend.models.dndclass import DnDclass, ClassEquipment, ClassFeatures, Subclass
from Backend.models.item import Item, ItemChoiceGroup, ItemChoice
from Backend.models.languages import Language, EntityLanguage, LanguageChoice, LanguageChoiceGroup
from Backend.models.proficiencies import Proficiency, ProficiencyChoice, ProficiencyChoiceGroup, EntityProficiency
from Backend.models import session

def create_barbarian():
    barbarian = DnDclass(
        name='Barbarian',
        hit_dice=12,
        primary_ability="STR",
        saving_throws=["STR", "CON"],
        armor_proficiencies=["Light", "Medium", "Shields"],
        weapon_proficiencies=["Simple", "Martial"],
        tool_proficiencies=[],
        skill_choices={"n_choices": 2, "options": ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"]}
    )
    session.add(barbarian)
    session.commit()

    # === BARBARIAN FEATURES ===
    features = [
        Features(
            name='Rage',
            desc="In battle, you fight with primal ferocity. On your turn, you can enter a rage as a bonus action. "
                  "While raging, you gain the following benefits if you aren't wearing heavy armor:"
                  "You have advantage on Strength checks and Strength saving throws. "
                  "When you make a melee weapon attack using Strength, you gain a bonus to the damage roll that increases as you gain levels as a barbarian, as shown in the Rage Damage column of the Barbarian table. "
                  "You have resistance to bludgeoning, piercing, and slashing damage. "
                  "If you are able to cast spells, you can't cast them or concentrate on them while raging."
                  "Your rage lasts for 1 minute. It ends early if you are knocked unconscious or if your turn ends and you haven't attacked a hostile creature since your last turn or taken damage since then. You can also end your rage on your turn as a bonus action. "
                  "Once you have raged the number of times shown for your barbarian level in the Rages column of the Barbarian table, you must finish a long rest before you can rage again.",
            properties={'charges': 2, 'damage_bonus': 2}
        ),
        Features(
            name='Unarmored Defense',
            desc='While you are not wearing any armor, your armor class equals 10 + your Dexterity modifier + your Constitution modifier. You can use a shield and still gain this benefit.',
            properties={'ac':'10+DEX+CON'}
        ),
        Features(
            name='Reckless Attack',
            desc="Starting at 2nd level, you can throw aside all concern for defense to attack with fierce desperation. "
                  "When you make your first attack on your turn, you can decide to attack recklessly. "
                  "Doing so gives you advantage on melee weapon attack rolls using Strength during this turn, but attack rolls against you have advantage until your next turn."
        ),
        Features(
            name='Danger Sense',
            desc="At 2nd level, you gain an uncanny sense of when things nearby aren't as they should be, giving you an edge when you dodge away from danger. "
                  "You have advantage on Dexterity saving throws against effects that you can see, such as traps and spells. "
                  "To gain this benefit, you can't be blinded, deafened, or incapacitated."
        ),
        Features(
            name="Primal Path",
            desc="At 3rd level, you choose a path that shapes the nature of your rage. "
                  "Your choice grants you features at 3rd level and again at 6th, 10th, and 14th levels."
        ),
        Features(
            name='Primal Knowledge',
            desc='When you reach 3rd level and again at 10th level, you gain proficiency in one skill of your choice from the list of skills available to barbarians at 1st level.',
            properties={"optional":True}
        )
    ]
    session.add_all(features)
    session.commit()

    # Rage progression
    rage = features[0]
    rage_levels = [
        FeatureLevel(featureID=rage.id, level=1, attributes={"charges":2, "damage_bonus":2}),
        FeatureLevel(featureID=rage.id, level=3, attributes={"charges":3}),
        FeatureLevel(featureID=rage.id, level=6, attributes={"charges":4}),
        FeatureLevel(featureID=rage.id, level=9, attributes={"damage_bonus":3}),
        FeatureLevel(featureID=rage.id, level=12, attributes={"charges":5}),
        FeatureLevel(featureID=rage.id, level=16, attributes={"damage_bonus":4}),
        FeatureLevel(featureID=rage.id, level=17, attributes={"charges":6}),
        FeatureLevel(featureID=rage.id, level=20, attributes={"charges":"inf"}),
    ]
    session.add_all(rage_levels)
    session.commit()
    
    asi = session.query(Features).filter_by(name="Ability Score Improvement").first()
    barb_levels = [
        ClassFeatures(classID=barbarian.id, featureID=features[0].id, level=1),  # Rage
        ClassFeatures(classID=barbarian.id, featureID=features[1].id, level=1),  # Unarmored Defense
        ClassFeatures(classID=barbarian.id, featureID=features[2].id, level=2),  # Reckless Attack
        ClassFeatures(classID=barbarian.id, featureID=features[3].id, level=2),  # Danger Sense
        ClassFeatures(classID=barbarian.id, featureID=features[4].id, level=3),  # Primal Path
        ClassFeatures(classID=barbarian.id, featureID=features[5].id, level=3),  # Primal Knowledge
        ClassFeatures(classID=barbarian.id, featureID=asi.id, level=4),
        ClassFeatures(classID=barbarian.id, featureID=asi.id, level=8),
        ClassFeatures(classID=barbarian.id, featureID=asi.id, level=12),
        ClassFeatures(classID=barbarian.id, featureID=asi.id, level=16),
        ClassFeatures(classID=barbarian.id, featureID=asi.id, level=19)
    ]
    session.add_all(barb_levels)
    session.commit()

    # === BARBARIAN SUBCLASSES ===
    # Path of the Berserker
    berserker = Subclass(
        class_id=barbarian.id,
        name="Path of the Berserker",
        subclass_flavor="Primal Path"
    )
    session.add(berserker)
    session.commit()

    berserker_features = [
        Features(
            name="Frenzy",
            desc="Starting when you choose this path at 3rd level, you can go into a frenzy when you rage. "
                 "If you do so, for the duration of your rage you can make a single melee weapon attack as a bonus action on each of your turns after this one. "
                 "When your rage ends, you suffer one level of exhaustion."
        ),
        Features(
            name="Mindless Rage",
            desc="Beginning at 6th level, you can't be charmed or frightened while raging. "
                 "If you are charmed or frightened when you enter your rage, the effect is suspended for the duration of the rage."
        ),
        Features(
            name="Intimidating Presence",
            desc="Beginning at 10th level, you can use your action to frighten someone with your menacing presence. "
                 "When you do so, choose one creature that you can see within 30 feet of you. "
                 "If the creature can see or hear you, it must succeed on a Wisdom saving throw (DC equal to 8 + your proficiency bonus + your Charisma modifier) or be frightened of you until the end of your next turn. "
                 "On subsequent turns, you can use your action to extend the duration of this effect on the frightened creature until the end of your next turn. "
                 "This effect ends if the creature ends its turn out of line of sight or more than 60 feet away from you."
        ),
        Features(
            name="Retaliation",
            desc="Starting at 14th level, when you take damage from a creature that is within 5 feet of you, you can use your reaction to make a melee weapon attack against that creature."
        )
    ]
    session.add_all(berserker_features)
    session.commit()

    # Link berserker features
    session.add(ClassFeatures(classID=barbarian.id, subclassID=berserker.id, featureID=berserker_features[0].id, level=3))
    session.add(ClassFeatures(classID=barbarian.id, subclassID=berserker.id, featureID=berserker_features[1].id, level=6))
    session.add(ClassFeatures(classID=barbarian.id, subclassID=berserker.id, featureID=berserker_features[2].id, level=10))
    session.add(ClassFeatures(classID=barbarian.id, subclassID=berserker.id, featureID=berserker_features[3].id, level=14))
    session.commit()

    # Path of the Totem Warrior
    totem_warrior = Subclass(
        class_id=barbarian.id,
        name="Path of the Totem Warrior",
        subclass_flavor="Primal Path"
    )
    session.add(totem_warrior)
    session.commit()

    totem_features = [
        Features(
            name="Spirit Seeker",
            desc="At 3rd level, when you join the Path of the Totem Warrior, you undergo a spiritual quest. "
                 "At the end of a long rest, you can choose a totem spirit: Bear, Eagle, or Wolf. "
                 "Your totem animal provides specific benefits while you're raging."
        ),
        Features(
            name="Aspect of the Beast",
            desc="At 6th level, you gain a magical benefit based on your totem spirit:"
                 "\n• Bear: You gain resistance to all damage except psychic while raging."
                 "\n• Eagle: You gain the ability to cast the *beast sense* spell a number of times equal to your proficiency bonus, regaining all uses when you finish a long rest."
                 "\n• Wolf: Your friends have advantage on attack rolls against creatures within 5 feet of you while you're raging."
        ),
        Features(
            name="Spirit Walker",
            desc="At 10th level, you can cast the *commune with nature* spell, requiring no material components. "
                 "You can cast it once without expending a spell slot, and you regain the ability to do so when you finish a long rest."
        ),
        Features(
            name="Totemic Attunement",
            desc="At 14th level, you gain a magical benefit based on your totem spirit:"
                 "\n• Bear: While raging, you have resistance to all damage, even if you don't have resistance to that damage type."
                 "\n• Eagle: While raging, other creatures have disadvantage on opportunity attack rolls against you."
                 "\n• Wolf: While raging, your allies within 30 feet of you have advantage on attack rolls against creatures you can see."
        )
    ]
    session.add_all(totem_features)
    session.commit()

    # Link totem warrior features
    session.add(ClassFeatures(classID=barbarian.id, subclassID=totem_warrior.id, featureID=totem_features[0].id, level=3))
    session.add(ClassFeatures(classID=barbarian.id, subclassID=totem_warrior.id, featureID=totem_features[1].id, level=6))
    session.add(ClassFeatures(classID=barbarian.id, subclassID=totem_warrior.id, featureID=totem_features[2].id, level=10))
    session.add(ClassFeatures(classID=barbarian.id, subclassID=totem_warrior.id, featureID=totem_features[3].id, level=14))
    session.commit()
    
    print(f"✅ Created Barbarian class with {barbarian.id}")

def create_druid():
    druid = DnDclass(
        name='Druid',
        hit_dice=8,
        primary_ability="WIS",
        saving_throws=["INT", "WIS"],
        armor_proficiencies=["Light", "Medium", "Shields"],
        weapon_proficiencies=["Clubs", "Daggers", "Darts", "Javelins", "Maces", "Quarterstaffs", "Scimitars", "Sickles", "Slings", "Spears"],
        tool_proficiencies=["Herbalism Kit"],
        skill_choices={"n_choices": 2, "options": ["Arcana", "Animal Handling", "Insight", "Medicine", "Nature", "Perception", "Religion", "Survival"]},
        subclass_level=2
    )
    session.add(druid)
    session.commit()

    # === DRUID FEATURES ===
    features = [
        Features(
            name='Ritual Casting',
            desc="You can cast a druid spell as a ritual if that spell has the ritual tag and you have the spell prepared."
        ),
        Features(
            name='Wild Shape',
            desc="Starting at 2nd level, you can use your action to magically assume the shape of a beast that you have seen before. "
                "You can use this feature twice. You regain expended uses when you finish a short or long rest. "
                "Your druid level determines the beasts you can transform into, as shown in the Beast Shapes table. "
                "At 2nd level, for example, you can transform into any beast that has a challenge rating of 1/4 or lower that doesn't have a flying or swimming speed. "
                "You can stay in a beast shape for a number of hours equal to half your druid level (rounded down). "
                "You then revert to your normal form unless you expend another use of this feature. You can revert to your normal form earlier by using a bonus action on your turn. "
                "You automatically revert if you fall unconscious, drop to 0 hit points, or die."
                "While you are transformed, the following rules apply: "
                "Your game statistics are replaced by the statistics of the beast, but you retain your alignment, personality, and Intelligence, Wisdom, and Charisma scores. "
                "You also retain all of your skill and saving throw proficiencies, in addition to gaining those of the creature. "
                "If the creature has the same proficiency as you and the bonus in its stat block is higher than yours, use the creature's bonus instead of yours. "
                "If the creature has any legendary or lair actions, you can't use them. "
                "When you transform, you assume the beast's hit points and Hit Dice. When you revert to your normal form, you return to the number of hit points you had before you transformed. "
                "However, if you revert as a result of dropping to 0 hit points, any excess damage carries over to your normal form, For example, if you take 10 damage in animal form and have only 1 hit point left, you revert and take 9 damage. "
                "As long as the excess damage doesn't reduce your normal form to 0 hit points, you aren't knocked unconscious."
                "You can't cast spells, and your ability to speak or take any action that requires hands is limited to the capabilities of your beast form. "
                "Transforming doesn't break your concentration on a spell you've already cast, however, or prevent you from taking actions that are part of a spell, such as Call Lightning, that you've already cast."
                "You retain the benefit of any features from your class, race, or other source and can use them if the new form is physically capable of doing so. "
                "However, you can't use any of your special senses, such as darkvision, unless your new form also has that sense."
                "You choose whether your equipment falls to the ground in your space, merges into your new form, or is worn by it. Worn equipment functions as normal, but the DM decides whether it is practical for the new form to wear a piece of equipment, based on the creature's shape and size. "
                "Your equipment doesn't change size or shape to match the new form, and any equipment that the new form can't wear must either fall to the ground or merge with it. Equipment that merges with the form has no effect until you leave the form.",
            properties={"max_cr":0.25, "fly":False, "swim":False}
        ),
        Features(
            name='Druid Circle',
            desc="At 2nd level, you choose to identify with a circle of druids. Your choice grants you features at 2nd level and again at 6th, 10th, and 14th level."
        ),
        Features(
            name='Wild Companion',
            desc="At 2nd level, you gain the ability to summon a spirit that assumes an animal form: as an action, you can expend a use of your Wild Shape feature to cast the Find Familiar spell, without material components."
                "When you cast the spell in this way, the familiar is a fey instead of a beast, and the familiar disappears after a number of hours equal to half your druid level.",
            properties={"optional":True}
        ),
        Features(
            name="Cantrip Versatility",
            desc="Whenever you reach a level in this class that grants the Ability Score Improvement feature, you can replace one cantrip you learned from this class's Spellcasting feature with another cantrip from the druid spell list.",
            properties={"optional":True}
        )
    ]
    session.add_all(features)
    session.commit()
    
    asi = session.query(Features).filter_by(name="Ability Score Improvement").first()
    wildshape = features[1]
    wildshape_levels = [
        FeatureLevel(featureID=wildshape.id, level=2, attributes={"max_cr":0.25, "fly":False, "swim":False}),
        FeatureLevel(featureID=wildshape.id, level=4, attributes={"max_cr":0.5, "fly":False, "swim":True}),
        FeatureLevel(featureID=wildshape.id, level=8, attributes={"max_cr":1, "fly":True, "swim":True}),
    ]
    session.add_all(wildshape_levels)
    session.commit()

    druid_levels = [
        ClassFeatures(classID=druid.id, featureID=features[0].id, level=1),  # Ritual Casting
        ClassFeatures(classID=druid.id, featureID=features[2].id, level=2),  # Druid Circle
        ClassFeatures(classID=druid.id, featureID=features[3].id, level=2),  # Wild Companion
        ClassFeatures(classID=druid.id, featureID=wildshape.id, level=2),    # Wild Shape
        ClassFeatures(classID=druid.id, featureID=asi.id, level=4),
        ClassFeatures(classID=druid.id, featureID=features[4].id, level=4),  # Cantrip Versatility
        ClassFeatures(classID=druid.id, featureID=asi.id, level=8),
        ClassFeatures(classID=druid.id, featureID=features[4].id, level=8),
        ClassFeatures(classID=druid.id, featureID=asi.id, level=12),
        ClassFeatures(classID=druid.id, featureID=features[4].id, level=12),
        ClassFeatures(classID=druid.id, featureID=asi.id, level=16),
        ClassFeatures(classID=druid.id, featureID=features[4].id, level=16),
        ClassFeatures(classID=druid.id, featureID=asi.id, level=19),
        ClassFeatures(classID=druid.id, featureID=features[4].id, level=19),
    ]
    session.add_all(druid_levels)
    session.commit()

    # === DRUID SUBCLASSES ===
    # Circle of the Moon
    moon_circle = Subclass(
        class_id=druid.id,
        name="Circle of the Moon",
        subclass_flavor="Druid Circle"
    )
    session.add(moon_circle)
    session.commit()

    moon_features = [
        Features(
            name="Combat Wild Shape",
            desc="Starting at 2nd level, you can use Wild Shape as a bonus action instead of an action. "
                 "Additionally, while you are transformed by Wild Shape, you can use a bonus action to expend one spell slot to regain 1d8 hit points per level of the spell slot expended."
        ),
        Features(
            name="Circle Forms",
            desc="The rites of your circle grant you the ability to transform into more dangerous animal forms. "
                 "Starting at 2nd level, you can use your Wild Shape to transform into a beast with a challenge rating as high as 1 (you ignore the Max. CR column of the Beast Shapes table, but must abide by the other limitations there)."
                 "\n\nAt 6th level, you can transform into a beast with a challenge rating as high as your druid level divided by 3, rounded down."
        ),
        Features(
            name="Primal Strike",
            desc="Starting at 6th level, your attacks in beast form count as magical for the purpose of overcoming resistance and immunity to nonmagical attacks and damage."
        ),
        Features(
            name="Elemental Wild Shape",
            desc="At 10th level, you can expend two uses of Wild Shape at the same time to transform into an air elemental, earth elemental, fire elemental, or water elemental."
        ),
        Features(
            name="Thousand Forms",
            desc="By 14th level, you have learned to use magic to alter your physical form in more drastic ways. "
                 "You can cast the *alter self* spell at will."
        )
    ]
    session.add_all(moon_features)
    session.commit()

    # Link moon circle features
    session.add(ClassFeatures(classID=druid.id, subclassID=moon_circle.id, featureID=moon_features[0].id, level=2))
    session.add(ClassFeatures(classID=druid.id, subclassID=moon_circle.id, featureID=moon_features[1].id, level=2))
    session.add(ClassFeatures(classID=druid.id, subclassID=moon_circle.id, featureID=moon_features[2].id, level=6))
    session.add(ClassFeatures(classID=druid.id, subclassID=moon_circle.id, featureID=moon_features[3].id, level=10))
    session.add(ClassFeatures(classID=druid.id, subclassID=moon_circle.id, featureID=moon_features[4].id, level=14))
    session.commit()

    # Circle of the Land (Earth Domain)
    land_circle = Subclass(
        class_id=druid.id,
        name="Circle of the Land (Mountain)",
        subclass_flavor="Druid Circle"
    )
    session.add(land_circle)
    session.commit()

    land_features = [
        Features(
            name="Bonus Cantrip",
            desc="When you choose this circle at 2nd level, you learn one additional druid cantrip of your choice."
        ),
        Features(
            name="Natural Recovery",
            desc="Starting at 2nd level, you can regain some of your magical energy by sitting in meditation during a short rest. "
                 "During such a rest, you choose expended spell slots to recover. The spell slots can have a combined level that is equal to or less than half your druid level (rounded up), and none of the slots can be 6th level or higher. "
                 "You can't use this feature again until you finish a long rest."
        ),
        Features(
            name="Circle Spells",
            desc="Your mystical connection to the land infuses you with the ability to cast certain spells. "
                 "At 3rd, 5th, 7th, and 9th level you gain access to circle spells connected to the land where you became a druid. "
                 "Choose that land—arctic, coast, desert, forest, grassland, mountain, swamp, or underdark—and consult the associated list of spells."
                 "\n\nMountain Circle Spells:"
                 "\n3rd: *Spider climb*, *spike growth*"
                 "\n5th: *Meld into stone*, *meld into stone*"
                 "\n7th: *Stone shape*, *stoneskin*"
                 "\n9th: *Passwall*, *wall of stone*"
        ),
        Features(
            name="Land's Stride",
            desc="Starting at 6th level, moving through nonmagical difficult terrain costs you no extra movement. "
                 "You can also pass through nonmagical plants without being slowed by them and without taking damage from them if they have thorns, spines, or a similar hazard."
                 "\n\nIn addition, you have advantage on saving throws against plants that are magically created or manipulated to impede movement, such as those created by the *entangle* spell."
        ),
        Features(
            name="Nature's Ward",
            desc="When you reach 10th level, you can't be charmed or frightened by elementals or fey, and you are immune to poison and disease."
        ),
        Features(
            name="Nature's Sanctuary",
            desc="When you reach 14th level, creatures have disadvantage on attack rolls against you while you aren't incapacitated, as long as you haven't attacked or cast a spell since your last turn."
        )
    ]
    session.add_all(land_features)
    session.commit()

    # Link land circle features
    session.add(ClassFeatures(classID=druid.id, subclassID=land_circle.id, featureID=land_features[0].id, level=2))
    session.add(ClassFeatures(classID=druid.id, subclassID=land_circle.id, featureID=land_features[1].id, level=2))
    session.add(ClassFeatures(classID=druid.id, subclassID=land_circle.id, featureID=land_features[2].id, level=3))
    session.add(ClassFeatures(classID=druid.id, subclassID=land_circle.id, featureID=land_features[3].id, level=6))
    session.add(ClassFeatures(classID=druid.id, subclassID=land_circle.id, featureID=land_features[4].id, level=10))
    session.add(ClassFeatures(classID=druid.id, subclassID=land_circle.id, featureID=land_features[5].id, level=14))
    session.commit()

    # Add proficiencies
    int_save = session.query(Proficiency).filter_by(name="Saving Throw: INT").first()
    wis_save = session.query(Proficiency).filter_by(name="Saving Throw: WIS").first()
    herbalism_kit = session.query(Proficiency).filter_by(name="Herbalism Kit").first()
    
    prof_entities = []
    if int_save:
        prof_entities.append(EntityProficiency(sourceType="class", sourceID=druid.id, proficiencyID=int_save.id))
    if wis_save:
        prof_entities.append(EntityProficiency(sourceType="class", sourceID=druid.id, proficiencyID=wis_save.id))
    if herbalism_kit:
        prof_entities.append(EntityProficiency(sourceType="class", sourceID=druid.id, proficiencyID=herbalism_kit.id))
    
    if prof_entities:
        session.add_all(prof_entities)
        session.commit()

    # Skill proficiencies
    skill_profs = ProficiencyChoiceGroup(
        sourceType="class",
        sourceID=druid.id,
        name="druid-skill-proficiencies",
        n_choices=2
    )
    arcana = session.query(Proficiency).filter_by(name="Arcana").first()
    animal_handling = session.query(Proficiency).filter_by(name="Animal Handling").first()
    insight = session.query(Proficiency).filter_by(name="Insight").first()
    medicine = session.query(Proficiency).filter_by(name="Medicine").first()
    nature = session.query(Proficiency).filter_by(name="Nature").first()
    perception = session.query(Proficiency).filter_by(name="Perception").first()
    religion = session.query(Proficiency).filter_by(name="Religion").first()
    survival = session.query(Proficiency).filter_by(name="Survival").first()
    
    choices = []
    for prof in [arcana, animal_handling, insight, medicine, nature, perception, religion, survival]:
        if prof:
            choices.append(ProficiencyChoice(proficiencyID=prof.id))
    
    skill_profs.choices = choices
    session.add(skill_profs)
    session.commit()

    # Equipment
    leather_armor = session.query(Item).filter_by(name="Leather Armor").first()
    explorers_pack = session.query(Item).filter_by(name="Explorer's Pack").first()
    druidic_focus = session.query(Item).filter_by(name="Druidic Focus").first()
    
    class_equipment = []
    if leather_armor:
        class_equipment.append(ClassEquipment(classID=druid.id, itemID=leather_armor.id, quantity=1))
    if explorers_pack:
        class_equipment.append(ClassEquipment(classID=druid.id, itemID=explorers_pack.id, quantity=1))
    if druidic_focus:
        class_equipment.append(ClassEquipment(classID=druid.id, itemID=druidic_focus.id, quantity=1))
    
    if class_equipment:
        session.add_all(class_equipment)
        session.commit()
    
    print(f"✅ Created Druid class with {druid.id}")

def create_artificer():
    artificer = DnDclass(
        name='Artificer',
        hit_dice=8,
        primary_ability="INT",
        saving_throws=["CON", "INT"],
        armor_proficiencies=["Light", "Medium", "Shields"],
        weapon_proficiencies=["Simple", "Martial"],
        tool_proficiencies=["Thieves' Tools", "Tinker's Tools", "One type of Artisan's Tools"],
        skill_choices={"n_choices": 2, "options": ["Arcana", "History", "Investigation", "Medicine", "Nature", "Perception", "Sleight of Hand"]}
    )
    session.add(artificer)
    session.commit()

    features = [
        Features(
            name='Magical Tinkering',
            desc="At 1st level, you learn how to invest a spark of magic into objects that would otherwise be mundane. As an action, you can touch a Tiny nonmagical object and give it one of the following magical properties of your choice: The object sheds dim light in a 5-foot radius. The object emits a recorded message that can be heard up to 10 feet away. The object continuously emits your choice of an odor or a nonverbal sound. A static visual effect appears on one of the object's surfaces.",
            properties={}
        ),
        Features(
            name='Spellcasting',
            desc="You have studied the workings of magic and how to channel it through objects. As a result, you have gained the ability to cast spells. To observers, you don't appear to be casting spells in a conventional way. Intelligence is your spellcasting ability for your artificer spells.",
            properties={'spellcasting_ability': 'INT'}
        ),
        Features(
            name='Infuse Item',
            desc="At 2nd level, you gain the ability to imbue mundane items with certain magical infusions. The magic items you create with this feature are effectively prototypes of permanent items. You learn four infusions of your choice. You can infuse more than one nonmagical object at the end of a long rest; the maximum number of objects equals half your proficiency bonus, rounded up.",
            properties={'infusions_known': 4, 'max_infused_items': 2}
        ),
        Features(
            name='Artificer Specialist',
            desc="At 3rd level, you choose the type of specialist you are: Alchemist, Artillerist, or Battle Smith. Your choice grants you features at 3rd level and again at 5th, 9th, and 15th level.",
            properties={}
        ),
        Features(
            name='The Right Tool for the Job',
            desc="At 3rd level, you learn how to produce exactly the tool you need: with thieves' tools or artisan's tools in hand, you can magically create one set of artisan's tools in an unoccupied space within 5 feet of you. This creation requires 1 hour of uninterrupted work, which can coincide with a short or long rest. Though the product of magic, the tools are nonmagical, and they vanish when you use this feature again.",
            properties={}
        ),
        Features(
            name='Ability Score Improvement',
            desc="When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1.",
            properties={}
        )
    ]
    session.add_all(features)
    session.commit()

    asi = session.query(Features).filter_by(name="Ability Score Improvement").first()
    artificer_levels = [
        ClassFeatures(classID=artificer.id, featureID=features[0].id, level=1),
        ClassFeatures(classID=artificer.id, featureID=features[1].id, level=1),
        ClassFeatures(classID=artificer.id, featureID=features[2].id, level=2),
        ClassFeatures(classID=artificer.id, featureID=features[3].id, level=3),
        ClassFeatures(classID=artificer.id, featureID=features[4].id, level=3),
        ClassFeatures(classID=artificer.id, featureID=asi.id, level=4),
        ClassFeatures(classID=artificer.id, featureID=asi.id, level=8),
        ClassFeatures(classID=artificer.id, featureID=asi.id, level=12),
        ClassFeatures(classID=artificer.id, featureID=asi.id, level=16),
        ClassFeatures(classID=artificer.id, featureID=asi.id, level=19)
    ]
    session.add_all(artificer_levels)
    session.commit()

    # === SUBCLASSES ===
    # Alchemist
    alchemist = Subclass(class_id=artificer.id, name="Alchemist", subclass_flavor="Artificer Specialist")
    session.add(alchemist)
    session.commit()

    alchemist_features = [
        Features(name="Alchemist Spells", desc="Starting at 3rd level, you always have certain spells prepared after you reach particular levels in this class.", properties={}),
        Features(name="Experimental Elixir", desc="Whenever you finish a long rest, you can magically produce an experimental elixir in an empty flask you touch. Roll on the Experimental Elixir table for the elixir's effect. You can create additional elixirs by expending spell slots.", properties={}),
        Features(name="Alchemical Savant", desc="Starting at 5th level, you can add your Intelligence modifier to one roll of an alchemical item or spell that deals acid, fire, necrotic, or poison damage.", properties={}),
        Features(name="Restorative Reagents", desc="Starting at 9th level, you can create restorative reagents. When you create an experimental elixir, you can have it grant temporary hit points equal to 2d8 + your Intelligence modifier.", properties={}),
        Features(name="Chemical Mastery", desc="Starting at 15th level, you have advantage on saving throws against being poisoned, and you have resistance to poison damage.", properties={})
    ]
    session.add_all(alchemist_features)
    session.commit()
    session.add_all([ClassFeatures(classID=artificer.id, subclassID=alchemist.id, featureID=f.id, level=l) for f, l in zip(alchemist_features, [3, 3, 5, 9, 15])])
    session.commit()

    # Artillerist
    artillerist = Subclass(class_id=artificer.id, name="Artillerist", subclass_flavor="Artificer Specialist")
    session.add(artillerist)
    session.commit()

    artillerist_features = [
        Features(name="Artillerist Spells", desc="Starting at 3rd level, you always have certain spells prepared.", properties={}),
        Features(name="Eldritch Cannon", desc="At 3rd level, you learn how to create a magical cannon. Using woodworker's tools or smith's tools, you can take an action to magically create a Small or Tiny eldritch cannon in an unoccupied space on a horizontal surface within 5 feet of you.", properties={}),
        Features(name="Eldritch Cannon Modifier", desc="At 5th level, you add your Intelligence modifier to the damage roll of your eldritch cannon's attack.", properties={}),
        Features(name="Explosive Cannon", desc="Starting at 9th level, every time you make an attack with the eldritch cannon, it deals an extra 1d8 force damage. In addition, if your eldritch cannon is destroyed, each creature within 10 feet of it must make a Dexterity saving throw.", properties={}),
        Features(name="Fortified Position", desc="Starting at 15th level, you and your allies have half cover while within 10 feet of your eldritch cannon. You can now create a Large eldritch cannon, and the cannon's size increases by one category when you create it.", properties={})
    ]
    session.add_all(artillerist_features)
    session.commit()
    session.add_all([ClassFeatures(classID=artificer.id, subclassID=artillerist.id, featureID=f.id, level=l) for f, l in zip(artillerist_features, [3, 3, 5, 9, 15])])
    session.commit()

    print(f"✅ Created Artificer class with {artificer.id}")


def create_bard():
    bard = DnDclass(
        name='Bard',
        hit_dice=8,
        primary_ability="CHA",
        saving_throws=["DEX", "CHA"],
        armor_proficiencies=["Light"],
        weapon_proficiencies=["Simple", "Hand Crossbows", "Longswords", "Rapiers", "Shortswords"],
        tool_proficiencies=["Three musical instruments of your choice"],
        skill_choices={"n_choices": 3, "options": ["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"]}
    )
    session.add(bard)
    session.commit()

    features = [
        Features(name='Spellcasting', desc="You have learned to untangle and reshape the fabric of reality in harmony with your wishes and music. Your spells are part of your vast repertoire, magic that you can tune to different situations. Charisma is your spellcasting ability for your bard spells.", properties={'spellcasting_ability': 'CHA'}),
        Features(name='Bardic Inspiration', desc="You can inspire others through stirring words or music. To do so, you use a bonus action on your turn to choose one creature other than yourself within 60 feet of you who can hear you. That creature gains one Bardic Inspiration die, a d6. Once within the next 10 minutes, the creature can roll the die and add the number rolled to one ability check, attack roll, or saving throw it makes.", properties={'inspiration_die': 'd6', 'uses': 'CHA mod per long rest'}),
        Features(name='Jack of All Trades', desc="Starting at 2nd level, you can add half your proficiency bonus, rounded down, to any ability check you make that doesn't already include your proficiency bonus.", properties={}),
        Features(name='Song of Rest', desc="Beginning at 2nd level, you can use soothing music or oration to help revitalize your wounded allies during a short rest. If you or any friendly creatures who can hear your performance regain hit points at the end of the short rest by spending one or more Hit Dice, each of those creatures regains an extra 1d6 hit points.", properties={'healing_bonus': '1d6'}),
        Features(name='Bard College', desc="At 3rd level, you delve into the advanced techniques of a bard college of your choice. Your choice grants you features at 3rd level and again at 6th and 14th level.", properties={}),
        Features(name='Expertise', desc="At 3rd level, choose two of your skill proficiencies. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies.", properties={}),
        Features(name='Ability Score Improvement', desc="When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1.", properties={})
    ]
    session.add_all(features)
    session.commit()

    asi = session.query(Features).filter_by(name="Ability Score Improvement").first()
    bard_levels = [
        ClassFeatures(classID=bard.id, featureID=features[0].id, level=1),
        ClassFeatures(classID=bard.id, featureID=features[1].id, level=1),
        ClassFeatures(classID=bard.id, featureID=features[2].id, level=2),
        ClassFeatures(classID=bard.id, featureID=features[3].id, level=2),
        ClassFeatures(classID=bard.id, featureID=features[4].id, level=3),
        ClassFeatures(classID=bard.id, featureID=features[5].id, level=3),
        ClassFeatures(classID=bard.id, featureID=asi.id, level=4),
        ClassFeatures(classID=bard.id, featureID=asi.id, level=8),
        ClassFeatures(classID=bard.id, featureID=asi.id, level=12),
        ClassFeatures(classID=bard.id, featureID=asi.id, level=16),
        ClassFeatures(classID=bard.id, featureID=asi.id, level=19)
    ]
    session.add_all(bard_levels)
    session.commit()

    # === SUBCLASSES ===
    # College of Lore
    lore = Subclass(class_id=bard.id, name="College of Lore", subclass_flavor="Bard College")
    session.add(lore)
    session.commit()

    lore_features = [
        Features(name="Bonus Proficiencies", desc="When you join the College of Lore at 3rd level, you gain proficiency with three skills of your choice.", properties={}),
        Features(name="Cutting Words", desc="Also at 3rd level, you learn how to use your wit to distract, confuse, and otherwise sap the confidence and competence of others. When a creature that you can see within 60 feet of you makes an attack roll, an ability check, or a damage roll, you can use your reaction to expend one of your uses of Bardic Inspiration, rolling a Bardic Inspiration die and subtracting the number rolled from the creature's roll.", properties={}),
        Features(name="Additional Magical Secrets", desc="At 6th level, you learn two spells of your choice from any class. A spell you choose must be of a level you can cast, as shown on the Bard table, or a cantrip. The chosen spells count as bard spells for you but don't count against the number of bard spells you know.", properties={}),
        Features(name="Peerless Skill", desc="Starting at 14th level, when you make an ability check, you can expend one use of Bardic Inspiration. Roll a Bardic Inspiration die and add the number rolled to your ability check. You can choose to do so after you roll the die for the ability check, but before the DM tells you whether you succeed or fail.", properties={})
    ]
    session.add_all(lore_features)
    session.commit()
    session.add_all([ClassFeatures(classID=bard.id, subclassID=lore.id, featureID=f.id, level=l) for f, l in zip(lore_features, [3, 3, 6, 14])])
    session.commit()

    # College of Valor
    valor = Subclass(class_id=bard.id, name="College of Valor", subclass_flavor="Bard College")
    session.add(valor)
    session.commit()

    valor_features = [
        Features(name="Bonus Proficiencies", desc="When you join the College of Valor at 3rd level, you gain proficiency with medium armor, shields, and martial weapons.", properties={}),
        Features(name="Combat Inspiration", desc="Also at 3rd level, you learn to inspire others in battle. A creature that has a Bardic Inspiration die from you can roll that die and add the number rolled to a weapon damage roll it just made. Alternatively, when an attack roll is made against the creature, it can use its reaction to roll the Bardic Inspiration die and add the number rolled to its AC against that attack, after seeing the roll but before knowing whether it hits or misses.", properties={}),
        Features(name="Extra Attack", desc="Starting at 6th level, you can attack twice, instead of once, whenever you take the Attack action on your turn.", properties={}),
        Features(name="Battle Magic", desc="At 14th level, you have mastered the art of weaving spellcasting and weapon use into a single harmonious act. When you use your action to cast a bard spell, you can make one weapon attack as a bonus action.", properties={})
    ]
    session.add_all(valor_features)
    session.commit()
    session.add_all([ClassFeatures(classID=bard.id, subclassID=valor.id, featureID=f.id, level=l) for f, l in zip(valor_features, [3, 3, 6, 14])])
    session.commit()

    print(f"✅ Created Bard class with {bard.id}")


def create_cleric():
    cleric = DnDclass(
        name='Cleric',
        hit_dice=8,
        primary_ability="WIS",
        saving_throws=["WIS", "CHA"],
        armor_proficiencies=["Light", "Medium", "Shields"],
        weapon_proficiencies=["Simple"],
        tool_proficiencies=[],
        skill_choices={"n_choices": 2, "options": ["History", "Insight", "Medicine", "Persuasion", "Religion"]}
    )
    session.add(cleric)
    session.commit()

    features = [
        Features(name='Spellcasting', desc="As a conduit for divine power, you can cast cleric spells. Wisdom is your spellcasting ability for your cleric spells.", properties={'spellcasting_ability': 'WIS'}),
        Features(name='Divine Domain', desc="Choose one domain related to your deity: Knowledge, Life, Light, Nature, Tempest, Trickery, or War. Your choice grants you domain spells and other features when you choose it at 1st level. It also grants you additional ways to use Channel Divinity when you gain that feature at 2nd level, and additional benefits at 6th, 8th, and 17th levels.", properties={}),
        Features(name='Channel Divinity', desc="At 2nd level, you gain the ability to channel divine energy directly from your deity, using that energy to fuel magical effects. You start with two such effects: Turn Undead and an effect determined by your domain. When you use your Channel Divinity, you choose which effect to create. You must then finish a short or long rest to use your Channel Divinity again.", properties={'uses': '1 per short rest'}),
        Features(name='Ability Score Improvement', desc="When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1.", properties={}),
        Features(name='Destroy Undead', desc="Starting at 5th level, when an undead fails its saving throw against your Turn Undead feature, the creature is instantly destroyed if its challenge rating is at or below a certain threshold.", properties={'cr_threshold': 0.5}),
        Features(name='Divine Intervention', desc="Beginning at 10th level, you can call on your deity to intervene on your behalf when your need is great. Imploring your deity's aid requires you to use your action. Describe the assistance you seek, and roll percentile dice. If you roll a number equal to or lower than your cleric level, your deity intervenes.", properties={})
    ]
    session.add_all(features)
    session.commit()

    asi = session.query(Features).filter_by(name="Ability Score Improvement").first()
    cleric_levels = [
        ClassFeatures(classID=cleric.id, featureID=features[0].id, level=1),
        ClassFeatures(classID=cleric.id, featureID=features[1].id, level=1),
        ClassFeatures(classID=cleric.id, featureID=features[2].id, level=2),
        ClassFeatures(classID=cleric.id, featureID=asi.id, level=4),
        ClassFeatures(classID=cleric.id, featureID=features[4].id, level=5),
        ClassFeatures(classID=cleric.id, featureID=asi.id, level=8),
        ClassFeatures(classID=cleric.id, featureID=features[5].id, level=10),
        ClassFeatures(classID=cleric.id, featureID=asi.id, level=12),
        ClassFeatures(classID=cleric.id, featureID=asi.id, level=16),
        ClassFeatures(classID=cleric.id, featureID=asi.id, level=19)
    ]
    session.add_all(cleric_levels)
    session.commit()

    # === SUBCLASSES (Domains) ===
    # Life Domain
    life = Subclass(class_id=cleric.id, name="Life Domain", subclass_flavor="Divine Domain")
    session.add(life)
    session.commit()

    life_features = [
        Features(name="Domain Spells", desc="You gain domain spells at the cleric levels listed in the Life Domain Spells table.", properties={'always_prepared': True}),
        Features(name="Bonus Proficiency", desc="When you choose this domain at 1st level, you gain proficiency with heavy armor.", properties={}),
        Features(name="Disciple of Life", desc="Also starting at 1st level, your healing spells are more effective. Whenever you use a spell of 1st level or higher to restore hit points to a creature, the creature regains additional hit points equal to 2 + the spell's level.", properties={}),
        Features(name="Channel Divinity: Preserve Life", desc="Starting at 2nd level, you can use your Channel Divinity to heal the badly injured. As an action, you present your holy symbol and evoke healing energy that can restore a number of hit points equal to five times your cleric level. Choose any creatures within 30 feet of you, and divide those hit points among them.", properties={}),
        Features(name="Blessed Healer", desc="Beginning at 6th level, the healing spells you cast on others heal you as well. When you cast a spell of 1st level or higher that restores hit points to a creature other than you, you regain hit points equal to 2 + the spell's level.", properties={}),
        Features(name="Divine Strike", desc="At 8th level, you gain the ability to infuse your weapon strikes with divine energy. Once on each of your turns when you hit a creature with a weapon attack, you can cause the attack to deal an extra 1d8 radiant damage to the target. When you reach 14th level, the extra damage increases to 2d8.", properties={}),
        Features(name="Supreme Healing", desc="Starting at 17th level, when you would normally roll one or more dice to restore hit points with a spell, you instead use the highest number possible for each die.", properties={})
    ]
    session.add_all(life_features)
    session.commit()
    session.add_all([ClassFeatures(classID=cleric.id, subclassID=life.id, featureID=f.id, level=l) for f, l in zip(life_features, [1, 1, 1, 2, 6, 8, 17])])
    session.commit()

    # Light Domain
    light = Subclass(class_id=cleric.id, name="Light Domain", subclass_flavor="Divine Domain")
    session.add(light)
    session.commit()

    light_features = [
        Features(name="Domain Spells", desc="You gain domain spells at the cleric levels listed in the Light Domain Spells table.", properties={'always_prepared': True}),
        Features(name="Bonus Cantrip", desc="When you choose this domain at 1st level, you gain the light cantrip if you don't already know it.", properties={}),
        Features(name="Warding Flare", desc="Also at 1st level, you can interpose divine light between yourself and an attacking enemy. When you are attacked by a creature within 30 feet of you that you can see, you can use your reaction to impose disadvantage on the attack roll, causing light to flare before the attacker. You can use this feature a number of times equal to your Wisdom modifier (a minimum of once). You regain all expended uses when you finish a long rest.", properties={}),
        Features(name="Channel Divinity: Radiance of the Dawn", desc="Starting at 2nd level, you can use your Channel Divinity to harness sunlight, banishing darkness and dealing radiant damage to your foes. As an action, you present your holy symbol, and any magical darkness within 30 feet of you is dispelled. Additionally, each creature of your choice in that area must make a Constitution saving throw. A creature takes radiant damage equal to 2d10 + your cleric level on a failed saving throw, and half as much damage on a successful one.", properties={}),
        Features(name="Improved Flare", desc="Starting at 6th level, you can also use your Warding Flare feature when a creature that you can see within 30 feet of you attacks a creature other than you.", properties={}),
        Features(name="Potent Spellcasting", desc="Starting at 8th level, you add your Wisdom modifier to the damage you deal with any cleric cantrip.", properties={}),
        Features(name="Corona of Light", desc="Starting at 17th level, you can use your action to activate an aura of sunlight that lasts for 1 minute or until you dismiss it using another action. You emit bright light in a 60-foot radius and dim light 30 feet beyond that. Your enemies in the bright light have disadvantage on saving throws against any spell that deals fire or radiant damage.", properties={})
    ]
    session.add_all(light_features)
    session.commit()
    session.add_all([ClassFeatures(classID=cleric.id, subclassID=light.id, featureID=f.id, level=l) for f, l in zip(light_features, [1, 1, 1, 2, 6, 8, 17])])
    session.commit()

    print(f"✅ Created Cleric class with {cleric.id}")


def create_fighter():
    fighter = DnDclass(
        name='Fighter',
        hit_dice=10,
        primary_ability="STR or DEX",
        saving_throws=["STR", "CON"],
        armor_proficiencies=["All armor", "Shields"],
        weapon_proficiencies=["Simple", "Martial"],
        tool_proficiencies=[],
        skill_choices={"n_choices": 2, "options": ["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"]}
    )
    session.add(fighter)
    session.commit()

    features = [
        Features(name='Fighting Style', desc="You adopt a particular style of fighting as your specialty. Choose one of the following options: Archery, Defense, Dueling, Great Weapon Fighting, Protection, or Two-Weapon Fighting. You can't take a Fighting Style option more than once, even if you later get to choose again.", properties={}),
        Features(name='Second Wind', desc="You have a limited well of stamina that you can draw on to protect yourself from harm. On your turn, you can use a bonus action to regain hit points equal to 1d10 + your fighter level. Once you use this feature, you must finish a short or long rest before you can use it again.", properties={'healing': '1d10 + level'}),
        Features(name='Action Surge', desc="Starting at 2nd level, you can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action. Once you use this feature, you must finish a short or long rest before you can use it again. Starting at 17th level, you can use it twice before a rest, but only once on the same turn.", properties={'uses': '1 per short rest'}),
        Features(name='Martial Archetype', desc="At 3rd level, you choose an archetype that you strive to emulate in your combat styles and techniques. Choose Champion, Battle Master, or Eldritch Knight. The archetype you choose grants you features at 3rd level and again at 7th, 10th, 15th, and 18th level.", properties={}),
        Features(name='Ability Score Improvement', desc="When you reach 4th level, and again at 6th, 8th, 12th, 14th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1.", properties={}),
        Features(name='Extra Attack', desc="Beginning at 5th level, you can attack twice, instead of once, whenever you take the Attack action on your turn. The number of attacks increases to three when you reach 11th level in this class and to four when you reach 20th level in this class.", properties={'attacks': 2}),
        Features(name='Indomitable', desc="Beginning at 9th level, you can reroll a saving throw that you fail. If you do so, you must use the new roll, and you can't use this feature again until you finish a long rest. You can use this feature twice between long rests starting at 13th level and three times between long rests starting at 17th level.", properties={'uses': '1 per long rest'})
    ]
    session.add_all(features)
    session.commit()

    asi = session.query(Features).filter_by(name="Ability Score Improvement").first()
    fighter_levels = [
        ClassFeatures(classID=fighter.id, featureID=features[0].id, level=1),
        ClassFeatures(classID=fighter.id, featureID=features[1].id, level=1),
        ClassFeatures(classID=fighter.id, featureID=features[2].id, level=2),
        ClassFeatures(classID=fighter.id, featureID=features[3].id, level=3),
        ClassFeatures(classID=fighter.id, featureID=asi.id, level=4),
        ClassFeatures(classID=fighter.id, featureID=features[5].id, level=5),
        ClassFeatures(classID=fighter.id, featureID=asi.id, level=6),
        ClassFeatures(classID=fighter.id, featureID=asi.id, level=8),
        ClassFeatures(classID=fighter.id, featureID=features[6].id, level=9),
        ClassFeatures(classID=fighter.id, featureID=asi.id, level=12),
        ClassFeatures(classID=fighter.id, featureID=asi.id, level=14),
        ClassFeatures(classID=fighter.id, featureID=asi.id, level=16),
        ClassFeatures(classID=fighter.id, featureID=features[2].id, level=17),  # Action Surge 2nd use
        ClassFeatures(classID=fighter.id, featureID=asi.id, level=19),
        ClassFeatures(classID=fighter.id, featureID=features[5].id, level=20)  # Extra Attack (4)
    ]
    session.add_all(fighter_levels)
    session.commit()

    # === SUBCLASSES ===
    # Champion
    champion = Subclass(class_id=fighter.id, name="Champion", subclass_flavor="Martial Archetype")
    session.add(champion)
    session.commit()

    champion_features = [
        Features(name="Improved Critical", desc="Beginning when you choose this archetype at 3rd level, your weapon attacks score a critical hit on a roll of 19 or 20.", properties={}),
        Features(name="Remarkable Athlete", desc="Starting at 7th level, you can add half your proficiency bonus (round up) to any Strength, Dexterity, or Constitution check you make that doesn't already use your proficiency bonus. In addition, when you make a running long jump, the distance you can cover increases by a number of feet equal to your Strength modifier.", properties={}),
        Features(name="Additional Fighting Style", desc="At 10th level, you can choose a second option from the Fighting Style class feature.", properties={}),
        Features(name="Superior Critical", desc="Starting at 15th level, your weapon attacks score a critical hit on a roll of 18-20.", properties={}),
        Features(name="Survivor", desc="At 18th level, you attain the pinnacle of resilience in battle. At the start of each of your turns, you regain hit points equal to 5 + your Constitution modifier if you have no more than half of your hit points left. You don't gain this benefit if you have 0 hit points.", properties={})
    ]
    session.add_all(champion_features)
    session.commit()
    session.add_all([ClassFeatures(classID=fighter.id, subclassID=champion.id, featureID=f.id, level=l) for f, l in zip(champion_features, [3, 7, 10, 15, 18])])
    session.commit()

    # Battle Master
    battlemaster = Subclass(class_id=fighter.id, name="Battle Master", subclass_flavor="Martial Archetype")
    session.add(battlemaster)
    session.commit()

    battlemaster_features = [
        Features(name="Combat Superiority", desc="When you choose this archetype at 3rd level, you learn maneuvers that are fueled by special dice called superiority dice. You learn three maneuvers of your choice. Many maneuvers enhance an attack in some way. You can use only one maneuver per attack. You have four superiority dice, which are d8s. A superiority die is expended when you use it. You regain all of your expended superiority dice when you finish a short or long rest.", properties={'superiority_dice': '4d8'}),
        Features(name="Student of War", desc="At 3rd level, you gain proficiency with one type of artisan's tools of your choice.", properties={}),
        Features(name="Know Your Enemy", desc="Starting at 7th level, if you spend at least 1 minute observing or interacting with another creature outside combat, you can learn certain information about its capabilities compared to your own.", properties={}),
        Features(name="Improved Combat Superiority", desc="At 10th level, your superiority dice turn into d10s. At 18th level, they turn into d12s.", properties={}),
        Features(name="Relentless", desc="Starting at 15th level, when you roll initiative and have no superiority dice remaining, you regain 1 superiority die.", properties={})
    ]
    session.add_all(battlemaster_features)
    session.commit()
    session.add_all([ClassFeatures(classID=fighter.id, subclassID=battlemaster.id, featureID=f.id, level=l) for f, l in zip(battlemaster_features, [3, 3, 7, 10, 15])])
    session.commit()

    print(f"✅ Created Fighter class with {fighter.id}")


def create_paladin():
    paladin = DnDclass(
        name='Paladin',
        hit_dice=10,
        primary_ability="STR and CHA",
        saving_throws=["WIS", "CHA"],
        armor_proficiencies=["All armor", "Shields"],
        weapon_proficiencies=["Simple", "Martial"],
        tool_proficiencies=[],
        skill_choices={"n_choices": 2, "options": ["Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"]}
    )
    session.add(paladin)
    session.commit()

    features = [
        Features(name='Divine Sense', desc="The presence of strong evil registers on your senses like a noxious odor, and powerful good rings like heavenly music in your ears. As an action, you can open your awareness to detect such forces. Until the end of your next turn, you know the location of any celestial, fiend, or undead within 60 feet of you that is not behind total cover. You can use this feature a number of times equal to 1 + your Charisma modifier. When you finish a long rest, you regain all expended uses.", properties={'uses': '1 + CHA mod per long rest'}),
        Features(name='Lay on Hands', desc="Your blessed touch can heal wounds. You have a pool of healing power that replenishes when you take a long rest. With that pool, you can restore a total number of hit points equal to your paladin level × 5. As an action, you can touch a creature and draw power from the pool to restore a number of hit points to that creature, up to the maximum amount remaining in your pool. Alternatively, you can expend 5 hit points from your pool of healing to cure the target of one disease or neutralize one poison affecting it.", properties={'healing_pool': 'level × 5'}),
        Features(name='Fighting Style', desc="At 2nd level, you adopt a particular style of fighting as your specialty. Choose one of the following options: Defense, Dueling, Great Weapon Fighting, or Protection.", properties={}),
        Features(name='Spellcasting', desc="By 2nd level, you have learned to draw on divine magic through meditation and prayer to cast spells as a cleric does. Charisma is your spellcasting ability for your paladin spells.", properties={'spellcasting_ability': 'CHA'}),
        Features(name='Divine Smite', desc="Starting at 2nd level, when you hit a creature with a melee weapon attack, you can expend one spell slot to deal radiant damage to the target, in addition to the weapon's damage. The extra damage is 2d8 for a 1st-level spell slot, plus 1d8 for each spell level higher than 1st, to a maximum of 5d8. The damage increases by 1d8 if the target is an undead or a fiend.", properties={}),
        Features(name='Sacred Oath', desc="When you reach 3rd level, you swear the oath that binds you as a paladin forever. Up to this time you have been in a preparatory stage, committed to the path but not yet sworn to it. Your choice grants you features at 3rd level and again at 7th, 15th, and 20th level.", properties={}),
        Features(name='Ability Score Improvement', desc="When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1.", properties={}),
        Features(name='Extra Attack', desc="Beginning at 5th level, you can attack twice, instead of once, whenever you take the Attack action on your turn.", properties={'attacks': 2}),
        Features(name='Aura of Protection', desc="Starting at 6th level, whenever you or a friendly creature within 10 feet of you must make a saving throw, the creature gains a bonus to the saving throw equal to your Charisma modifier (with a minimum bonus of +1). You must be conscious to grant this bonus. At 18th level, the range of this aura increases to 30 feet.", properties={'range': 10}),
        Features(name='Aura of Courage', desc="Starting at 10th level, you and friendly creatures within 10 feet of you can't be frightened while you are conscious. At 18th level, the range of this aura increases to 30 feet.", properties={'range': 10}),
        Features(name='Cleansing Touch', desc="Beginning at 14th level, you can use your action to end one spell on yourself or on one willing creature that you touch. You can use this feature a number of times equal to your Charisma modifier (a minimum of once). You regain expended uses when you finish a long rest.", properties={'uses': 'CHA mod per long rest'})
    ]
    session.add_all(features)
    session.commit()

    asi = session.query(Features).filter_by(name="Ability Score Improvement").first()
    paladin_levels = [
        ClassFeatures(classID=paladin.id, featureID=features[0].id, level=1),
        ClassFeatures(classID=paladin.id, featureID=features[1].id, level=1),
        ClassFeatures(classID=paladin.id, featureID=features[2].id, level=2),
        ClassFeatures(classID=paladin.id, featureID=features[3].id, level=2),
        ClassFeatures(classID=paladin.id, featureID=features[4].id, level=2),
        ClassFeatures(classID=paladin.id, featureID=features[5].id, level=3),
        ClassFeatures(classID=paladin.id, featureID=asi.id, level=4),
        ClassFeatures(classID=paladin.id, featureID=features[7].id, level=5),
        ClassFeatures(classID=paladin.id, featureID=features[8].id, level=6),
        ClassFeatures(classID=paladin.id, featureID=asi.id, level=8),
        ClassFeatures(classID=paladin.id, featureID=features[9].id, level=10),
        ClassFeatures(classID=paladin.id, featureID=asi.id, level=12),
        ClassFeatures(classID=paladin.id, featureID=features[10].id, level=14),
        ClassFeatures(classID=paladin.id, featureID=asi.id, level=16),
        ClassFeatures(classID=paladin.id, featureID=asi.id, level=19)
    ]
    session.add_all(paladin_levels)
    session.commit()

    # === SUBCLASSES (Oaths) ===
    # Oath of Devotion
    devotion = Subclass(class_id=paladin.id, name="Oath of Devotion", subclass_flavor="Sacred Oath")
    session.add(devotion)
    session.commit()

    devotion_features = [
        Features(name="Oath Spells", desc="You gain oath spells at the paladin levels listed in the Oath of Devotion Spells table.", properties={'always_prepared': True}),
        Features(name="Channel Divinity: Sacred Weapon", desc="As an action, you can imbue one weapon that you are holding with positive energy, using your Channel Divinity. For 1 minute, you add your Charisma modifier to attack rolls made with that weapon (with a minimum bonus of +1). The weapon also emits bright light in a 20-foot radius and dim light 20 feet beyond that.", properties={}),
        Features(name="Channel Divinity: Turn the Unholy", desc="As an action, you present your holy symbol and speak a prayer censuring fiends and undead, using your Channel Divinity. Each fiend or undead that can see or hear you within 30 feet of you must make a Wisdom saving throw. If the creature fails its saving throw, it is turned for 1 minute or until it takes damage.", properties={}),
        Features(name="Aura of Devotion", desc="Starting at 7th level, you and friendly creatures within 10 feet of you can't be charmed while you are conscious. At 18th level, the range of this aura increases to 30 feet.", properties={'range': 10}),
        Features(name="Purity of Spirit", desc="Beginning at 15th level, you are always under the effects of a protection from evil and good spell.", properties={}),
        Features(name="Holy Nimbus", desc="At 20th level, as an action, you can emanate an aura of sunlight. For 1 minute, bright light shines from you in a 30-foot radius, and dim light shines 30 feet beyond that. Whenever an enemy creature starts its turn in the bright light, the creature takes 10 radiant damage.", properties={})
    ]
    session.add_all(devotion_features)
    session.commit()
    session.add_all([ClassFeatures(classID=paladin.id, subclassID=devotion.id, featureID=f.id, level=l) for f, l in zip(devotion_features, [3, 3, 3, 7, 15, 20])])
    session.commit()

    # Oath of Vengeance
    vengeance = Subclass(class_id=paladin.id, name="Oath of Vengeance", subclass_flavor="Sacred Oath")
    session.add(vengeance)
    session.commit()

    vengeance_features = [
        Features(name="Oath Spells", desc="You gain oath spells at the paladin levels listed in the Oath of Vengeance Spells table.", properties={'always_prepared': True}),
        Features(name="Channel Divinity: Abjure Enemy", desc="As an action, you present your holy symbol and speak a prayer of denunciation, using your Channel Divinity. Choose one creature within 60 feet of you that you can see. That creature must make a Wisdom saving throw. On a failed save, the creature is frightened for 1 minute or until it takes any damage.", properties={}),
        Features(name="Channel Divinity: Vow of Enmity", desc="As a bonus action, you can utter a vow of enmity against a creature you can see within 10 feet of you, using your Channel Divinity. You gain advantage on attack rolls against the creature for 1 minute or until it drops to 0 hit points or falls unconscious.", properties={}),
        Features(name="Relentless Avenger", desc="By 7th level, your supernatural focus helps you close off a foe's retreat. When you hit a creature with an opportunity attack, you can move up to half your speed immediately after the attack and as part of the same reaction. This movement doesn't provoke opportunity attacks.", properties={}),
        Features(name="Soul of Vengeance", desc="Starting at 15th level, the authority with which you speak your Vow of Enmity gives you greater power over your foe. When a creature under the effect of your Vow of Enmity makes an attack, you can use your reaction to make a melee weapon attack against that creature if it is within range.", properties={}),
        Features(name="Avenging Angel", desc="At 20th level, you can assume the form of an angelic avenger. Using your action, you undergo a transformation. For 1 hour, you gain the following benefits: Wings sprout from your back and grant you a flying speed of 60 feet. You emanate an aura of menace in a 30-foot radius. The first time any enemy creature enters the aura or starts its turn there during a battle, the creature must succeed on a Wisdom saving throw or become frightened of you for 1 minute or until it takes any damage.", properties={})
    ]
    session.add_all(vengeance_features)
    session.commit()
    session.add_all([ClassFeatures(classID=paladin.id, subclassID=vengeance.id, featureID=f.id, level=l) for f, l in zip(vengeance_features, [3, 3, 3, 7, 15, 20])])
    session.commit()

    print(f"✅ Created Paladin class with {paladin.id}")


def create_ranger():
    ranger = DnDclass(
        name='Ranger',
        hit_dice=10,
        primary_ability="DEX and WIS",
        saving_throws=["STR", "DEX"],
        armor_proficiencies=["Light", "Medium", "Shields"],
        weapon_proficiencies=["Simple", "Martial"],
        tool_proficiencies=[],
        skill_choices={"n_choices": 3, "options": ["Animal Handling", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"]}
    )
    session.add(ranger)
    session.commit()

    features = [
        Features(name='Favored Enemy', desc="Beginning at 1st level, you have significant experience studying, tracking, hunting, and even talking to a certain type of creature. Choose a type of favored enemy: aberrations, beasts, celestials, constructs, dragons, elementals, fey, fiends, giants, monstrosities, oozes, plants, or undead. Alternatively, you can select two races of humanoid as favored enemies. You have advantage on Wisdom (Survival) checks to track your favored enemies, as well as on Intelligence checks to recall information about them.", properties={}),
        Features(name='Natural Explorer', desc="You are particularly familiar with one type of natural environment and are adept at traveling and surviving in such regions. Choose one type of favored terrain: arctic, coast, desert, forest, grassland, mountain, swamp, or the Underdark. When you make an Intelligence or Wisdom check related to your favored terrain, your proficiency bonus is doubled if you are using a skill that you're proficient in.", properties={}),
        Features(name='Fighting Style', desc="At 2nd level, you adopt a particular style of fighting as your specialty. Choose one of the following options: Archery, Defense, Dueling, or Two-Weapon Fighting.", properties={}),
        Features(name='Spellcasting', desc="By 2nd level, you have learned to use the magical essence of nature to cast spells, much as a druid does. Wisdom is your spellcasting ability for your ranger spells.", properties={'spellcasting_ability': 'WIS'}),
        Features(name='Ranger Archetype', desc="At 3rd level, you choose an archetype that you strive to emulate: Hunter, Beast Master, or Gloom Stalker. Your choice grants you features at 3rd level and again at 7th, 11th, and 15th level.", properties={}),
        Features(name='Primeval Awareness', desc="Beginning at 3rd level, you can use your action and expend one ranger spell slot to focus your awareness on the region around you. For 1 minute per level of the spell slot you expend, you can sense whether the following types of creatures are present within 1 mile of you (or within up to 6 miles if you are in your favored terrain): aberrations, celestials, dragons, elementals, fey, fiends, and undead.", properties={}),
        Features(name='Ability Score Improvement', desc="When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1.", properties={}),
        Features(name='Extra Attack', desc="Beginning at 5th level, you can attack twice, instead of once, whenever you take the Attack action on your turn.", properties={'attacks': 2}),
        Features(name="Land's Stride", desc="Starting at 8th level, moving through nonmagical difficult terrain costs you no extra movement. You can also pass through nonmagical plants without being slowed by them and without taking damage from them if they have thorns, spines, or a similar hazard.", properties={}),
        Features(name='Hide in Plain Sight', desc="Starting at 10th level, you can spend 1 minute creating camouflage for yourself. You must have access to fresh mud, dirt, plants, soot, and other naturally occurring materials with which to create your camouflage. Once you are camouflaged in this way, you can try to hide by pressing yourself up against a solid surface that is at least as tall and wide as you are. You gain a +10 bonus to Dexterity (Stealth) checks as long as you remain there without moving or taking actions.", properties={}),
        Features(name='Vanish', desc="Starting at 14th level, you can use the Hide action as a bonus action on your turn. Also, you can't be tracked by nonmagical means, unless you choose to leave a trail.", properties={}),
        Features(name='Feral Senses', desc="At 18th level, you gain preternatural senses that help you fight creatures you can't see. When you attack a creature you can't see, your inability to see it doesn't impose disadvantage on your attack rolls against it. You are also aware of the location of any invisible creature within 30 feet of you, provided that the creature isn't hidden from you and you aren't blinded or deafened.", properties={}),
        Features(name='Foe Slayer', desc="At 20th level, you become an unparalleled hunter of your enemies. Once on each of your turns, you can add your Wisdom modifier to the attack roll or the damage roll of an attack you make against one of your favored enemies. You can choose to use this feature before or after the roll, but before any effects of the roll are applied.", properties={})
    ]
    session.add_all(features)
    session.commit()

    asi = session.query(Features).filter_by(name="Ability Score Improvement").first()
    ranger_levels = [
        ClassFeatures(classID=ranger.id, featureID=features[0].id, level=1),
        ClassFeatures(classID=ranger.id, featureID=features[1].id, level=1),
        ClassFeatures(classID=ranger.id, featureID=features[2].id, level=2),
        ClassFeatures(classID=ranger.id, featureID=features[3].id, level=2),
        ClassFeatures(classID=ranger.id, featureID=features[4].id, level=3),
        ClassFeatures(classID=ranger.id, featureID=features[5].id, level=3),
        ClassFeatures(classID=ranger.id, featureID=asi.id, level=4),
        ClassFeatures(classID=ranger.id, featureID=features[7].id, level=5),
        ClassFeatures(classID=ranger.id, featureID=features[8].id, level=8),
        ClassFeatures(classID=ranger.id, featureID=asi.id, level=8),
        ClassFeatures(classID=ranger.id, featureID=features[9].id, level=10),
        ClassFeatures(classID=ranger.id, featureID=asi.id, level=12),
        ClassFeatures(classID=ranger.id, featureID=features[10].id, level=14),
        ClassFeatures(classID=ranger.id, featureID=asi.id, level=16),
        ClassFeatures(classID=ranger.id, featureID=features[11].id, level=18),
        ClassFeatures(classID=ranger.id, featureID=asi.id, level=19),
        ClassFeatures(classID=ranger.id, featureID=features[12].id, level=20)
    ]
    session.add_all(ranger_levels)
    session.commit()

    # === SUBCLASSES ===
    # Hunter
    hunter = Subclass(class_id=ranger.id, name="Hunter", subclass_flavor="Ranger Archetype")
    session.add(hunter)
    session.commit()

    hunter_features = [
        Features(name="Hunter's Prey", desc="At 3rd level, you gain one of the following features of your choice: Colossus Slayer (Your tenacity can wear down the most potent foes. When you hit a creature with a weapon attack, the creature takes an extra 1d8 damage if it's below its hit point maximum. You can deal this extra damage only once per turn), Giant Killer (When a Large or larger creature within 5 feet of you hits or misses you with an attack, you can use your reaction to attack that creature immediately after its attack, provided that you can see the creature), or Horde Breaker (Once on each of your turns when you make a weapon attack, you can make another attack with the same weapon against a different creature that is within 5 feet of the original target and within range of your weapon).", properties={}),
        Features(name="Defensive Tactics", desc="At 7th level, you gain one of the following features of your choice: Escape the Horde (Opportunity attacks against you are made with disadvantage), Multiattack Defense (When a creature hits you with an attack, you gain a +4 bonus to AC against all subsequent attacks made by that creature for the rest of the turn), or Steel Will (You have advantage on saving throws against being frightened).", properties={}),
        Features(name="Multiattack", desc="At 11th level, you gain one of the following features of your choice: Volley (You can use your action to make a ranged attack against any number of creatures within 10 feet of a point you can see within your weapon's range. You must have ammunition for each target, as normal, and you make a separate attack roll for each target) or Whirlwind Attack (You can use your action to make a melee attack against any number of creatures within 5 feet of you, with a separate attack roll for each target).", properties={}),
        Features(name="Superior Hunter's Defense", desc="At 15th level, you gain one of the following features of your choice: Evasion (When you are subjected to an effect, such as a red dragon's fiery breath or a lightning bolt spell, that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw, and only half damage if you fail), Stand Against the Tide (When a hostile creature misses you with a melee attack, you can use your reaction to force that creature to repeat the same attack against another creature (other than itself) of your choice), or Uncanny Dodge (When an attacker that you can see hits you with an attack, you can use your reaction to halve the attack's damage against you).", properties={})
    ]
    session.add_all(hunter_features)
    session.commit()
    session.add_all([ClassFeatures(classID=ranger.id, subclassID=hunter.id, featureID=f.id, level=l) for f, l in zip(hunter_features, [3, 7, 11, 15])])
    session.commit()

    # Beast Master
    beastmaster = Subclass(class_id=ranger.id, name="Beast Master", subclass_flavor="Ranger Archetype")
    session.add(beastmaster)
    session.commit()

    beastmaster_features = [
        Features(name="Ranger's Companion", desc="At 3rd level, you gain a beast companion that accompanies you on your adventures and is trained to fight alongside you. Choose a beast that is no larger than Medium and that has a challenge rating of 1/4 or lower. Add your proficiency bonus to the beast's AC, attack rolls, and damage rolls, as well as to any saving throws and skills it is proficient in. Its hit point maximum equals its normal maximum or four times your ranger level, whichever is higher.", properties={}),
        Features(name="Exceptional Training", desc="Beginning at 7th level, on any of your turns when your beast companion doesn't attack, you can use a bonus action to command the beast to take the Dash, Disengage, Dodge, or Help action on its turn.", properties={}),
        Features(name="Bestial Fury", desc="Starting at 11th level, your beast companion can make two attacks when you command it to use the Attack action.", properties={}),
        Features(name="Share Spells", desc="Beginning at 15th level, when you cast a spell targeting yourself, you can also affect your beast companion with the spell if the beast is within 30 feet of you.", properties={})
    ]
    session.add_all(beastmaster_features)
    session.commit()
    session.add_all([ClassFeatures(classID=ranger.id, subclassID=beastmaster.id, featureID=f.id, level=l) for f, l in zip(beastmaster_features, [3, 7, 11, 15])])
    session.commit()

    print(f"✅ Created Ranger class with {ranger.id}")


def create_rogue():
    rogue = DnDclass(
        name='Rogue',
        hit_dice=8,
        primary_ability="DEX",
        saving_throws=["DEX", "INT"],
        armor_proficiencies=["Light"],
        weapon_proficiencies=["Simple", "Hand Crossbows", "Longswords", "Rapiers", "Shortswords"],
        tool_proficiencies=["Thieves' Tools"],
        skill_choices={"n_choices": 4, "options": ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"]}
    )
    session.add(rogue)
    session.commit()

    features = [
        Features(
            name='Expertise',
            desc="At 1st level, choose two of your skill proficiencies, or one of your skill proficiencies and your proficiency with thieves' tools. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies. At 6th level, you can choose two more of your proficiencies to gain this benefit.",
            properties={}
        ),
        Features(
            name='Sneak Attack',
            desc="Beginning at 1st level, you know how to strike subtly and exploit a foe's distraction. Once per turn, you can deal an extra 1d6 damage to one creature you hit with an attack if you have advantage on the attack roll. The attack must use a finesse or a ranged weapon. You don't need advantage on the attack roll if another enemy of the target is within 5 feet of it, that enemy isn't incapacitated, and you don't have disadvantage on the attack roll. The amount of the extra damage increases as you gain levels in this class.",
            properties={'damage_die': '1d6', 'scaling': '1d6 per 2 levels'}
        ),
        Features(
            name="Thieves' Cant'",
            desc="During your rogue training you learned thieves' cant, a secret mix of dialect, jargon, and code that allows you to hide messages in seemingly normal conversation. Only another creature that knows thieves' cant understands such messages. It takes four times longer to convey such a message than it does to speak the same idea plainly.",
            properties={}
        ),
        Features(
            name='Cunning Action',
            desc="Starting at 2nd level, your quick thinking and agility allow you to move and act quickly. You can take a bonus action on each of your turns in combat. This action can be used only to take the Dash, Disengage, or Hide action.",
            properties={}
        ),
        Features(
            name='Roguish Archetype',
            desc="At 3rd level, you choose an archetype that you emulate in the exercise of your rogue abilities. Your archetype choice grants you features at 3rd level and then again at 9th, 13th, and 17th level.",
            properties={}
        ),
        Features(
            name='Ability Score Improvement',
            desc="When you reach 4th level, and again at 8th, 10th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1.",
            properties={}
        ),
        Features(
            name='Uncanny Dodge',
            desc="Starting at 5th level, when an attacker that you can see hits you with an attack, you can use your reaction to halve the attack's damage against you.",
            properties={}
        ),
        Features(
            name='Evasion',
            desc="Beginning at 7th level, you can nimbly dodge out of the way of certain area effects. When you are subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw, and only half damage if you fail.",
            properties={}
        ),
        Features(
            name='Reliable Talent',
            desc="By 11th level, you have refined your chosen skills until they approach perfection. Whenever you make an ability check that lets you add your proficiency bonus, you can treat a d20 roll of 9 or lower as a 10.",
            properties={}
        ),
        Features(
            name='Blindsense',
            desc="Starting at 14th level, if you are able to hear, you are aware of the location of any hidden or invisible creature within 10 feet of you.",
            properties={'range': 10}
        ),
        Features(
            name='Slippery Mind',
            desc="By 15th level, you have acquired greater mental strength. You gain proficiency in Wisdom saving throws.",
            properties={}
        ),
        Features(
            name='Elusive',
            desc="Beginning at 18th level, you are so evasive that attackers rarely gain the upper hand against you. No attack roll has advantage against you while you aren't incapacitated.",
            properties={}
        ),
        Features(
            name='Stroke of Luck',
            desc="At 20th level, you have an uncanny knack for succeeding when you need to. If your attack misses a target within range, you can turn the miss into a hit. Alternatively, if you fail an ability check, you can treat the d20 roll as a 20. Once you use this feature, you can't use it again until you finish a short or long rest.",
            properties={'uses': '1 per short rest'}
        )
    ]
    session.add_all(features)
    session.commit()

    # Sneak Attack progression
    sneak_attack = features[1]
    sneak_attack_levels = [
        FeatureLevel(featureID=sneak_attack.id, level=1, attributes={'damage': '1d6'}),
        FeatureLevel(featureID=sneak_attack.id, level=3, attributes={'damage': '2d6'}),
        FeatureLevel(featureID=sneak_attack.id, level=5, attributes={'damage': '3d6'}),
        FeatureLevel(featureID=sneak_attack.id, level=7, attributes={'damage': '4d6'}),
        FeatureLevel(featureID=sneak_attack.id, level=9, attributes={'damage': '5d6'}),
        FeatureLevel(featureID=sneak_attack.id, level=11, attributes={'damage': '6d6'}),
        FeatureLevel(featureID=sneak_attack.id, level=13, attributes={'damage': '7d6'}),
        FeatureLevel(featureID=sneak_attack.id, level=15, attributes={'damage': '8d6'}),
        FeatureLevel(featureID=sneak_attack.id, level=17, attributes={'damage': '9d6'}),
        FeatureLevel(featureID=sneak_attack.id, level=19, attributes={'damage': '10d6'}),
    ]
    session.add_all(sneak_attack_levels)
    session.commit()

    asi = session.query(Features).filter_by(name="Ability Score Improvement").first()
    rogue_levels = [
        ClassFeatures(classID=rogue.id, featureID=features[0].id, level=1),
        ClassFeatures(classID=rogue.id, featureID=features[1].id, level=1),
        ClassFeatures(classID=rogue.id, featureID=features[2].id, level=1),
        ClassFeatures(classID=rogue.id, featureID=features[3].id, level=2),
        ClassFeatures(classID=rogue.id, featureID=features[4].id, level=3),
        ClassFeatures(classID=rogue.id, featureID=asi.id, level=4),
        ClassFeatures(classID=rogue.id, featureID=features[6].id, level=5),
        ClassFeatures(classID=rogue.id, featureID=features[0].id, level=6),  # Expertise 2nd
        ClassFeatures(classID=rogue.id, featureID=features[7].id, level=7),
        ClassFeatures(classID=rogue.id, featureID=asi.id, level=8),
        ClassFeatures(classID=rogue.id, featureID=features[8].id, level=9),
        ClassFeatures(classID=rogue.id, featureID=asi.id, level=10),
        ClassFeatures(classID=rogue.id, featureID=asi.id, level=12),
        ClassFeatures(classID=rogue.id, featureID=features[9].id, level=14),
        ClassFeatures(classID=rogue.id, featureID=features[10].id, level=15),
        ClassFeatures(classID=rogue.id, featureID=asi.id, level=16),
        ClassFeatures(classID=rogue.id, featureID=features[11].id, level=18),
        ClassFeatures(classID=rogue.id, featureID=asi.id, level=19),
        ClassFeatures(classID=rogue.id, featureID=features[12].id, level=20)
    ]
    session.add_all(rogue_levels)
    session.commit()

    # === SUBCLASSES ===
    # Thief
    thief = Subclass(class_id=rogue.id, name="Thief", subclass_flavor="Roguish Archetype")
    session.add(thief)
    session.commit()

    thief_features = [
        Features(
            name="Fast Hands",
            desc="Starting at 3rd level, you can use the bonus action granted by your Cunning Action to make a Dexterity (Sleight of Hand) check, use your thieves' tools to disarm a trap or open a lock, or take the Use an Object action.",
            properties={}
        ),
        Features(
            name="Second-Story Work",
            desc="When you choose this archetype at 3rd level, you gain the ability to climb faster than normal; climbing no longer costs you extra movement. In addition, when you make a running jump, the distance you cover increases by a number of feet equal to your Dexterity modifier.",
            properties={}
        ),
        Features(
            name="Supreme Sneak",
            desc="Starting at 9th level, you have advantage on a Dexterity (Stealth) check if you move no more than half your speed on the same turn.",
            properties={}
        ),
        Features(
            name="Use Magic Device",
            desc="By 13th level, you have learned enough about the workings of magic that you can improvise the use of items even when they are not intended for you. You ignore all class, race, and level requirements on the use of magic items.",
            properties={}
        ),
        Features(
            name="Thief's Reflexes",
            desc="When you reach 17th level, you have become adept at laying ambushes and quickly escaping danger. You can take two turns during the first round of any combat. You take your first turn at your normal initiative and your second turn at your initiative minus 10. You can't use this feature when you are surprised.",
            properties={}
        )
    ]
    session.add_all(thief_features)
    session.commit()
    session.add_all([ClassFeatures(classID=rogue.id, subclassID=thief.id, featureID=f.id, level=l) for f, l in zip(thief_features, [3, 3, 9, 13, 17])])
    session.commit()

    # Assassin
    assassin = Subclass(class_id=rogue.id, name="Assassin", subclass_flavor="Roguish Archetype")
    session.add(assassin)
    session.commit()

    assassin_features = [
        Features(
            name="Bonus Proficiencies",
            desc="When you choose this archetype at 3rd level, you gain proficiency with the disguise kit and the poisoner's kit.",
            properties={}
        ),
        Features(
            name="Assassinate",
            desc="Starting at 3rd level, you are at your deadliest when you get the drop on your enemies. You have advantage on attack rolls against any creature that hasn't taken a turn in the combat yet. In addition, any hit you score against a creature that is surprised is a critical hit.",
            properties={}
        ),
        Features(
            name="Infiltration Expertise",
            desc="Starting at 9th level, you can unfailingly create false identities for yourself. You must spend seven days and 25 gp to establish the history, profession, and affiliations for an identity. You can't establish an identity that belongs to someone else. Thereafter, if you adopt the new identity as a disguise, other creatures believe you to be that person until given an obvious reason not to.",
            properties={}
        ),
        Features(
            name="Impostor",
            desc="At 13th level, you gain the ability to unerringly mimic another person's speech, writing, and behavior. You must spend at least three hours studying these three components of the person's behavior, listening to speech, examining handwriting, and observing mannerisms. Your ruse is indiscernible to the casual observer. If a wary creature suspects something is amiss, you have advantage on any Charisma (Deception) check you make to avoid detection.",
            properties={}
        ),
        Features(
            name="Death Strike",
            desc="Starting at 17th level, you become a master of instant death. When you attack and hit a creature that is surprised, it must make a Constitution saving throw (DC 8 + your Dexterity modifier + your proficiency bonus). On a failed save, double the damage of your attack against the creature.",
            properties={}
        )
    ]
    session.add_all(assassin_features)
    session.commit()
    session.add_all([ClassFeatures(classID=rogue.id, subclassID=assassin.id, featureID=f.id, level=l) for f, l in zip(assassin_features, [3, 3, 9, 13, 17])])
    session.commit()

    print(f"✅ Created Rogue class with {rogue.id}")


def create_sorcerer():
    sorcerer = DnDclass(
        name='Sorcerer',
        hit_dice=6,
        primary_ability="CHA",
        saving_throws=["CON", "CHA"],
        armor_proficiencies=[],
        weapon_proficiencies=["Daggers", "Darts", "Slings", "Quarterstaffs", "Light Crossbows"],
        tool_proficiencies=[],
        skill_choices={"n_choices": 2, "options": ["Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"]}
    )
    session.add(sorcerer)
    session.commit()

    features = [
        Features(
            name='Spellcasting',
            desc="An event in your past, or in the life of a parent or ancestor, left an indelible mark on you, infusing you with arcane magic. This font of magic, whatever its origin, fuels your spells. Charisma is your spellcasting ability for your sorcerer spells.",
            properties={'spellcasting_ability': 'CHA'}
        ),
        Features(
            name='Sorcerous Origin',
            desc="Choose a sorcerous origin, which describes the source of your innate magical power. Your choice grants you features when you choose it at 1st level and again at 6th, 14th, and 18th level.",
            properties={}
        ),
        Features(
            name='Font of Magic',
            desc="At 2nd level, you tap into a deep wellspring of magic within yourself. This wellspring is represented by sorcery points, which allow you to create a variety of magical effects. You have 2 sorcery points, and you gain more as you reach higher levels. You can never have more sorcery points than shown on the table for your level. You regain all spent sorcery points when you finish a long rest.",
            properties={'sorcery_points': 2}
        ),
        Features(
            name='Metamagic',
            desc="At 3rd level, you gain the ability to twist your spells to suit your needs. You gain two Metamagic options of your choice. You gain another one at 10th and 17th level. You can use only one Metamagic option on a spell when you cast it, unless otherwise noted.",
            properties={'options_known': 2}
        ),
        Features(
            name='Ability Score Improvement',
            desc="When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1.",
            properties={}
        ),
        Features(
            name='Sorcerous Restoration',
            desc="At 20th level, you regain 4 expended sorcery points whenever you finish a short rest.",
            properties={'sorcery_points_recovered': 4}
        )
    ]
    session.add_all(features)
    session.commit()

    # Sorcery Points progression
    font_of_magic = features[2]
    sorcery_levels = [
        FeatureLevel(featureID=font_of_magic.id, level=2, attributes={'points': 2}),
        FeatureLevel(featureID=font_of_magic.id, level=3, attributes={'points': 3}),
        FeatureLevel(featureID=font_of_magic.id, level=4, attributes={'points': 4}),
        FeatureLevel(featureID=font_of_magic.id, level=5, attributes={'points': 5}),
        FeatureLevel(featureID=font_of_magic.id, level=6, attributes={'points': 6}),
        FeatureLevel(featureID=font_of_magic.id, level=7, attributes={'points': 7}),
        FeatureLevel(featureID=font_of_magic.id, level=8, attributes={'points': 8}),
        FeatureLevel(featureID=font_of_magic.id, level=9, attributes={'points': 9}),
        FeatureLevel(featureID=font_of_magic.id, level=10, attributes={'points': 10}),
        FeatureLevel(featureID=font_of_magic.id, level=11, attributes={'points': 11}),
        FeatureLevel(featureID=font_of_magic.id, level=12, attributes={'points': 12}),
        FeatureLevel(featureID=font_of_magic.id, level=13, attributes={'points': 13}),
        FeatureLevel(featureID=font_of_magic.id, level=14, attributes={'points': 14}),
        FeatureLevel(featureID=font_of_magic.id, level=15, attributes={'points': 15}),
        FeatureLevel(featureID=font_of_magic.id, level=16, attributes={'points': 16}),
        FeatureLevel(featureID=font_of_magic.id, level=17, attributes={'points': 17}),
        FeatureLevel(featureID=font_of_magic.id, level=18, attributes={'points': 18}),
        FeatureLevel(featureID=font_of_magic.id, level=19, attributes={'points': 19}),
        FeatureLevel(featureID=font_of_magic.id, level=20, attributes={'points': 20}),
    ]
    session.add_all(sorcery_levels)
    session.commit()

    asi = session.query(Features).filter_by(name="Ability Score Improvement").first()
    sorcerer_levels = [
        ClassFeatures(classID=sorcerer.id, featureID=features[0].id, level=1),
        ClassFeatures(classID=sorcerer.id, featureID=features[1].id, level=1),
        ClassFeatures(classID=sorcerer.id, featureID=features[2].id, level=2),
        ClassFeatures(classID=sorcerer.id, featureID=features[3].id, level=3),
        ClassFeatures(classID=sorcerer.id, featureID=asi.id, level=4),
        ClassFeatures(classID=sorcerer.id, featureID=asi.id, level=8),
        ClassFeatures(classID=sorcerer.id, featureID=asi.id, level=12),
        ClassFeatures(classID=sorcerer.id, featureID=asi.id, level=16),
        ClassFeatures(classID=sorcerer.id, featureID=features[5].id, level=20)
    ]
    session.add_all(sorcerer_levels)
    session.commit()

    # === SUBCLASSES ===
    # Draconic Bloodline
    draconic = Subclass(class_id=sorcerer.id, name="Draconic Bloodline", subclass_flavor="Sorcerous Origin")
    session.add(draconic)
    session.commit()

    draconic_features = [
        Features(
            name="Dragon Ancestor",
            desc="At 1st level, you choose one type of dragon as your ancestor. The damage type associated with each dragon is used by features you gain later. You can speak, read, and write Draconic. Additionally, whenever you make a Charisma check when interacting with dragons, your proficiency bonus is doubled if it applies to the check.",
            properties={}
        ),
        Features(
            name="Draconic Resilience",
            desc="As magic flows through your body, it causes physical traits of your dragon ancestors to emerge. At 1st level, your hit point maximum increases by 1 and increases by 1 again whenever you gain a level in this class. Additionally, parts of your skin are covered by a thin sheen of dragon-like scales. When you aren't wearing armor, your AC equals 13 + your Dexterity modifier.",
            properties={'ac': '13 + DEX'}
        ),
        Features(
            name="Elemental Affinity",
            desc="Starting at 6th level, when you cast a spell that deals damage of the type associated with your draconic ancestry, you can add your Charisma modifier to one damage roll of that spell. At the same time, you can spend 1 sorcery point to gain resistance to that damage type for 1 hour.",
            properties={}
        ),
        Features(
            name="Dragon Wings",
            desc="At 14th level, you gain the ability to sprout a pair of dragon wings from your back, gaining a flying speed equal to your current speed. You can create these wings as a bonus action on your turn. They last until you dismiss them as a bonus action on your turn. You can't manifest your wings while wearing armor unless the armor is made to accommodate them, and clothing not made to accommodate your wings might be destroyed when you manifest them.",
            properties={'flying_speed': 'equal to speed'}
        ),
        Features(
            name="Draconic Presence",
            desc="Beginning at 18th level, you can channel the dread presence of your dragon ancestor, causing those around you to become awestruck or frightened. As an action, you can spend 5 sorcery points to draw on this power and exude an aura of awe or fear (your choice) to a distance of 60 feet. For 1 minute or until you lose your concentration (as if you were casting a concentration spell), each hostile creature that starts its turn in this aura must succeed on a Wisdom saving throw or be charmed (if you chose awe) or frightened (if you chose fear) until the aura ends.",
            properties={'sorcery_cost': 5, 'range': 60}
        )
    ]
    session.add_all(draconic_features)
    session.commit()
    session.add_all([ClassFeatures(classID=sorcerer.id, subclassID=draconic.id, featureID=f.id, level=l) for f, l in zip(draconic_features, [1, 1, 6, 14, 18])])
    session.commit()

    # Wild Magic
    wild_magic = Subclass(class_id=sorcerer.id, name="Wild Magic", subclass_flavor="Sorcerous Origin")
    session.add(wild_magic)
    session.commit()

    wild_magic_features = [
        Features(
            name="Wild Magic Surge",
            desc="Starting when you choose this origin at 1st level, your spellcasting can unleash surges of untamed magic. Immediately after you cast a sorcerer spell of 1st level or higher, the DM can have you roll a d20. If you roll a 1, roll on the Wild Magic Surge table to create a random magical effect.",
            properties={}
        ),
        Features(
            name="Tides of Chaos",
            desc="Starting at 1st level, you can manipulate the forces of chance and chaos to gain advantage on one attack roll, ability check, or saving throw. Once you do so, you must finish a long rest before you can use this feature again. Any time before you regain the use of this feature, the DM can have you roll on the Wild Magic Surge table immediately after you cast a sorcerer spell of 1st level or higher. You then regain the use of this feature.",
            properties={'uses': '1 per long rest'}
        ),
        Features(
            name="Bend Luck",
            desc="Starting at 6th level, you have the ability to twist fate using your wild magic. When another creature you can see makes an attack roll, an ability check, or a saving throw, you can use your reaction and spend 2 sorcery points to roll 1d4 and apply the number rolled as a bonus or penalty (your choice) to the creature's roll. You can do so after the creature rolls but before any effects of the roll occur.",
            properties={'sorcery_cost': 2}
        ),
        Features(
            name="Controlled Chaos",
            desc="At 14th level, you gain a modicum of control over the surges of your wild magic. Whenever you roll on the Wild Magic Surge table, you can roll twice and use either number.",
            properties={}
        ),
        Features(
            name="Spell Bombardment",
            desc="Beginning at 18th level, the harmful energy of your spells intensifies. When you roll damage for a spell and roll the highest number possible on any of the dice, choose one of those dice, roll it again and add that roll to the damage. You can use the feature only once per turn.",
            properties={}
        )
    ]
    session.add_all(wild_magic_features)
    session.commit()
    session.add_all([ClassFeatures(classID=sorcerer.id, subclassID=wild_magic.id, featureID=f.id, level=l) for f, l in zip(wild_magic_features, [1, 1, 6, 14, 18])])
    session.commit()

    print(f"✅ Created Sorcerer class with {sorcerer.id}")


def create_warlock():
    warlock = DnDclass(
        name='Warlock',
        hit_dice=8,
        primary_ability="CHA",
        saving_throws=["WIS", "CHA"],
        armor_proficiencies=["Light"],
        weapon_proficiencies=["Simple"],
        tool_proficiencies=[],
        skill_choices={"n_choices": 2, "options": ["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"]}
    )
    session.add(warlock)
    session.commit()

    features = [
        Features(
            name='Otherworldly Patron',
            desc="At 1st level, you have struck a bargain with an otherworldly being of your choice. Your choice grants you features at 1st level and again at 6th, 10th, and 14th level.",
            properties={}
        ),
        Features(
            name='Pact Magic',
            desc="Your arcane research and the magic bestowed on you by your patron have given you facility with spells. Charisma is your spellcasting ability for your warlock spells. You regain all expended spell slots when you finish a short or long rest.",
            properties={'spellcasting_ability': 'CHA', 'slot_recovery': 'short rest'}
        ),
        Features(
            name='Eldritch Invocations',
            desc="In your study of occult lore, you have unearthed eldritch invocations, fragments of forbidden knowledge that imbue you with an abiding magical ability. At 2nd level, you gain two eldritch invocations of your choice. When you gain certain warlock levels, you gain additional invocations of your choice. Additionally, when you gain a level in this class, you can choose one of the invocations you know and replace it with another invocation that you could learn at that level.",
            properties={'invocations_known': 2}
        ),
        Features(
            name='Pact Boon',
            desc="At 3rd level, your otherworldly patron bestows a gift upon you for your loyal service. You gain one of the following features of your choice: Pact of the Chain, Pact of the Blade, or Pact of the Tome.",
            properties={}
        ),
        Features(
            name='Ability Score Improvement',
            desc="When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1.",
            properties={}
        ),
        Features(
            name='Mystic Arcanum',
            desc="Starting at 11th level, your patron bestows upon you a magical secret called an arcanum. Choose one 6th-level spell from the warlock spell list as this arcanum. You can cast your arcanum spell once without expending a spell slot. You must finish a long rest before you can do so again. At higher levels, you gain more arcanum spells.",
            properties={}
        ),
        Features(
            name='Eldritch Master',
            desc="At 20th level, you can draw on your inner reserve of mystical power while entreating your patron to regain expended spell slots. You can spend 1 minute entreating your patron for aid to regain all your expended spell slots from your Pact Magic feature. Once you regain spell slots with this feature, you must finish a long rest before you can do so again.",
            properties={'uses': '1 per long rest'}
        )
    ]
    session.add_all(features)
    session.commit()

    # Pact Magic progression
    pact_magic = features[1]
    pact_levels = [
        FeatureLevel(featureID=pact_magic.id, level=1, attributes={'slots': 1, 'slot_level': 1}),
        FeatureLevel(featureID=pact_magic.id, level=2, attributes={'slots': 2, 'slot_level': 1}),
        FeatureLevel(featureID=pact_magic.id, level=3, attributes={'slots': 2, 'slot_level': 2}),
        FeatureLevel(featureID=pact_magic.id, level=4, attributes={'slots': 2, 'slot_level': 2}),
        FeatureLevel(featureID=pact_magic.id, level=5, attributes={'slots': 2, 'slot_level': 3}),
        FeatureLevel(featureID=pact_magic.id, level=6, attributes={'slots': 2, 'slot_level': 3}),
        FeatureLevel(featureID=pact_magic.id, level=7, attributes={'slots': 2, 'slot_level': 4}),
        FeatureLevel(featureID=pact_magic.id, level=8, attributes={'slots': 2, 'slot_level': 4}),
        FeatureLevel(featureID=pact_magic.id, level=9, attributes={'slots': 2, 'slot_level': 5}),
        FeatureLevel(featureID=pact_magic.id, level=10, attributes={'slots': 2, 'slot_level': 5}),
        FeatureLevel(featureID=pact_magic.id, level=11, attributes={'slots': 3, 'slot_level': 5}),
        FeatureLevel(featureID=pact_magic.id, level=16, attributes={'slots': 4, 'slot_level': 5}),
    ]
    session.add_all(pact_levels)
    session.commit()

    # Eldritch Invocations progression
    invocations = features[2]
    invocation_levels = [
        FeatureLevel(featureID=invocations.id, level=2, attributes={'known': 2}),
        FeatureLevel(featureID=invocations.id, level=5, attributes={'known': 3}),
        FeatureLevel(featureID=invocations.id, level=7, attributes={'known': 4}),
        FeatureLevel(featureID=invocations.id, level=9, attributes={'known': 5}),
        FeatureLevel(featureID=invocations.id, level=12, attributes={'known': 6}),
        FeatureLevel(featureID=invocations.id, level=15, attributes={'known': 7}),
        FeatureLevel(featureID=invocations.id, level=18, attributes={'known': 8}),
    ]
    session.add_all(invocation_levels)
    session.commit()

    asi = session.query(Features).filter_by(name="Ability Score Improvement").first()
    warlock_levels = [
        ClassFeatures(classID=warlock.id, featureID=features[0].id, level=1),
        ClassFeatures(classID=warlock.id, featureID=features[1].id, level=1),
        ClassFeatures(classID=warlock.id, featureID=features[2].id, level=2),
        ClassFeatures(classID=warlock.id, featureID=features[3].id, level=3),
        ClassFeatures(classID=warlock.id, featureID=asi.id, level=4),
        ClassFeatures(classID=warlock.id, featureID=asi.id, level=8),
        ClassFeatures(classID=warlock.id, featureID=features[5].id, level=11),
        ClassFeatures(classID=warlock.id, featureID=asi.id, level=12),
        ClassFeatures(classID=warlock.id, featureID=features[5].id, level=13),  # 7th level arcanum
        ClassFeatures(classID=warlock.id, featureID=features[5].id, level=15),  # 8th level arcanum
        ClassFeatures(classID=warlock.id, featureID=asi.id, level=16),
        ClassFeatures(classID=warlock.id, featureID=features[5].id, level=17),  # 9th level arcanum
        ClassFeatures(classID=warlock.id, featureID=asi.id, level=19),
        ClassFeatures(classID=warlock.id, featureID=features[6].id, level=20)
    ]
    session.add_all(warlock_levels)
    session.commit()

    # === SUBCLASSES (Patrons) ===
    # The Fiend
    fiend = Subclass(class_id=warlock.id, name="The Fiend", subclass_flavor="Otherworldly Patron")
    session.add(fiend)
    session.commit()

    fiend_features = [
        Features(
            name="Expanded Spell List",
            desc="The Fiend lets you choose from an expanded list of spells when you learn a warlock spell.",
            properties={'always_prepared': True}
        ),
        Features(
            name="Dark One's Blessing",
            desc="Starting at 1st level, when you reduce a hostile creature to 0 hit points, you gain temporary hit points equal to your Charisma modifier + your warlock level (minimum of 1).",
            properties={}
        ),
        Features(
            name="Dark One's Own Luck",
            desc="Starting at 6th level, you can call on your patron to alter fate in your favor. When you make an ability check or a saving throw, you can use this feature to add a d10 to your roll. You can do so after seeing the initial roll but before any of the roll's effects occur. Once you use this feature, you can't use it again until you finish a short or long rest.",
            properties={'uses': '1 per short rest'}
        ),
        Features(
            name="Fiendish Resilience",
            desc="Starting at 10th level, you can choose one damage type when you finish a short or long rest. You gain resistance to that damage type until you choose a different one with this feature. Damage from magical weapons or silver weapons ignores this resistance.",
            properties={}
        ),
        Features(
            name="Hurl Through Hell",
            desc="Starting at 14th level, when you hit a creature with an attack, you can use this feature to instantly transport the target through the lower planes. The creature disappears and hurtles through a nightmare landscape. At the end of your next turn, the target returns to the space it previously occupied, or the nearest unoccupied space. If the target is not a fiend, it takes 10d10 psychic damage as it reels from its horrific experience. Once you use this feature, you can't use it again until you finish a long rest.",
            properties={'damage': '10d10 psychic', 'uses': '1 per long rest'}
        )
    ]
    session.add_all(fiend_features)
    session.commit()
    session.add_all([ClassFeatures(classID=warlock.id, subclassID=fiend.id, featureID=f.id, level=l) for f, l in zip(fiend_features, [1, 1, 6, 10, 14])])
    session.commit()

    # The Great Old One
    great_old_one = Subclass(class_id=warlock.id, name="The Great Old One", subclass_flavor="Otherworldly Patron")
    session.add(great_old_one)
    session.commit()

    great_old_one_features = [
        Features(
            name="Expanded Spell List",
            desc="The Great Old One lets you choose from an expanded list of spells when you learn a warlock spell.",
            properties={'always_prepared': True}
        ),
        Features(
            name="Awakened Mind",
            desc="Starting at 1st level, your alien knowledge gives you the ability to touch the minds of other creatures. You can telepathically speak to any creature you can see within 30 feet of you. You don't need to share a language with the creature for it to understand your telepathic utterances, but the creature must be able to understand at least one language.",
            properties={'range': 30}
        ),
        Features(
            name="Entropic Ward",
            desc="At 6th level, you learn to magically ward yourself against attack and to turn an enemy's failed strike into good luck for yourself. When a creature makes an attack roll against you, you can use your reaction to impose disadvantage on that roll. If the attack misses you, your next attack roll against the creature has advantage if you make it before the end of your next turn. Once you use this feature, you can't use it again until you finish a short or long rest.",
            properties={'uses': '1 per short rest'}
        ),
        Features(
            name="Thought Shield",
            desc="Starting at 10th level, your thoughts can't be read by telepathy or other means unless you allow it. You also have resistance to psychic damage, and whenever a creature deals psychic damage to you, that creature takes the same amount of damage that you do.",
            properties={}
        ),
        Features(
            name="Create Thrall",
            desc="At 14th level, you gain the ability to infect a humanoid's mind with the alien magic of your patron. You can use your action to touch an incapacitated humanoid. That creature is then charmed by you until a remove curse spell is cast on it, the charmed condition is removed from it, or you use this feature again. You can communicate telepathically with the charmed creature as long as the two of you are on the same plane of existence.",
            properties={}
        )
    ]
    session.add_all(great_old_one_features)
    session.commit()
    session.add_all([ClassFeatures(classID=warlock.id, subclassID=great_old_one.id, featureID=f.id, level=l) for f, l in zip(great_old_one_features, [1, 1, 6, 10, 14])])
    session.commit()

    print(f"✅ Created Warlock class with {warlock.id}")


def create_wizard():
    wizard = DnDclass(
        name='Wizard',
        hit_dice=6,
        primary_ability="INT",
        saving_throws=["INT", "WIS"],
        armor_proficiencies=[],
        weapon_proficiencies=["Daggers", "Darts", "Slings", "Quarterstaffs", "Light Crossbows"],
        tool_proficiencies=[],
        skill_choices={"n_choices": 2, "options": ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"]}
    )
    session.add(wizard)
    session.commit()

    features = [
        Features(
            name='Spellcasting',
            desc="As a student of arcane magic, you have a spellbook containing spells that show the first glimmerings of your true power. Intelligence is your spellcasting ability for your wizard spells.",
            properties={'spellcasting_ability': 'INT'}
        ),
        Features(
            name='Arcane Recovery',
            desc="You have learned to regain some of your magical energy by studying your spellbook. Once per day when you finish a short rest, you can choose expended spell slots to recover. The spell slots can have a combined level that is equal to or less than half your wizard level (rounded up), and none of the slots can be 6th level or higher.",
            properties={'uses': '1 per day'}
        ),
        Features(
            name='Arcane Tradition',
            desc="When you reach 2nd level, you choose an arcane tradition, shaping your practice of magic through one of eight schools. Your choice grants you features at 2nd level and again at 6th, 10th, and 14th level.",
            properties={}
        ),
        Features(
            name='Ability Score Improvement',
            desc="When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1.",
            properties={}
        ),
        Features(
            name='Spell Mastery',
            desc="At 18th level, you have achieved such mastery over certain spells that you can cast them at will. Choose a 1st-level wizard spell and a 2nd-level wizard spell that are in your spellbook. You can cast those spells at their lowest level without expending a spell slot when you have them prepared.",
            properties={}
        ),
        Features(
            name='Signature Spells',
            desc="When you reach 20th level, you gain mastery over two powerful spells and can cast them with little effort. Choose two 3rd-level wizard spells in your spellbook as your signature spells. You always have these spells prepared, they don't count against the number of spells you have prepared, and you can cast each of them once at 3rd level without expending a spell slot. When you do so, you can't do so again until you finish a short or long rest.",
            properties={'uses': '1 per short rest per spell'}
        )
    ]
    session.add_all(features)
    session.commit()

    asi = session.query(Features).filter_by(name="Ability Score Improvement").first()
    wizard_levels = [
        ClassFeatures(classID=wizard.id, featureID=features[0].id, level=1),
        ClassFeatures(classID=wizard.id, featureID=features[1].id, level=1),
        ClassFeatures(classID=wizard.id, featureID=features[2].id, level=2),
        ClassFeatures(classID=wizard.id, featureID=asi.id, level=4),
        ClassFeatures(classID=wizard.id, featureID=asi.id, level=8),
        ClassFeatures(classID=wizard.id, featureID=asi.id, level=12),
        ClassFeatures(classID=wizard.id, featureID=asi.id, level=16),
        ClassFeatures(classID=wizard.id, featureID=features[4].id, level=18),
        ClassFeatures(classID=wizard.id, featureID=asi.id, level=19),
        ClassFeatures(classID=wizard.id, featureID=features[5].id, level=20)
    ]
    session.add_all(wizard_levels)
    session.commit()

    # === SUBCLASSES (Schools of Magic) ===
    # School of Evocation
    evocation = Subclass(class_id=wizard.id, name="School of Evocation", subclass_flavor="Arcane Tradition")
    session.add(evocation)
    session.commit()

    evocation_features = [
        Features(
            name="Evocation Savant",
            desc="Beginning when you select this school at 2nd level, the gold and time you must spend to copy an evocation spell into your spellbook is halved.",
            properties={}
        ),
        Features(
            name="Sculpt Spells",
            desc="Beginning at 2nd level, you can create pockets of relative safety within the effects of your evocation spells. When you cast an evocation spell that affects other creatures that you can see, you can choose a number of them equal to 1 + the spell's level. The chosen creatures automatically succeed on their saving throws against the spell, and they take no damage if they would normally take half damage on a successful save.",
            properties={}
        ),
        Features(
            name="Potent Cantrip",
            desc="Starting at 6th level, your damaging cantrips affect even creatures that avoid the brunt of the effect. When a creature succeeds on a saving throw against your cantrip, the creature takes half the cantrip's damage (if any) but suffers no additional effect from the cantrip.",
            properties={}
        ),
        Features(
            name="Empowered Evocation",
            desc="Beginning at 10th level, you can add your Intelligence modifier to one damage roll of any wizard evocation spell you cast.",
            properties={}
        ),
        Features(
            name="Overchannel",
            desc="Starting at 14th level, you can increase the power of your simpler spells. When you cast a wizard spell of 1st through 5th level that deals damage, you can deal maximum damage with that spell. The first time you do so, you suffer no adverse effect. If you use this feature again before you finish a long rest, you take 2d12 necrotic damage for each level of the spell, immediately after you cast it. Each time you use this feature again before finishing a long rest, the necrotic damage per spell level increases by 1d12. This damage ignores resistance and immunity.",
            properties={'damage': '2d12 necrotic per spell level'}
        )
    ]
    session.add_all(evocation_features)
    session.commit()
    session.add_all([ClassFeatures(classID=wizard.id, subclassID=evocation.id, featureID=f.id, level=l) for f, l in zip(evocation_features, [2, 2, 6, 10, 14])])
    session.commit()

    # School of Abjuration
    abjuration = Subclass(class_id=wizard.id, name="School of Abjuration", subclass_flavor="Arcane Tradition")
    session.add(abjuration)
    session.commit()

    abjuration_features = [
        Features(
            name="Abjuration Savant",
            desc="Beginning when you select this school at 2nd level, the gold and time you must spend to copy an abjuration spell into your spellbook is halved.",
            properties={}
        ),
        Features(
            name="Arcane Ward",
            desc="Starting at 2nd level, you can weave magic around yourself for protection. When you cast an abjuration spell of 1st level or higher, you can simultaneously use a strand of the spell's magic to create a magical ward on yourself that lasts until you finish a long rest. The ward has hit points equal to twice your wizard level + your Intelligence modifier. Whenever you take damage, the ward takes the damage instead. If this damage reduces the ward to 0 hit points, you take any remaining damage. While the ward has 0 hit points, it can't absorb damage, but its magic remains. Whenever you cast an abjuration spell of 1st level or higher, the ward regains a number of hit points equal to twice the level of the spell.",
            properties={'hp': '2 × wizard level + INT mod'}
        ),
        Features(
            name="Projected Ward",
            desc="Starting at 6th level, when a creature that you can see within 30 feet of you takes damage, you can use your reaction to cause your Arcane Ward to absorb that damage. If this damage reduces the ward to 0 hit points, the warded creature takes any remaining damage.",
            properties={'range': 30}
        ),
        Features(
            name="Improved Abjuration",
            desc="Beginning at 10th level, when you cast an abjuration spell that requires you to make an ability check as a part of casting that spell (as in counterspell and dispel magic), you add your proficiency bonus to that ability check.",
            properties={}
        ),
        Features(
            name="Spell Resistance",
            desc="Starting at 14th level, you have advantage on saving throws against spells. Furthermore, you have resistance against the damage of spells.",
            properties={}
        )
    ]
    session.add_all(abjuration_features)
    session.commit()
    session.add_all([ClassFeatures(classID=wizard.id, subclassID=abjuration.id, featureID=f.id, level=l) for f, l in zip(abjuration_features, [2, 2, 6, 10, 14])])
    session.commit()

    print(f"✅ Created Wizard class with {wizard.id}")


def populate_all_classes():
    create_barbarian()
    create_druid()
    create_cleric()
    create_artificer()
    create_bard()
    create_fighter()
    create_paladin()
    create_ranger()
    create_rogue()
    create_sorcerer()
    create_warlock()
    create_wizard()