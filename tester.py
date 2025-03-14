import Backend.models
from Backend.models.item import Item
from Backend.models.dndclass import DnDclass
from Backend.models.species import Species
from Backend.models.languages import Language
from Backend.models import session

from populate.populate_languagesDB import add_languages
add_languages()

from populate.populate_itemDB import add_items
add_items()

from populate.populate_featuresDB import add_features
add_features()

import populate.populate_proficienciesDB 

from populate.populate_speciesDB import create_dwarf, create_human
create_dwarf()
create_human()

from populate.populate_classesDB import create_barbarian, create_druid
create_barbarian()
create_druid


dwarf = session.query(DnDclass).filter_by(name="Druid").first()
print(dwarf.to_dict())

# all = session.query(Item).all()
# for feat in all:
#     print(feat.to_dict())
