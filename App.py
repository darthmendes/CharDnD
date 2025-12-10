#
# App To create a DnD Character
# Backend API layer — routes mapped to service layer.
#
# author: darthmendes
#

from flask import Flask, request, jsonify
from flask_cors import CORS
from http import HTTPStatus

# Services
from Backend.services.CharacterService import CharacterService as Character
from Backend.services.SpeciesService import SpeciesService as Species
from Backend.services.ClassService import ClassService as DnDClass
from Backend.services.ItemService import ItemService as Item

from Backend.constants import PACK_DEFINITIONS
from Backend.config import FLASK_DEBUG, FLASK_PORT, CORS_ORIGINS, SECRET_KEY

app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY

# CORS: Use environment-configured origins
if '*' in CORS_ORIGINS:
    CORS(app, origins='*')  # Development only
else:
    CORS(app, origins=CORS_ORIGINS)


################################################################
# Character Routes
################################################################

@app.route('/API/characters/creator', methods=['POST'])
def create_character():
    """Create a new character with the provided data."""
    data = request.json
    if not data:
        return jsonify({"error": "Request body must be valid JSON"}), HTTPStatus.BAD_REQUEST

    # Map frontend ability fields to internal format
    try:
        data['abilityScores'] = {
            "str": data.pop('STR'),
            "dex": data.pop('DEX'),
            "con": data.pop('CON'),
            "int": data.pop('INT'),
            "wis": data.pop('WIS'),
            "cha": data.pop('CHA')
        }
    except KeyError as e:
        return jsonify({"error": f"Missing ability score: {e}"}), HTTPStatus.BAD_REQUEST

    result = Character.new(data)
    if not result["success"]:
        if "already exists" in result["error"]:
            return jsonify({"error": result["error"]}), HTTPStatus.CONFLICT
        return jsonify({"error": result["error"]}), HTTPStatus.BAD_REQUEST

    return jsonify(result["data"]), HTTPStatus.CREATED


@app.route('/API/characters/<int:id>', methods=['DELETE'])
def delete_character(id):
    """Delete a character by ID."""
    result = Character.delete(id)
    if not result["success"]:
        return jsonify({"error": result["error"]}), HTTPStatus.NOT_FOUND
    return jsonify({"message": result["message"]}), HTTPStatus.OK


@app.route('/API/characters/<int:id>', methods=['GET'])
def get_character(id):
    """Retrieve a character by ID."""
    char = Character.get_by_id(id)
    if not char:
        return jsonify({"error": "Character not found"}), HTTPStatus.NOT_FOUND
    return jsonify(char.to_dict()), HTTPStatus.OK


@app.route('/API/characters', methods=['GET'])
def list_characters():
    """Retrieve a list of all characters."""
    chars = Character.get_all()
    result = [{"id": c.id, "name": c.name} for c in chars]
    return jsonify(result), HTTPStatus.OK


@app.route('/API/characters/<int:char_id>/items', methods=['POST'])
def add_item_to_character(char_id):
    """Add an item or pack to a character's inventory."""
    data = request.json
    if not data:
        return jsonify({"error": "Request body must be valid JSON"}), HTTPStatus.BAD_REQUEST
    
    if 'pack_name' in data:
        result = Item.add_pack_to_character(char_id, data['pack_name'])
    elif 'itemID' in data:
        result = Item.add_item_to_character(char_id, data['itemID'], data.get('quantity', 1))
    else:
        return jsonify({"error": "Missing itemID or pack_name"}), HTTPStatus.BAD_REQUEST

    if result["success"]:
        return jsonify(result), HTTPStatus.OK
    else:
        return jsonify(result), HTTPStatus.BAD_REQUEST
    
################################################################
# Species Routes
################################################################

@app.route('/API/species/creator', methods=['POST'])
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


@app.route('/API/species/<int:id>', methods=['DELETE'])
def delete_species(id):
    result = Species.delete(id)
    if not result["success"]:
        return jsonify({"error": result["error"]}), HTTPStatus.NOT_FOUND
    return jsonify({"message": "Species deleted"}), HTTPStatus.OK


@app.route('/API/species/<int:id>', methods=['GET'])
def get_species(id):
    species = Species.get_by_id(id)
    if not species:
        return jsonify({"error": "Species not found"}), HTTPStatus.NOT_FOUND
    return jsonify(species.to_dict()), HTTPStatus.OK


@app.route('/API/species', methods=['GET'])
def list_species():
    all_species = Species.get_all()
    result = [{"id": s.id, "name": s.name} for s in all_species]
    return jsonify(result), HTTPStatus.OK


################################################################
# Class Routes
################################################################

@app.route('/API/classes/creator', methods=['POST'])
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


@app.route('/API/classes/<int:id>', methods=['DELETE'])
def delete_class(id):
    result = DnDClass.delete(id)
    if not result["success"]:
        return jsonify({"error": result["error"]}), HTTPStatus.NOT_FOUND
    return jsonify({"message": "Class deleted"}), HTTPStatus.OK


@app.route('/API/classes/<int:id>', methods=['GET'])
def get_class(id):
    dnd_class = DnDClass.get_by_id(id)
    if not dnd_class:
        return jsonify({"error": "Class not found"}), HTTPStatus.NOT_FOUND
    return jsonify(dnd_class.to_dict()), HTTPStatus.OK


@app.route('/API/classes', methods=['GET'])
def list_classes():
    all_classes = DnDClass.get_all()
    result = [{"id": c.id, "name": c.name} for c in all_classes]
    return jsonify(result), HTTPStatus.OK


################################################################
# Item Routes
################################################################

@app.route('/API/items/creator', methods=['POST'])
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


@app.route('/API/items/<int:id>', methods=['GET'])
def get_item(id):
    item = Item.get_by_id(id)
    if not item:
        return jsonify({"error": "Item not found"}), HTTPStatus.NOT_FOUND
    return jsonify(item.to_dict()), HTTPStatus.OK

@app.route('/API/items', methods=['GET'])
def list_items():
    all_items = Item.get_all()
    result = [c.to_dict() for c in all_items]
    return jsonify(result), HTTPStatus.OK

@app.route('/API/items/<int:id>', methods=['DELETE'])
def delete_item(id):
    result = Item.delete(id)
    if not result["success"]:
        return jsonify({"error": result["error"]}), HTTPStatus.NOT_FOUND
    return jsonify({"message": "Item deleted"}), HTTPStatus.OK

################################################################
# App Entry
################################################################

if __name__ == "__main__":
    app.run(port=FLASK_PORT, debug=FLASK_DEBUG)