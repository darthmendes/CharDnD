from Backend.models.features import Features, FeatureLevel
from Backend.models.dndclass import DnDclass, ClassEquipment, ClassFeatures
from Backend.models.item import Item, ItemChoiceGroup, ItemChoice
from Backend.models.languages import Language, EntityLanguage, LanguageChoice, LanguageChoiceGroup
from Backend.models.proficiencies import Proficiency, ProficiencyChoice, ProficiencyChoiceGroup, EntityProficiency
from Backend.models import session

def create_barbarian():
    barbarian = DnDclass(
        name='Barbarian',
        hit_dice=12
    )
    session.add(barbarian)
    session.commit()

    # Defining Barbarian Features
    # 0 : Rage
    # 1 : Unarmored Defense
    # 2 : Reckless Attack
    # 3 : Danger Sense
    # 4 : Primal Path
    # 5 : Primal Knowledge
    features = [
        Features(
            name='Rage',
            desc= "In battle, you fight with primal ferocity. On your turn, you can enter a rage as a bonus action. "
                  "While raging, you gain the following benefits if you aren't wearing heavy armor:"
                  "You have advantage on Strength checks and Strength saving throws. "
                  "When you make a melee weapon attack using Strength, you gain a bonus to the damage roll that increases as you gain levels as a barbarian, as shown in the Rage Damage column of the Barbarian table. "
                  "You have resistance to bludgeoning, piercing, and slashing damage. "
                  "If you are able to cast spells, you can't cast them or concentrate on them while raging."
                  "Your rage lasts for 1 minute. It ends early if you are knocked unconscious or if your turn ends and you haven't attacked a hostile creature since your last turn or taken damage since then. You can also end your rage on your turn as a bonus action. "
                  "Once you have raged the number of times shown for your barbarian level in the Rages column of the Barbarian table, you must finish a long rest before you can rage again.",
            properties={
                'charges': 2,
                'damage_bonus': 2
            }
        ),
        Features(
            name='Unarmored Defense',
            desc='While you are not wearing any armor, your armor class equals 10 + your Dexterity modifier + your Constitution modifier. You can use a shield and still gain this benefit.',
            # I have to update this use further down the line in code
            properties = { 
                'ac':'10+STR+DEX'
            }
        ),
        Features(
            name='Reckless Attack',
            desc= "Starting at 2nd level, you can throw aside all concern for defense to attack with fierce desperation. "
                  "When you make your first attack on your turn, you can decide to attack recklessly. "
                  "Doing so gives you advantage on melee weapon attack rolls using Strength during this turn, but attack rolls against you have advantage until your next turn."
        ),
        Features(
            name='Danger Sense',
            desc= "At 2nd level, you gain an uncanny sense of when things nearby aren't as they should be, giving you an edge when you dodge away from danger. "
                  "You have advantage on Dexterity saving throws against effects that you can see, such as traps and spells. "
                  "To gain this benefit, you can't be blinded, deafened, or incapacitated."
        ),
        Features(
            name="Primal Path",
            desc= "At 3rd level, you choose a path that shapes the nature of your rage. "
                  "Your choice grants you features at 3rd level and again at 6th, 10th, and 14th levels."
        ),
        Features(
            name='Primal Knowledge',
            desc='When you reach 3rd level and again at 10th level, you gain proficiency in one skill of your choice from the list of skills available to barbarians at 1st level.',
            properties= {
                "optional":True
            }
        )
    ]
    session.add_all(features)
    session.commit()

    # Adding Rage Levels/Changes to rage from levels
    rage = features[0]
    rage_levels = [
        FeatureLevel(
            featureID = rage.id,
            level = 1,
            attributes = {"charges":2, "damage_bonus":2}
        ),
        FeatureLevel(
            featureID = rage.id,
            level = 3,
            attributes = {"charges":3}
        ),
        FeatureLevel(
            featureID = rage.id,
            level = 6,
            attributes = {"charges":4}
        ),
        FeatureLevel(
            featureID = rage.id,
            level = 9,
            attributes = {"damage_bonus":3}
        ),
        FeatureLevel(
            featureID = rage.id,
            level = 12,
            attributes = {"charges":5}
        ),
        FeatureLevel(
            featureID = rage.id,
            level = 16,
            attributes = {"damage_bonus":4}
        ),
        FeatureLevel(
            featureID = rage.id,
            level = 17,
            attributes = {"charges":6}
        ),
        FeatureLevel(
            featureID = rage.id,
            level = 20,
            attributes = {"charges":"inf"}
        ),
    ]
    session.add_all(rage_levels)
    session.commit()
    
    # Ability Improvement Score
    asi = session.query(Features).filter_by(name="Ability Score Improvement").first()

    barb_levels = [
        ClassFeatures(
            classID = barbarian.id,
            featureID = features[0].id, # rage
            level = 1
        ),
        ClassFeatures(
            classID = barbarian.id,
            featureID = features[1].id, # unarmored defense
            level = 1
        ),
        ClassFeatures(
            classID = barbarian.id,
            featureID = features[2].id, # Reckless Attack
            level=2
        ),
        ClassFeatures(
            classID = barbarian.id,
            featureID = features[3].id, # Danger Sense
            level=2
        ),
        ClassFeatures(
            classID = barbarian.id,
            featureID = features[4].id, # Primal Path
            level=3
        ),
        ClassFeatures(
            classID = barbarian.id,
            featureID = features[5].id, # Primal Knowledge
            level=3
        ),
        ClassFeatures(
            classID = barbarian.id,
            featureID = asi.id, # Ability Score Improvement
            level=4
        ),
        ClassFeatures(
            classID = barbarian.id,
            featureID = asi.id, # Ability Score Improvement
            level=8
        ),
        ClassFeatures(
            classID = barbarian.id,
            featureID = asi.id, # Ability Score Improvement
            level=12
        ),
        ClassFeatures(
            classID = barbarian.id,
            featureID = asi.id, # Ability Score Improvement
            level=16
        ),
        ClassFeatures(
            classID = barbarian.id,
            featureID = asi.id, # Ability Score Improvement
            level=19
        )
    ]
    session.add_all(barb_levels)
    session.commit()
    

def create_druid():
    druid = DnDclass(
        name='Druid',
        hit_dice=8
    )
    session.add(druid)
    session.commit()

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
            properties = {
                "max_cr":0.25,
                "fly":False,
                "swim":False
            }
        ),
        Features(
            name='Druid Circle',
            desc="At 2nd level, you choose to identify with a circle of druids. Your choice grants you features at 2nd level and again at 6th, 10th, and 14th level."
        ),
        Features(
            name='Wild Companion',
            desc="At 2nd level, you gain the ability to summon a spirit that assumes an animal form: as an action, you can expend a use of your Wild Shape feature to cast the Find Familiar spell, without material components."
                "When you cast the spell in this way, the familiar is a fey instead of a beast, and the familiar disappears after a number of hours equal to half your druid level.",
            properties={
                "optional":True
            }
        ),
        Features(
            name="Cantrip Versatility",
            desc="Whenever you reach a level in this class that grants the Ability Score Improvement feature, you can replace one cantrip you learned from this class's Spellcasting feature with another cantrip from the druid spell list.",
            properties={
                "optional":True
            }
        )
    ]
    session.add_all(features)
    session.commit()
    
    asi = session.query(Features).filter_by(name="Ability Score Improvement").first()
    wildshape = features[1]
    wildshape_levels = [
        FeatureLevel(
            featureID = wildshape.id,
            level = 2,
            attributes = {
                "max_cr":0.25,
                "fly":False,
                "swim":False
                }
        ),        
        FeatureLevel(
            featureID = wildshape.id,
            level = 4,
            attributes = {
                "max_cr":0.5,
                "fly":False,
                "swim":True
                }
        ),
        FeatureLevel(
            featureID = wildshape.id,
            level = 8,
            attributes = {
                "max_cr":1,
                "fly":True,
                "swim":True
                }
        ),
    ]


    druid_levels = [
        ClassFeatures(
            classID = druid.id,
            featureID = features[0].id, # Ritual Casting 
            level = 1,
        ),
        ClassFeatures(
            classID = druid.id,
            featureID = features[2].id, # Druid Circle 
            level = 2,
        ),
        ClassFeatures(
            classID = druid.id,
            featureID = features[3].id, # Wild Companion 
            level = 2,
        ),
        ClassFeatures(
            classID = druid.id,
            featureID = wildshape.id,
            level = 2,
        ),
        ClassFeatures(
            classID = druid.id,
            featureID = asi.id, # Ability Score Improvement
            level = 4,
        ),
        ClassFeatures(
            classID = druid.id,
            featureID = features[4].id, # Cantrip Versatility
            level = 4,
        ),
        ClassFeatures(
            classID = druid.id,
            featureID = asi.id, # Ability Score Improvement
            level = 8,
        ),
        ClassFeatures(
            classID = druid.id,
            featureID = features[4].id, # Cantrip Versatility
            level = 8,
        ),
        ClassFeatures(
            classID = druid.id,
            featureID = asi.id, # Ability Score Improvement
            level = 12,
        ),
        ClassFeatures(
            classID = druid.id,
            featureID = features[4].id, # Cantrip Versatility
            level = 12,
        ),
        ClassFeatures(
            classID = druid.id,
            featureID = asi.id, # Ability Score Improvement
            level = 16,
        ),
        ClassFeatures(
            classID = druid.id,
            featureID = features[4].id, # Cantrip Versatility
            level = 16,
        ),
        ClassFeatures(
            classID = druid.id,
            featureID = asi.id, # Ability Score Improvement
            level = 19,
        ),
        ClassFeatures(
            classID = druid.id,
            featureID = features[4].id, # Cantrip Versatility
            level = 19,
        ),
    ]
    session.add_all(druid_levels)
    session.commit()

    herbalism_kit = session.query(Proficiency).filter_by(name="Herbalism Kit").first()
    druid_profs = [
        Proficiency(
            name='Druidic',
            type='language'
        ),
        EntityProficiency(
            sourceType = "class",
            sourceID = druid.id,
            proficiencyID = herbalism_kit.id

        )
    ]

    skill_profs = ProficiencyChoiceGroup(
        sourceType="class",
        sourceID=druid.id,
        name="druid-skill-proficiencies",
        n_choices=2
    )
    arcana = session.query(Proficiency).filter_by(name="Arcana").first()
    animal_handling= session.query(Proficiency).filter_by(name="Animal Handling").first()
    insight= session.query(Proficiency).filter_by(name="Insight").first()
    medicine= session.query(Proficiency).filter_by(name="Medicine").first()
    nature= session.query(Proficiency).filter_by(name="Nature").first()
    perception= session.query(Proficiency).filter_by(name="Perception").first()
    religion= session.query(Proficiency).filter_by(name="Religion").first()
    survival= session.query(Proficiency).filter_by(name="Survival").first()
    session.add_all(druid_profs)
    session.commit()

    skill_profs.choices = [
        ProficiencyChoice(proficiencyID=arcana.id),
        ProficiencyChoice(proficiencyID=animal_handling.id),
        ProficiencyChoice(proficiencyID=insight.id),
        ProficiencyChoice(proficiencyID=medicine.id),
        ProficiencyChoice(proficiencyID=nature.id),
        ProficiencyChoice(proficiencyID=perception.id),
        ProficiencyChoice(proficiencyID=religion.id),
        ProficiencyChoice(proficiencyID=survival.id)
        
    ]
    session.add_all([skill_profs])
    session.commit()

    # Wooden Shield or Any Simple weapon
    choice1= ItemChoiceGroup(
        sourceType="class",
        sourceID=druid.id,
        name="druid-choice-1",
        n_choices=1
    )
    wooden_shield = session.query(Item).filter_by(name="Wooden Shield").first()
    simple_weapon = session.query(Item).filter_by(name="Simple weapon").first()
    choice1.choices =[
        ItemChoice(itemID=wooden_shield.id),
        ItemChoice(itemID=simple_weapon.id)
    ]
    
    # Scimitar or Any Simple melee weapon
    choice2= ItemChoiceGroup(
        sourceType="class",
        sourceID=druid.id,
        name="druid-choice-2",
        n_choices=1
    )
    scimitar = session.query(Item).filter_by(name="Scimitar").first()
    simple_melee_weapon = session.query(Item).filter_by(name="Simple melee weapon").first()
    choice2.choices =[
        ItemChoice(itemID=scimitar.id),
        ItemChoice(itemID=simple_melee_weapon.id)
    ]
    session.add_all([choice1,choice2])
    session.commit()

    leather_armor = session.query(Item).filter_by(name="Leather", item_type="armor").first()
    explorers_pack = session.query(Item).filter_by(name="Explorer's Pack").first()
    druidic_focus = session.query(Item).filter_by(name="Druidic Focus").first()
    class_equipment=[
        ClassEquipment(
            classID = druid.id,
            itemID = leather_armor.id,
            quantity = 1
        ),
        ClassEquipment(
            classID = druid.id,
            itemID = explorers_pack.id,
            quantity = 1
        ),
        ClassEquipment(
            classID = druid.id,
            itemID = druidic_focus.id,
            quantity = 1
        )
    ]
    session.add_all(class_equipment)
    session.commit()