// src/services/api.ts

const API_BASE = 'http://127.0.0.1:8001/API';

export const createCharacter = (data: any) =>
  fetch(`${API_BASE}/characters/creator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(res => {
    if (!res.ok) throw new Error('Failed to create character');
    return res.json();
  });

export const fetchSpecies = () =>
  fetch(`${API_BASE}/species`).then(res => res.json());

export const fetchClasses = () =>
  fetch(`${API_BASE}/classes`).then(res => res.json());