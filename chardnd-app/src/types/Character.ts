// types/Character.ts
export interface Character {
  id: number;
  name: string;
  species: string;
  char_class: string;
  level: number;
  xp: number;
  abilityScores: { [key: string]: number };
  proficiencies: string[];
  languages: string[];

  hpMax: number;
  hpCurrent: number;
  hpTmp: number;
  ac: number;
  initiative: number;
  speed: number;

  savingThrows: { [key: string]: number }; 
  passivePerception: number;
}