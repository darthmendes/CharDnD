from Backend.src.character import Character
char1 = {
    'name': 'Gwinleth',
    'level' : 12,
    'char_class' : 'druid',
    'species' : 'half-elf',
    'abilityScores': {'strenght' : 11,
                      'constitution':12,
                      'dexterity':13,
                      'inteligence':14,
                      'wisdom':15,
                      'charisma':16}
}

character1 = Character.new(char1)