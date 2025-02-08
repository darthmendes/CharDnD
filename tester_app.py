from Frontend.code.character import Character, Ability_scores


if __name__ == '__main__':
    ab_scores = Ability_scores(11,12,15,14,10,8)
    new_char = Character('Guillian Torgar', {'Druid': 1}, 'Human', ab_scores)
    print(new_char.__dict__())  # prints the character's attributes
    new_char.add_language('Elvish')
    print(new_char.__dict__())  # prints the character's attributes