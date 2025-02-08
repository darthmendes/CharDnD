level_up_xp = [0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000]

all_skills = {
                "Athletics":"STR",
                "Acrobatics":"DEX",
                "Sleight of Hand":"DEX",
                "Stealth" : "DEX",
                "Arcana": "INT",
                "History": "INT",
                "Investigation": "INT",
                "Nature": "INT",
                "Religion": "INT",
                "Animal Handling":"WIS",
                "Insight": "WIS",
                "Medicine":"WIS",
                "Perception":"WIS",
                "Survival":"WIS",
                "Persuasion": "CHA",
                "Deception": "CHA",
                "Intimidation": "CHA",
                "Performance": "CHA"}




class Character():
    def __init__(self, name, class_, race, ability_scores):

        self.name = name
        self.race = race
        self.class_ = class_ 
        self.ability_scores = ability_scores
    
        self.xp = 0
        self.level = 1
        
        self.hp = HP(0,0,0)
        
        self.skills = []
        self.inventory = []
        self.equipment = []
        self.languages = []
        self.features = []

    def __dict__(self):
        return {
            "name": self.name,
            "class": self.class_,
            "race": self.race,
            "ability_scores": self.ability_scores.__dict__(),
            "xp": self.xp,
            "level": self.level,
            "HP": self.hp.__dict__(),
            "skills": self.skills,
            "inventory": self.inventory,
            "equipment": self.equipment,
            "languages": self.languages,
            "features": self.features
            }

        # print all skills with the correct modifiers based on proficiency
    def list_all_skills(self):
        for i in all_skills:
            mod = self.ability_scores.get_score_modifier(all_skills[i])
            if i in self.skills:
                mod =  mod + self.proficiency_bonus

            symbol = ''
            if mod > 0:
                symbol = '+'
            print(f"\t- {i}: {symbol}{mod}")

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
    def add_prof_skill (self, skill):
        self.skills.append(skill)

    # Removes Skills from the Character
    def remove_prof_skill(self, skill):
        if skill in self.skills: self.skills.remove(skill)

    # adds Items to Inventory
    def add_inventory (self, inventory):
        self.inventory.append(inventory)
    
    # Removes Items from Inventory
    def remove_inventory (self, inventory):
        self.inventory.remove(inventory)
    
    # Calculates the carrying weight in Kgs
    def carrying_capacity(self):
        return self.ability_scores.get_score('STR') * 15 * 0.4536
    
    # Increases a Specific Ability Score
    def increase_ability (self, ability, amount):
        self.ability_scores.increase(ability, amount)

    def set_ability_score (self, ability, amount):
        self.ability_scores.set(ability, amount)

    # Decreases a Specific Ability Score
    def decrease_ability (self, ability, amount):
        self.ability_scores.decrease(ability, amount)

############################################################################################################################################################333
class HP():
    def __init__(self, max_hp, current_hp, tmp_hp):
        self.max_hp = max_hp
        self.current_hp = current_hp
        self.tmp_hp = tmp_hp
    
    def __dict__(self):
        return {
            "max_hp": self.max_hp,
            "current_hp": self.current_hp,
            "tmp_hp": self.tmp_hp
            }
    


############################################################################################################################################################333

# Class that deals with ability scores operations         
class Ability_scores :
    def __init__(self, STR, DEX, CON, INT, WIS, CHA):
        self.STR = STR
        self.DEX = DEX
        self.CON = CON
        self.INT = INT
        self.WIS = WIS
        self.CHA = CHA

    def __dict__(self):
        return {
            "STR": self.STR,
            "DEX": self.DEX,
            "CON": self.CON,
            "INT": self.INT,
            "WIS": self.WIS,
            "CHA": self.CHA
            }

    def get_score_modifier (self, score):
        return round((self.__dict__[score]-10) / 2)
    
    def increase (self, ability, amount):
        if ability in self.__dict__:
            self.__dict__[ability] += amount

    def decrease (self, ability, amount):
        if ability in self.__dict__:
            self.__dict__[ability] -= amount
        
        if self.__dict__[ability] < 1:
                self.__dict__[ability] = 1

    def get (self, name):
        return self.__dict__[name]
    
    def set (self, name, amount):
        if name in self.__dict__:
            if amount < 0: amount = 1
            self.__dict__[name] = amount

    def __str__ (self):
        return f"STR: {self.STR}   DEX: {self.DEX}   CON: {self.CON}   INT: {self.INT}   WIS: {self.WIS}   CHA: {self.CHA}"
    
    