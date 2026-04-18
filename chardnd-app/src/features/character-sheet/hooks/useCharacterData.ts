// src/features/character-sheet/hooks/useCharacterData.ts
// Custom hook for managing character data fetching and state

import { useState, useEffect, useCallback } from 'react';
import type { Character } from '../../../types/Character';
import {
    fetchCharacter,
    updateCharacter,
    fetchSpeciesTraits,
    fetchSpellSlots,
    fetchCharacterSpells,
    fetchPrepareLimit,
} from '../../../services/api';

interface UseCharacterDataResult {
    character: Character | null;
    loading: boolean;
    error: string | null;
    saving: boolean;
    refetch: () => Promise<void>;
    updateField: <K extends keyof Character>(field: K, value: Character[K]) => void;
    saveCharacter: () => Promise<void>;
    speciesTraits: any[];
    spellSlots: Record<string, { total: number; expended: number }>;
    characterSpells: any[];
    prepareLimit: { limit: number; prepared: number; unlimited: boolean } | null;
}

export function useCharacterData(characterId: string | undefined): UseCharacterDataResult {
    const [character, setCharacter] = useState<Character | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [speciesTraits, setSpeciesTraits] = useState<any[]>([]);
    const [spellSlots, setSpellSlots] = useState<Record<string, { total: number; expended: number }>>({});
    const [characterSpells, setCharacterSpells] = useState<any[]>([]);
    const [prepareLimit, setPrepareLimit] = useState<{ limit: number; prepared: number; unlimited: boolean } | null>(null);

    const loadCharacter = useCallback(async () => {
        if (!characterId) {
            setError('No character ID provided');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const charData = await fetchCharacter(parseInt(characterId, 10));
            setCharacter(charData);

            // Load species traits
            if (charData.species) {
                const traits = await fetchSpeciesTraits(charData.species, charData.subspecies);
                setSpeciesTraits(traits);
            }

            // Load spell data
            const [slots, spells, limit] = await Promise.all([
                fetchSpellSlots(parseInt(characterId, 10)).catch(() => ({ slots: [] })),
                fetchCharacterSpells(parseInt(characterId, 10)).catch(() => []),
                fetchPrepareLimit(parseInt(characterId, 10)).catch(() => null),
            ]);

            // Transform spell slots
            const slotsMap: Record<string, { total: number; expended: number }> = {};
            if (slots && Array.isArray(slots.slots)) {
                slots.slots.forEach((slot: any) => {
                    slotsMap[`level${slot.level}`] = {
                        total: slot.total,
                        expended: slot.expended,
                    };
                });
            }
            setSpellSlots(slotsMap);
            setCharacterSpells(spells);

            if (limit) {
                setPrepareLimit({
                    limit: limit.limit ?? 0,
                    prepared: limit.prepared ?? 0,
                    unlimited: limit.unlimited ?? false,
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load character');
        } finally {
            setLoading(false);
        }
    }, [characterId]);

    useEffect(() => {
        loadCharacter();
    }, [loadCharacter]);

    const updateField = useCallback(<K extends keyof Character>(field: K, value: Character[K]) => {
        setCharacter(prev => prev ? { ...prev, [field]: value } : null);
    }, []);

    const saveCharacter = useCallback(async () => {
        if (!character || !characterId) return;

        try {
            setSaving(true);
            await updateCharacter(parseInt(characterId, 10), character);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save character');
            throw err;
        } finally {
            setSaving(false);
        }
    }, [character, characterId]);

    const refetch = useCallback(async () => {
        await loadCharacter();
    }, [loadCharacter]);

    return {
        character,
        loading,
        error,
        saving,
        refetch,
        updateField,
        saveCharacter,
        speciesTraits,
        spellSlots,
        characterSpells,
        prepareLimit,
    };
}

export default useCharacterData;
