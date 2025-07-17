export interface Character {
    id : number; 
    name : String;
    species : String;
    char_class : String;
    level : number;
    xp: number;
    abilityScores : {[key:string]:number};
}