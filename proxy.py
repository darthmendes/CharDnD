#
# App To create a DnD Character
# Backend of the app. This script is used like aproxy for DB requests.
# Currently it performs the requests directly to the DBs, in the future replace with a proxy that maps the calls correctly
#
# author: darthmendes
# date: 2025-02-04
# version: 1.0.0
#

from http.client import BAD_REQUEST, CREATED, NOT_ACCEPTABLE, NOT_FOUND, OK
from flask import Flask, request, jsonify
import requests
from Backend.src.character import Character
import json


app = Flask(__name__)

#
# Character DB operations
#

# Create a Character
@app.route('/API/characters/creator', methods=['POST'])
def create_character():
    dataDict = json.loads(request.json)

    if not Character.is_valid(dataDict):
        return {'error': 'Invalid character data'}, BAD_REQUEST
    
    # extract all values from dataDict and load into the Character Creator while handling missing inputs
    character = Character()
    for key, value in dataDict.items():
        if key == 'name':
            character.name = value
        elif key == 'race':
            character.race = value
        elif key == 'class':
            character.char_class = value
        elif key == 'level':
            character.level = value
        elif key == 'xp':
            character.xp = value
        elif key == 'hp':
            character.hp = value
        elif key == 'ability_scores':
            character.ability_scores = value
        elif key == 'skills':
            character.skills = value
        elif key == 'equipment':
            character.equipment = value
        elif key == 'languages':
            character.languages = value
        elif key == 'alignment':
            character.alignment = value
        elif key == 'features':
            character.features = value

    character.save()
    return "Created New Character", CREATED

# Character Deletion
@app.route('/API/characters/<path:name>', methods=['DELETE'])
def delete_character(name):
    dataDict = json.loads(request.json)
    character = Character.delete(name=dataDict['name']).first()
    if character:
        character.delete()
        return "Character Deleted", OK
    else:
        return "Character Not Found", NOT_FOUND

# Character retrieval
@app.route('/API/characters/<path:name>', methods=['GET'])
def get_character(name):
    character = Character.get(name=name)
    if character:
        return jsonify(character.to_dict()), OK
    else:
        return "Character Not Found", NOT_FOUND

# List Characters
@app.route('/API/characters', methods=['GET'])
def list_characters():
    characters = Character.list()
    return jsonify([character.to_dict() for character in characters]), OK
    

if __name__ == "__main__":
    # initiating server
    app.run(host='0.0.0.0', port=8001, debug=True)
