from Backend.src. species import Species

def addNewSpecies(species):  
  res = Species.new(species)
  if res == -1:
      print(f'error: Invalid Species data {species}')
  elif res == -2:
      print(f'error: Species already exists {species}')
  else: print(f'message: Species created {species}')

dwarf = {
    "name": "Dwarf",
    "speed": 25,
    "ability_bonuses": { "constitution" : 2}
    ,
    "size": "Medium",
    "starting_proficiencies": ["battleaxes", "handaxes", "light-hammers", "warhammers"],

    "starting_proficiency_options": {
      "choose": 1,
      "type": "proficiencies",
      "from": {
        "option_set_type": "options_array",
        "options": ["smiths-tools", "brewers-supplies","masons-tools"]
      }
    },
    "languages": ["common", "dwarvish"],
    "traits": [ "darkvision", "dwarven-resilience", "stonecunning", "dwarven-combat-training", "tool-proficiency"],
    "subraces": ["hill-dwarf"]
  }

elf = {
    "name": "Elf",
    "speed": 30,
    "ability_bonuses": { "dexterity" : 2},
    "size": "Medium",
    "starting_proficiencies": ["skill-perception"],
    "languages": ["common", "elvish"],
    "traits": [ "darkvision", "fey-ancestry", "trance", "keen-senses"],
    "subraces": ["high-elf"]
  }

human = {
    "name": "Human",
    "speed": 30,
    "ability_bonuses": { "strenght" : 1, 
                        "constitution":1,
                        "dexterity":1,
                        "intelligence":1,
                        "wisdom":1,
                        "charisma":1}
    ,
    "size": "Medium",
    "starting_proficiencies": [],
    "languages": ["common"],
    "languages_options" : {
       "choose" : 1,
       "from" : ["dwarvish", "elvish", "giant", "gnomish", "goblin", "halfling", "orc", "abyssal", "celestial", "draconic", "deep-speech", "infernal", "primordial", "sylvan", "undercommon"]
    },
    "traits": [],
    "subraces": []
}
# addNewSpecies(dwarf)
# addNewSpecies(elf)
# addNewSpecies(human)
    