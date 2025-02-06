
class Skill:
    def __init__(self, name, Ability) :
        self.name = name
        self.Ability = Ability
    
    def get_ability(self):
        return self.Ability
    
    def __str__ (self):
        return f'{self.name}'
