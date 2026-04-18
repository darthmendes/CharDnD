// src/types/api.ts
// Centralized API response types for type safety

// ============ Base Types ============

export interface Species {
    id: number;
    name: string;
    size?: string;
    speed?: number;
    traits?: SpeciesTrait[];
    subspecies?: Subspecies[];
}

export interface Subspecies {
    id: number;
    name: string;
    traits?: SpeciesTrait[];
}

export interface SpeciesTrait {
    id: number;
    name: string;
    description: string;
    source?: string;
}

export interface DnDClass {
    id: number;
    name: string;
    hit_die?: string;
    primary_ability?: string;
    saving_throws?: string[];
    armor_proficiencies?: string[];
    weapon_proficiencies?: string[];
    tool_proficiencies?: string[];
    skill_choices?: string[];
    num_skills?: number;
    spellcasting_ability?: string;
    subclass_level?: number;
    subclasses?: Subclass[];
}

export interface Subclass {
    id: number;
    name: string;
    subclass_flavor?: string;
    description?: string;
}

export interface Background {
    id: number;
    name: string;
    description?: string;
    languages?: string[];
    skill_proficiencies?: string[];
    tool_proficiencies?: string[];
    starting_gold_bonus?: number;
}

export interface Language {
    id: number;
    name: string;
    type?: string;
    script?: string;
}

export interface Spell {
    id: number;
    name: string;
    level: number;
    school: string;
    casting_time?: string;
    range?: string;
    components?: string;
    duration?: string;
    description?: string;
    higher_level?: string;
    classes?: string[];
    ritual?: boolean;
    concentration?: boolean;
}

export interface FightingStyle {
    id: number;
    name: string;
    description: string;
}

export interface Feature {
    id: number;
    name: string;
    description: string;
    class_name?: string;
    level?: number;
}

export interface Monster {
    id: number;
    name: string;
    size?: string;
    type?: string;
    alignment?: string;
    armor_class?: number;
    hit_points?: number;
    hit_dice?: string;
    speed?: string;
    abilities?: Record<string, number>;
    skills?: Record<string, number>;
    challenge_rating?: number;
    xp?: number;
    actions?: MonsterAction[];
    special_abilities?: SpecialAbility[];
}

export interface MonsterAction {
    name: string;
    desc: string;
    attack_bonus?: number;
    damage_dice?: string;
    damage_type?: string;
}

export interface SpecialAbility {
    name: string;
    desc: string;
}

// ============ Item Types ============

export interface Item {
    id: number;
    name: string;
    desc: string;
    weight: number;
    cost: number;
    item_type: string;
    item_category: string;
    rarity: string;
    properties?: string[];
    damageDice?: string;
    damageType?: string;
    versatileDamage?: string;
    specialAbilities?: string[];
    maxCharges?: number;
    currentCharges?: number;
    chargeRecharge?: string;
    onHitEffect?: string;
    requires_attunement?: boolean;
}

export interface InventoryItem extends Item {
    inventoryId: number;
    quantity: number;
    equipped: boolean;
    attuned: boolean;
}

// ============ Character Types ============

export interface CharacterClass {
    className: string;
    level: number;
    subclass?: string;
    chosenSkills?: string[];
}

export interface AbilityScores {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
}

export interface CharacterTrait {
    name: string;
    description: string;
    source: string;
}

export interface Character {
    id: number;
    name: string;
    species: string;
    subspecies?: string;
    background?: Background;
    classes: CharacterClass[];
    level: number;
    xp: number;
    abilityScores: AbilityScores;

    // Proficiencies
    proficientSkills?: string[];
    proficientWeapons?: string[];
    proficientTools?: string[];
    knownLanguages?: string[];
    speciesSkills?: string[];
    backgroundSkills?: string[];

    // Combat stats
    hpMax?: number;
    hpCurrent?: number;
    hpTmp?: number;
    ac?: number;
    initiative?: number;
    speed?: number;
    hitPoints?: number;
    attunementSlotBonus?: number;

    // Other
    savingThrows?: Record<string, number>;
    passivePerception?: number;
    traits?: CharacterTrait[];
    items?: InventoryItem[];
}

export interface CharacterListItem {
    id: number;
    name: string;
}

// ============ Spell Slot Types ============

export interface SpellSlot {
    level: number;
    total: number;
    remaining: number;
    expended: number;
}

export interface SpellSlotResponse {
    slots: SpellSlot[];
}

export interface CharacterSpell {
    id: number;
    spell: Spell;
    prepared: boolean;
    source_class?: string;
}

export interface PrepareLimit {
    limit: number;
    prepared: number;
}

// ============ Request Types ============

export interface CreateCharacterRequest {
    name: string;
    species: string;
    subspecies?: string;
    background: string;
    classes: CharacterClass[];
    abilityScores: AbilityScores;
    classChoices?: ClassChoices;
    selectedItems?: number[];
}

export interface ClassChoices {
    cantrips?: string[];
    fightingStyle?: string;
    subclass?: string;
}

export interface UpdateCharacterRequest {
    name?: string;
    hpCurrent?: number;
    hpTmp?: number;
    xp?: number;
    level?: number;
    [key: string]: unknown;
}

export interface CreateItemRequest {
    name: string;
    desc: string;
    weight: number;
    cost: number;
    item_type: string;
    item_category: string;
    rarity: string;
    properties?: string[];
    damageDice?: string;
    damageType?: string;
    maxCharges?: number;
    chargeRecharge?: string;
}

export interface CreateMonsterRequest {
    name: string;
    size: string;
    type: string;
    alignment?: string;
    armor_class: number;
    hit_points: number;
    hit_dice?: string;
    speed?: string;
    abilities: Record<string, number>;
    skills?: Record<string, number>;
    challenge_rating?: number;
    xp?: number;
    actions?: MonsterAction[];
    special_abilities?: SpecialAbility[];
}

export interface RestRequest {
    type: 'short' | 'long';
    hitDiceSpent?: number;
}

// ============ API Response Wrapper ============

export interface ApiError {
    error: string;
    message?: string;
    details?: unknown;
}

export type ApiResponse<T> = T | ApiError;

export function isApiError(response: unknown): response is ApiError {
    return typeof response === 'object' && response !== null && 'error' in response;
}
