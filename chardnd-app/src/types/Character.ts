export interface AbilityScores {
    strenght : number;
    dexterity : number;
    constitution : number;
    intelligence : number;
    wisdom : number;
    charisma: number;
}

export interface Character {
    id : number; 
    name : String;
    species : String;
    char_class : String;
    level : number;
    abilityScores : AbilityScores;
}