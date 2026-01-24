// src/components/CharacterCreator/types.ts

export interface Species {
  id: number;
  name: string;
  hasSubrace?: boolean;
  subraces?: string[];
  traits?: string[];
}

export interface DnDClass {
  id: number;
  name: string;
  hasSubclass?: boolean;
  subclasses?: string[];
  equipmentOptions?: string[]; // e.g., "chain mail OR leather armor"
}

export interface CharacterClassLevel {
  className: string;
  level: number;
  subclass?: string;
}

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface EquipmentItem {
  id?: number;
  name: string;
  quantity: number;
  isCustom: boolean;
}

export interface CharacterData {
  name: string;
  background: string;
  species: string;
  speciesChoices?: Record<string, string>;
  classes: CharacterClassLevel[];
  abilityScores: AbilityScores;
  equipment: EquipmentItem[];
  gold: number; // in gold pieces (GP)
}