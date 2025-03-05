#
# App To create a DnD Character
# Backend of the app. This script is used like a proxy for DB requests.
# Currently it performs the requests directly to the DBs, in the future replace with a proxy that maps the calls correctly
#
# author: darthmendes
# date: 2025-02-04
# version: 1.0.0
#

from http.client import BAD_REQUEST, CREATED, NOT_ACCEPTABLE, NOT_FOUND, OK
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from Backend.src.character import Character
from Backend.src.species import Species
from Backend.src.char_class import Char_Class
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
    
    dataDict['abilityScores'] = {   "strenght":dataDict['STR'], 
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
        return jsonify(character.to_dict())
    else:
        return "Character Not Found", NOT_FOUND

# List Characters
@app.route('/API/characters', methods=['GET'])
def list_characters():
    characters = Character.get_all()
    return jsonify([character.to_dict() for character in characters]), OK
    

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
    
    res = Char_Class.new(dataDict)
    
    if res == -1:
        return {'error':'Invalid class data'}, BAD_REQUEST

    if res == -2:
        return {'error':'Class already exists'}, NOT_ACCEPTABLE
    return {'message':'Class created'}, CREATED

# Delete class
@app.route('/API/classes/<path:name>', methods=['DELETE'])
def delete_classes(name):
    dataDict = json.loads(request.json)
    aux = Char_Class.delete(name=dataDict['name']).first()
    if aux:
        aux.delete()
        return "Class Deleted", OK
    else:
        return "Class Not Found", NOT_FOUND


# Retrieve class
@app.route('/API/classes/<path:name>', methods=['GET']) 
def get_classes(name):
    aux = Char_Class.get(name=name)
    if aux:
        return jsonify(aux.to_dict())
    else:
        return "Class Not Found", NOT_FOUND

# List class
@app.route('/API/classes', methods=['GET'])
def list_classes():
    aux = Char_Class.get_all()
    return [{'name':'Ranger'},
            {'name':'Druid'},
            {'name':'Barbarian'},
            {'name':'Artificer'},
            {'name':'Wizard'} ]
    #jsonify([a.to_dict() for a in aux]), OK


if __name__ == "__main__":
    # initiating server
    app.run(port=8001, debug=True)