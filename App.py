#
# App To create a DnD Character
# Backend API layer — routes mapped to service layer.
#
# author: darthmendes
#

import logging
from flask import Blueprint, Flask, request, jsonify
from flask_cors import CORS
from http import HTTPStatus

# Configure logging
logger = logging.getLogger(__name__)

# Services
from Backend.services.CharacterService import CharacterService as Character
from Backend.services.SpeciesService import SpeciesService as Species
from Backend.services.ClassService import ClassService as DnDClass
from Backend.services.ItemService import ItemService as Item
from Backend.services.SpellService import SpellService as Spell

from Backend.constants import PACK_DEFINITIONS
from Backend.config import FLASK_DEBUG, FLASK_PORT, CORS_ORIGINS, SECRET_KEY

app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY
api_v1 = Blueprint('api_v1', __name__, url_prefix='/api/v1')

# CORS: Use environment-configured origins
if '*' in CORS_ORIGINS:
    CORS(app, origins='*')  # Development only
else:
    CORS(app, origins=CORS_ORIGINS)


################################################################
# Character Routes
################################################################

@api_v1.route('/characters/creator', methods=['POST'])
def create_character():
    """Create a new character with the provided data."""
    data = request.json
    if not data:
        return jsonify({"error": "Request body must be valid JSON"}), HTTPStatus.BAD_REQUEST

    # Frontend already sends lowercase ability scores, no transformation needed
    result = Character.new(data)
    if not result["success"]:
        if "already exists" in result["error"]:
            return jsonify({"error": result["error"]}), HTTPStatus.CONFLICT
        return jsonify({"error": result["error"]}), HTTPStatus.BAD_REQUEST

    return jsonify(result["data"]), HTTPStatus.CREATED


@api_v1.route('/characters/<int:id>', methods=['DELETE'])
def delete_character(id):
    """Delete a character by ID."""
    result = Character.delete(id)
    if not result["success"]:
        return jsonify({"error": result["error"]}), HTTPStatus.NOT_FOUND
    return jsonify({"message": result["message"]}), HTTPStatus.OK


@api_v1.route('/characters/<int:id>', methods=['GET'])
def get_character(id):
    """Retrieve a character by ID."""
    char = Character.get_byID(id)
    if not char:
        return jsonify({"error": "Character not found"}), HTTPStatus.NOT_FOUND
    return jsonify(char.to_dict()), HTTPStatus.OK


@api_v1.route('/characters', methods=['GET'])
def list_characters():
    """Retrieve a list of all characters."""
    chars = Character.get_all()
    result = [{"id": c.id, "name": c.name} for c in chars]
    return jsonify(result), HTTPStatus.OK


@api_v1.route('/characters/<int:charID>/items', methods=['POST'])
def add_item_to_character(charID):
    """Add an item or pack to a character's inventory."""
    data = request.json
    if not data:
        return jsonify({"error": "Request body must be valid JSON"}), HTTPStatus.BAD_REQUEST
    
    if 'pack_name' in data:
        result = Item.add_pack_to_character(charID, data['pack_name'])
    elif 'itemID' in data:
        result = Item.add_item_to_character(charID, data['itemID'], data.get('quantity', 1))
    else:
        return jsonify({"error": "Missing itemID or pack_name"}), HTTPStatus.BAD_REQUEST

    if result["success"]:
        # Fetch and return the updated character
        char = Character.get_byID(charID)
        if char:
            return jsonify(char.to_dict()), HTTPStatus.OK
        else:
            return jsonify(result), HTTPStatus.OK
    else:
        return jsonify(result), HTTPStatus.BAD_REQUEST


@api_v1.route('/characters/<int:charID>/inventory/<int:inventoryID>', methods=['DELETE'])
def delete_inventory_item(charID, inventoryID):
    """Delete an item from character's inventory."""
    result = Item.delete_inventory_item(inventoryID, charID)
    if result["success"]:
        char = Character.get_byID(charID)
        if char:
            return jsonify(char.to_dict()), HTTPStatus.OK
        return jsonify(result), HTTPStatus.OK
    else:
        return jsonify(result), HTTPStatus.BAD_REQUEST


@api_v1.route('/characters/<int:charID>/inventory/<int:inventoryID>/charges', methods=['PATCH'])
def update_item_charges(charID, inventoryID):
    """Update current charges of an inventory item."""
    data = request.json
    if not data or 'currentCharges' not in data:
        return jsonify({"error": "Missing currentCharges field"}), HTTPStatus.BAD_REQUEST
    
    # Validate currentCharges is a non-negative integer
    if not isinstance(data['currentCharges'], int) or data['currentCharges'] < 0:
        return jsonify({"error": "currentCharges must be a non-negative integer"}), HTTPStatus.BAD_REQUEST
    
    result = Item.update_item_charges(inventoryID, charID, data['currentCharges'])
    if result["success"]:
        char = Character.get_byID(charID)
        if char:
            return jsonify(char.to_dict()), HTTPStatus.OK
        return jsonify(result), HTTPStatus.OK
    else:
        return jsonify(result), HTTPStatus.BAD_REQUEST


@api_v1.route('/characters/<int:charID>/inventory/<int:inventoryID>/remove-one', methods=['PATCH'])
def remove_one_item(charID, inventoryID):
    """Remove 1 item from inventory (or delete entire entry if quantity is 1)."""
    result = Item.remove_one_item(inventoryID, charID)
    if result["success"]:
        char = Character.get_byID(charID)
        if char:
            return jsonify(char.to_dict()), HTTPStatus.OK
        return jsonify(result), HTTPStatus.OK
    else:
        return jsonify(result), HTTPStatus.BAD_REQUEST


@api_v1.route('/characters/<int:charID>/inventory/<int:inventoryID>/equip', methods=['PATCH'])
def equip_item(charID, inventoryID):
    """Equip an armor/shield item. Automatically unequips conflicting items."""
    result = Item.equip_item(inventoryID, charID)
    if result["success"]:
        char = Character.get_byID(charID)
        if char:
            return jsonify(char.to_dict()), HTTPStatus.OK
        return jsonify(result), HTTPStatus.OK
    else:
        return jsonify(result), HTTPStatus.BAD_REQUEST


@api_v1.route('/characters/<int:charID>/inventory/<int:inventoryID>/unequip', methods=['PATCH'])
def unequip_item(charID, inventoryID):
    """Unequip an armor/shield item."""
    result = Item.unequip_item(inventoryID, charID)
    if result["success"]:
        char = Character.get_byID(charID)
        if char:
            return jsonify(char.to_dict()), HTTPStatus.OK
        return jsonify(result), HTTPStatus.OK
    else:
        return jsonify(result), HTTPStatus.BAD_REQUEST


# app.py

@api_v1.route('/characters/<int:charID>/inventory/<int:inventoryID>/attune', methods=['PATCH'])
def attune_item(charID, inventoryID):
    """Attune to a magic item."""
    result = Item.attune_item(inventoryID, charID)
    if result["success"]:
        char = Character.get_byID(charID)
        if char:
            return jsonify(char.to_dict()), HTTPStatus.OK
        return jsonify(result), HTTPStatus.OK
    else:
        status = HTTPStatus.NOT_FOUND if "not found" in result.get("error", "").lower() else HTTPStatus.BAD_REQUEST
        return jsonify(result), status


@api_v1.route('/characters/<int:charID>/inventory/<int:inventoryID>/unattune', methods=['PATCH'])
def unattune_item(charID, inventoryID):
    """Unattune from a magic item."""
    result = Item.unattune_item(inventoryID, charID)
    if result["success"]:
        char = Character.get_byID(charID)
        if char:
            return jsonify(char.to_dict()), HTTPStatus.OK
        return jsonify(result), HTTPStatus.OK
    else:
        status = HTTPStatus.NOT_FOUND if "not found" in result.get("error", "").lower() else HTTPStatus.BAD_REQUEST
        return jsonify(result), status
    
################################################################
# Species Routes
################################################################

@api_v1.route('/species/creator', methods=['POST'])
def create_species():
    data = request.json
    if not data or 'name' not in data:
        return jsonify({"error": "Invalid species data"}), HTTPStatus.BAD_REQUEST

    result = Species.new(data)
    if not result["success"]:
        if "already exists" in result["error"]:
            return jsonify({"error": result["error"]}), HTTPStatus.CONFLICT
        return jsonify({"error": result["error"]}), HTTPStatus.BAD_REQUEST
    return jsonify({"message": "Species created"}), HTTPStatus.CREATED


@api_v1.route('/species/<int:id>', methods=['DELETE'])
def delete_species(id):
    result = Species.delete(id)
    if not result["success"]:
        return jsonify({"error": result["error"]}), HTTPStatus.NOT_FOUND
    return jsonify({"message": "Species deleted"}), HTTPStatus.OK


@api_v1.route('/species/<int:id>', methods=['GET'])
def get_species(id):
    result = Species.get_byID(id)
    if not result["success"]:
        return jsonify({"error": result["error"]}), HTTPStatus.NOT_FOUND
    return jsonify(result["data"]), HTTPStatus.OK


@api_v1.route('/species', methods=['GET'])
def list_species():
    result = Species.get_all()
    if not result["success"]:
        return jsonify({"error": result["error"]}), HTTPStatus.INTERNAL_SERVER_ERROR
    return jsonify(result["data"]), HTTPStatus.OK


@api_v1.route('/species/<species_name>/traits', methods=['GET'])
def get_species_traits(species_name):
    """Get all traits for a species (with optional subspecies filter)."""
    try:
        from Backend.models import session
        from Backend.models.species import Species as SpeciesModel
        from Backend.services.TraitsService import TraitsService
        
        species = session.query(SpeciesModel).filter(
            SpeciesModel.name.ilike(species_name),
            SpeciesModel.parent.is_(None),
        ).first()
        if not species:
            return jsonify({"error": "Species not found"}), HTTPStatus.NOT_FOUND

        traits = []
        base_traits = TraitsService.get_for_species(species.id)
        if not base_traits["success"]:
            return jsonify({"error": base_traits["error"]}), HTTPStatus.INTERNAL_SERVER_ERROR
        traits.extend(
            {
                "name": trait["name"],
                "description": trait["description"] or "",
                "source": species.name,
            }
            for trait in base_traits["data"]
        )

        subspecies_name = request.args.get('subspecies')
        if subspecies_name:
            subspecies = session.query(SpeciesModel).filter(
                SpeciesModel.name.ilike(subspecies_name),
                SpeciesModel.parent == species.id,
            ).first()
            if subspecies is None:
                return jsonify({"error": "Subspecies not found"}), HTTPStatus.NOT_FOUND
            sub_traits = TraitsService.get_for_species(subspecies.id)
            if not sub_traits["success"]:
                return jsonify({"error": sub_traits["error"]}), HTTPStatus.INTERNAL_SERVER_ERROR
            traits.extend(
                {
                    "name": trait["name"],
                    "description": trait["description"] or "",
                    "source": subspecies.name,
                }
                for trait in sub_traits["data"]
            )

        return jsonify(traits), HTTPStatus.OK
    except Exception:
        logger.exception("Error fetching species traits")
        return jsonify({"error": "Unable to fetch species traits"}), HTTPStatus.INTERNAL_SERVER_ERROR

################################################################
# Class Routes
################################################################

@api_v1.route('/classes/creator', methods=['POST'])
def create_class():
    data = request.json
    if not data or 'name' not in data:
        return jsonify({"error": "Invalid class data"}), HTTPStatus.BAD_REQUEST

    result = DnDClass.new(data)
    if not result["success"]:
        if "already exists" in result["error"]:
            return jsonify({"error": result["error"]}), HTTPStatus.CONFLICT
        return jsonify({"error": result["error"]}), HTTPStatus.BAD_REQUEST
    return jsonify({"message": "Class created"}), HTTPStatus.CREATED


@api_v1.route('/classes/<int:id>', methods=['DELETE'])
def delete_class(id):
    result = DnDClass.delete(id)
    if not result["success"]:
        return jsonify({"error": result["error"]}), HTTPStatus.NOT_FOUND
    return jsonify({"message": "Class deleted"}), HTTPStatus.OK


@api_v1.route('/classes/<int:id>', methods=['GET'])
def get_class(id):
    dnd_class = DnDClass.get_byID(id)
    if not dnd_class:
        return jsonify({"error": "Class not found"}), HTTPStatus.NOT_FOUND
    return jsonify(dnd_class.to_dict()), HTTPStatus.OK


@api_v1.route('/classes', methods=['GET'])
def list_classes():
    all_classes = DnDClass.get_all()
    return jsonify([c.to_dict() for c in all_classes]), 200

@api_v1.route('/characters/<int:char_id>/classes/<int:class_id>/resources', methods=['GET'])
def get_class_resources(char_id, class_id):
    return jsonify({"error": "Class resources are not represented in the current data model."}), HTTPStatus.NOT_IMPLEMENTED

@api_v1.route('/characters/<int:char_id>/classes/<int:class_id>/resources/<resource_type>', methods=['PATCH'])
def update_resource(char_id, class_id, resource_type):
    return jsonify({"error": "Class resources are not represented in the current data model."}), HTTPStatus.NOT_IMPLEMENTED

@api_v1.route('/characters/<int:char_id>/rest', methods=['POST'])
def take_rest(char_id):
    return jsonify({"error": "Class resources are not represented in the current data model."}), HTTPStatus.NOT_IMPLEMENTED


################################################################
# Background Routes
################################################################

@api_v1.route('/backgrounds', methods=['GET'])
def list_backgrounds():
    from Backend.services.BackgroundService import BackgroundService
    result = BackgroundService.get_all()
    if result["success"]:
        return jsonify(result["data"]), 200
    return jsonify({"error": result["error"]}), 500


@api_v1.route('/backgrounds/<int:bgID>', methods=['GET'])
def get_background(bgID):
    from Backend.services.BackgroundService import BackgroundService
    result = BackgroundService.get_byID(bgID)
    if result["success"]:
        return jsonify(result["data"]), 200
    return jsonify({"error": result["error"]}), 404


################################################################
# Item Routes
################################################################

@api_v1.route('/items/creator', methods=['POST'])
def create_item():
    data = request.json
    if not data or 'name' not in data:
        return jsonify({"error": "Invalid item data"}), HTTPStatus.BAD_REQUEST

    result = Item.new(data)
    if not result["success"]:
        if "already exists" in result["error"]:
            return jsonify({"error": result["error"]}), HTTPStatus.CONFLICT
        return jsonify({"error": result["error"]}), HTTPStatus.BAD_REQUEST
    return jsonify({"message": "Item created"}), HTTPStatus.CREATED


@api_v1.route('/items/<int:id>', methods=['GET'])
def get_item(id):
    item = Item.get_byID(id)
    if not item:
        return jsonify({"error": "Item not found"}), HTTPStatus.NOT_FOUND
    return jsonify(item.to_dict()), HTTPStatus.OK

@api_v1.route('/items', methods=['GET'])
def list_items():
    all_items = Item.get_all()
    result = [c.to_dict() for c in all_items]
    return jsonify(result), HTTPStatus.OK

@api_v1.route('/items/<int:id>', methods=['DELETE'])
def delete_item(id):
    result = Item.delete(id)
    if not result["success"]:
        return jsonify({"error": result["error"]}), HTTPStatus.NOT_FOUND
    return jsonify({"message": "Item deleted"}), HTTPStatus.OK

################################################################
# Language Routes
################################################################


@api_v1.route('/languages', methods=['GET'])
def get_languages():
    return jsonify({"error": "Languages are not represented in the current data model."}), HTTPStatus.NOT_IMPLEMENTED
    
################################################################
# Spell Routes
################################################################

@api_v1.route('/spells', methods=['GET'])
def list_spells():
    """Get all available spells."""
    try:
        spells = Spell.get_all_spells()
        result = [s.to_dict() for s in spells]
        return jsonify(result), HTTPStatus.OK
    except Exception as e:
        return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR

@api_v1.route('/characters/<int:charID>/spell-slots', methods=['GET'])
def get_spell_slots(charID):
    """Get character's available spell slots."""
    result = Spell.get_character_spell_slots(charID)
    if result["success"]:
        return jsonify(result["data"]), HTTPStatus.OK
    else:
        return jsonify({"error": result["error"]}), HTTPStatus.NOT_FOUND


@api_v1.route('/characters/<int:charID>/spell-slots/expended', methods=['PATCH'])
def update_expended_slots(charID):
    """Update expended spell slots."""
    data = request.json
    if not data or 'level' not in data or 'amount' not in data:
        return jsonify({"error": "Missing level or amount"}), HTTPStatus.BAD_REQUEST
    
    result = Spell.update_expended_slots(charID, data['level'], data['amount'])
    if result["success"]:
        return jsonify(result["data"]), HTTPStatus.OK
    else:
        return jsonify({"error": result["error"]}), HTTPStatus.BAD_REQUEST


@api_v1.route('/characters/<int:charID>/spells', methods=['GET'])
def get_character_spells(charID):
    """Get all spells known by character."""
    result = Spell.get_character_spells(charID)
    if result["success"]:
        return jsonify(result["data"]), HTTPStatus.OK
    else:
        return jsonify({"error": result["error"]}), HTTPStatus.NOT_FOUND


@api_v1.route('/characters/<int:charID>/spells', methods=['POST'])
def add_character_spell(charID):
    """Add a spell to character's known spells."""
    data = request.json
    if not data:
        return jsonify({"error": "Request body must be valid JSON"}), HTTPStatus.BAD_REQUEST
    
    result = Spell.add_spell_to_character(charID, data)
    if result["success"]:
        return jsonify(result["data"]), HTTPStatus.CREATED
    else:
        return jsonify({"error": result["error"]}), HTTPStatus.BAD_REQUEST


@api_v1.route('/characters/<int:charID>/spells/<int:spellID>', methods=['DELETE'])
def remove_character_spell(charID, spellID):
    """Remove a spell from character's known spells."""
    result = Spell.remove_spell_from_character(charID, spellID)
    if result["success"]:
        return jsonify({"success": True}), HTTPStatus.OK
    else:
        return jsonify({"error": result["error"]}), HTTPStatus.NOT_FOUND


@api_v1.route('/characters/<int:charID>/spells/<int:spellID>/prepare', methods=['PATCH'])
def toggle_spell_prepared(charID, spellID):
    """Toggle whether a spell is prepared."""
    result = Spell.toggle_spell_prepared(charID, spellID)
    if result["success"]:
        return jsonify(result["data"]), HTTPStatus.OK
    else:
        return jsonify({"error": result["error"]}), HTTPStatus.NOT_FOUND


@api_v1.route('/characters/<int:charID>/prepare-limit', methods=['GET'])
def get_prepare_limit(charID):
    """Get spell prepare limit for character based on D&D 5e rules."""
    result = Spell.calculate_prepare_limit(charID)
    if result["success"]:
        return jsonify({
            "limit": result["limit"],
            "prepared": result["prepared"],
            "prepare_ability": result["prepare_ability"],
            "primary_spellcasting_class": result["primary_spellcasting_class"],
            "unlimited": result["unlimited"]
        }), HTTPStatus.OK
    else:
        return jsonify({"error": result["error"]}), HTTPStatus.NOT_FOUND


@api_v1.route('/characters/<int:charID>/spells/bulk-prepare', methods=['PATCH'])
def bulk_prepare_character_spells(charID):
    data = request.get_json(silent=True) or {}
    result = Spell.set_spells_prepared(charID, data.get("spellIDs"), True)
    if result["success"]:
        return jsonify(result["data"]), HTTPStatus.OK
    return jsonify({"error": result["error"]}), HTTPStatus.BAD_REQUEST


@api_v1.route('/characters/<int:charID>/spells/bulk-unprepare', methods=['PATCH'])
def bulk_unprepare_character_spells(charID):
    data = request.get_json(silent=True) or {}
    result = Spell.set_spells_prepared(charID, data.get("spellIDs"), False)
    if result["success"]:
        return jsonify(result["data"]), HTTPStatus.OK
    return jsonify({"error": result["error"]}), HTTPStatus.BAD_REQUEST

@api_v1.route('/classes/<class_name>/spells', methods=['GET'])
def get_class_spells(class_name):
    """Get all spells available to a class."""
    try:
        from Backend.models import session
        from Backend.models.dndclass import DnDclass, ClassSpell
        from Backend.models.spells import Spell
        
        level_filter = request.args.get('level', type=int)  # Optional filter

        # Find the class
        dnd_class = session.query(DnDclass).filter(
            DnDclass.name.ilike(class_name)
        ).first()
        
        if not dnd_class:
            return jsonify({"error": "Class not found"}), HTTPStatus.NOT_FOUND
        
        # The current class-spell junction has no subclass-specific column.
        class_spells = session.query(ClassSpell).filter(
            ClassSpell.classID == dnd_class.id
        ).all()

        # Get the actual spell objects
        spellIDs = [cs.spellID for cs in class_spells]
        spells = session.query(Spell).filter(
            Spell.id.in_(spellIDs)
        )
        
        if level_filter is not None:
            spells = spells.filter(Spell.level == level_filter)
            
        spells = spells.all()
        
        return jsonify([spell.to_dict() for spell in spells]), HTTPStatus.OK
    except Exception as e:
        return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR

################################################################
# Monsters
################################################################
@api_v1.route('/monsters', methods=['GET'])
def list_monsters():
    return jsonify({"error": "Monsters are not represented in the current data model."}), HTTPStatus.NOT_IMPLEMENTED

@api_v1.route('/monsters', methods=['POST'])
def create_monster():
    return jsonify({"error": "Monsters are not represented in the current data model."}), HTTPStatus.NOT_IMPLEMENTED

@api_v1.route('/monsters/<int:monster_id>', methods=['GET'])
def get_monster(monster_id):
    return jsonify({"error": "Monsters are not represented in the current data model."}), HTTPStatus.NOT_IMPLEMENTED

@api_v1.route('/monsters/<int:monster_id>', methods=['PUT', 'PATCH'])
def update_monster(monster_id):
    return jsonify({"error": "Monsters are not represented in the current data model."}), HTTPStatus.NOT_IMPLEMENTED

@api_v1.route('/monsters/<int:monster_id>', methods=['DELETE'])
def delete_monster(monster_id):
    result = Monster.delete(monster_id)
    status = 200 if result["success"] else 404
    return jsonify(result), status

################################################################
# Misc
################################################################

@api_v1.route('/fighting-styles', methods=['GET'])
def get_fighting_styles():
    fighting_styles = [
        {'id': 1, 'name': 'Archery', 'description': '+2 to hit with ranged weapons'},
        {'id': 2, 'name': 'Defense', 'description': '+1 AC while wearing armor'},
        {'id': 3, 'name': 'Dueling', 'description': '+2 damage with one-handed weapon'},
        {'id': 4, 'name': 'Great Weapon Fighting', 'description': 'Reroll 1s and 2s on damage'},
        {'id': 5, 'name': 'Protection', 'description': '-4 to hit allies adjacent to you'},
        {'id': 6, 'name': 'Two-Weapon Fighting', 'description': 'Add ability modifier to off-hand damage'}
    ]
    return jsonify(fighting_styles), 200

@api_v1.route('/features', methods=['GET'])
def list_features():
    from Backend.models import session
    from Backend.models.features import Features
    features = session.query(Features).all()
    return jsonify([{"id": f.id, "name": f.name, "description": f.desc} for f in features]), 200

################################################################
# App Entry
################################################################

app.register_blueprint(api_v1)

if __name__ == "__main__":
    app.run(port=FLASK_PORT, debug=FLASK_DEBUG)