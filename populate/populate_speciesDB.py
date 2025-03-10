from Backend.models.species import Species, SpeciesTraits
from Backend.models.features import Features
from Backend.models.languages import Language, EntityLanguage, LanguageChoice, LanguageChoiceGroup
from Backend.models.proficiencies import Proficiency, ProficiencyChoice, ProficiencyChoiceGroup
from Backend.models import session

# Create Dwarf species 
def create_dwarf():
    dwarf = Species(
        name = "Dwarf",
        ability_bonuses = {"Constitution" : 2},
        size = "medium", 
        speed = "25"
    )

    darkvision = session.query(Features).filter_by(name='Darkvision').first()
    dwarven_resilience = session.query(Features).filter_by(name='Dwarven Resilience').first()
    stonecutting = session.query(Features).filter_by(name='Stonecunning').first()

    dwarf.traits = [
            SpeciesTraits(featureID=darkvision.id),
            SpeciesTraits(featureID=dwarven_resilience.id),
            SpeciesTraits(featureID=stonecutting.id)
    ]
    session.add(dwarf)
    session.commit()

    dwarf = session.query(Species).filter_by(name='Dwarf').first()

    tool_group = ProficiencyChoiceGroup(
        sourceType="species",
        sourceID=dwarf.id,
        name="Artisan's Tools",
        n_choices=1
    )

    smith_tools = session.query(Proficiency).filter_by(name="Smith's Tools").first()
    brewer_supplies = session.query(Proficiency).filter_by(name="Brewer's Supplies").first()
    mason_tools = session.query(Proficiency).filter_by(name="Mason's Tools").first()

    tool_group.choices = [
        ProficiencyChoice(proficiencyID=smith_tools.id),
        ProficiencyChoice(proficiencyID=brewer_supplies.id),
        ProficiencyChoice(proficiencyID=mason_tools.id)
    ]

    common = session.query(Language).filter_by(name="Common").first()
    dwarvish = session.query(Language).filter_by(name='Dwarvish').first()

    languages = [
        EntityLanguage(sourceType='species',
                       sourceID=dwarf.id,
                       languageID=common.id),
        EntityLanguage(sourceType='species',
                       sourceID=dwarf.id,
                       languageID=dwarvish.id)
    ]

    session.add_all([dwarf, tool_group])
    session.add_all(languages)
    session.commit()

def create_human():
    human = Species(
        name = "Human",
        ability_bonuses = {"Strenght":1, "Dexterity":1, "Constitution":1, "Intelligence":1, "Wisdom":1, "Charisma":1},
        size = "medium", 
        speed = "30"
    )
    session.add(human)
    human = session.query(Species).filter_by(name='Human').first()

    common = session.query(Language).filter_by(name="Common").first()

    languages = EntityLanguage(sourceType='species',
                       sourceID=human.id,
                       languageID=common.id)

    lang_group = LanguageChoiceGroup(
        sourceType="species",
        sourceID=human.id,
        name="human_languages",
        n_choices=1
    )

    for lang in session.query(Language).all():
        if lang.name != 'Common':
            lang_group.choices.append(LanguageChoice(languageID=lang.id))

    session.add_all([human, lang_group, languages])
    session.commit()
