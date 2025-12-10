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
