from Backend.models.proficiencies import Proficiency, ProficiencyChoiceGroup, ProficiencyChoice
from Backend.models.item import Item
from Backend.models.species import Species
from Backend.models import session


def add_proficiency(name):
    aux = session.query(Item).filter_by(name=name).first()
    prof = Proficiency(name=aux.name,
                       type=aux.item_type,
                       itemID=aux.id)
    session.add(aux)
    session.commit

# Add Proficiencies to Proficiency list
add_proficiency("Smith's Tools")
add_proficiency("Brewer's Supplies")
add_proficiency("Mason's Tools")
add_proficiency("Herbalism Kit")
add_proficiency("Club")
add_proficiency("Dagger")
add_proficiency("Dart")
add_proficiency("Javelin")
add_proficiency("Mace")
add_proficiency("Quarterstaff")
add_proficiency("Scimitar")
add_proficiency("Sickle")
add_proficiency("Sling")
add_proficiency("Spear") 

# Make a category table?!
proficiencies = [
    Proficiency(name='Light Armor', type="category"),
    Proficiency(name='Medium Armor', type="category"),
    Proficiency(name='Shields', type="category"),
    Proficiency(name='Intelligence', type="saving-throw"),
    Proficiency(name='Wisdom', type="saving-throw"),
    Proficiency(name='Arcana', type="skill"),
    Proficiency(name='Animal Handling', type="skill"),
    Proficiency(name='Insight', type="skill"),
    Proficiency(name='Medicine', type="skill"),
    Proficiency(name='Nature', type="skill"),
    Proficiency(name='Perception', type="skill"),
    Proficiency(name='Religion', type="skill"),
    Proficiency(name='Survival', type="skill")
]
session.add_all(proficiencies)
session.commit()
