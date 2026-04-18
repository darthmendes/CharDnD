// src/constants.ts

// ============ API Configuration ============
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001/API';

// ============ Game Constants ============
export const DEFAULT_ATTUNEMENT_SLOTS = 3;
export const MAX_LEVEL = 20;
export const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
export type Ability = typeof ABILITIES[number];

// Standard 5e ASI levels by class
export const ASI_LEVELS: Record<string, number[]> = {
  Fighter: [4, 6, 8, 12, 14, 16, 19],
  Rogue: [4, 8, 10, 12, 16, 19],
  default: [4, 8, 12, 16, 19],
};

export const getASILevels = (className: string): number[] => {
  return ASI_LEVELS[className] || ASI_LEVELS.default;
};

// Classes that can cast cantrips
export const CANTRIP_CASTERS = ['Sorcerer', 'Warlock', 'Wizard', 'Druid', 'Cleric', 'Bard'] as const;

// Classes that can choose fighting styles
export const FIGHTING_STYLE_CLASSES = ['Fighter', 'Paladin', 'Ranger'] as const;

// Cantrips known by class at level 1
export const CANTRIP_COUNTS: Record<string, number> = {
  Wizard: 3,
  Sorcerer: 4,
  Warlock: 2,
  Druid: 2,
  Cleric: 3,
  Bard: 2,
};

// Subclass labels by class
export const SUBCLASS_LABELS: Record<string, string> = {
  Cleric: 'Choose Divine Domain',
  Wizard: 'Choose Arcane Tradition',
  Fighter: 'Choose Martial Archetype',
  Paladin: 'Choose Sacred Oath',
  Ranger: 'Choose Hunter Archetype',
  Barbarian: 'Choose Primal Path',
  Druid: 'Choose Druid Circle',
  Monk: 'Choose Monastic Tradition',
  Rogue: 'Choose Roguish Archetype',
  Sorcerer: 'Choose Sorcerous Origin',
  Warlock: 'Choose Otherworldly Patron',
  Bard: 'Choose Bard College',
};

// ============ Equipment Packs ============

// Virtual pack items shown in ItemModal
export const VIRTUAL_PACKS = [
  {
    id: "pack_explorer",
    name: "Explorer's Pack",
    item_type: "Wondrous Item",
    item_category: "Equipment Pack",
    rarity: "common",
    desc: "Includes a backpack, bedroll, mess kit, tinderbox, 10 torches, 10 days of rations, waterskin, and 50 feet of hempen rope.",
    weight: 59,
    cost: 1000, // 10 gp = 1000 cp
  },
  {
    id: "pack_dungeoneer",
    name: "Dungeoneer's Pack",
    item_type: "Wondrous Item",
    item_category: "Equipment Pack",
    rarity: "common",
    desc: "Includes a backpack, crowbar, hammer, 10 pitons, 10 torches, 10 days of rations, waterskin, and 50 feet of hempen rope.",
    weight: 69,
    cost: 1200, // 12 gp
  },
  {
    id: "pack_priest",
    name: "Priest's Pack",
    item_type: "Wondrous Item",
    item_category: "Equipment Pack",
    rarity: "common",
    desc: "Includes a backpack, blanket, 10 candles, tinderbox, alms box, censer, vestments, 2 days of rations, and waterskin.",
    weight: 25,
    cost: 500, // 5 gp
  },
] as const;

// [NOTE] Pack contents (matches BACKEND PACK_DEFINITIONS exactly)
export const PACK_CONTENTS: Record<string, Array<{ name: string; quantity: number }>> = {
  "Explorer's Pack": [
    { name: "Backpack", quantity: 1 },
    { name: "Bedroll", quantity: 1 },
    { name: "Mess Kit", quantity: 1 },
    { name: "Tinderbox", quantity: 1 },
    { name: "Torch", quantity: 10 },
    { name: "Rations", quantity: 10 },
    { name: "Waterskin", quantity: 1 },
    { name: "Hempen Rope (50 ft)", quantity: 1 },
  ],
  "Dungeoneer's Pack": [
    { name: "Backpack", quantity: 1 },
    { name: "Crowbar", quantity: 1 },
    { name: "Hammer", quantity: 1 },
    { name: "Piton", quantity: 10 },
    { name: "Torch", quantity: 10 },
    { name: "Rations", quantity: 10 },
    { name: "Waterskin", quantity: 1 },
    { name: "Hempen Rope (50 ft)", quantity: 1 },
  ],
  "Priest's Pack": [
    { name: "Backpack", quantity: 1 },
    { name: "Blanket", quantity: 1 },
    { name: "Candle", quantity: 10 },
    { name: "Tinderbox", quantity: 1 },
    { name: "Alms Box", quantity: 1 },
    { name: "Censer", quantity: 1 },
    { name: "Vestments", quantity: 1 },
    { name: "Rations", quantity: 2 },
    { name: "Waterskin", quantity: 1 },
  ],
};

// Derived list of pack names (for quick lookup)
export const PACK_NAMES = VIRTUAL_PACKS.map(p => p.name) as string[];