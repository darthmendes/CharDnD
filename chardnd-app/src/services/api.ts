// src/services/api.ts

const API_BASE = 'http://127.0.0.1:8001/API';

/**
 * Generic API error handler
 */
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`
    }));
    throw new Error(errorData.error || 'Request failed');
  }
  return response.json();
};

/**
 * Create a new character
 */
export const createCharacter = async (data: any): Promise<any> => {
  const response = await fetch(`${API_BASE}/characters/creator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

/**
 * Fetch all species
 */
export const fetchSpecies = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE}/species`);
  return handleResponse(response);
};

/**
 * Fetch all classes
 */
export const fetchClasses = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE}/classes`);
  return handleResponse(response);
};

/**
 * Fetch all items
 */
export const fetchItems = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE}/items`);
  return handleResponse(response);
};

/**
 * Fetch all backgrounds
 */
export const fetchBackgrounds = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE}/backgrounds`);
  return handleResponse(response);
};

/**
 * Fetch all languages
 */
export const fetchLanguages = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE}/languages`);
  return handleResponse(response);
};

/**
 * Fetch species traits
 */
export const fetchSpeciesTraits = async (speciesName: string, subspeciesName?: string): Promise<any[]> => {
  try {
    const url = new URL(`${API_BASE}/species/${encodeURIComponent(speciesName)}/traits`);
    if (subspeciesName) {
      url.searchParams.append('subspecies', subspeciesName);
    }
    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error(`Failed to fetch traits for species: ${speciesName}`);
      return [];
    }
    return response.json();
  } catch (err) {
    console.error('Error fetching species traits:', err);
    return [];
  }
};

/**
 * Fetch a specific character by ID
 */
export const fetchCharacter = async (id: number): Promise<any> => {
  const response = await fetch(`${API_BASE}/characters/${id}`);
  return handleResponse(response);
};

/**
 * Delete a character by ID
 */
export const deleteCharacter = async (id: number): Promise<any> => {
  const response = await fetch(`${API_BASE}/characters/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

/**
 * Fetch all characters
 */
export const fetchAllCharacters = async (): Promise<{ id: number; name: string }[]> => {
  const response = await fetch(`${API_BASE}/characters`);
  return handleResponse(response);
};

/**
 * Update a character by ID
 */
export const updateCharacter = async (id: number, data: Record<string, any>): Promise<any> => {
  const response = await fetch(`${API_BASE}/characters/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

/**
 * Add item to character inventory
 */
export const addItemToCharacter = async (charId: number, itemId: number, quantity: number = 1): Promise<any> => {
  const response = await fetch(`${API_BASE}/characters/${charId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemID: itemId, quantity }),
  });
  return handleResponse(response);
};

/**
 * Delete inventory item
 */
export const deleteInventoryItem = async (charId: number, inventoryId: number): Promise<any> => {
  const response = await fetch(`${API_BASE}/characters/${charId}/inventory/${inventoryId}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

/**
 * Update item charges
 */
export const updateItemCharges = async (charId: number, inventoryId: number, currentCharges: number): Promise<any> => {
  const response = await fetch(`${API_BASE}/characters/${charId}/inventory/${inventoryId}/charges`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentCharges }),
  });
  return handleResponse(response);
};

/**
 * Equip item
 */
export const equipItem = async (charId: number, inventoryId: number): Promise<any> => {
  const response = await fetch(`${API_BASE}/characters/${charId}/inventory/${inventoryId}/equip`, {
    method: 'PATCH',
  });
  return handleResponse(response);
};

/**
 * Unequip item
 */
export const unequipItem = async (charId: number, inventoryId: number): Promise<any> => {
  const response = await fetch(`${API_BASE}/characters/${charId}/inventory/${inventoryId}/unequip`, {
    method: 'PATCH',
  });
  return handleResponse(response);
};

/**
 * Attune item
 */
export const attuneItem = async (charId: number, inventoryId: number): Promise<any> => {
  const response = await fetch(`${API_BASE}/characters/${charId}/inventory/${inventoryId}/attune`, {
    method: 'PATCH',
  });
  return handleResponse(response);
};

/**
 * Unattune item
 */
export const unattuneItem = async (charId: number, inventoryId: number): Promise<any> => {
  const response = await fetch(`${API_BASE}/characters/${charId}/inventory/${inventoryId}/unattune`, {
    method: 'PATCH',
  });
  return handleResponse(response);
};

/**
 * Remove one item from inventory
 */
export const removeOneItem = async (charId: number, inventoryId: number): Promise<any> => {
  const response = await fetch(`${API_BASE}/characters/${charId}/inventory/${inventoryId}/remove-one`, {
    method: 'PATCH',
  });
  return handleResponse(response);
};

/**
 * Fetch spell slots for a character
 */
export const fetchSpellSlots = async (charId: number): Promise<any> => {
  const response = await fetch(`${API_BASE}/characters/${charId}/spell-slots`);
  return handleResponse(response);
};

/**
 * Expend spell slot
 */
export const expendSpellSlot = async (charId: number, level: number, amount: number = 1): Promise<any> => {
  const response = await fetch(`${API_BASE}/characters/${charId}/spell-slots/expended`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level, amount }),
  });
  return handleResponse(response);
};

/**
 * Fetch character spells
 */
export const fetchCharacterSpells = async (charId: number): Promise<any[]> => {
  const response = await fetch(`${API_BASE}/characters/${charId}/spells`);
  return handleResponse(response);
};

/**
 * Add spell to character
 */
export const addSpellToCharacter = async (charId: number, spellId: number): Promise<any> => {
  const response = await fetch(`${API_BASE}/characters/${charId}/spells`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ spellID: spellId }),
  });
  return handleResponse(response);
};

/**
 * Toggle spell prepared status
 */
export const toggleSpellPrepared = async (charId: number, spellId: number): Promise<any> => {
  const response = await fetch(`${API_BASE}/characters/${charId}/spells/${spellId}/prepare`, {
    method: 'PATCH',
  });
  return handleResponse(response);
};

/**
 * Fetch prepare limit for character
 */
export const fetchPrepareLimit = async (charId: number): Promise<any> => {
  const response = await fetch(`${API_BASE}/characters/${charId}/prepare-limit`);
  return handleResponse(response);
};

/**
 * Bulk prepare spells
 */
export const bulkPrepareSpells = async (charId: number, spellIds: number[]): Promise<any> => {
  const response = await fetch(`${API_BASE}/characters/${charId}/spells/bulk-prepare`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ spellIDs: spellIds }),
  });
  return handleResponse(response);
};

/**
 * Bulk unprepare spells
 */
export const bulkUnprepareSpells = async (charId: number, spellIds: number[]): Promise<any> => {
  const response = await fetch(`${API_BASE}/characters/${charId}/spells/bulk-unprepare`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ spellIDs: spellIds }),
  });
  return handleResponse(response);
};

/**
 * Fetch class spells
 */
export const fetchClassSpells = async (className: string): Promise<any[]> => {
  const response = await fetch(`${API_BASE}/classes/${encodeURIComponent(className)}/spells`);
  return handleResponse(response);
};

/**
 * Fetch all spells
 */
export const fetchAllSpells = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE}/spells`);
  return handleResponse(response);
};

/**
 * Fetch a single item by ID
 */
export const fetchItem = async (itemId: number | string): Promise<any> => {
  const response = await fetch(`${API_BASE}/items/${itemId}`);
  return handleResponse(response);
};

/**
 * Create a new item
 */
export const createItem = async (itemData: any): Promise<any> => {
  const response = await fetch(`${API_BASE}/items/creator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData),
  });
  return handleResponse(response);
};

export const createMonster = async (monsterData: Record<string, any>) => {
  const response = await fetch(`${API_BASE}/monsters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(monsterData),
  });

  return handleResponse(response);
};

export const fetchMonster = async (id: number) => {
  const response = await fetch(`${API_BASE}/monsters/${id}`);
  if (!response.ok) {
    const errData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errData.message || 'Failed to fetch monster');
  }
  return response.json();
};