from Backend.models.dndclass import DnDclass
def addNewClass(charclass):  
  res = DnDclass.new(charclass)
  if res == -1:
      print(f'error: Invalid Class data {charclass}')
  elif res == -2:
      print(f'error: Class already exists {charclass}')
  else: print(f'message: Class created {charclass}')


barbarian = {
    "name": "Barbarian",
    "hit_die": 12,
    "proficiency_choices": [
      { "choose": 2,
        "type": "proficiencies",
        "from": ["skill-animal-handling", "skill-atheletics", "skill-intimidation", "skill-nature", "skill-survival" ]
        }
    ],
    "proficiencies": [ "light-armor", "medium-armor", "shields", "simple-weapons", "martial-weapons", "saving-throw-strenght", "saving-throw-constitution"],
    "saving_throws": [ "Strenght", "Constitution"],
    "starting_equipment": [ {"explorers-pack" : 1}, {"javelin" : 4}],
    "starting_equipment_options": [
        { "choose": 1,
            "from":[
                {"greataxe" : 1 },
                {"martial-melee-weapons" : 1}]
        },
        { "choose": 1,
            "from": [
                {"handaxe" : 2},
                {"simple-weapons":1}
            ]
        }
    ],
    "class_levels": "/api/2014/classes/barbarian/levels",
    "multiclassing": {
      "prerequisites": [
            {"Strenght" : 13}
      ],
      "proficiencies": [ "shields", "simple-weapons", "martial-weapons"]
    },
    "subclasses": ["Berserker", "Path of the Totem Warrior"]
  }

druid = {
    "name": "Druid",
    "hit_die": 8,
    "proficiency_choices": [
      { "choose": 2,
        "type": "proficiencies",
        "from": ["skill-arcana", "skill-animal-handling", "skill-insight", "skill-medicine", "skill-nature","skill-perception", "skill-religion", "skill-survival"]
      }
    ],
    "proficiencies": ["light-armor", 
                      "medium-armor", 
                      "shields", 
                      "clubs", 
                      "daggers", 
                      "javelins", 
                      "maces", 
                      "quaterstaffs", 
                      "sickles", 
                      "spears",
                      "darts",
                      "slings",
                      "scimitars",
                      "herbalism-kit",
                      "saving-throw-intelligence",
                      "saving-throw-wisdom"
    ],
    "saving_throws": ["intelligence", "wisdom"],
    "starting_equipment": [{"leather-armor":1},
                           {"explorers-pack":1}
    ],
    "starting_equipment_options": [
      { "choose": 1,
        "from": [
            { "shield" : 1 },
            { "simple-melee-weapons" : 1}
          ]
        },
      { "choose": 1,
        "from": [{"scimitar":1}, 
                 {"simple-melee-weapons":1}]
      },
      { "druidic-focus": 1}
    ],
    "multiclassing": {
      "prerequisites": [{"wisdom" : 13}
      ],
      "proficiencies": [ "light-armor", "medium-armor", "shields"]
    },
    "subclasses": ["land"],
    "spellcasting": {
      "level": 1,
      "spellcasting_ability": {
        "name": "wisdom"
      }
    }
  }

addNewClass(druid)
addNewClass(barbarian)