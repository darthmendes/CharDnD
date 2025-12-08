// src/constants.ts
export const VIRTUAL_PACKS = [
  {
    id: "pack_explorer",
    name: "Explorer's Pack",
    type: "Wondrous Item",
    item_category: "Equipment Pack",
    rarity: "common",
    desc: "Includes a backpack, bedroll, mess kit, tinderbox, 10 torches, 10 days of rations, waterskin, and 50 feet of hempen rope.",
    weight: 59,
    cost: 1000, // 10 gp in copper
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

export const PACK_NAMES = VIRTUAL_PACKS.map(p => p.name);