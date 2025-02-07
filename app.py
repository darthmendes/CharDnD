#
# App To create a DnD Character
# This part will be replaced by a frontend engine and is only used here for testing 
#
# author: darthmendes
# date: 2025-02-04
# version: 1.0.0
#

from http.client import BAD_REQUEST, CREATED, NOT_ACCEPTABLE, NOT_FOUND, OK, INTERNAL_SERVER_ERROR
from flask import Flask, render_template, request, flash, redirect, url_for
import requests 
import json

PROXY_URL = 'http://127.0.0.1:8001'

app = Flask(__name__)
app.config['SECRET_KEY'] = '123'

@app.route("/")
def index():
    return render_template('home_page.html')


# Character Operations
#   Creation of a character sheet
#   Retrieving a Character Sheet
#   Deleting
#   Updating

character_html_path = 'Character'
@app.route("/characters")
def character_home():
    return render_template(character_html_path + '/' +'home.html')

@app.route("/characters/creator", methods=["GET"])
def character_creator():
    return render_template(character_html_path + '/' +'new_character_form.html')

@app.route("/characters/creator", methods=["POST"])
def new_character():

    name = request.form['name']
    race = request.form['race']
    char_class = request.form['char_class']
    level = request.form['level']
    
    STR = request.form['strength']
    DEX = request.form['dexterity']
    CON = request.form['constitution']
    INT = request.form['intelligence']
    WIS = request.form['wisdom']
    CHA = request.form['charisma']

    ability_scores = {
        'STR': STR,
        'DEX': DEX,
        'CON': CON,
        'INT': INT,
        'WIS': WIS,
        'CHA': CHA
    }

    data = json.dumps({
        "name": name,
        "race": race,
        "class": char_class,
        "level": level,
        "ability_scores": str(ability_scores)
        })

    print(data)
    p = requests.post(PROXY_URL + '/API/characters/creator', json=data)
    print(p.status_code)
    return redirect(url_for('character_home'))


if __name__ == "__main__":
    # initiating server
    app.run(host='0.0.0.0', port=8000, debug=True)
