class_hit_dice = {
            "Barbarian": 12,
            "Bard": 8,
            "Cleric": 8,
            "Druid": 8,
            "Fighter": 10,
            "Monk": 8,
            "Paladin": 10,
            "Ranger": 10,
            "Rogue": 8,
            "Sorcerer": 6,
            "Warlock": 8,
            "Wizard": 6,
        } 
class_prerequisites = {
            "Barbarian": {"Strength": 13},
            "Bard": {"Charisma": 13},
            "Cleric": {"Wisdom": 13},
            "Druid": {"Wisdom": 13},
            "Fighter": {"Strength": 13, "Dexterity": 13},
            "Monk": {"Dexterity": 13, "Wisdom": 13},
            "Paladin": {"Strength": 13, "Charisma": 13},
            "Ranger": {"Dexterity": 13, "Wisdom": 13},
            "Rogue": {"Dexterity": 13},
            "Sorcerer": {"Charisma": 13},
            "Warlock": {"Charisma": 13},
            "Wizard": {"Intelligence": 13},
        }

class Char_Class():
    def __init__(self, name, hit_dice, prerequisites=None, spellcasting = False, features=None):
        self.name = name
        self.hit_dice = hit_dice
        self.prerequisites = prerequisites # {STR: 10, WIS:13}
        self.features = features or [] 
         
        self.proficiencies = {} # default : [op1, op2, ... ]
                                # choices : {"choose": 2,
                                            #"type": "proficiencies",
                                            #"from": [op1, op2, ... ]
        self.saving_throws = [] # [STR, WIS, ... ]
        self.starting_equipment = {} # { default : { option:quantity, op2:quant2,...}
                                        #choices : [{a:{op:quant}, b:[]}
                                                #   {a:[], b:[]}, ... ]
        self.class_levels = {}
        self.subclasses = {}
        self.multiclassing = {} # {prerequisites : {score:value}, 
                                #  proficiencies : [op1, op2, op3]}

        self.spellcasting = {}  #{  level : val,
                                #   spellcasting_ability : [INT, WIS ?],
                                #   spells : {} }


    def __str__(self):
        return f"{self.name} - {self.hit_dice}d{self.hit_dice} - {', '.join(f'{key}: {value}' for key, value in self.prerequisites.items())}"