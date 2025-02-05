#
# App To create a DnD Character
#
# author: darthmendes
# date: 2025-02-04
# version: 1.0.0
#

from src.character import Character_sheet, Ability_scores
from src.char_class import Char_Class

druid_class = Char_Class(name="Druid",
                       hit_dice=8,
                       prerequisites={"Wisdom":13},
                       features=None)


new_character = Character_sheet(name = "Legolas Tester",
                                level = 2,
                                race ="Elf",
                                base_class = druid_class,
                                background="Noble",
                                alignment="Neutral Good",
                                ability_scores=Ability_scores(STR=10, DEX=14,CON=10,CHA=10,WIS=8,INT=10),
                                skills=["Arcana", "Nature", "Animal Handling"]
                                )

new_character.list_all_skills()
new_character.show_sheet()

