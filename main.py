#
# App To create a DnD Character
#
# author: darthmendes
# date: 2025-02-04
# version: 1.0.0
#

from src.character import Character_sheet

new_character = Character_sheet("Legolas Tester",
                                1,
                                "Elf",
                                "Ranger",
                                "Noble",
                                "Neutral Good",
                                [10,10,10,11,11,11],
                                "None",
                                "None",
                                [])

new_character.add_language("Dwarvish")
new_character.show_sheet()