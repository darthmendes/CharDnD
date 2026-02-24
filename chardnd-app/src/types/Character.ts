// src/types/Character.ts
export interface Character {
  id: number;
  name: string;
  species: string;
  subspecies?: string; // ✅ NEW
  background?: {
    description?: string;
    id?: number;
    languages?: string[];
    name: string;
    skill_proficiencies?: string[];
    starting_gold_bonus?: number;
    tool_proficiencies?: string[];
  };
  classes: Array<{ // ✅ NEW (multiclass)
    className: string;
    level: number;
    subclass: string;
    chosenSkills: string[];
  }>;
  level: number;
  xp: number;
  abilityScores: { 
    str: number;
    dex: number; 
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  // ✅ NEW detailed proficiencies
  proficientSkills?: string[];
  proficientWeapons?: string[];
  proficientTools?: string[];
  knownLanguages?: string[];
  hitPoints?: number;

  hpMax?: number;
  hpCurrent?: number;
  hpTmp?: number;
  ac?: number;
  initiative?: number;
  speed?: number;
  savingThrows?: { [key: string]: number }; 
  passivePerception?: number;
  items?: Array<{
    id?: number;
    name: string;
    item_type?: string;
    type?: string;
    damageDice?: string;
    damageType?: string;
    desc?: string;
    weight?: number;
    cost?: number;
    item_category?: string;
    rarity?: string;
    properties?: string[];
    specialAbilities?: string[];
    quantity?: number;
    maxCharges?: number;
    currentCharges?: number;
    chargeRecharge?: string;
    onHitEffect?: string;
    inventoryId?: number;
    [key: string]: any;
  }>;
}