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


if __name__ == "__main__":
    create_barbarian()
    create_druid()
    print("✅ Classes and subclasses populated successfully!")