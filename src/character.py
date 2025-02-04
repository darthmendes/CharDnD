level_up_xp = [0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000]


# Character Sheet Information and Updates
class Character_sheet : 
    def __init__(self, name, level,  race, class_, background, alignment, ability_scores, skills, features, languages):
        self.name = name
        self.level = level
        self.xp = level_up_xp[level]
        self.race = race
        self.class_ = class_
        self.background = background
        self.alignment = alignment
        self.ability_scores = ability_scores
        self.skills = skills
        self.inventory = []
        self.features = features
        self.languages = languages
        
        self.proficiency_bonus = self.proficiency_bonus_calc()
        self.hitpoints = self.hitpoint_calc()
        self.speed = self.speed_calc()
        self.initiative = self.initiative_calc()
        self.armor_class = self.ac






    def add_xp (self, xp):
        self.xp += xp
        if self.xp > level_up_xp[self.level]:
            self.level += 1
            
    def change_name(self, name):
        self.name = name
    
    def change_alignment (self, alignment):
        self.alignment = alignment
    
    def add_language (self, language):
        self.languages.append(language)

    def add_inventory (self, inventory):
        self.inventory.append(inventory)
    
    def remove_inventory (self, inventory):
        self.inventory.remove(inventory)
    
    # carrying weight in Kgs
    def carrying_capacity(self):
        return self.ability_scores['Strenght'] * 15 * 0.4536
    

# Class that deals with ability scores operations         
class ability_scores :
    def __init__(self, strength, dexterity, constitution, intelligence, wisdom, charisma):
        self.strength = strength
        self.dexterity = dexterity
        self.constitution = constitution
        self.intelligence = intelligence
        self.wisdom = wisdom
        self.charisma = charisma

    def ability_scores_modifiers (self):
        return {
            'Strength': self.strength - 10,
            'Dexterity': self.dexterity - 10,
            'Constitution': self.constitution - 10,
            'Intelligence': self.intelligence - 10,
            'Wisdom': self.wisdom - 10,
            'Charisma': self.charisma - 10
            }
    
    def increase_ability_score (self, ability, amount):
        if ability in self.__dict__:
            self.__dict__[ability] += amount

    def decrease_ability_score (self, ability, amount):
        if ability in self.__dict__:
            self.__dict__[ability] -= amount
        
        if self.__dict__[ability] < 1:
                self.__dict__[ability] = 1


# Class that controls the different classes
# TODO add subclass and class features
# dif presets for them all 
class class_:
    def __init__(self, name, level):
        self.name = name
        self.level = level
    
    def level_up(self, amount):
        self.level += amount

