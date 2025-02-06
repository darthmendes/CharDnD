#
# App To create a DnD Character
#
# author: darthmendes
# date: 2025-02-04
# version: 1.0.0
#

from flask import Flask, render_template
from character_v1 import Character_sheet, Ability_scores
from src.char_class import Char_Class

html_path = r'C:\Users\user\Desktop\my stuff\CharDnD\ui\html'


# druid_class = Char_Class(name="Druid",
#                        hit_dice=8,
#                        prerequisites={"Wisdom":13},
#                        features=None)


# new_character = Character_sheet(name = "Legolas Tester",
#                                 level = 2,
#                                 race ="Elf",
#                                 base_class = druid_class,
#                                 background="Noble",
#                                 alignment="Neutral Good",
#                                 ability_scores=Ability_scores(STR=10, DEX=14,CON=10,CHA=10,WIS=8,INT=10),
#                                 skills=["Arcana", "Nature", "Animal Handling"]
#                                 )

# new_character.show_sheet()
 
app = Flask(__name__)

@app.route("/")
def index():
    return render_template('home_page.html')


character_html_path = 'Character'
@app.route("/characters")
def character_home():
    return render_template(character_html_path + '/' +'home.html')

@app.route("/characters/creator", methods=["GET"])
def new_character_form():
    return render_template(character_html_path + '/' +'new_character_form.html')


if __name__ == "__main__":
    # initiating server
    app.run(host='0.0.0.0', port=8000, debug=True)
