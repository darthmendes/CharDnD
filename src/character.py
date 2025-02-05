level_up_xp = [0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000]

all_skills = {
                "Athletics":"Strenght",
                "Acrobatics":"Dexterity",
                "Sleight of Hand":"Dexterity",
                "Stealth" : "Dexterity",
                "Arcana": "Intelligence",
                "History": "Intelligence",
                "Investigation": "Intelligence",
                "Nature": "Intelligence",
                "Religion": "Intelligence",
                "Animal Handling":"Wisdom",
                "Insight": "Wisdom",
                "Medicine":"Wisdom",
                "Perception":"Wisdom",
                "Survival":"Wisdom",
                "Persuasion": "Charisma",
                "Deception": "Charisma",
                "Intimidation": "Charisma",
                "Performance": "Charisma"}

class Skill:
    def __init__(self, name, Ability) :
        self.name = name
        self.Ability = Ability
    
    def get_ability(self):
        return self.Ability
    
    def __str__ (self):
        return f'{self.name}'

# Character Sheet Information and Updates
class Character_sheet : 
    def __init__(self, name, race, ability_scores, base_class, background="None", alignment="Neutral Neutral",level = 1, skills=[], features=[], languages = []):
        self.name = name
        self.level = level
        self.xp = level_up_xp[level]
        self.race = race
        self.class_ = {base_class.name: {"level": level}}
        self.background = background
        self.alignment = alignment
        
        self.base_ability_scores = ability_scores
        self.ability_scores = ability_scores
        
        self.skills = []
        for skill in skills:
            self.skills.append(skill)

        self.inventory = []
        self.features = features

        self.languages = []
        for lang in languages:
            self.languages.append(lang)
        
        #self.ability_scores = self.calc_ability_scores()
        self.proficiency_bonus = 2 + (self.level - 1) // 4
        self.hitpoints = (self.level * 8) + 8 # needs update for multiclass and to use class hit die 
        
        #self.speed = race.speed
        self.initiative = ability_scores.get_ability_score_modifier('dexterity')
        self.armor_class = 10 + ability_scores.get_ability_score_modifier('dexterity')
        self.passive_perception = 10 + ability_scores.get_ability_score_modifier('wisdom') # needs to add prof bonus if proficient


    # adding Xp to the character and check if level up
    # needing to add prompt for level up and allow to choose which class
    def add_xp (self, xp):
        self.xp += xp
        if self.xp > level_up_xp[19]:
            self.level = 20
            return
        
        while self.xp > level_up_xp[self.level]:
            self.level += 1
        
            
    # just changes the name in the Character sheet
    def change_name(self, name):
        self.name = name
    
    # Changes the Character alignment
    def change_alignment (self, alignment):
        self.alignment = alignment
    
    # Adds Languages to the Character
    def add_language (self, language):
        self.languages.append(language)

    # Removes Languages from the Character
    def remove_language(self, language):
        if language in self.languages: self.languages.remove(language)

    # Adds Skills to the Character
    def add_skill (self, skill):
        self.skills.append(skill)

    # Removes Skills from the Character
    def remove_skill(self, skill):
        if skill in self.skills: self.skills.remove(skill)

    # adds Items to Inventory
    def add_inventory (self, inventory):
        self.inventory.append(inventory)
    
    # Removes Items from Inventory
    def remove_inventory (self, inventory):
        self.inventory.remove(inventory)
    
    # Calculates the carrying weight in Kgs
    def carrying_capacity(self):
        return self.ability_scores['Strenght'] * 15 * 0.4536
    
    # Increases a Specific Ability Score
    def increase_ability (self, ability, amount):
        if ability in self.ability_scores:
            self.ability_scores[ability] += amount
        else:
            print("Invalid Ability")

    # Decreases a Specific Ability Score
    def decrease_ability (self, ability, amount):
        if ability in self.ability_scores:
            self.ability_scores[ability] -= amount
            if self.ability_scores[ability] < 1:
                self.ability_scores[ability] = 1
        else:
            print("Invalid Ability")

    
    # Prints the entire sheet to console
    def show_sheet(self):
        print(f"\nName: {self.name}")
        print(f"Race: {self.race}          Alignment: {self.alignment}")
        print(f"Level: {self.level}   XP: {self.xp}")
        print(f"Class: {self.class_}")
        print(f"\nAbility Scores:\n{self.ability_scores}\n")
        print(f"Initiative: +{self.initiative}   AC: {self.armor_class}   Passive Perception: {self.passive_perception}")
        print(f"Skills: {self.skills}")
        print(f"Languages: {self.languages}")
        
        

# Class that deals with ability scores operations         
class Ability_scores :
    def __init__(self, strength, dexterity, constitution, intelligence, wisdom, charisma):
        self.strength = strength
        self.dexterity = dexterity
        self.constitution = constitution
        self.intelligence = intelligence
        self.wisdom = wisdom
        self.charisma = charisma

    def get_ability_score_modifier (self, score):
        return round((self.__dict__[score]-10) / 2)
    
    def increase_ability_score (self, ability, amount):
        if ability in self.__dict__:
            self.__dict__[ability] += amount

    def decrease_ability_score (self, ability, amount):
        if ability in self.__dict__:
            self.__dict__[ability] -= amount
        
        if self.__dict__[ability] < 1:
                self.__dict__[ability] = 1

    def __str__ (self):
        return f"STR: {self.strength}   DEX: {self.dexterity}   CON: {self.constitution}   INT: {self.intelligence}   WIS: {self.wisdom}   CHA: {self.charisma}"