from Backend.models.species import Species, SpeciesTraits
from Backend.models.features import Features, FeatureLevel
from Backend.models.dndclass import DnDclass, ClassEquipment, ClassFeatures
from Backend.models.languages import Language, EntityLanguage, LanguageChoice, LanguageChoiceGroup
from Backend.models.proficiencies import Proficiency, ProficiencyChoice, ProficiencyChoiceGroup
from Backend.models import session

def create_barbarian():
    barbarian = DnDclass(
        name='Barbarian',
        hit_dice=12
    )
    session.add(barbarian)
    session.commit()

    # Defining Level 1 Features
    # 0 : Rage
    # 1 : Unarmored Defense
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
    
    barb_level_1 = [
        ClassFeatures(
            classID = barbarian.id,
            featureID = features[0].id, # rage
            level = 1
        ),
        ClassFeatures(
            classID = barbarian.id,
            featureID = features[1].id, # unarmored defense
            level = 1
        )
    ]
    session.add_all(barb_level_1)
    session.commit()
    

