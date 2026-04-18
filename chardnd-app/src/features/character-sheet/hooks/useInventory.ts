// src/features/character-sheet/hooks/useInventory.ts
// Custom hook for managing character inventory operations

import { useState, useCallback } from 'react';
import {
    addItemToCharacter,
    deleteInventoryItem,
    removeOneItem,
    updateItemCharges,
    equipItem,
    unequipItem,
    attuneItem,
    unattuneItem,
} from '../../../services/api';

interface InventoryItem {
    inventoryId: number;
    id?: number;
    name: string;
    quantity: number;
    equipped: boolean;
    attuned: boolean;
    currentCharges?: number;
    maxCharges?: number;
    requires_attunement?: boolean;
    [key: string]: unknown;
}

interface UseInventoryResult {
    // Filters
    showEquippedOnly: boolean;
    setShowEquippedOnly: (value: boolean) => void;
    showAttunedOnly: boolean;
    setShowAttunedOnly: (value: boolean) => void;

    // Bulk delete
    isBulkDeleteMode: boolean;
    setIsBulkDeleteMode: (value: boolean) => void;
    selectedItemsForDelete: Set<number>;
    toggleItemForDelete: (inventoryId: number) => void;
    clearSelectedItems: () => void;

    // Item operations
    addItem: (characterId: number, itemId: number, quantity?: number) => Promise<void>;
    deleteItem: (characterId: number, inventoryId: number) => Promise<void>;
    removeOne: (characterId: number, inventoryId: number) => Promise<void>;
    updateCharges: (characterId: number, inventoryId: number, charges: number) => Promise<void>;
    toggleEquip: (characterId: number, inventoryId: number, currentlyEquipped: boolean) => Promise<void>;
    toggleAttune: (characterId: number, inventoryId: number, currentlyAttuned: boolean) => Promise<void>;
    bulkDeleteItems: (characterId: number) => Promise<void>;

    // Loading state
    operationLoading: boolean;

    // Filter helpers
    filterItems: (items: InventoryItem[]) => InventoryItem[];
    getEquippedCount: (items: InventoryItem[]) => number;
    getAttunedCount: (items: InventoryItem[]) => number;
}

export function useInventory(): UseInventoryResult {
    const [showEquippedOnly, setShowEquippedOnly] = useState(false);
    const [showAttunedOnly, setShowAttunedOnly] = useState(false);
    const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false);
    const [selectedItemsForDelete, setSelectedItemsForDelete] = useState<Set<number>>(new Set());
    const [operationLoading, setOperationLoading] = useState(false);

    const toggleItemForDelete = useCallback((inventoryId: number) => {
        setSelectedItemsForDelete(prev => {
            const newSet = new Set(prev);
            if (newSet.has(inventoryId)) {
                newSet.delete(inventoryId);
            } else {
                newSet.add(inventoryId);
            }
            return newSet;
        });
    }, []);

    const clearSelectedItems = useCallback(() => {
        setSelectedItemsForDelete(new Set());
        setIsBulkDeleteMode(false);
    }, []);

    const addItem = useCallback(async (characterId: number, itemId: number, quantity = 1) => {
        setOperationLoading(true);
        try {
            await addItemToCharacter(characterId, itemId, quantity);
        } finally {
            setOperationLoading(false);
        }
    }, []);

    const deleteItem = useCallback(async (characterId: number, inventoryId: number) => {
        setOperationLoading(true);
        try {
            await deleteInventoryItem(characterId, inventoryId);
        } finally {
            setOperationLoading(false);
        }
    }, []);

    const removeOne = useCallback(async (characterId: number, inventoryId: number) => {
        setOperationLoading(true);
        try {
            await removeOneItem(characterId, inventoryId);
        } finally {
            setOperationLoading(false);
        }
    }, []);

    const updateCharges = useCallback(async (characterId: number, inventoryId: number, charges: number) => {
        setOperationLoading(true);
        try {
            await updateItemCharges(characterId, inventoryId, charges);
        } finally {
            setOperationLoading(false);
        }
    }, []);

    const toggleEquip = useCallback(async (characterId: number, inventoryId: number, currentlyEquipped: boolean) => {
        setOperationLoading(true);
        try {
            if (currentlyEquipped) {
                await unequipItem(characterId, inventoryId);
            } else {
                await equipItem(characterId, inventoryId);
            }
        } finally {
            setOperationLoading(false);
        }
    }, []);

    const toggleAttune = useCallback(async (characterId: number, inventoryId: number, currentlyAttuned: boolean) => {
        setOperationLoading(true);
        try {
            if (currentlyAttuned) {
                await unattuneItem(characterId, inventoryId);
            } else {
                await attuneItem(characterId, inventoryId);
            }
        } finally {
            setOperationLoading(false);
        }
    }, []);

    const bulkDeleteItems = useCallback(async (characterId: number) => {
        setOperationLoading(true);
        try {
            const deletePromises = Array.from(selectedItemsForDelete).map(inventoryId =>
                deleteInventoryItem(characterId, inventoryId)
            );
            await Promise.all(deletePromises);
            clearSelectedItems();
        } finally {
            setOperationLoading(false);
        }
    }, [selectedItemsForDelete, clearSelectedItems]);

    const filterItems = useCallback((items: InventoryItem[]): InventoryItem[] => {
        let filtered = items;
        if (showEquippedOnly) {
            filtered = filtered.filter(item => item.equipped);
        }
        if (showAttunedOnly) {
            filtered = filtered.filter(item => item.attuned);
        }
        return filtered;
    }, [showEquippedOnly, showAttunedOnly]);

    const getEquippedCount = useCallback((items: InventoryItem[]): number => {
        return items.filter(item => item.equipped).length;
    }, []);

    const getAttunedCount = useCallback((items: InventoryItem[]): number => {
        return items.filter(item => item.attuned).length;
    }, []);

    return {
        showEquippedOnly,
        setShowEquippedOnly,
        showAttunedOnly,
        setShowAttunedOnly,
        isBulkDeleteMode,
        setIsBulkDeleteMode,
        selectedItemsForDelete,
        toggleItemForDelete,
        clearSelectedItems,
        addItem,
        deleteItem,
        removeOne,
        updateCharges,
        toggleEquip,
        toggleAttune,
        bulkDeleteItems,
        operationLoading,
        filterItems,
        getEquippedCount,
        getAttunedCount,
    };
}

export default useInventory;
