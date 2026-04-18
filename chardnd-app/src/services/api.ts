// src/services/api.ts
// Centralized API service with proper TypeScript types

import { API_BASE_URL } from '../constants';
import type {
  Character,
  CharacterListItem,
  Species,
  SpeciesTrait,
  DnDClass,
  Background,
  Language,
  Item,
  InventoryItem,
  Spell,
  FightingStyle,
  Feature,
  Monster,
  SpellSlotResponse,
  CharacterSpell,
  PrepareLimit,
  CreateCharacterRequest,
  UpdateCharacterRequest,
  CreateItemRequest,
  CreateMonsterRequest,
  RestRequest,
} from '../types/api';

// ============ API Utilities ============

/** Generic API error handler */
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`
    }));
    throw new Error(errorData.error || 'Request failed');
  }
  return response.json();
};

/** JSON headers for POST/PATCH requests */
const jsonHeaders = { 'Content-Type': 'application/json' };

// ============ Species Endpoints ============

export const fetchSpecies = async (): Promise<Species[]> => {
  const response = await fetch(`${API_BASE_URL}/species`);
  return handleResponse(response);
};

export const fetchSpeciesTraits = async (
  speciesName: string,
  subspeciesName?: string
): Promise<SpeciesTrait[]> => {
  const url = new URL(`${API_BASE_URL}/species/${encodeURIComponent(speciesName)}/traits`);
  if (subspeciesName) {
    url.searchParams.append('subspecies', subspeciesName);
  }
  const response = await fetch(url.toString());
  if (!response.ok) return [];
  return response.json();
};

// ============ Class Endpoints ============

export const fetchClasses = async (): Promise<DnDClass[]> => {
  const response = await fetch(`${API_BASE_URL}/classes`);
  return handleResponse(response);
};

export const fetchClassSpells = async (
  className: string,
  options?: { level?: number }
): Promise<Spell[]> => {
  const url = new URL(`${API_BASE_URL}/classes/${encodeURIComponent(className)}/spells`);
  if (options?.level !== undefined) {
    url.searchParams.append('level', String(options.level));
  }
  const response = await fetch(url.toString());
  return handleResponse(response);
};

export const fetchFightingStyles = async (): Promise<FightingStyle[]> => {
  const response = await fetch(`${API_BASE_URL}/fighting-styles`);
  return handleResponse(response);
};

// ============ Background & Language Endpoints ============

export const fetchBackgrounds = async (): Promise<Background[]> => {
  const response = await fetch(`${API_BASE_URL}/backgrounds`);
  return handleResponse(response);
};

export const fetchLanguages = async (): Promise<Language[]> => {
  const response = await fetch(`${API_BASE_URL}/languages`);
  return handleResponse(response);
};

// ============ Character Endpoints ============

export const createCharacter = async (data: CreateCharacterRequest): Promise<Character> => {
  const response = await fetch(`${API_BASE_URL}/characters/creator`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const fetchCharacter = async (id: number): Promise<Character> => {
  const response = await fetch(`${API_BASE_URL}/characters/${id}`);
  return handleResponse(response);
};

export const fetchAllCharacters = async (): Promise<CharacterListItem[]> => {
  const response = await fetch(`${API_BASE_URL}/characters`);
  return handleResponse(response);
};

export const updateCharacter = async (
  id: number,
  data: UpdateCharacterRequest
): Promise<Character> => {
  const response = await fetch(`${API_BASE_URL}/characters/${id}`, {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteCharacter = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/characters/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

// ============ Inventory Endpoints ============

export const addItemToCharacter = async (
  charId: number,
  itemId: number,
  quantity = 1
): Promise<InventoryItem> => {
  const response = await fetch(`${API_BASE_URL}/characters/${charId}/items`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ itemID: itemId, quantity }),
  });
  return handleResponse(response);
};

export const deleteInventoryItem = async (
  charId: number,
  inventoryId: number
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/characters/${charId}/inventory/${inventoryId}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

export const updateItemCharges = async (
  charId: number,
  inventoryId: number,
  currentCharges: number
): Promise<InventoryItem> => {
  const response = await fetch(`${API_BASE_URL}/characters/${charId}/inventory/${inventoryId}/charges`, {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify({ currentCharges }),
  });
  return handleResponse(response);
};

export const equipItem = async (charId: number, inventoryId: number): Promise<InventoryItem> => {
  const response = await fetch(`${API_BASE_URL}/characters/${charId}/inventory/${inventoryId}/equip`, {
    method: 'PATCH',
  });
  return handleResponse(response);
};

export const unequipItem = async (charId: number, inventoryId: number): Promise<InventoryItem> => {
  const response = await fetch(`${API_BASE_URL}/characters/${charId}/inventory/${inventoryId}/unequip`, {
    method: 'PATCH',
  });
  return handleResponse(response);
};

export const attuneItem = async (charId: number, inventoryId: number): Promise<InventoryItem> => {
  const response = await fetch(`${API_BASE_URL}/characters/${charId}/inventory/${inventoryId}/attune`, {
    method: 'PATCH',
  });
  return handleResponse(response);
};

export const unattuneItem = async (charId: number, inventoryId: number): Promise<InventoryItem> => {
  const response = await fetch(`${API_BASE_URL}/characters/${charId}/inventory/${inventoryId}/unattune`, {
    method: 'PATCH',
  });
  return handleResponse(response);
};

export const removeOneItem = async (charId: number, inventoryId: number): Promise<InventoryItem> => {
  const response = await fetch(`${API_BASE_URL}/characters/${charId}/inventory/${inventoryId}/remove-one`, {
    method: 'PATCH',
  });
  return handleResponse(response);
};

// ============ Spell Endpoints ============

export const fetchSpellSlots = async (charId: number): Promise<SpellSlotResponse> => {
  const response = await fetch(`${API_BASE_URL}/characters/${charId}/spell-slots`);
  return handleResponse(response);
};

export const expendSpellSlot = async (
  charId: number,
  level: number,
  amount = 1
): Promise<SpellSlotResponse> => {
  const response = await fetch(`${API_BASE_URL}/characters/${charId}/spell-slots/expended`, {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify({ level, amount }),
  });
  return handleResponse(response);
};

export const fetchCharacterSpells = async (charId: number): Promise<CharacterSpell[]> => {
  const response = await fetch(`${API_BASE_URL}/characters/${charId}/spells`);
  return handleResponse(response);
};

export const addSpellToCharacter = async (charId: number, spellId: number): Promise<CharacterSpell> => {
  const response = await fetch(`${API_BASE_URL}/characters/${charId}/spells`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ spellID: spellId }),
  });
  return handleResponse(response);
};

export const toggleSpellPrepared = async (charId: number, spellId: number): Promise<CharacterSpell> => {
  const response = await fetch(`${API_BASE_URL}/characters/${charId}/spells/${spellId}/prepare`, {
    method: 'PATCH',
  });
  return handleResponse(response);
};

export const fetchPrepareLimit = async (charId: number): Promise<PrepareLimit> => {
  const response = await fetch(`${API_BASE_URL}/characters/${charId}/prepare-limit`);
  return handleResponse(response);
};

export const bulkPrepareSpells = async (charId: number, spellIds: number[]): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/characters/${charId}/spells/bulk-prepare`, {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify({ spellIDs: spellIds }),
  });
  return handleResponse(response);
};

export const bulkUnprepareSpells = async (charId: number, spellIds: number[]): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/characters/${charId}/spells/bulk-unprepare`, {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify({ spellIDs: spellIds }),
  });
  return handleResponse(response);
};

export const fetchAllSpells = async (): Promise<Spell[]> => {
  const response = await fetch(`${API_BASE_URL}/spells`);
  return handleResponse(response);
};

// ============ Item Endpoints ============

export const fetchItems = async (): Promise<Item[]> => {
  const response = await fetch(`${API_BASE_URL}/items`);
  return handleResponse(response);
};

export const fetchItem = async (itemId: number | string): Promise<Item> => {
  const response = await fetch(`${API_BASE_URL}/items/${itemId}`);
  return handleResponse(response);
};

export const createItem = async (itemData: CreateItemRequest): Promise<Item> => {
  const response = await fetch(`${API_BASE_URL}/items/creator`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(itemData),
  });
  return handleResponse(response);
};

// ============ Monster Endpoints ============

export const createMonster = async (monsterData: CreateMonsterRequest): Promise<Monster> => {
  const response = await fetch(`${API_BASE_URL}/monsters`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(monsterData),
  });
  return handleResponse(response);
};

export const fetchMonster = async (id: number): Promise<Monster> => {
  const response = await fetch(`${API_BASE_URL}/monsters/${id}`);
  return handleResponse(response);
};

// ============ Feature Endpoints ============

export const fetchFeatures = async (): Promise<Feature[]> => {
  const response = await fetch(`${API_BASE_URL}/features`);
  if (!response.ok) return [];
  return response.json();
};

// ============ Rest Endpoints ============

export const performRest = async (
  characterId: number,
  restData: RestRequest
): Promise<Character> => {
  const response = await fetch(`${API_BASE_URL}/characters/${characterId}/rest`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(restData),
  });
  return handleResponse(response);
};