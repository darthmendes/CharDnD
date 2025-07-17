#
# App To create a DnD Character
# Backend of the app. This script is used like a proxy for DB requests.
# Currently it performs the requests directly to the DBs, in the future replace with a proxy that maps the calls correctly
#
# author: darthmendes
#

from http.client import BAD_REQUEST, CREATED, NOT_ACCEPTABLE, NOT_FOUND, OK
from flask import Flask, request, jsonify
from flask_cors import CORS
from Backend.services.CharacterService import CharacterService as Character
from Backend.services.SpeciesService import SpeciesService as Species
from Backend.services.ClassService import ClassService as DnDClass
from Backend.services.ItemService import ItemService as Item
import json


app = Flask(__name__)
cors = CORS(app, origins='*')

##################################################################################################################################################
#
# Character DB operations
#
##################################################################################################################################################

# Create a Character
@app.route('/API/characters/creator', methods=['POST'])
def create_character():
    dataDict = request.json
    if 'name' not in dataDict:
        return {'error':'Invalid character data'}, BAD_REQUEST
    
    dataDict['abilityScores'] = {   "strength":dataDict['STR'], 
                                    "dexterity":dataDict['DEX'],
                                    "constitution":dataDict['CON'],
                                    "intelligence":dataDict['INT'],
                                    "wisdom":dataDict['WIS'],
                                    "charisma":dataDict['CHA']}
    print(dataDict)
    res = Character.new(dataDict)
    
    if res == -1:
        return {'error':'Invalid character data'}, BAD_REQUEST

    if res == -2:
        return {'error':'Character already exists'}, NOT_ACCEPTABLE
    return {'message':'Character created'}, CREATED

# Character Deletion
@app.route('/API/characters/<path:id>', methods=['DELETE'])
def delete_character(id):
    dataDict = json.loads(request.json)
    character = Character.delete(id=dataDict['id']).first()
    if character:
        character.delete()
        return "Character Deleted", OK
    else:
        return "Character Not Found", NOT_FOUND

# Character retrieval
@app.route('/API/characters/<path:id>', methods=['GET'])
def get_character(id):
    character = Character.get(id=id)
    if character:
        print(character.to_dict())
        return jsonify(character.to_dict())
    else:
        return "Character Not Found", NOT_FOUND

# List Characters
@app.route('/API/characters', methods=['GET'])
def list_characters():
    aux = Character.get_all()
    res = []
    for a in aux:
        a = a.to_dict()
        res.append({'id':a['id'], 'name':a['name']})
    
    return res, OK
    

##################################################################################################################################################
#
# Species DB operations
#
##################################################################################################################################################

# Add Species
@app.route('/API/species/creator', methods=['POST'])
def create_species():
    dataDict = json.loads(request.json)
    if 'name' not in dataDict:
        return {'error':'Invalid species data'}, BAD_REQUEST
    
    res = Species.new(dataDict)
    
    if res == -1:
        return {'error':'Invalid species data'}, BAD_REQUEST

    if res == -2:
        return {'error':'Character already exists'}, NOT_ACCEPTABLE
    return {'message':'Character created'}, CREATED

# Delete Species
@app.route('/API/species/<path:name>', methods=['DELETE'])
def delete_species(name):
    dataDict = json.loads(request.json)
    aux = Species.delete(name=dataDict['name']).first()
    if aux:
        aux.delete()
        return "Species Deleted", OK
    else:
        return "Species Not Found", NOT_FOUND

# Retrieve Species
@app.route('/API/species/<path:id>', methods=['GET'])
def get_species(id):
    aux = Species.get(id=id)
    if aux:
        return jsonify(aux.to_dict())
    else:
        return "Species Not Found", NOT_FOUND

# List Species
@app.route('/API/species', methods=['GET'])
def list_species():
    aux = Species.get_all()
    res = []
    for a in aux:
        a = a.to_dict()
        res.append({'id':a['id'], 'name':a['name']})
    return res


##################################################################################################################################################
#
# Character Class DB operations
#
##################################################################################################################################################

# Add Class
@app.route('/API/classes/creator', methods=['POST'])
def create_classes():
    dataDict = json.loads(request.json)
    if 'name' not in dataDict:
        return {'error':'Invalid class data'}, BAD_REQUEST
    
    res = DnDClass.new(dataDict)
    
    if res == -1:
        return {'error':'Invalid class data'}, BAD_REQUEST

    elif res == -2:
        return {'error':'Class already exists'}, NOT_ACCEPTABLE
    return {'message':'Class created'}, CREATED

# Delete class
@app.route('/API/classes/<path:name>', methods=['DELETE'])
def delete_classes(name):
    dataDict = json.loads(request.json)
    aux = DnDClass.delete(name=dataDict['name']).first()
    if aux:
        aux.delete()
        return "Class Deleted", OK
    else:
        return "Class Not Found", NOT_FOUND

# Retrieve class
@app.route('/API/classes/<path:name>', methods=['GET']) 
def get_classes(name):
    aux = DnDClass.get(name=name)
    if aux:
        return jsonify(aux.to_dict())
    else:
        return "Class Not Found", NOT_FOUND

# List class
@app.route('/API/classes', methods=['GET'])
def list_classes():
    aux = DnDClass.get_all()
    res = []
    for a in aux:
        a = a.to_dict()
        res.append({'id':a['id'], 'name':a['name']})
    return res

##################################################################################################################################################
#
# Item DB operations
#
##################################################################################################################################################
@app.route('/API/items/creator', methods=['POST'])
def create_items():
    dataDict = request.json
    if 'name' not in dataDict:
        return {'error':'Invalid item data'}, BAD_REQUEST
    
    res = Item.new(dataDict)
    
    if res == -1:
        return {'error':'Invalid Item data'}, BAD_REQUEST

    elif res == -2:
        return {'error':'Item already exists'}, NOT_ACCEPTABLE
    return {'message':'Item created'}, CREATED

@app.route('/API/items/<path:id>', methods=['GET'])
def get_item(id):
    item = Item.get(id=id)
    if item:
        print(item.to_dict())
        return jsonify(item.to_dict())
    else:
        return "Item Not Found", NOT_FOUND

@app.route('/API/items/<path:id>', methods=['DELETE'])
def delete_item(id):
    item = Item.delete(id=id)
    if 'message' in item.keys():
        return "Item Deleted", OK
    else:
        return "Item Not Found", NOT_FOUND


if __name__ == "__main__":
    # initiating server
    app.run(port=8001, debug=True)