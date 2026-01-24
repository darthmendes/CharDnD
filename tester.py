import Backend.models
from Backend.models.item import Item
from Backend.models.dndclass import DnDclass
from Backend.models.species import Species
from Backend.models.languages import Language
from Backend.models.background import Background
from Backend.models import session

"""
Database Population Tester
Toggle the imports/calls below to populate the database.
Recommended order: Languages -> Features -> Proficiencies -> Species -> Classes -> Items -> Backgrounds -> Link Traits
"""

# === Step 1: Populate Languages ===
# from populate.populate_languagesDB import add_languages
# add_languages()

# === Step 2: Populate Features ===
from populate.populate_featuresDB import add_features
add_features()

# === Step 3: Populate Proficiencies ===
# from populate.populate_proficienciesDB import add_proficiencies
# add_proficiencies()

# === Step 4: Populate Species ===
from populate.populate_speciesDB import add_species_and_subspecies, add_species_traits
add_species_and_subspecies()

# === Step 5: Link Species Traits ===
add_species_traits()

# === Step 6: Populate Classes ===
from populate.populate_classesDB import create_barbarian, create_druid
create_barbarian()
create_druid()

# === Step 7: Populate Items ===
from populate.populate_itemDB import add_items
add_items()

# === Step 8: Populate Backgrounds ===
from populate.populate_backgroundsDB import populate_backgrounds
populate_backgrounds()


# === Testing/Verification Queries ===
# Uncomment to test and view populated data

# druid = session.query(DnDclass).filter_by(name="Druid").first()
# if druid:
#     print(druid.to_dict())

# all_backgrounds = session.query(Background).all()
# for bg in all_backgrounds:
#     print(bg.to_dict())
# for item in all_items:
#     print(item.to_dict())

# all_species = session.query(Species).all()
# for species in all_species:
#     print(species.to_dict())
