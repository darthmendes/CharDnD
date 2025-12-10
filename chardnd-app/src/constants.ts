// src/constants.ts

// Virtual pack items shown in ItemModal
export const VIRTUAL_PACKS = [
  {
    id: "pack_explorer",
    name: "Explorer's Pack",
    type: "Wondrous Item",
    item_category: "Equipment Pack",
    rarity: "common",
    desc: "Includes a backpack, bedroll, mess kit, tinderbox, 10 torches, 10 days of rations, waterskin, and 50 feet of hempen rope.",
    weight: 59,
    cost: 1000, // 10 gp = 1000 cp
  },
  {
    id: "pack_dungeoneer",
    name: "Dungeoneer's Pack",
    type: "Wondrous Item",
    item_category: "Equipment Pack",
    rarity: "common",
    desc: "Includes a backpack, crowbar, hammer, 10 pitons, 10 torches, 10 days of rations, waterskin, and 50 feet of hempen rope.",
    weight: 69,
    cost: 1200, // 12 gp
  },
  {
    id: "pack_priest",
    name: "Priest's Pack",
    type: "Wondrous Item",
    item_category: "Equipment Pack",
    rarity: "common",
    desc: "Includes a backpack, blanket, 10 candles, tinderbox, alms box, censer, vestments, 2 days of rations, and waterskin.",
    weight: 25,
    cost: 500, // 5 gp
  },
] as const;

// ✅ Pack contents (matches BACKEND PACK_DEFINITIONS exactly)
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