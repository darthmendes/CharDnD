from Backend.models.proficiencies import Proficiency, ProficiencyChoiceGroup, ProficiencyChoice
from Backend.models.item import Item
from Backend.models.species import Species
from Backend.models import session

# Add Proficiencies to Proficiency list
smith_tools = session.query(Item).filter_by(name="Smith's Tools").first()
brewer_supplies = session.query(Item).filter_by(name="Brewer's Supplies").first()
mason_tools = session.query(Item).filter_by(name="Mason's Tools").first()

proficiencies = [
    Proficiency(name=smith_tools.name, type=smith_tools.item_type, itemID=smith_tools.id),
    Proficiency(name=brewer_supplies.name, type=brewer_supplies.item_type, itemID=brewer_supplies.id),
    Proficiency(name=mason_tools.name, type=mason_tools.item_type, itemID=mason_tools.id),
]

def add_proficiencies():
    session.add_all(proficiencies)
    session.commit()