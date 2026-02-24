// src/features/character-sheet/CharacterDisplay.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Character } from '../../types/Character';
import AbsScores from './components/AbilityScores/AbsScores';
import styles from './CharacterSheet.module.css';
import ItemModal from '../Items/ItemModal/ItemModal';
import SpellModal from './components/SpellModal/SpellModal';
import ItemDetailsModal from './components/ItemDetailsModal/ItemDetailsModal';
import StatModifiersModal from './components/StatModifiersModal/StatModifiersModal';
import ProficiencyModal from './components/ProficiencyModal/ProficiencyModal';
import { fetchItems } from '../../services/api';

// 🔽 D&D 5e XP Thresholds
const LEVEL_XP_TABLE = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
];

const CharacterDisplay = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [character, setCharacter] = useState<Character | null>(null);
  const [localAbilityScores, setLocalAbilityScores] = useState<{ [key: string]: number } | null>(null);

  // ✅ Level & XP
  const [localLevel, setLocalLevel] = useState<number>(1);
  const [localXp, setLocalXp] = useState<number>(0);

  // ✅ HP Controls
  const [hpCurrent, setHpCurrent] = useState<number>(0);
  const [hpMax, setHpMax] = useState<number>(0);
  const [hpTmp, setHpTmp] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isSpellModalOpen, setIsSpellModalOpen] = useState(false);

  // ✅ NEW: State for items
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [selectedAttackItem, setSelectedAttackItem] = useState<any | null>(null);
  const [attackModalData, setAttackModalData] = useState<any | null>(null);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<any | null>(null);

  // ✅ NEW: State for bulk delete
  const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false);
  const [selectedItemsForDelete, setSelectedItemsForDelete] = useState<Set<number>>(new Set());

  // ✅ NEW: State for attack details modal
  const [selectedAttackForModal, setSelectedAttackForModal] = useState<any | null>(null);
  const [selectedAttackData, setSelectedAttackData] = useState<any | null>(null);

  // ✅ NEW: State for weapon variant selector
  const [weaponVariantSelectorOpen, setWeaponVariantSelectorOpen] = useState(false);
  const [weaponToVariantSelect, setWeaponToVariantSelect] = useState<any | null>(null);
  const [selectedWeaponVariant, setSelectedWeaponVariant] = useState<string | null>(null);

  // ✅ NEW: HP Modal State
  const [hpModalType, setHpModalType] = useState<'heal' | 'damage' | 'temp' | null>(null);
  const [hpModalInput, setHpModalInput] = useState<string>('');

  // ✅ NEW: Charge expend checkbox state
  const [expendCharge, setExpendCharge] = useState(false);

  // Navigation
  const goToMain = () => navigate('/');
  const goToItemCreator = () => navigate('/items/creator');

  // 🔁 XP ⇄ Level Helpers
  const levelToXp = (level: number): number => {
    if (level < 1) return 0;
    if (level > 20) return LEVEL_XP_TABLE[19];
    return LEVEL_XP_TABLE[level - 1];
  };

  const xpToLevel = (xp: number): number => {
    for (let i = 19; i >= 0; i--) {
      if (xp >= LEVEL_XP_TABLE[i]) return i + 1;
    }
    return 1;
  };

  // 🔄 Level & XP Handlers
  const handleLevelChange = (delta: number) => {
    const newLevel = Math.max(1, Math.min(20, localLevel + delta));
    setLocalLevel(newLevel);
    setLocalXp(levelToXp(newLevel));
  };

  const handleXpChange = (delta: number) => {
    const newXp = Math.max(0, localXp + delta);
    setLocalXp(newXp);
    setLocalLevel(xpToLevel(newXp));
  };

  const handleXpInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setLocalXp(value);
    setLocalLevel(xpToLevel(value));
  };

  // 💾 Save Level & XP
  const saveLevelAndXp = async () => {
    if (!id || saving) return;
    setSaving(true);
    try {
      const response = await fetch(`http://127.0.0.1:8001/API/characters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: localLevel, xp: localXp }),
      });
      if (!response.ok) throw new Error('Save failed');
      const updated: Character = await response.json();
      setCharacter(updated);
      alert('✅ Level & XP saved!');
    } catch (err: any) {
      console.error(err);
      alert('❌ Failed to save Level & XP: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // 🩸 HP Logic
  const heal = (amount: number) => {
    setHpCurrent(prev => Math.min(hpMax, prev + amount));
    setHpModalInput('');
    setHpModalType(null);
  };

  const takeDamage = (amount: number) => {
    let remaining = amount;
    if (hpTmp > 0) {
      const newTemp = Math.max(0, hpTmp - amount);
      const usedOnTemp = hpTmp - newTemp;
      setHpTmp(newTemp);
      remaining -= usedOnTemp;
    }
    if (remaining > 0) {
      setHpCurrent(prev => Math.max(-hpMax, prev - remaining));
    }
    setHpModalInput('');
    setHpModalType(null);
  };

  const addTempHp = (amount: number) => {
    setHpTmp(prev => prev + amount);
    setHpModalInput('');
    setHpModalType(null);
  };

  const handleHpModalSubmit = () => {
    const amount = parseInt(hpModalInput) || 0;
    if (amount <= 0) {
      alert('Please enter a positive number');
      return;
    }
    if (hpModalType === 'heal') heal(amount);
    else if (hpModalType === 'damage') takeDamage(amount);
    else if (hpModalType === 'temp') addTempHp(amount);
  };

  // 💾 Save HP
  const saveHp = async () => {
    if (!id || saving) return;
    setSaving(true);
    try {
      const response = await fetch(`http://127.0.0.1:8001/API/characters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hpCurrent, hpTmp }),
      });
      if (!response.ok) throw new Error('Save failed');
      const updated: Character = await response.json();
      setCharacter(updated);
      alert('✅ HP saved!');
    } catch (err: any) {
      console.error(err);
      alert('❌ Failed to save HP');
    } finally {
      setSaving(false);
    }
  };

  // 📥 Load character
  useEffect(() => {
    const fetchCharacter = async () => {
      if (!id) return;
      try {
        const response = await fetch(`http://127.0.0.1:8001/API/characters/${id}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: Character = await response.json();
        setCharacter(data);
        const scores = data.abilityScores || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
        setLocalAbilityScores(scores);
        setLocalLevel(data.level || 1);
        setLocalXp(data.xp || 0);
        setHpMax(data.hpMax || data.hitPoints || 10);
        setHpCurrent(data.hpCurrent !== undefined ? data.hpCurrent : (data.hpMax || data.hitPoints || 10));
        setHpTmp(data.hpTmp || 0);
      } catch (err: any) {
        setError(err.message || 'Failed to load character');
      } finally {
        setLoading(false);
      }
    };
    fetchCharacter();
  }, [id]);

  // 📥 Load items for modal
  useEffect(() => {
    const loadItems = async () => {
      try {
        const items = await fetchItems();
        setAvailableItems(items);
      } catch (err) {
        console.error('Failed to load items:', err);
        setAvailableItems([]);
      } finally {
        setItemsLoading(false);
      }
    };
    loadItems();
  }, []);

  // Ability scores
  const handleScoreChange = (newScores: { [key: string]: number }) => {
    setLocalAbilityScores(newScores);
  };

  const saveScores = async () => {
    if (!id || !localAbilityScores || saving) return;
    setSaving(true);
    try {
      const response = await fetch(`http://127.0.0.1:8001/API/characters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ abilityScores: localAbilityScores }),
      });
      if (!response.ok) throw new Error('Save failed');
      const updatedCharacter: Character = await response.json();
      setCharacter(updatedCharacter);
      alert('✅ Ability scores saved!');
    } catch (err: any) {
      console.error(err);
      alert('❌ Failed to save scores: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Add item
  const addItem = async (item: { name: string; id?: number; [key: string]: any }, quantity: number = 1) => {
    try {
      const response = await fetch(`http://127.0.0.1:8001/API/characters/${id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemID: item.id, quantity }),
      });
      if (!response.ok) throw new Error('Failed to add item');
      const updatedCharacter: Character = await response.json();
      setCharacter(updatedCharacter);
      alert(`✅ Added ${quantity} × ${item.name} to inventory`);
    } catch (err: any) {
      console.error(err);
      alert('❌ Could not add item');
    }
  };

  // Add spell
  const addSpell = async (spell: { name: string }) => {
    try {
      const response = await fetch(`http://127.0.0.1:8001/API/characters/${id}/spells`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spell),
      });
      if (!response.ok) throw new Error('Failed to add spell');
      const updatedCharacter: Character = await response.json();
      setCharacter(updatedCharacter);
      setIsSpellModalOpen(false);
      alert(`✅ Added ${spell.name} to spells`);
    } catch (err: any) {
      console.error(err);
      alert('❌ Could not add spell');
    }
  };

  // Add one more of the same item
  const addMoreItem = async (item: any) => {
    try {
      const response = await fetch(`http://127.0.0.1:8001/API/characters/${id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemID: item.id, quantity: 1 }),
      });
      if (!response.ok) throw new Error('Failed to add item');
      const updatedCharacter: Character = await response.json();
      setCharacter(updatedCharacter);
      alert(`✅ Added 1 more × ${item.name}`);
    } catch (err: any) {
      console.error(err);
      alert('❌ Could not add item');
    }
  };

  // Delete item from inventory
  const deleteInventoryItem = async (inventoryId: number, itemName: string) => {
    if (!window.confirm(`Delete ${itemName} from inventory?`)) return;
    try {
      const response = await fetch(`http://127.0.0.1:8001/API/characters/${id}/inventory/${inventoryId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to delete item');
      const updatedCharacter: Character = await response.json();
      setCharacter(updatedCharacter);
      alert(`✅ Deleted ${itemName}`);
    } catch (err: any) {
      console.error(err);
      alert('❌ Could not delete item');
    }
  };

  // Remove 1 item from inventory
  const removeOneItem = async (inventoryId: number, itemName: string, quantity: number) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8001/API/characters/${id}/inventory/${inventoryId}/remove-one`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) throw new Error('Failed to remove item');
      const updatedCharacter: Character = await response.json();
      setCharacter(updatedCharacter);
      const message = quantity > 1
        ? `✅ Removed 1 × ${itemName} (${quantity - 1} remaining)`
        : `✅ Deleted last × ${itemName}`;
      alert(message);
    } catch (err: any) {
      console.error(err);
      alert('❌ Could not remove item');
    }
  };

  // Update item charges
  const updateItemCharges = async (inventoryId: number, newCharges: number) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8001/API/characters/${id}/inventory/${inventoryId}/charges`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentCharges: newCharges }),
        }
      );
      if (!response.ok) throw new Error('Failed to update charges');
      const updatedCharacter: Character = await response.json();
      setCharacter(updatedCharacter);
    } catch (err: any) {
      console.error(err);
      alert('❌ Could not update charges');
    }
  };

  // Bulk delete items
  const bulkDeleteItems = async () => {
    if (selectedItemsForDelete.size === 0) {
      alert('❌ Select at least one item to delete');
      return;
    }
    if (!window.confirm(`Delete ${selectedItemsForDelete.size} item(s)?`)) return;
    try {
      for (const inventoryId of selectedItemsForDelete) {
        const response = await fetch(`http://127.0.0.1:8001/API/characters/${id}/inventory/${inventoryId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`Failed to delete item ${inventoryId}`);
      }
      const response = await fetch(`http://127.0.0.1:8001/API/characters/${id}`);
      if (!response.ok) throw new Error('Failed to fetch updated character');
      const updatedCharacter: Character = await response.json();
      setCharacter(updatedCharacter);
      setIsBulkDeleteMode(false);
      setSelectedItemsForDelete(new Set());
      alert(`✅ Deleted ${selectedItemsForDelete.size} item(s)`);
    } catch (err: any) {
      console.error(err);
      alert('❌ Could not delete items');
    }
  };

  // Toggle item selection for bulk delete
  const toggleItemSelection = (inventoryId: number) => {
    const newSelection = new Set(selectedItemsForDelete);
    if (newSelection.has(inventoryId)) {
      newSelection.delete(inventoryId);
    } else {
      newSelection.add(inventoryId);
    }
    setSelectedItemsForDelete(newSelection);
  };

  // ✅ NEW: Calculate AC based on equipped armor
  const calculateAC = (): number => {
    if (!character || !character.items) return 10;
    
    let baseAC = 10;
    let armorAC = 0;
    let shieldBonus = 0;
    let dexMod = 0;
    
    // Get DEX modifier
    if (character.abilityScores) {
      dexMod = Math.floor((character.abilityScores.dex - 10) / 2);
    }
    
    // Find equipped armor and shield
    for (const inv of character.items) {
      if (inv.is_equipped) {
        const armorItem = inv.item || inv;
        
        if (armorItem.item_category && armorItem.item_category.includes('Shield')) {
          // Shield adds flat bonus
          if (armorItem.property_data?.ac_bonus) {
            shieldBonus += armorItem.property_data.ac_bonus;
          }
        } else if (armorItem.item_type === 'Armor') {
          // Armor sets base AC
          if (armorItem.property_data?.ac_base) {
            armorAC = armorItem.property_data.ac_base;
          }
        }
      }
    }
    
    // Apply armor AC if equipped, otherwise use 10 + DEX
    if (armorAC > 0) {
      baseAC = armorAC;
      // Check if armor allows DEX modifier
      if (!character.items?.some(inv => inv.is_equipped && inv.item?.property_data?.ac_type === 'dex_no')) {
        baseAC += dexMod;
      }
    } else {
      baseAC = 10 + dexMod;
    }
    
    return Math.max(10, baseAC + shieldBonus);
  };

  // ✅ NEW: Equip item
  const equipItem = async (inventoryId: number, itemName: string) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8001/API/characters/${id}/inventory/${inventoryId}/equip`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) throw new Error('Failed to equip item');
      const updatedCharacter: Character = await response.json();
      setCharacter(updatedCharacter);
      setSelectedItemForDetails(null);
      alert(`✅ ${itemName} equipped!`);
    } catch (err: any) {
      console.error(err);
      alert('❌ Could not equip item');
    }
  };

  // ✅ NEW: Unequip item
  const unequipItem = async (inventoryId: number, itemName: string) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8001/API/characters/${id}/inventory/${inventoryId}/unequip`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) throw new Error('Failed to unequip item');
      const updatedCharacter: Character = await response.json();
      setCharacter(updatedCharacter);
      setSelectedItemForDetails(null);
      alert(`✅ ${itemName} unequipped!`);
    } catch (err: any) {
      console.error(err);
      alert('❌ Could not unequip item');
    }
  };

  // ✅ NEW: State for stat modifiers modal
  const [statModifiersModal, setStatModifiersModal] = useState<{
    isOpen: boolean;
    stat: 'AC' | 'Speed' | 'Initiative' | 'AbilityScore';
    abilityKey?: string;
  }>({
    isOpen: false,
    stat: 'AC',
  });

  // ✅ NEW: State for proficiency modals
  const [proficiencyModal, setProficiencyModal] = useState<{
    isOpen: boolean;
    type: 'skills' | 'weapons' | 'tools' | 'languages';
  }>({
    isOpen: false,
    type: 'skills',
  });

  // ✅ NEW: Get AC modifiers
  const getACModifiers = (): Array<{ itemName: string; value: number; type: 'bonus' | 'penalty' | 'base' }> => {
    if (!character || !character.items) return [];
    const modifiers: Array<{ itemName: string; value: number; type: 'bonus' | 'penalty' | 'base' }> = [];
    let hasArmor = false;

    for (const inv of character.items) {
      if (inv.is_equipped) {
        const item = inv.item || inv;
        
        if (item.item_category?.includes('Shield') && item.property_data?.ac_bonus) {
          modifiers.push({
            itemName: item.name,
            value: item.property_data.ac_bonus,
            type: 'bonus',
          });
        } else if (item.item_type === 'Armor' && item.property_data?.ac_base) {
          modifiers.push({
            itemName: item.name,
            value: item.property_data.ac_base,
            type: 'base',
          });
          hasArmor = true;
        }
      }
    }

    // Add DEX modifier if applicable
    if (character.abilityScores) {
      const dexMod = Math.floor((character.abilityScores.dex - 10) / 2);
      if (dexMod !== 0) {
        modifiers.push({
          itemName: 'DEX Modifier',
          value: Math.abs(dexMod),
          type: dexMod >= 0 ? 'bonus' : 'penalty',
        });
      }
    }

    return modifiers;
  };

  // ✅ NEW: Get Speed modifiers
  const getSpeedModifiers = (): Array<{ itemName: string; value: number; type: 'bonus' | 'penalty' | 'base' }> => {
    if (!character || !character.items) return [];
    const modifiers: Array<{ itemName: string; value: number; type: 'bonus' | 'penalty' | 'base' }> = [];

    for (const inv of character.items) {
      if (inv.is_equipped) {
        const item = inv.item || inv;
        if (item.property_data?.speed_modifier) {
          modifiers.push({
            itemName: item.name,
            value: item.property_data.speed_modifier,
            type: item.property_data.speed_modifier >= 0 ? 'bonus' : 'penalty',
          });
        }
      }
    }

    return modifiers;
  };

  // ✅ NEW: Get Initiative modifiers
  const getInitiativeModifiers = (): Array<{ itemName: string; value: number; type: 'bonus' | 'penalty' | 'base' }> => {
    if (!character || !character.items) return [];
    const modifiers: Array<{ itemName: string; value: number; type: 'bonus' | 'penalty' | 'base' }> = [];

    // DEX modifier (base)
    if (character.abilityScores) {
      const dexMod = Math.floor((character.abilityScores.dex - 10) / 2);
      modifiers.push({
        itemName: 'DEX Modifier',
        value: Math.abs(dexMod),
        type: 'base',
      });
    }

    // Item modifiers
    for (const inv of character.items) {
      if (inv.is_equipped) {
        const item = inv.item || inv;
        if (item.property_data?.initiative_modifier) {
          modifiers.push({
            itemName: item.name,
            value: item.property_data.initiative_modifier,
            type: item.property_data.initiative_modifier >= 0 ? 'bonus' : 'penalty',
          });
        }
      }
    }

    return modifiers;
  };

  // ✅ NEW: Get Ability Score modifiers
  const getAbilityModifiers = (abilityKey: string): Array<{ itemName: string; value: number; type: 'bonus' | 'penalty' | 'base' }> => {
    if (!character || !character.items) return [];
    const modifiers: Array<{ itemName: string; value: number; type: 'bonus' | 'penalty' | 'base' }> = [];

    for (const inv of character.items) {
      if (inv.is_equipped) {
        const item = inv.item || inv;
        if (item.property_data?.ability_modifiers?.[abilityKey]) {
          const value = item.property_data.ability_modifiers[abilityKey];
          modifiers.push({
            itemName: item.name,
            value: Math.abs(value),
            type: value >= 0 ? 'bonus' : 'penalty',
          });
        }
      }
    }

    return modifiers;
  };

  // ✅ NEW: Get skill proficiencies from equipped items
  const getSkillProficiencies = (): Array<{ itemName: string; proficiency: string }> => {
    if (!character || !character.items) return [];
    const proficiencies: Array<{ itemName: string; proficiency: string }> = [];

    for (const inv of character.items) {
      if (inv.is_equipped) {
        const item = inv.item || inv;
        if (item.property_data?.skill_proficiencies && Array.isArray(item.property_data.skill_proficiencies)) {
          for (const skill of item.property_data.skill_proficiencies) {
            proficiencies.push({
              itemName: item.name,
              proficiency: skill,
            });
          }
        }
      }
    }

    return proficiencies;
  };

  // ✅ NEW: Get weapon proficiencies from equipped items
  const getWeaponProficiencies = (): Array<{ itemName: string; proficiency: string }> => {
    if (!character || !character.items) return [];
    const proficiencies: Array<{ itemName: string; proficiency: string }> = [];

    for (const inv of character.items) {
      if (inv.is_equipped) {
        const item = inv.item || inv;
        if (item.property_data?.weapon_proficiencies && Array.isArray(item.property_data.weapon_proficiencies)) {
          for (const weapon of item.property_data.weapon_proficiencies) {
            proficiencies.push({
              itemName: item.name,
              proficiency: weapon,
            });
          }
        }
      }
    }

    return proficiencies;
  };

  // ✅ NEW: Get tool proficiencies from equipped items
  const getToolProficiencies = (): Array<{ itemName: string; proficiency: string }> => {
    if (!character || !character.items) return [];
    const proficiencies: Array<{ itemName: string; proficiency: string }> = [];

    for (const inv of character.items) {
      if (inv.is_equipped) {
        const item = inv.item || inv;
        if (item.property_data?.tool_proficiencies && Array.isArray(item.property_data.tool_proficiencies)) {
          for (const tool of item.property_data.tool_proficiencies) {
            proficiencies.push({
              itemName: item.name,
              proficiency: tool,
            });
          }
        }
      }
    }

    return proficiencies;
  };

  // ✅ NEW: Get languages from equipped items
  const getLanguages = (): Array<{ itemName: string; proficiency: string }> => {
    if (!character || !character.items) return [];
    const languages: Array<{ itemName: string; proficiency: string }> = [];

    for (const inv of character.items) {
      if (inv.is_equipped) {
        const item = inv.item || inv;
        if (item.property_data?.languages && Array.isArray(item.property_data.languages)) {
          for (const lang of item.property_data.languages) {
            languages.push({
              itemName: item.name,
              proficiency: lang,
            });
          }
        }
      }
    }

    return languages;
  };

  const availableSpells = [...availableItems];

  // Auto-add item from creator
  useEffect(() => {
    const search = location.search;
    const params = new URLSearchParams(search);
    const newItemParam = params.get('newItem');
    if (newItemParam && addItem) {
      try {
        const newItem = JSON.parse(newItemParam);
        addItem(newItem);
        navigate(`/characters/${id}`, { replace: true });
      } catch (err) {
        console.error('Failed to parse newItem:', err);
      }
    }
  }, [location.search, addItem, id, navigate]);

  // ✅ Calculate proficiency bonus based on level
  const getProficiencyBonus = () => {
    if (localLevel <= 4) return 2;
    if (localLevel <= 8) return 3;
    if (localLevel <= 12) return 4;
    if (localLevel <= 16) return 5;
    return 6;
  };

  const proficiencyBonus = getProficiencyBonus();

  // ✅ Helper: Get weapon attack variants based on properties
  const getWeaponVariants = (weapon: any): Array<{
    id: string;
    name: string;
    damageDice: string;
    damageType: string;
    range?: string;
  }> => {
    const variants: Array<{
      id: string;
      name: string;
      damageDice: string;
      damageType: string;
      range?: string;
    }> = [];

    const properties = (weapon.properties || []).map((p: any) =>
      typeof p === 'string' ? p.toLowerCase() : (p.name || '').toLowerCase()
    );
    const propertyData = weapon.property_data || {};

    const hasProperty = (keyword: string) => {
      return properties.some((p: string) => p.includes(keyword.toLowerCase()));
    };

    // 1️⃣ Melee attack (always available)
    variants.push({
      id: 'melee',
      name: 'Melee Attack',
      damageDice: weapon.damageDice || '1d4',
      damageType: weapon.damageType || 'bludgeoning'
    });

    // 2️⃣ Thrown attack
    if (hasProperty('thrown')) {
      const range = propertyData.thrown?.range || '20/60';
      variants.push({
        id: 'thrown',
        name: `Thrown Attack (Range: ${range})`,
        damageDice: weapon.damageDice || '1d4',
        damageType: weapon.damageType || 'bludgeoning',
        range
      });
    }

    // 3️⃣ Versatile attack
    if (hasProperty('versatile')) {
      const versatileDamage = propertyData.versatile?.damage_dice ||
        (weapon.damageDice ? weapon.damageDice.replace('d4', 'd6').replace('d6', 'd8').replace('d8', 'd10') : '1d8');
      variants.push({
        id: 'versatile',
        name: 'Two-Handed Attack',
        damageDice: versatileDamage,
        damageType: weapon.damageType || 'bludgeoning'
      });
    }

    return variants;
  };

  // ✅ Helper: Map skills to abilities
  const getSkillAbility = (skillName: string): string => {
    const skillMap: Record<string, string> = {
      'Acrobatics': 'dex',
      'Animal Handling': 'wis',
      'Arcana': 'int',
      'Athletics': 'str',
      'Deception': 'cha',
      'History': 'int',
      'Insight': 'wis',
      'Intimidation': 'cha',
      'Investigation': 'int',
      'Medicine': 'wis',
      'Nature': 'int',
      'Perception': 'wis',
      'Performance': 'cha',
      'Persuasion': 'cha',
      'Religion': 'int',
      'Sleight of Hand': 'dex',
      'Stealth': 'dex',
      'Survival': 'wis'
    };
    return skillMap[skillName] || 'varies';
  };

  // ✅ Get all proficiencies from character data
  const getAllProficiencies = () => {
    const skills: string[] = [];
    const weapons: string[] = [];
    const tools: string[] = [];
    const languages: string[] = [];

    if (character?.proficientSkills && Array.isArray(character.proficientSkills)) {
      skills.push(...character.proficientSkills);
    }
    if (character?.proficientWeapons && Array.isArray(character.proficientWeapons)) {
      weapons.push(...character.proficientWeapons);
    }
    if (character?.proficientTools && Array.isArray(character.proficientTools)) {
      tools.push(...character.proficientTools);
    }
    if (character?.knownLanguages && Array.isArray(character.knownLanguages)) {
      languages.push(...character.knownLanguages);
    }

    return { skills, weapons, tools, languages };
  };

  const proficiencies = character ? getAllProficiencies() : { skills: [], weapons: [], tools: [], languages: [] };
  const { skills: proficientSkills, weapons: proficientWeapons, tools: proficientTools, languages: knownLanguages } = proficiencies;

  // ✅ Calculate final ability scores
  const getFinalAbilityScore = (baseKey: string) => {
    return localAbilityScores?.[baseKey] || 10;
  };

  const getAbilityModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

  // ✅ NEW: Helper for Finesse weapons - returns best ability (STR or DEX)
  const getBestAbilityForWeapon = (weapon: any) => {
    const properties = (weapon.properties || []).map((p: any) =>
      typeof p === 'string' ? p.toLowerCase() : (p.name || '').toLowerCase()
    );

    const hasFinesse = properties.some((p: string) => p.includes('finesse'));

    if (hasFinesse) {
      const strMod = getAbilityModifier(character.abilityScores?.str || 10);
      const dexMod = getAbilityModifier(character.abilityScores?.dex || 10);
      const bestMod = Math.max(strMod, dexMod);
      const bestAbility = strMod >= dexMod ? 'STR' : 'DEX';
      return { modifier: bestMod, ability: bestAbility };
    }

    const strMod = getAbilityModifier(character.abilityScores?.str || 10);
    return { modifier: strMod, ability: 'STR' };
  };

  // Render
  if (loading) return <p className={styles.loading}>Loading character...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!character || !localAbilityScores) {
    return <p className={styles.error}>Character not found or missing ability scores.</p>;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button onClick={goToMain} className={styles.button}>Home</button>
        <button onClick={goToItemCreator} className={styles.button}>Item Creator</button>
      </header>

      <h1>{character.name}</h1>

      <section className={styles.section}>
        <h2>Species & Level</h2>
        <label><strong>Species:</strong> {character.species}</label>
        {character.subspecies && <label><strong>Subspecies:</strong> {character.subspecies}</label>}
        {character.background && <label><strong>Background:</strong> {character.background.name}</label>}

        {/* Level & XP */}
        <div className={styles.levelXpGroup}>
          <div className={styles.levelXpRow}>
            <span className={styles.levelXpLabel}>Level:</span>
            <strong>{localLevel}</strong>
            <div className={styles.levelButtons}>
              <button
                type="button"
                onClick={() => handleLevelChange(-1)}
                disabled={saving || localLevel <= 1}
                className={styles.levelButton}
              >
                −
              </button>
              <button
                type="button"
                onClick={() => handleLevelChange(1)}
                disabled={saving || localLevel >= 20}
                className={styles.levelButton}
              >
                +
              </button>
            </div>
          </div>

          <div className={styles.levelXpRow}>
            <span className={styles.levelXpLabel}>XP:</span>
            <input
              type="number"
              value={localXp}
              onChange={handleXpInput}
              disabled={saving}
              className={styles.xpInput}
            />
            <div className={styles.xpButtons}>
              <button
                type="button"
                onClick={() => handleXpChange(-100)}
                disabled={saving}
                className={styles.xpStepButton}
              >
                −100
              </button>
              <button
                type="button"
                onClick={() => handleXpChange(100)}
                disabled={saving}
                className={styles.xpStepButton}
              >
                +100
              </button>
            </div>
          </div>

          {localLevel < 20 && (
            <div className={styles.xpHint}>
              {levelToXp(localLevel + 1) - localXp} XP to Level {localLevel + 1}
            </div>
          )}

          <button onClick={saveLevelAndXp} disabled={saving} className={styles.saveBtn}>
            {saving ? 'Saving...' : 'Save Level & XP'}
          </button>
        </div>

        {/* Multiclass Display */}
        <label><strong>Classes:</strong></label>
        {character.classes?.length > 0 ? (
          <div>
            {character.classes.map((cls, index) => (
              <div key={index}>
                {cls.className} (Level {cls.level})
                {cls.subclass && ` - ${cls.subclass}`}
              </div>
            ))}
          </div>
        ) : (
          <p>No classes assigned</p>
        )}

        <div>
          <strong>Ability Scores:</strong>
          <AbsScores abilityScores={localAbilityScores} onScoreChange={handleScoreChange} />
          <button onClick={saveScores} disabled={saving} className={styles.saveBtn}>
            {saving ? 'Saving...' : 'Save Scores'}
          </button>
        </div>

        {/* Proficiency Display */}
        <div>
          <strong>Proficiencies:</strong>
          {proficientSkills.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <strong 
                style={{ cursor: 'pointer', color: '#4a90e2', textDecoration: 'underline' }}
                onClick={() => setProficiencyModal({ isOpen: true, type: 'skills' })}
                title="Click to see skill proficiency sources"
              >
                Skills: {getSkillProficiencies().length > 0 && `(+${getSkillProficiencies().length})`}
              </strong>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                {proficientSkills.map(skill => {
                  const ability = getSkillAbility(skill);
                  const finalScore = getFinalAbilityScore(ability);
                  const abilityMod = getAbilityModifier(finalScore);
                  const totalMod = abilityMod + proficiencyBonus;
                  const displayMod = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;
                  return (
                    <div key={skill} style={{ padding: '0.25rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                      <strong>{skill}</strong>: {displayMod}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {proficientWeapons.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <strong
                style={{ cursor: 'pointer', color: '#4a90e2', textDecoration: 'underline' }}
                onClick={() => setProficiencyModal({ isOpen: true, type: 'weapons' })}
                title="Click to see weapon proficiency sources"
              >
                Weapons & Armor: {getWeaponProficiencies().length > 0 && `(+${getWeaponProficiencies().length})`}
              </strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {proficientWeapons.map(weapon => (
                  <span key={weapon} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#e0e0e0', borderRadius: '4px' }}>
                    {weapon}
                  </span>
                ))}
              </div>
            </div>
          )}

          {proficientTools.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <strong
                style={{ cursor: 'pointer', color: '#4a90e2', textDecoration: 'underline' }}
                onClick={() => setProficiencyModal({ isOpen: true, type: 'tools' })}
                title="Click to see tool proficiency sources"
              >
                Tools: {getToolProficiencies().length > 0 && `(+${getToolProficiencies().length})`}
              </strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {proficientTools.map(tool => (
                  <span key={tool} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#e0e0e0', borderRadius: '4px' }}>
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Languages */}
        <div>
          <strong
            style={{ cursor: 'pointer', color: '#4a90e2', textDecoration: 'underline' }}
            onClick={() => setProficiencyModal({ isOpen: true, type: 'languages' })}
            title="Click to see language sources"
          >
            Languages: {getLanguages().length > 0 && `(+${getLanguages().length})`}
          </strong>
          {knownLanguages.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {knownLanguages.map(lang => (
                <span key={lang} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#e0e0e0', borderRadius: '4px' }}>
                  {lang}
                </span>
              ))}
            </div>
          ) : (
            <p>None</p>
          )}
        </div>

        {/* Hit Points */}
        <div>
          <strong>Hit Points:</strong>
          <p>{character.hitPoints || character.hpMax || 'Not set'} (current: {hpCurrent})</p>
        </div>

        {/* Proficiency Bonus */}
        <div>
          <strong>Proficiency Bonus:</strong> +{proficiencyBonus}
        </div>
      </section>

      {/* Spellcasting */}
      <section className={styles.section}>
        <h2>Spellcasting</h2>
        <button className={styles.primary} onClick={() => setIsSpellModalOpen(true)}>Add Spell</button>
        <SpellModal
          isOpen={isSpellModalOpen}
          onClose={() => setIsSpellModalOpen(false)}
          onAddSpell={addSpell}
          availableSpells={availableSpells}
          characterId={character?.id || 0}
        />
      </section>

      {/* Inventory */}
      <section className={styles.section}>
        <h2>Inventory</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button
            className={styles.primary}
            onClick={() => setIsItemModalOpen(true)}
            disabled={itemsLoading}
          >
            {itemsLoading ? 'Loading Items...' : 'Add Item'}
          </button>
          {character.items && Array.isArray(character.items) && character.items.length > 0 && (
            <button
              className={isBulkDeleteMode ? styles.danger : styles.secondary}
              onClick={() => {
                if (isBulkDeleteMode) {
                  setIsBulkDeleteMode(false);
                  setSelectedItemsForDelete(new Set());
                } else {
                  setIsBulkDeleteMode(true);
                }
              }}
            >
              {isBulkDeleteMode ? 'Cancel Bulk Delete' : '🗑️ Bulk Delete'}
            </button>
          )}
          {isBulkDeleteMode && selectedItemsForDelete.size > 0 && (
            <button
              className={styles.danger}
              onClick={bulkDeleteItems}
            >
              Delete {selectedItemsForDelete.size} Item(s)
            </button>
          )}
        </div>

        <ItemModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          onAddItem={addItem}
          availableItems={availableItems}
          characterId={character.id}
        />

        {character.items && Array.isArray(character.items) && character.items.length > 0 ? (
          <div className={styles.inventoryList}>
            {character.items.map((item: any) => {
              const isSelected = selectedItemsForDelete.has(item.inventoryId);
              return (
                <div
                  key={item.inventoryId}
                  className={`${styles.inventoryItem} ${isBulkDeleteMode && isSelected ? styles.selectedForDelete : ''}`}
                  onClick={() => {
                    if (isBulkDeleteMode) {
                      toggleItemSelection(item.inventoryId);
                    } else {
                      setSelectedItemForDetails(item);
                    }
                  }}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: isBulkDeleteMode && isSelected ? 'rgba(255, 100, 100, 0.2)' : 'transparent'
                  }}
                >
                  {isBulkDeleteMode && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleItemSelection(item.inventoryId);
                      }}
                      style={{ cursor: 'pointer', flexShrink: 0, marginTop: '2px' }}
                    />
                  )}
                  <div className={styles.inventoryItemContent}>
                    <div className={styles.inventoryItemHeader}>
                      <span className={styles.inventoryItemName}>
                        {item.name} {item.quantity > 1 && `(x${item.quantity})`}
                      </span>
                      <div className={styles.inventoryItemQuickInfo}>
                        {item.item_type && <span className={styles.itemType}>{item.item_type}</span>}
                        {item.maxCharges && (
                          <span className={styles.chargesIndicator}>
                            Charges: {item.currentCharges}/{item.maxCharges}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={styles.inventoryActions} style={{ display: 'none' }}>
                      <button className={styles.addMoreBtn} onClick={(e) => { e.stopPropagation(); addMoreItem(item); }}>+ Add 1 More</button>
                      <button className={styles.removeOneBtn} onClick={(e) => { e.stopPropagation(); removeOneItem(item.inventoryId, item.name, item.quantity); }}>− Remove 1</button>
                      <button className={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); deleteInventoryItem(item.inventoryId, item.name); }}>🗑️ Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className={styles.emptyInventory}>No items yet. Add items to get started!</p>
        )}
      </section>

      {/* Combat */}
      <section className={styles.section}>
        <h2>Combat</h2>

        {/* HP Section */}
        <div className={styles.hpSection}>
          <div className={styles.hpRow}>
            <div className={styles.hpContainer}>
              <strong>Hit Points:</strong>
              <div className={styles.hpDisplay}>
                <div className={styles.hpMainDisplay}>
                  <span className={styles.hpCurrent}>{hpCurrent}</span>
                  <span className={styles.hpSeparator}>/</span>
                  <span className={styles.hpMax}>{hpMax}</span>
                  {hpTmp > 0 && <span className={styles.hpTemp}>(+{hpTmp} temp)</span>}
                </div>
              </div>
              <div className={styles.hpControls}>
                <button type="button" onClick={() => setHpModalType('heal')} disabled={saving} className={styles.hpButton}>💚 Heal</button>
                <button type="button" onClick={() => setHpModalType('damage')} disabled={saving} className={styles.hpButton}>💔 Damage</button>
                <button type="button" onClick={() => setHpModalType('temp')} disabled={saving} className={styles.hpButton}>🛡️ Temp HP</button>
              </div>
            </div>
            <div className={styles.totalHpContainer}>
              <strong>Total HP:</strong>
              <div className={styles.totalHpDisplay}>
                <span className={styles.totalHpValue}>{hpCurrent + hpTmp} / {hpMax}</span>
              </div>
            </div>
          </div>

          {hpModalType && (
            <div className={styles.hpModal}>
              <div className={styles.hpModalContent}>
                <label>
                  {hpModalType === 'heal' && 'Heal amount:'}
                  {hpModalType === 'damage' && 'Damage amount:'}
                  {hpModalType === 'temp' && 'Temporary HP:'}
                </label>
                <input
                  type="number"
                  value={hpModalInput}
                  onChange={(e) => setHpModalInput(e.target.value)}
                  placeholder="Enter amount"
                  className={styles.hpModalInput}
                  autoFocus
                  onKeyPress={(e) => { if (e.key === 'Enter') handleHpModalSubmit(); }}
                />
                <div className={styles.hpModalButtons}>
                  <button onClick={handleHpModalSubmit} className={styles.confirmBtn}>Apply</button>
                  <button onClick={() => { setHpModalType(null); setHpModalInput(''); }} className={styles.cancelBtn}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          <button onClick={saveHp} disabled={saving} className={styles.saveBtn}>
            {saving ? 'Saving...' : 'Save HP'}
          </button>
        </div>

        {/* Combat Stats */}
        <div className={styles.combatStats}>
          <div 
            className={`${styles.statBox} ${styles.clickable}`}
            onClick={() => setStatModifiersModal({ isOpen: true, stat: 'AC' })}
            title="Click to see AC modifiers"
          >
            <strong>AC:</strong>
            <span>{calculateAC()}</span>
          </div>
          <div 
            className={`${styles.statBox} ${styles.clickable}`}
            onClick={() => setStatModifiersModal({ isOpen: true, stat: 'Initiative' })}
            title="Click to see Initiative modifiers"
          >
            <strong>Initiative:</strong>
            <span>{(() => {
              const dexModifier = getAbilityModifier(character.abilityScores?.dex || 10);
              return (dexModifier >= 0 ? '+' : '') + dexModifier;
            })()}</span>
          </div>
          <div 
            className={`${styles.statBox} ${styles.clickable}`}
            onClick={() => setStatModifiersModal({ isOpen: true, stat: 'Speed' })}
            title="Click to see Speed modifiers"
          >
            <strong>Speed:</strong>
            <span>{character.speed || 30} ft</span>
          </div>
        </div>

        {/* Combat Attacks */}
        <div className={styles.attacksSection}>
          <h3>Possible Attacks</h3>
          {character.items && Array.isArray(character.items) && character.items.length > 0 ? (
            <>
              <div className={styles.attackRowHeader}>
                <div className={styles.attackRowName}>Name</div>
                <div className={styles.attackRowBonus}>Attack Bonus</div>
                <div className={styles.attackRowDamage}>Damage</div>
                <div className={styles.attackRowType}>Damage Type</div>
              </div>
              <div className={styles.attacksList}>
                {character.items
                  .filter((item: any) => item.item_type === 'Weapon' || item.type === 'Weapon')
                  .map((weapon: any, index: number) => {
                    // ✅ Use Finesse helper for attack bonus
                    const bestAbility = getBestAbilityForWeapon(weapon);
                    const attackBonus = bestAbility.modifier + proficiencyBonus;
                    const damageDice = weapon.damageDice || '1d4';
                    const damageType = weapon.damageType || 'bludgeoning';

                    return (
                      <div
                        key={index}
                        className={styles.attackRow}
                        onClick={() => {
                          const variants = getWeaponVariants(weapon);
                          if (variants.length > 1) {
                            setWeaponToVariantSelect(weapon);
                            setSelectedWeaponVariant(variants[0].id);
                            setWeaponVariantSelectorOpen(true);
                          } else {
                            setSelectedAttackForModal(weapon);
                            setSelectedAttackData({
                              weapon,
                              attackBonus,
                              damageDice,
                              damageType,
                              abilityUsed: bestAbility.ability,
                              abilityModifier: bestAbility.modifier
                            });
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className={styles.attackRowName}>{weapon.name}</div>
                        <div className={styles.attackRowBonus}>+{attackBonus}</div>
                        <div className={styles.attackRowDamage}>{damageDice}</div>
                        <div className={styles.attackRowType}>{damageType}</div>
                      </div>
                    );
                  })}
              </div>
            </>
          ) : (
            <p className={styles.noAttacks}>No weapons in inventory. Add items to see possible attacks.</p>
          )}
        </div>

        {/* Attack Modal */}
        {attackModalData && (
          <div className={styles.attackModal}>
            <div className={styles.attackModalContent}>
              <button className={styles.attackModalClose} onClick={() => setAttackModalData(null)}>×</button>
              <h3>Make Attack: {attackModalData.weapon.name}</h3>
              <div className={styles.attackModalData}>
                <div className={styles.attackModalBox}>
                  <h4>To-Hit Bonus</h4>
                  <div className={styles.attackModalValue}>+{attackModalData.attackBonus}</div>
                  <p className={styles.diceLabel}>Roll d20 and add +{attackModalData.attackBonus}</p>
                </div>
                <div className={styles.attackModalBox}>
                  <h4>Damage Roll</h4>
                  <div className={styles.attackModalValue}>{attackModalData.damageDice}</div>
                  <p className={styles.diceLabel}>
                    Add +{attackModalData.abilityModifier || getAbilityModifier(character.abilityScores?.str || 10)} 
                    ({attackModalData.abilityUsed || 'STR'} mod)
                  </p>
                  <p className={styles.damageTypeLabel}>Type: {attackModalData.damageType}</p>
                  {attackModalData.weapon.properties?.some((p: string) => 
                    typeof p === 'string' ? p.toLowerCase().includes('finesse') : false
                  ) && (
                    <p className={styles.finesseNote} style={{ color: '#2d5016', fontSize: '0.85em' }}>
                      ⚡ Finesse: Using {attackModalData.abilityUsed || 'STR'} (higher of STR/DEX)
                    </p>
                  )}
                </div>
              </div>
              {attackModalData.weapon.onHitEffect && (
                <div className={styles.attackModalEffect}>
                  <h4>Special Effect</h4>
                  <p>{attackModalData.weapon.onHitEffect}</p>
                </div>
              )}
              {attackModalData.weapon.maxCharges && attackModalData.weapon.currentCharges > 0 && (
                <div className={styles.chargesExpendPrompt}>
                  <label>
                    <input
                      type="checkbox"
                      checked={expendCharge}
                      onChange={(e) => setExpendCharge(e.target.checked)}
                    />
                    Expend 1 charge? ({attackModalData.weapon.currentCharges} remaining)
                  </label>
                </div>
              )}
              <div className={styles.attackModalButtons}>
                <button className={styles.confirmBtn} onClick={() => { 
                  if (expendCharge && attackModalData.weapon.currentCharges > 0) {
                      updateItemCharges(attackModalData.weapon.inventoryId, attackModalData.weapon.currentCharges - 1);
                  }
                  setAttackModalData(null);
                  setExpendCharge(false);
                }}>OK, Ready to Roll!</button>
                <button className={styles.cancelBtn} onClick={() => { setAttackModalData(null); setExpendCharge(false); }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Weapon Variant Selector Modal */}
        {weaponVariantSelectorOpen && weaponToVariantSelect && (
          <div className={styles.variantSelectorOverlay} onClick={() => {
            setWeaponVariantSelectorOpen(false);
            setWeaponToVariantSelect(null);
          }}>
            <div className={styles.variantSelectorContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeBtn} onClick={() => {
                setWeaponVariantSelectorOpen(false);
                setWeaponToVariantSelect(null);
              }}>✕</button>
              <h2>Select Attack Type for {weaponToVariantSelect.name}</h2>
              <p className={styles.variantDescription}>This weapon can be used in multiple ways. Choose how you want to attack:</p>
              <div className={styles.variantOptions}>
                {getWeaponVariants(weaponToVariantSelect).map((variant) => (
                  <div
                    key={variant.id}
                    className={`${styles.variantOption} ${selectedWeaponVariant === variant.id ? styles.variantOptionSelected : ''}`}
                    onClick={() => setSelectedWeaponVariant(variant.id)}
                  >
                    <div className={styles.variantOptionName}>{variant.name}</div>
                    <div className={styles.variantOptionDetails}>
                      <span><strong>Damage:</strong> {variant.damageDice}</span>
                      <span><strong>Type:</strong> {variant.damageType}</span>
                      {variant.range && <span><strong>Range:</strong> {variant.range}</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.variantActions}>
                <button
                  className={styles.confirmVariantBtn}
                  onClick={() => {
                    const selectedVariantObj = getWeaponVariants(weaponToVariantSelect).find(v => v.id === selectedWeaponVariant);
                    if (selectedVariantObj) {
                      // ✅ Use Finesse helper for variant selection too
                      const bestAbility = getBestAbilityForWeapon(weaponToVariantSelect);
                      const attackBonus = bestAbility.modifier + proficiencyBonus;
                      setSelectedAttackForModal(weaponToVariantSelect);
                      setSelectedAttackData({
                        weapon: weaponToVariantSelect,
                        attackBonus,
                        damageDice: selectedVariantObj.damageDice,
                        damageType: selectedVariantObj.damageType,
                        variant: selectedWeaponVariant,
                        range: selectedVariantObj.range,
                        abilityUsed: bestAbility.ability,
                        abilityModifier: bestAbility.modifier
                      });
                      setWeaponVariantSelectorOpen(false);
                      setWeaponToVariantSelect(null);
                    }
                  }}
                >
                  Proceed with {getWeaponVariants(weaponToVariantSelect).find(v => v.id === selectedWeaponVariant)?.name || 'Attack'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Attack Details Modal */}
        {selectedAttackForModal && selectedAttackData && (
          <div className={styles.attackDetailsModalOverlay} onClick={() => setSelectedAttackForModal(null)}>
            <div className={styles.attackDetailsModalContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeBtn} onClick={() => setSelectedAttackForModal(null)}>✕</button>
              <div className={styles.attackDetailsHeader}>
                <h2>{selectedAttackForModal.name}</h2>
                <p className={styles.weaponType}>
                  {selectedAttackForModal.item_type || selectedAttackForModal.type || 'Weapon'}
                  {selectedAttackData.variant && (
                    <> • {getWeaponVariants(selectedAttackForModal).find(v => v.id === selectedAttackData.variant)?.name}</>
                  )}
                </p>
              </div>
              <div className={styles.attackDetailsContent}>
                {selectedAttackForModal.desc && (
                  <div className={styles.section}>
                    <p className={styles.weaponDesc}>{selectedAttackForModal.desc}</p>
                  </div>
                )}
                <div className={styles.attackStatsSection}>
                  <h3>Attack Statistics</h3>
                  <div>
                    <div className={styles.attackStatRow}>
                      <strong>Attack Bonus:</strong>
                      <span>+{selectedAttackData.attackBonus}</span>
                    </div>
                    <div className={styles.attackStatRow}>
                      <strong>Damage Roll:</strong>
                      <span>{selectedAttackData.damageDice} + {selectedAttackData.abilityModifier || getAbilityModifier(character.abilityScores?.str || 10)}</span>
                    </div>
                    <div className={styles.attackStatRow}>
                      <strong>Damage Type:</strong>
                      <span>{selectedAttackData.damageType}</span>
                    </div>
                    {selectedAttackForModal.properties?.some((p: string) =>
                      typeof p === 'string' ? p.toLowerCase().includes('finesse') : false
                    ) && (
                      <div className={styles.calcRow} style={{ backgroundColor: '#fff3cd', padding: '0.25rem', borderRadius: '4px' }}>
                        <strong>⚡ Finesse:</strong>
                        <span>Using {selectedAttackData.abilityUsed || 'STR'} (higher of STR/DEX)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Weapon Properties */}
                {selectedAttackForModal.properties && selectedAttackForModal.properties.length > 0 && (
                  <div className={styles.propertiesSection}>
                    <h3>Properties</h3>
                    <div className={styles.propertiesList}>
                      {selectedAttackForModal.properties.map((prop: string, idx: number) => (
                        <span key={idx} className={styles.propertyTag}>{prop}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* On-Hit Effect */}
                {selectedAttackForModal.onHitEffect && (
                  <div className={styles.onHitSection}>
                    <h3>On-Hit Effect</h3>
                    <p>{selectedAttackForModal.onHitEffect}</p>
                  </div>
                )}

                {/* Charges */}
                {selectedAttackForModal.maxCharges && (
                  <div className={styles.chargesInfoSection}>
                    <h3>Charges</h3>
                    <div className={styles.chargesInfo}>
                      <span><strong>Current</strong> {selectedAttackForModal.currentCharges} / {selectedAttackForModal.maxCharges}</span>
                      {selectedAttackForModal.chargeRecharge && (
                        <span><strong>Recharge</strong> {selectedAttackForModal.chargeRecharge}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Special Abilities */}
                {selectedAttackForModal.specialAbilities && selectedAttackForModal.specialAbilities.length > 0 && (
                  <div className={styles.abilitiesSection}>
                    <h3>Special Abilities</h3>
                    <ul className={styles.abilitiesList}>
                      {selectedAttackForModal.specialAbilities.map((ability: string, idx: number) => (
                        <li key={idx}>{ability}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Other Stats */}
                {(selectedAttackForModal.weight || selectedAttackForModal.cost || selectedAttackForModal.rarity) && (
                  <div className={styles.otherStatsSection}>
                    <div>
                      {selectedAttackForModal.weight && (
                        <div className={styles.statRow}><strong>Weight:</strong> <span>{selectedAttackForModal.weight} lbs</span></div>
                      )}
                      {selectedAttackForModal.cost && (
                        <div className={styles.statRow}><strong>Cost:</strong> <span>{selectedAttackForModal.cost} gp</span></div>
                      )}
                      {selectedAttackForModal.rarity && (
                        <div className={styles.statRow}><strong>Rarity:</strong> <span>{selectedAttackForModal.rarity}</span></div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className={styles.attackDetailsActions}>
                {getWeaponVariants(selectedAttackForModal).length > 1 && (
                  <button
                    className={styles.changeVariantBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAttackForModal(null);
                      setWeaponToVariantSelect(selectedAttackForModal);
                      setSelectedWeaponVariant(selectedAttackData.variant || 'melee');
                      setWeaponVariantSelectorOpen(true);
                    }}
                  >
                    🔄 Change Attack Type
                  </button>
                )}
                <button
                  className={styles.makeAttackBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setAttackModalData(selectedAttackData);
                    setSelectedAttackForModal(null);
                  }}
                >
                  ⚔️ Make Attack
                </button>
                <button className={styles.closeActionBtn} onClick={() => setSelectedAttackForModal(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Item Details Modal */}
      <ItemDetailsModal
        isOpen={selectedItemForDetails !== null}
        onClose={() => setSelectedItemForDetails(null)}
        item={selectedItemForDetails}
        onUpdateCharges={(newCharges) => {
          if (selectedItemForDetails && selectedItemForDetails.inventoryId) {
            updateItemCharges(selectedItemForDetails.inventoryId, newCharges).then(() => {
              setSelectedItemForDetails({
                ...selectedItemForDetails,
                currentCharges: newCharges
              });
            });
          }
        }}
        onAddItem={() => {
          if (selectedItemForDetails) {
            addMoreItem(selectedItemForDetails);
            setSelectedItemForDetails(null);
          }
        }}
        onRemoveOne={() => {
          if (selectedItemForDetails) {
            removeOneItem(selectedItemForDetails.inventoryId, selectedItemForDetails.name, selectedItemForDetails.quantity);
            setSelectedItemForDetails(null);
          }
        }}
        onDelete={() => {
          if (selectedItemForDetails) {
            deleteInventoryItem(selectedItemForDetails.inventoryId, selectedItemForDetails.name);
            setSelectedItemForDetails(null);
          }
        }}
        onEquip={() => {
          if (selectedItemForDetails) {
            equipItem(selectedItemForDetails.inventoryId, selectedItemForDetails.name);
          }
        }}
        onUnequip={() => {
          if (selectedItemForDetails) {
            unequipItem(selectedItemForDetails.inventoryId, selectedItemForDetails.name);
          }
        }}
      />

      {/* Stat Modifiers Modal */}
      {character && (
        <StatModifiersModal
          isOpen={statModifiersModal.isOpen}
          onClose={() => setStatModifiersModal({ ...statModifiersModal, isOpen: false })}
          statName={statModifiersModal.stat}
          currentValue={
            statModifiersModal.stat === 'AC'
              ? calculateAC()
              : statModifiersModal.stat === 'Initiative'
              ? getAbilityModifier(character.abilityScores?.dex || 10)
              : statModifiersModal.stat === 'Speed'
              ? character.speed || 30
              : 0
          }
          modifiers={
            statModifiersModal.stat === 'AC'
              ? getACModifiers()
              : statModifiersModal.stat === 'Initiative'
              ? getInitiativeModifiers()
              : statModifiersModal.stat === 'Speed'
              ? getSpeedModifiers()
              : []
          }
        />
      )}

      {/* Proficiency Modal */}
      <ProficiencyModal
        isOpen={proficiencyModal.isOpen}
        onClose={() => setProficiencyModal({ ...proficiencyModal, isOpen: false })}
        modalType={proficiencyModal.type}
        proficiencies={
          proficiencyModal.type === 'skills'
            ? getSkillProficiencies()
            : proficiencyModal.type === 'weapons'
            ? getWeaponProficiencies()
            : proficiencyModal.type === 'tools'
            ? getToolProficiencies()
            : getLanguages()
        }
      />
    </div>
  );
};

export default CharacterDisplay;