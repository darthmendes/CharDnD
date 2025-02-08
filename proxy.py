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

    res = Character.new(dataDict)
    if res == -1:
        return {'error':'Invalid character data'}, BAD_REQUEST

    if res == -2:
        return {'error':'Character already exists'}, NOT_ACCEPTABLE
    return {'message':'Character created'}, CREATED

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
    characters = Character.get_all()
    return jsonify([character.to_dict() for character in characters]), OK
    

if __name__ == "__main__":
    # initiating server
    app.run(host='0.0.0.0', port=8001, debug=True)
