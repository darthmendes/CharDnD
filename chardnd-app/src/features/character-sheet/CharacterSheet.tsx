// src/features/character-sheet/CharacterDisplay.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Character } from '../../types/Character';
import AbsScores from './components/AbilityScores/AbsScores';
import styles from './CharacterSheet.module.css';
import ItemModal from '../Items/ItemModal/ItemModal';
import SpellSelectionModal from './components/SpellModal/SpellSelectionModal';
import ItemDetailsModal from './components/ItemDetailsModal/ItemDetailsModal';
import SpellDetailsModal from './components/SpellDetailsModal/SpellDetailsModal';
import StatModifiersModal from './components/StatModifiersModal/StatModifiersModal';
import ProficiencyModal from './components/ProficiencyModal/ProficiencyModal';
import SpellManager from './components/SpellManager/SpellManager';
import { 
  fetchItems, 
  fetchSpeciesTraits, 
  fetchCharacter,
  updateCharacter,
  addItemToCharacter,
  deleteInventoryItem as apiDeleteInventoryItem,
  removeOneItem as apiRemoveOneItem,
  updateItemCharges as apiUpdateItemCharges,
  equipItem as apiEquipItem,
  unequipItem as apiUnequipItem,
  attuneItem as apiAttuneItem,
  unattuneItem as apiUnattuneItem,
  fetchSpellSlots,
  fetchCharacterSpells,
  addSpellToCharacter,
  toggleSpellPrepared as apiToggleSpellPrepared,
  fetchPrepareLimit,
  fetchClassSpells,
  fetchAllSpells,
  expendSpellSlot as apiExpendSpellSlot,
} from '../../services/api';

// 🔽 D&D 5e XP Thresholds
const LEVEL_XP_TABLE = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
];

// ✅ Default attunement slot limit
const DEFAULT_ATTUNEMENT_SLOTS = 4;

// ✅ Type for proficiency tabs
type ProficiencyTab = 'skills' | 'weapons' | 'tools';

// ✅ Type for collapsible sections
type CollapsibleSection = 'speciesLevel' | 'traits' | 'spellcasting' | 'inventory' | 'combat';

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
  const [isSpellDetailsModalOpen, setIsSpellDetailsModalOpen] = useState(false);
  const [selectedSpellForDetails] = useState<any | null>(null);
  
  // ✅ State for items
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [_selectedAttackItem, _setSelectedAttackItem] = useState<any | null>(null);
  const [attackModalData, setAttackModalData] = useState<any | null>(null);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<any | null>(null);
  
  // ✅ State for bulk delete
  const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false);
  const [selectedItemsForDelete, setSelectedItemsForDelete] = useState<Set<number>>(new Set());
  
  // ✅ State for attack details modal
  const [selectedAttackForModal, setSelectedAttackForModal] = useState<any | null>(null);
  const [selectedAttackData, setSelectedAttackData] = useState<any | null>(null);
  
  // ✅ State for weapon variant selector
  const [weaponVariantSelectorOpen, setWeaponVariantSelectorOpen] = useState(false);
  const [weaponToVariantSelect, setWeaponToVariantSelect] = useState<any | null>(null);
  const [selectedWeaponVariant, setSelectedWeaponVariant] = useState<string | null>(null);
  
  // ✅ HP Modal State
  const [hpModalType, setHpModalType] = useState<'heal' | 'damage' | 'temp' | null>(null);
  const [hpModalInput, setHpModalInput] = useState<string>('');
  
  // ✅ Charge expend checkbox state
  const [expendCharge, setExpendCharge] = useState(false);
  
  // ✅ State for stat modifiers modal
  const [statModifiersModal, setStatModifiersModal] = useState<{
    isOpen: boolean;
    stat: 'AC' | 'Speed' | 'Initiative' | 'AbilityScore' | 'SpellDC' | 'SpellAttack';
    abilityKey?: string;
  }>({
    isOpen: false,
    stat: 'AC',
  });
  
  // ✅ State for proficiency modals
  const [proficiencyModal, setProficiencyModal] = useState<{
    isOpen: boolean;
    type: 'skills' | 'weapons' | 'tools' | 'languages';
  }>({
    isOpen: false,
    type: 'skills',
  });
  
  // ✅ NEW: State for proficiency tabs
  const [activeProficiencyTab, setActiveProficiencyTab] = useState<ProficiencyTab>('skills');
  
  // ✅ State for equipped items filter
  const [showEquippedOnly, setShowEquippedOnly] = useState(false);
  
  // ✅ State for attuned items filter
  const [showAttunedOnly, setShowAttunedOnly] = useState(false);
  
  // ✅ Attunement slot limit
  const [attunementSlotLimit, setAttunementSlotLimit] = useState<number>(DEFAULT_ATTUNEMENT_SLOTS);
  
  // ✅ State for expanded trait (for collapsible display)
  const [expandedTrait, setExpandedTrait] = useState<string | null>(null);
  
  // ✅ State for expanded skill advantage (for collapsible display)
  const [expandedAdvantage, setExpandedAdvantage] = useState<string | null>(null);
  
  // ✅ NEW: State for collapsible sections
  const [collapsedSections, setCollapsedSections] = useState<Record<CollapsibleSection, boolean>>({
    speciesLevel: false,
    traits: false,
    spellcasting: false,
    inventory: false,
    combat: false,
  });
  
  // ✅ NEW: Spell casting state
  const [spellSlots, setSpellSlots] = useState<{[key: string]: number}>({});
  const [spellSlotsExpended, setSpellSlotsExpended] = useState<{[key: string]: number}>({});
  const [, setSpellSlotsRemaining] = useState<{[key: string]: number}>({});
  const [spellcasterLevel, setSpellcasterLevel] = useState<number>(0);
  const [spellcastingAbility, setSpellcastingAbility] = useState<string>('int');
  const [spellSaveDC, setSpellSaveDC] = useState<number>(10);
  const [spellAttackBonus, setSpellAttackBonus] = useState<number>(0);
  const [characterSpells, setCharacterSpells] = useState<any[]>([]);
  
  // ✅ NEW: Spell preparation state
  const [spellPrepareLimit, setSpellPrepareLimit] = useState<number | null>(null);
  const [spellPreparedCount, setSpellPreparedCount] = useState<number>(0);
  const [spellPrepareUnlimited, setSpellPrepareUnlimited] = useState<boolean>(false);

  // ✅ NEW: Class-based spell lists state
  const [, setClassSpellsByClass] = useState<{[className: string]: {[level: number]: any[]}}>({});
  const [, setActiveSpellLevels] = useState<{[className: string]: number}>({});
  const [, setActiveClassSpellTab] = useState<{[className: string]: 'available' | 'prepared'}>({});
  const [, setClassSpellLoading] = useState<{[className: string]: boolean}>({});

  // ✅ Spell bulk preparation state (unused - for future feature)

  // Navigation
  const goToMain = () => navigate('/');
  const goToItemCreator = () => navigate('/items/creator');

  // ✅ Toggle section collapse
  const toggleSection = (section: CollapsibleSection) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
      const updated = await updateCharacter(parseInt(id), { level: localLevel, xp: localXp });
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
      const updated = await updateCharacter(parseInt(id), { hpCurrent, hpTmp });
      setCharacter(updated);
      alert('✅ HP saved!');
    } catch (err: any) {
      console.error(err);
      alert('❌ Failed to save HP');
    } finally {
      setSaving(false);
    }
  };

  // 📥 Load character (✅ FIXED: Fetch species traits)
  useEffect(() => {
    const loadCharacter = async () => {
      if (!id) return;
      try {
        const data = await fetchCharacter(parseInt(id));
        
        // ✅ Fetch species traits if species exists
        if (data.species) {
          try {
            const speciesTraits = await fetchSpeciesTraits(data.species, data.subspecies);
            if (speciesTraits && speciesTraits.length > 0) {
              // Merge species traits with character traits
              data.traits = [
                ...(data.traits || []),
                ...speciesTraits.map((t: any) => ({
                  name: t.feature_name || t.name,
                  description: t.description,
                  source: data.subspecies || data.species
                }))
              ];
            }
          } catch (err) {
            console.error('Failed to load species traits:', err);
          }
        }
        
        setCharacter(data);
        const scores = data.abilityScores || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
        setLocalAbilityScores(scores);
        setLocalLevel(data.level || 1);
        setLocalXp(data.xp || 0);
        setHpMax(data.hpMax || data.hitPoints || 10);
        setHpCurrent(data.hpCurrent !== undefined ? data.hpCurrent : (data.hpMax || data.hitPoints || 10));
        setHpTmp(data.hpTmp || 0);
        
        // ✅ Check for attunement slot modifiers
        const attunementBonus = data.attunementSlotBonus || 0;
        setAttunementSlotLimit(DEFAULT_ATTUNEMENT_SLOTS + attunementBonus);
      } catch (err: any) {
        setError(err.message || 'Failed to load character');
      } finally {
        setLoading(false);
      }
    };
    loadCharacter();
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

  // ✅ Load spell slots and character spells
  useEffect(() => {
    const loadSpellData = async () => {
      if (!id || !character) return;
      try {
        // Load spell slots
        const slotsData = await fetchSpellSlots(parseInt(id));
        setSpellSlots(slotsData.spell_slots);
        setSpellSlotsExpended(slotsData.spell_slots_expended);
        setSpellSlotsRemaining(slotsData.spell_slots_remaining);
        setSpellcasterLevel(slotsData.spellcaster_level);
        setSpellcastingAbility(slotsData.spellcasting_ability);
        setSpellSaveDC(slotsData.spell_save_dc);
        setSpellAttackBonus(slotsData.spell_attack_bonus);
        
        // Load character spells
        const spellsData = await fetchCharacterSpells(parseInt(id));
        setCharacterSpells(spellsData);
        
        // ✅ NEW: Load prepare limit
        const prepareData = await fetchPrepareLimit(parseInt(id));
        setSpellPrepareLimit(prepareData.prepare_limit);
        setSpellPreparedCount(prepareData.prepared_count);
        setSpellPrepareUnlimited(prepareData.unlimited);
      } catch (err) {
        console.error('Failed to load spell data:', err);
      }
    };
    loadSpellData();
  }, [id, character]);

  // ✅ NEW: Load class-available spells for each of character's classes
  useEffect(() => {
    const loadClassSpells = async () => {
      if (!id || !character?.classes) return;
      const spellsByClass: {[className: string]: {[level: number]: any[]}} = {};
      const initialActiveLevels: {[className: string]: number} = {};
      const initialActiveTabs: {[className: string]: 'available' | 'prepared'} = {};
      
      for (const charClass of character.classes) {
        const className = charClass.className;
        setClassSpellLoading(prev => ({ ...prev, [className]: true }));
        try {
          // Fetch spells available to this class
          const spells = await fetchClassSpells(className);
          // Group by spell level
          const byLevel: {[level: number]: any[]} = {};
          for (const spell of spells) {
            const level = spell.level || 0;
            if (!byLevel[level]) byLevel[level] = [];
            byLevel[level].push(spell);
          }
          spellsByClass[className] = byLevel;
          initialActiveLevels[className] = 0; // Default to cantrips tab
          // ✅ FIX #2: Default to 'prepared' tab for prepared casters
          const isPreparedCaster = ['Cleric', 'Druid', 'Paladin', 'Wizard'].includes(className);
          initialActiveTabs[className] = isPreparedCaster ? 'prepared' : 'available';
        } catch (err) {
          console.error(`Failed to load spells for ${className}:`, err);
        } finally {
          setClassSpellLoading(prev => ({ ...prev, [className]: false }));
        }
      }
      setClassSpellsByClass(spellsByClass);
      setActiveSpellLevels(initialActiveLevels);
      setActiveClassSpellTab(initialActiveTabs);
    };
    loadClassSpells();
  }, [id, character?.classes]);

  // Ability scores
  const handleScoreChange = (newScores: { [key: string]: number }) => {
    setLocalAbilityScores(newScores);
  };

  const saveScores = async () => {
    if (!id || !localAbilityScores || saving) return;
    setSaving(true);
    try {
      const updatedCharacter = await updateCharacter(parseInt(id), { abilityScores: localAbilityScores });
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
      const updatedCharacter = await addItemToCharacter(parseInt(id!), item.id!, quantity);
      setCharacter(updatedCharacter);
      alert(`✅ Added ${quantity} × ${item.name} to inventory`);
    } catch (err: any) {
      console.error(err);
      alert('❌ Could not add item');
    }
  };

  // Add spell
  const addSpell = async (spell: { id?: number; name: string }) => {
    try {
      // Extract spellID from spell object
      const spellId = spell.id;
      if (!spellId) {
        alert('❌ Spell ID not found');
        return;
      }

      await addSpellToCharacter(parseInt(id!), spellId);
      setIsSpellModalOpen(false);
      alert(`✅ Added ${spell.name} to spells`);
      
      // Refresh spell list
      const spellsData = await fetchCharacterSpells(parseInt(id!));
      setCharacterSpells(spellsData);
    } catch (err: any) {
      console.error(err);
      alert('❌ Could not add spell: ' + err.message);
    }
  };

  // Add one more of the same item
  const addMoreItem = async (item: any) => {
    try {
      const updatedCharacter = await addItemToCharacter(parseInt(id!), item.id, 1);
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
      const updatedCharacter = await apiDeleteInventoryItem(parseInt(id!), inventoryId);
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
      const updatedCharacter = await apiRemoveOneItem(parseInt(id!), inventoryId);
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
      const updatedCharacter = await apiUpdateItemCharges(parseInt(id!), inventoryId, newCharges);
      setCharacter(updatedCharacter);
    } catch (err: any) {
      console.error(err);
      alert('❌ Could not update charges');
    }
  };

  // ✅ NEW: Expend spell slot
  const expendSpellSlot = async (level: number) => {
    try {
      await apiExpendSpellSlot(parseInt(id!), level, 1);
      // Refresh spell slots
      const slotsData = await fetchSpellSlots(parseInt(id!));
      setSpellSlotsRemaining(slotsData.spell_slots_remaining);
      setSpellSlotsExpended(slotsData.spell_slots_expended);
    } catch (err) {
      console.error('Failed to expend spell slot:', err);
    }
  };

  // ✅ NEW: Toggle spell prepared status
  const toggleSpellPrepared = async (spellId: number) => {
    try {
      await apiToggleSpellPrepared(parseInt(id!), spellId);
      // Refresh spells and prepare limit
      const spellsData = await fetchCharacterSpells(parseInt(id!));
      setCharacterSpells(spellsData);
      
      // Refresh prepare limit
      const prepareData = await fetchPrepareLimit(parseInt(id!));
      setSpellPrepareLimit(prepareData.prepare_limit);
      setSpellPreparedCount(prepareData.prepared_count);
      setSpellPrepareUnlimited(prepareData.unlimited);
    } catch (err) {
      console.error('Failed to toggle spell prepared:', err);
    }
  };

  // ✅ NEW: Attune item (does NOT require equipment)
  const attuneItem = async (inventoryId: number, itemName: string, _itemData: any) => {
    const attunedCount = getAttunedCount();
    if (attunedCount >= attunementSlotLimit) {
      alert(`❌ Cannot attune: You already have ${attunedCount} attuned items (max: ${attunementSlotLimit}). Unattune an item first.`);
      return;
    }
    try {
      const updatedCharacter = await apiAttuneItem(parseInt(id!), inventoryId);
      setCharacter(updatedCharacter);
      alert(`✅ ${itemName} attuned! (${attunedCount + 1}/${attunementSlotLimit})`);
    } catch (err: any) {
      console.error(err);
      alert('❌ Could not attune item: ' + err.message);
    }
  };

  // ✅ NEW: Unattune item
  const unattuneItem = async (inventoryId: number, itemName: string) => {
    try {
      const updatedCharacter = await apiUnattuneItem(parseInt(id!), inventoryId);
      setCharacter(updatedCharacter);
      alert(`✅ ${itemName} unattuned!`);
    } catch (err: any) {
      console.error(err);
      alert('❌ Could not unattune item');
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
        await apiDeleteInventoryItem(parseInt(id!), inventoryId);
      }
      const updatedCharacter = await fetchCharacter(parseInt(id!));
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

  // ✅ Check if item requires attunement
  const requiresAttunement = (item: any): boolean => {
    if (!item) return false;
    const itemData = item.item || item;
    return itemData.requires_attunement === true || 
           itemData.property_data?.requires_attunement === true ||
           (itemData.rarity && ['Rare', 'Very Rare', 'Legendary', 'Artifact'].includes(itemData.rarity));
  };

  // ✅ Check if item is currently attuned
  const isItemAttuned = (item: any): boolean => {
    if (!item) return false;
    return item.is_attuned === true;
  };

  // ✅ Check if item can be equipped (Wondrous Item, Ring, Armor, Shield)
  const canEquip = (item: any): boolean => {
    if (!item) return false;
    const itemData = item.item || item;
    const itemType = itemData.item_type || itemData.type || '';
    const itemCategory = itemData.item_category || '';
    
    return (
      itemType === 'Wondrous Item' ||
      itemType === 'Ring' ||
      itemCategory.includes('Ring') ||
      itemType === 'Armor' ||
      (itemType === 'Armor' && itemCategory.includes('Shield'))
    );
  };

  // ✅ Count currently attuned items (NOT just equipped)
  const getAttunedCount = (): number => {
    if (!character || !character.items) return 0;
    return character.items.filter((inv: any) => 
      inv.is_attuned === true
    ).length;
  };

  // ✅ Check if character can attune to more items
  const canAttuneMore = (): boolean => {
    return getAttunedCount() < attunementSlotLimit;
  };

  // ✅ Calculate AC based on equipped armor
  const calculateAC = (): number => {
    if (!character || !character.items) return 10;
    let baseAC = 10;
    let armorAC = 0;
    let shieldBonus = 0;
    let dexMod = 0;

    if (character.abilityScores) {
      dexMod = Math.floor((character.abilityScores.dex - 10) / 2);
    }

    for (const inv of character.items) {
      if (inv.is_equipped) {
        const armorItem = inv.item || inv;
        if (armorItem.item_category && armorItem.item_category.includes('Shield')) {
          if (armorItem.property_data?.ac_bonus) {
            shieldBonus += armorItem.property_data.ac_bonus;
          }
        } else if (armorItem.item_type === 'Armor') {
          if (armorItem.property_data?.ac_base) {
            armorAC = armorItem.property_data.ac_base;
          }
        }
      }
    }

    if (armorAC > 0) {
      baseAC = armorAC;
      if (!character.items?.some(inv => inv.is_equipped && inv.item?.property_data?.ac_type === 'dex_no')) {
        baseAC += dexMod;
      }
    } else {
      baseAC = 10 + dexMod;
    }

    return Math.max(10, baseAC + shieldBonus);
  };

  // ✅ Equip item
  const equipItem = async (inventoryId: number, itemName: string, itemData: any) => {
    try {
      const updatedCharacter = await apiEquipItem(parseInt(id!), inventoryId);
      setCharacter(updatedCharacter);
      setSelectedItemForDetails(null);
      
      const attunementNote = requiresAttunement(itemData) 
        ? ' (Click ⚡ to attune for special abilities)' 
        : '';
      alert(`✅ ${itemName} equipped!${attunementNote}`);
    } catch (err: any) {
      console.error(err);
      alert('❌ Could not equip item');
    }
  };

  // ✅ Unequip item
  const unequipItem = async (inventoryId: number, itemName: string) => {
    try {
      const updatedCharacter = await apiUnequipItem(parseInt(id!), inventoryId);
      setCharacter(updatedCharacter);
      setSelectedItemForDetails(null);
      alert(`✅ ${itemName} unequipped!`);
    } catch (err: any) {
      console.error(err);
      alert('❌ Could not unequip item');
    }
  };

  // ✅ Get AC modifiers (only from equipped items)
  const getACModifiers = (): Array<{ itemName: string; value: number; type: 'bonus' | 'penalty' | 'base' }> => {
    if (!character || !character.items) return [];
    const modifiers: Array<{ itemName: string; value: number; type: 'bonus' | 'penalty' | 'base' }> = [];

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
        }
      }
    }

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

  // ✅ Get Speed modifiers (only from equipped items)
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

  // ✅ Get Initiative modifiers (only from equipped items)
  const getInitiativeModifiers = (): Array<{ itemName: string; value: number; type: 'bonus' | 'penalty' | 'base' }> => {
    if (!character || !character.items) return [];
    const modifiers: Array<{ itemName: string; value: number; type: 'bonus' | 'penalty' | 'base' }> = [];

    if (character.abilityScores) {
      const dexMod = Math.floor((character.abilityScores.dex - 10) / 2);
      modifiers.push({
        itemName: 'DEX Modifier',
        value: Math.abs(dexMod),
        type: 'base',
      });
    }

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

  // ✅ Get Spell Save DC modifiers
  const getSpellDCModifiers = (): Array<{ itemName: string; value: number; type: 'bonus' | 'penalty' | 'base' }> => {
    if (!character || !character.abilityScores) return [];
    const modifiers: Array<{ itemName: string; value: number; type: 'bonus' | 'penalty' | 'base' }> = [];

    // Base: 8 + proficiency bonus
    const profBonus = Math.floor((character.level - 1) / 4) + 2;
    modifiers.push({
      itemName: 'Base (8 + Proficiency)',
      value: 8 + profBonus,
      type: 'base',
    });

    // Ability modifier
    if (spellcastingAbility && character.abilityScores) {
      const abilityScore = (character.abilityScores as any)[spellcastingAbility] || 10;
      const abilityMod = Math.floor((abilityScore - 10) / 2);
      if (abilityMod !== 0) {
        modifiers.push({
          itemName: `${spellcastingAbility.toUpperCase()} Modifier`,
          value: Math.abs(abilityMod),
          type: abilityMod >= 0 ? 'bonus' : 'penalty',
        });
      }
    }

    // Item modifiers (equipped and attuned)
    if (character.items) {
      for (const inv of character.items) {
        if (inv.is_equipped && (inv.is_attuned || !requiresAttunement(inv))) {
          const item = inv.item || inv;
          if (item.property_data?.spell_save_dc_modifier) {
            modifiers.push({
              itemName: item.name,
              value: Math.abs(item.property_data.spell_save_dc_modifier),
              type: item.property_data.spell_save_dc_modifier >= 0 ? 'bonus' : 'penalty',
            });
          }
        }
      }
    }

    return modifiers;
  };

  // ✅ Get Spell Attack Bonus modifiers
  const getSpellAttackModifiers = (): Array<{ itemName: string; value: number; type: 'bonus' | 'penalty' | 'base' }> => {
    if (!character || !character.abilityScores) return [];
    const modifiers: Array<{ itemName: string; value: number; type: 'bonus' | 'penalty' | 'base' }> = [];

    // Base: proficiency bonus
    const profBonus = Math.floor((character.level - 1) / 4) + 2;
    modifiers.push({
      itemName: 'Proficiency Bonus',
      value: profBonus,
      type: 'base',
    });

    // Ability modifier
    if (spellcastingAbility && character.abilityScores) {
      const abilityScore = (character.abilityScores as any)[spellcastingAbility] || 10;
      const abilityMod = Math.floor((abilityScore - 10) / 2);
      if (abilityMod !== 0) {
        modifiers.push({
          itemName: `${spellcastingAbility.toUpperCase()} Modifier`,
          value: Math.abs(abilityMod),
          type: abilityMod >= 0 ? 'bonus' : 'penalty',
        });
      }
    }

    // Item modifiers (equipped and attuned)
    if (character.items) {
      for (const inv of character.items) {
        if (inv.is_equipped && (inv.is_attuned || !requiresAttunement(inv))) {
          const item = inv.item || inv;
          if (item.property_data?.spell_attack_bonus_modifier) {
            modifiers.push({
              itemName: item.name,
              value: Math.abs(item.property_data.spell_attack_bonus_modifier),
              type: item.property_data.spell_attack_bonus_modifier >= 0 ? 'bonus' : 'penalty',
            });
          }
        }
      }
    }

    return modifiers;
  };

  // ✅ Get skill proficiencies from equipped items only
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

  // ✅ Get skill modifiers from equipped AND attuned items
  const getSkillModifiers = (): Array<{ skillName: string; modifier: number; itemName: string }> => {
    if (!character || !character.items) return [];
    const modifiers: Array<{ skillName: string; modifier: number; itemName: string }> = [];

    for (const inv of character.items) {
      // ✅ Only count modifiers from equipped AND attuned items
      if (inv.is_equipped && (inv.is_attuned || !requiresAttunement(inv))) {
        const item = inv.item || inv;
        if (item.property_data?.skill_modifiers && Array.isArray(item.property_data.skill_modifiers)) {
          for (const mod of item.property_data.skill_modifiers) {
            modifiers.push({
              skillName: mod.skill || mod.name,
              modifier: mod.modifier || mod.value || 0,
              itemName: item.name,
            });
          }
        }
      }
    }

    return modifiers;
  };

  // ✅ Get skill advantages from equipped AND attuned items
  const getSkillAdvantages = (): Array<{ skillName: string; itemName: string; description?: string }> => {
    if (!character || !character.items) return [];
    const advantages: Array<{ skillName: string; itemName: string; description?: string }> = [];

    for (const inv of character.items) {
      // ✅ Only count advantages from equipped AND attuned items
      if (inv.is_equipped && (inv.is_attuned || !requiresAttunement(inv))) {
        const item = inv.item || inv;
        if (item.property_data?.skill_advantages && Array.isArray(item.property_data.skill_advantages)) {
          for (const adv of item.property_data.skill_advantages) {
            advantages.push({
              skillName: adv.skill || adv.name,
              itemName: item.name,
              description: adv.description || adv.note,
            });
          }
        }
      }
    }

    return advantages;
  };

  // ✅ Get weapon proficiencies from equipped items only
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

  // ✅ Get tool proficiencies from equipped items only
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

  // ✅ Get languages from equipped AND attuned items only
  const getLanguages = (): Array<{ itemName: string; proficiency: string }> => {
    if (!character || !character.items) return [];
    const languages: Array<{ itemName: string; proficiency: string }> = [];

    for (const inv of character.items) {
      // ✅ Only count languages from equipped AND attuned items
      if (inv.is_equipped && (inv.is_attuned || !requiresAttunement(inv))) {
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

  // ✅ Get all traits (from character + species + equipped AND attuned items)
  const getAllTraits = (): Array<{ name: string; description: string; source: string }> => {
    const traits: Array<{ name: string; description: string; source: string }> = [];
    const traitNames = new Set<string>();

    if (character?.traits && Array.isArray(character.traits)) {
      for (const trait of character.traits) {
        if (!traitNames.has(trait.name)) {
          traits.push({
            name: trait.name,
            description: trait.description || 'No description available',
            source: trait.source || 'Character',
          });
          traitNames.add(trait.name);
        }
      }
    }

    if (character?.items) {
      for (const inv of character.items) {
        // ✅ Only count traits from equipped AND attuned items
        if (inv.is_equipped && (inv.is_attuned || !requiresAttunement(inv))) {
          const item = inv.item || inv;
          if (item.property_data?.traits && Array.isArray(item.property_data.traits)) {
            for (const trait of item.property_data.traits) {
              if (!traitNames.has(trait.name)) {
                traits.push({
                  name: trait.name,
                  description: trait.description || 'No description available',
                  source: item.name,
                });
                traitNames.add(trait.name);
              }
            }
          }
        }
      }
    }

    return traits;
  };

  // ✅ Toggle trait expansion
  const toggleTraitExpand = (traitName: string) => {
    setExpandedTrait(expandedTrait === traitName ? null : traitName);
  };

  // ✅ Toggle skill advantage expansion
  const toggleAdvantageExpand = (skillName: string) => {
    setExpandedAdvantage(expandedAdvantage === skillName ? null : skillName);
  };

  const [availableSpells, setAvailableSpells] = useState<any[]>([]);

  useEffect(() => {
    const loadSpells = async () => {
      try {
        const spells = await fetchAllSpells();
        setAvailableSpells(spells);
      } catch (err) {
        console.error('Failed to load spells:', err);
      }
    };
    loadSpells();
  }, []);

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

    variants.push({
      id: 'melee',
      name: 'Melee Attack',
      damageDice: weapon.damageDice || '1d4',
      damageType: weapon.damageType || 'bludgeoning'
    });

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

  // ✅ Get all proficiencies from character data (includes species, background, class)
  const getAllProficiencies = () => {
    const skills: string[] = [];
    const weapons: string[] = [];
    const tools: string[] = [];
    const languages: string[] = [];

    if (character?.proficientSkills && Array.isArray(character.proficientSkills)) {
      for (const skill of character.proficientSkills) {
        if (!skills.includes(skill)) {
          skills.push(skill);
        }
      }
    }
    if (character?.speciesSkills && Array.isArray(character.speciesSkills)) {
      for (const skill of character.speciesSkills) {
        if (!skills.includes(skill)) {
          skills.push(skill);
        }
      }
    }
    if (character?.backgroundSkills && Array.isArray(character.backgroundSkills)) {
      for (const skill of character.backgroundSkills) {
        if (!skills.includes(skill)) {
          skills.push(skill);
        }
      }
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

  // ✅ Helper for Finesse weapons
  const getBestAbilityForWeapon = (weapon: any) => {
    const properties = (weapon.properties || []).map((p: any) =>
      typeof p === 'string' ? p.toLowerCase() : (p.name || '').toLowerCase()
    );
    const hasFinesse = properties.some((p: string) => p.includes('finesse'));

    if (hasFinesse) {
      const strMod = getAbilityModifier(character?.abilityScores?.str || 10);
      const dexMod = getAbilityModifier(character?.abilityScores?.dex || 10);
      const bestMod = Math.max(strMod, dexMod);
      const bestAbility = strMod >= dexMod ? 'STR' : 'DEX';
      return { modifier: bestMod, ability: bestAbility };
    }

    const strMod = getAbilityModifier(character?.abilityScores?.str || 10);
    return { modifier: strMod, ability: 'STR' };
  };

  // ✅ FIXED: Get all displayed skills (character + item-granted + skill modifiers)
  const getAllDisplayedSkills = () => {
    const skillSet = new Set<string>();
    const skillSources: Record<string, string[]> = {};
    
    // Add character base proficient skills (from species, background, class)
    if (proficientSkills.length > 0) {
      for (const skill of proficientSkills) {
        skillSet.add(skill);
        if (!skillSources[skill]) skillSources[skill] = [];
        skillSources[skill].push('Character');
      }
    }
    
    // Add skill proficiencies from equipped items
    const itemSkillProficiencies = getSkillProficiencies();
    if (itemSkillProficiencies.length > 0) {
      for (const itemProf of itemSkillProficiencies) {
        skillSet.add(itemProf.proficiency);
        if (!skillSources[itemProf.proficiency]) skillSources[itemProf.proficiency] = [];
        if (!skillSources[itemProf.proficiency].includes(itemProf.itemName)) {
          skillSources[itemProf.proficiency].push(itemProf.itemName);
        }
      }
    }
    
    // ✅ ADD SKILLS FROM SKILL MODIFIERS (THIS WAS MISSING!)
    const itemSkillModifiers = getSkillModifiers();
    if (itemSkillModifiers.length > 0) {
      for (const mod of itemSkillModifiers) {
        skillSet.add(mod.skillName);
        if (!skillSources[mod.skillName]) skillSources[mod.skillName] = [];
        if (!skillSources[mod.skillName].includes(mod.itemName)) {
          skillSources[mod.skillName].push(mod.itemName);
        }
      }
    }
    
    return {
      skills: Array.from(skillSet),
      sources: skillSources
    };
  };

  const displayedSkills = getAllDisplayedSkills();

  // Get all traits for display
  const allTraits = getAllTraits();
  const attunedCount = getAttunedCount();
  const skillModifiers = getSkillModifiers();
  const skillAdvantages = getSkillAdvantages();

  // ✅ FIXED: Helper: Get ordinal suffix for spell levels (returns full ordinal like "1st")
  const getOrdinal = (n: number): string => {
    if (n === 0) return 'Cantrip';
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
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

      {/* ✅ COLLAPSIBLE: Species & Level Section */}
      <section className={styles.section}>
        <div 
          className={styles.sectionHeader}
          onClick={() => toggleSection('speciesLevel')}
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.sectionTitle}>
            <span className={`${styles.toggleIcon} ${collapsedSections.speciesLevel ? styles.collapsed : ''}`}>
              ▼
            </span>
            <h2>Species & Level</h2>
          </div>
          <span className={styles.collapseHint}>
            {collapsedSections.speciesLevel ? 'Show' : 'Hide'}
          </span>
        </div>
        
        <div className={`${styles.sectionContent} ${collapsedSections.speciesLevel ? styles.collapsed : ''}`}>
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

          {/* Proficiency Bonus */}
          <div>
            <strong>Proficiency Bonus:</strong> +{proficiencyBonus}
          </div>

          {/* ✅ NEW: Proficiency Display with Tabs */}
          <div>
            <strong>Proficiencies:</strong>
            
            {/* ✅ Tab Buttons */}
            <div className={styles.proficiencyTabs} style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              marginTop: '0.5rem',
              marginBottom: '1rem'
            }}>
              <button
                onClick={() => setActiveProficiencyTab('skills')}
                className={`${styles.tabButton} ${activeProficiencyTab === 'skills' ? styles.activeTab : ''}`}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: activeProficiencyTab === 'skills' ? '#4a90e2' : '#e0e0e0',
                  color: activeProficiencyTab === 'skills' ? 'white' : '#333',
                  fontWeight: activeProficiencyTab === 'skills' ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                Skills {displayedSkills.skills.length > 0 && `(${displayedSkills.skills.length})`}
              </button>
              <button
                onClick={() => setActiveProficiencyTab('weapons')}
                className={`${styles.tabButton} ${activeProficiencyTab === 'weapons' ? styles.activeTab : ''}`}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: activeProficiencyTab === 'weapons' ? '#4a90e2' : '#e0e0e0',
                  color: activeProficiencyTab === 'weapons' ? 'white' : '#333',
                  fontWeight: activeProficiencyTab === 'weapons' ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                Weapons {proficientWeapons.length > 0 && `(${proficientWeapons.length})`}
              </button>
              <button
                onClick={() => setActiveProficiencyTab('tools')}
                className={`${styles.tabButton} ${activeProficiencyTab === 'tools' ? styles.activeTab : ''}`}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: activeProficiencyTab === 'tools' ? '#4a90e2' : '#e0e0e0',
                  color: activeProficiencyTab === 'tools' ? 'white' : '#333',
                  fontWeight: activeProficiencyTab === 'tools' ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                Tools {proficientTools.length > 0 && `(${proficientTools.length})`}
              </button>
            </div>

            {/* ✅ Tab Content - Skills */}
            {activeProficiencyTab === 'skills' && displayedSkills.skills.length > 0 && (
              <div>
                <strong
                  style={{ cursor: 'pointer', color: '#4a90e2', textDecoration: 'underline' }}
                  onClick={() => setProficiencyModal({ isOpen: true, type: 'skills' })}
                  title="Click to see skill proficiency sources"
                >
                  Skills: {getSkillProficiencies().length > 0 && `(+${getSkillProficiencies().length} from items)`}
                  {skillModifiers.length > 0 && ` | Item Bonuses: ${skillModifiers.length}`}
                </strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {/* ✅ Filter to only show skills with proficiency OR item bonuses */}
                  {displayedSkills.skills
                    .map(skill => {
                      const ability = getSkillAbility(skill);
                      const finalScore = getFinalAbilityScore(ability);
                      const abilityMod = getAbilityModifier(finalScore);
                      const isProficient = proficientSkills.includes(skill);
                      const itemModifier = skillModifiers
                        .filter(mod => mod.skillName.toLowerCase() === skill.toLowerCase())
                        .reduce((sum, mod) => sum + mod.modifier, 0);
                      const totalMod = abilityMod + (isProficient ? proficiencyBonus : 0) + itemModifier;
                      const displayMod = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;
                      const hasItemBonus = itemModifier !== 0;
                      const hasAdvantage = skillAdvantages.some(adv => adv.skillName.toLowerCase() === skill.toLowerCase());
                      const isFromItems = displayedSkills.sources[skill]?.some(source => source !== 'Character');
                      const itemSources = displayedSkills.sources[skill]?.filter(source => source !== 'Character') || [];
                      return {
                        skill,
                        abilityMod,
                        isProficient,
                        itemModifier,
                        totalMod,
                        displayMod,
                        hasItemBonus,
                        hasAdvantage,
                        isFromItems,
                        itemSources
                      };
                    })
                    .filter(skillData =>
                      // ✅ Only show if proficient OR has item bonus OR has advantage
                      skillData.isProficient || skillData.hasItemBonus || skillData.hasAdvantage
                    )
                    .map(skillData => (
                      <div
                        key={skillData.skill}
                        className={`${styles.skillCard} ${skillData.hasItemBonus ? styles.skillCardWithBonus : ''} ${skillData.hasAdvantage ? styles.skillCardWithAdvantage : ''} ${skillData.isFromItems ? styles.skillCardFromItem : ''}`}
                        style={{
                          padding: '0.25rem',
                          backgroundColor: skillData.hasAdvantage ? '#fff3e0' : (skillData.hasItemBonus ? '#e8f5e9' : (skillData.isFromItems ? '#e3f2fd' : '#f0f0f0')),
                          borderRadius: '4px',
                          border: skillData.hasAdvantage ? '2px solid #ff9800' : (skillData.hasItemBonus ? '1px solid #4caf50' : (skillData.isFromItems ? '1px solid #2196f3' : 'none'))
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong>{skillData.skill}</strong>
                          <span>{skillData.displayMod}</span>
                        </div>
                        {skillData.hasItemBonus && (
                          <span className={styles.itemBonusBadge}>
                            +{skillData.itemModifier} {skillModifiers
                              .filter(mod => mod.skillName.toLowerCase() === skillData.skill.toLowerCase())
                              .map(mod => mod.itemName)
                              .join(', ')}
                          </span>
                        )}
                        {skillData.isFromItems && !skillData.hasItemBonus && (
                          <span className={styles.itemSourceBadge}>
                            📦 {skillData.itemSources.join(', ')}
                          </span>
                        )}
                        {skillData.hasAdvantage && <span className={styles.advantageBadge}>🎲 ADV</span>}
                      </div>
                    ))}
                </div>
                {getSkillProficiencies().length > 0 && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#e3f2fd', borderRadius: '4px', border: '1px solid #2196f3' }}>
                    <strong>📜 Item-Granted Proficiencies:</strong>
                    <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0 }}>
                      {getSkillProficiencies().map((prof, idx) => (
                        <li key={idx} style={{ fontSize: '0.9em', color: '#1565c0' }}>
                          {prof.proficiency} (from {prof.itemName})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Skill Advantages - Always visible */}
                {skillAdvantages.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: '#ff9800' }}>🎲 Skill Advantages:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {skillAdvantages.map((adv, idx) => (
                        <div
                          key={idx}
                          className={`${styles.advantageCard} ${expandedAdvantage === adv.skillName ? styles.advantageCardExpanded : ''}`}
                          onClick={() => toggleAdvantageExpand(adv.skillName)}
                          style={{
                            cursor: 'pointer',
                            padding: '0.5rem',
                            backgroundColor: '#fff3e0',
                            border: '2px solid #ff9800',
                            borderRadius: '4px',
                            flex: '1 1 200px',
                            maxWidth: '300px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ color: '#e65100' }}>{adv.skillName}</strong>
                            <span style={{ fontSize: '0.75em', color: '#ff9800' }}>
                              {expandedAdvantage === adv.skillName ? '▲' : '▼'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.85em', color: '#f57c00' }}>from {adv.itemName}</div>
                          {expandedAdvantage === adv.skillName && adv.description && (
                            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #ffcc80', fontSize: '0.85em', color: '#e65100' }}>
                              {adv.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>            
            )}

            {/* ✅ Tab Content - Weapons */}
            {activeProficiencyTab === 'weapons' && proficientWeapons.length > 0 && (
              <div>
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

            {/* ✅ Tab Content - Tools */}
            {activeProficiencyTab === 'tools' && proficientTools.length > 0 && (
              <div>
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

            {/* ✅ Show message if no proficiencies in active tab */}
            {((activeProficiencyTab === 'skills' && displayedSkills.skills.length === 0) ||
              (activeProficiencyTab === 'weapons' && proficientWeapons.length === 0) ||
              (activeProficiencyTab === 'tools' && proficientTools.length === 0)) && (
              <p style={{ color: '#666', marginTop: '0.5rem' }}>
                No {activeProficiencyTab} proficiencies yet.
              </p>
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

          {/* Attunement Slots Display */}
          <div className={styles.attunementDisplay}>
            <strong>Attunement Slots:</strong>
            <span className={attunedCount >= attunementSlotLimit ? styles.attunementFull : styles.attunementAvailable}>
              {attunedCount} / {attunementSlotLimit}
            </span>
            {attunedCount >= attunementSlotLimit && (
              <span className={styles.attunementWarning}> ⚠️ Max attuned items reached!</span>
            )}
          </div>
        </div>
      </section>

      {/* ✅ COLLAPSIBLE: Traits Section */}
      <section className={styles.section}>
        <div 
          className={styles.sectionHeader}
          onClick={() => toggleSection('traits')}
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.sectionTitle}>
            <span className={`${styles.toggleIcon} ${collapsedSections.traits ? styles.collapsed : ''}`}>
              ▼
            </span>
            <h2>Traits</h2>
          </div>
          <span className={styles.collapseHint}>
            {collapsedSections.traits ? 'Show' : 'Hide'}
          </span>
        </div>
        
        <div className={`${styles.sectionContent} ${collapsedSections.traits ? styles.collapsed : ''}`}>
          {allTraits.length > 0 ? (
            <div className={styles.traitsList}>
              {allTraits.map((trait, index) => (
                <div
                  key={index}
                  className={`${styles.traitCard} ${expandedTrait === trait.name ? styles.traitCardExpanded : ''}`}
                  onClick={() => toggleTraitExpand(trait.name)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.traitCardHeader}>
                    <span className={styles.traitName}>{trait.name}</span>
                    <span className={styles.traitSource}>{trait.source}</span>
                    <span className={styles.traitExpandIcon}>
                      {expandedTrait === trait.name ? '▲' : '▼'}
                    </span>
                  </div>
                  {expandedTrait === trait.name && (
                    <div className={styles.traitDescription}>
                      {trait.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyInventory}>No traits yet. Traits will appear from your species, background, class, or equipped items!</p>
          )}
        </div>
      </section>

      {/* ✅ COLLAPSIBLE: Spellcasting Section */}
      <section className={styles.section}>
        <div 
          className={styles.sectionHeader}
          onClick={() => toggleSection('spellcasting')}
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.sectionTitle}>
            <span className={`${styles.toggleIcon} ${collapsedSections.spellcasting ? styles.collapsed : ''}`}>
              ▼
            </span>
            <h2>Spellcasting</h2>
          </div>
          <span className={styles.collapseHint}>
            {collapsedSections.spellcasting ? 'Show' : 'Hide'}
          </span>
        </div>
        
        <div className={`${styles.sectionContent} ${collapsedSections.spellcasting ? styles.collapsed : ''}`}>
          {/* Spellcasting Stats */}
          {spellcasterLevel > 0 && (
            <div className={styles.spellcastingStats} style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
              gap: '0.5rem',
              marginBottom: '1rem',
              padding: '1rem',
              backgroundColor: '#f0f4f8',
              borderRadius: '8px'
            }}>
              <div className={`${styles.statBox} ${styles.clickable}`} 
                onClick={() => setStatModifiersModal({ isOpen: true, stat: 'SpellDC' })}
                title="Click to see how Spell Save DC is calculated" >
                <strong>Spell Save DC</strong>
                <span style={{ fontSize: '1.5em', color: '#4a90e2' }}>{spellSaveDC}</span>
              </div>
              <div className={`${styles.statBox} ${styles.clickable}`}
                onClick={() => setStatModifiersModal({ isOpen: true, stat: 'SpellAttack' })}
                title="Click to see how Spell Attack is calculated" >
                <strong>Spell Attack</strong>
                <span style={{ fontSize: '1.5em', color: '#4a90e2' }}>+{spellAttackBonus}</span>
              </div>
              <div className={styles.statBox}>
                <strong>Ability</strong>
                <span style={{ fontSize: '1.5em', color: '#4a90e2' }}>{spellcastingAbility.toUpperCase()}</span>
              </div>
              <div className={styles.statBox}>
                <strong>Caster Level</strong>
                <span style={{ fontSize: '1.5em', color: '#4a90e2' }}>{spellcasterLevel}</span>
              </div>
            </div>
          )}
          
          {/* Spell Slots */}
          {spellcasterLevel > 0 && (
            <div className={styles.spellSlots} style={{ marginBottom: '1rem' }}>
              <h3>Spell Slots</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {Object.entries(spellSlots).map(([level, total]) => {
                  const expended = spellSlotsExpended[level] || 0;
                  const remaining = total - expended;
                  return (
                    <div key={level} style={{ 
                      padding: '0.5rem', 
                      backgroundColor: '#fff',
                      border: '2px solid #4a90e2',
                      borderRadius: '8px',
                      textAlign: 'center',
                      minWidth: '80px'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                        {getOrdinal(parseInt(level))}
                      </div>
                      <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
                        {remaining}/{total}
                      </div>
                      <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', marginTop: '0.25rem' }}>
                        {Array.from({ length: total }).map((_, i) => (
                          <div
                            key={i}
                            onClick={() => expendSpellSlot(parseInt(level))}
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '2px',
                              backgroundColor: i < expended ? '#ccc' : '#4a90e2',
                              cursor: i < expended ? 'default' : 'pointer',
                              border: '1px solid #333'
                            }}
                            title={i < expended ? 'Expended' : 'Available'}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* ✅ Spell Manager - Known & Prepared Spells with Source Badges */}
          {characterSpells.length > 0 && (
            <SpellManager
              characterSpells={characterSpells}
              spellSlots={spellSlots}
              spellSaveDC={spellSaveDC}
              spellAttackBonus={spellAttackBonus}
              spellcastingAbility={spellcastingAbility}
              character={character}
              prepareLimit={spellPrepareLimit}
              preparedCount={spellPreparedCount}
              isPrepareUnlimited={spellPrepareUnlimited}
              onTogglePrepare={toggleSpellPrepared}
              onCastSpell={expendSpellSlot}
            />
          )}
          
          {/* Add Spell Button */}
          <button className={styles.primary} onClick={() => setIsSpellModalOpen(true)} style={{ marginTop: '1rem' }}>
            Add Spell
          </button>
          
          <SpellSelectionModal
            isOpen={isSpellModalOpen}
            onClose={() => setIsSpellModalOpen(false)}
            onAddSpell={addSpell}
            availableSpells={availableSpells}
            spellSaveDC={spellSaveDC}
            spellAttackBonus={spellAttackBonus}
          />
          
          {/* ✅ REMOVED: Spell Cast Modal is now handled by SpellManager component */}
        </div>
      </section>

      {/* ✅ COLLAPSIBLE: Inventory Section */}
      <section className={styles.section}>
        <div 
          className={styles.sectionHeader}
          onClick={() => toggleSection('inventory')}
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.sectionTitle}>
            <span className={`${styles.toggleIcon} ${collapsedSections.inventory ? styles.collapsed : ''}`}>
              ▼
            </span>
            <h2>Inventory</h2>
          </div>
          <span className={styles.collapseHint}>
            {collapsedSections.inventory ? 'Show' : 'Hide'}
          </span>
        </div>
        
        <div className={`${styles.sectionContent} ${collapsedSections.inventory ? styles.collapsed : ''}`}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <button
              className={styles.primary}
              onClick={() => setIsItemModalOpen(true)}
              disabled={itemsLoading}
            >
              {itemsLoading ? 'Loading Items...' : 'Add Item'}
            </button>
            {character.items && Array.isArray(character.items) && character.items.length > 0 && (
              <>
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
                  {isBulkDeleteMode ? 'Cancel Bulk Delete' : 'Delete Items'}
                </button>
                <button
                  className={showEquippedOnly ? styles.active : styles.secondary}
                  onClick={() => setShowEquippedOnly(!showEquippedOnly)}
                  title={showEquippedOnly ? 'Show all items' : 'Show only equipped items'}
                >
                  {showEquippedOnly ? 'Show All Items' : 'Equipped Only'}
                </button>
                <button
                  className={showAttunedOnly ? styles.active : styles.secondary}
                  onClick={() => setShowAttunedOnly(!showAttunedOnly)}
                  title={showAttunedOnly ? 'Show all items' : 'Show only attuned items'}
                >
                  {showAttunedOnly ? 'Show All Items' : 'Attuned Only'}
                </button>
              </>
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
              {character.items
                .filter((item: any) => {
                  if (showEquippedOnly) {
                    return item.is_equipped === true;
                  }
                  if (showAttunedOnly) {
                    return item.is_attuned === true;
                  }
                  return true;
                })
                .map((item: any) => {
                  const isSelected = selectedItemsForDelete.has(item.inventoryId);
                  const itemData = item.item || item;
                  const isEquippable = canEquip(item);
                  const isEquipped = item.is_equipped || false;
                  const needsAttunement = requiresAttunement(item);
                  const isAttuned = isItemAttuned(item);
                  
                  return (
                    <div
                      key={item.inventoryId}
                      className={`${styles.inventoryItem} ${isBulkDeleteMode && isSelected ? styles.selectedForDelete : ''} ${isEquipped ? styles.equippedItem : ''} ${isAttuned ? styles.attunedItem : ''}`}
                      onClick={() => {
                        if (isBulkDeleteMode) {
                          toggleItemSelection(item.inventoryId);
                        } else {
                          setSelectedItemForDetails(item);
                        }
                      }}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: isBulkDeleteMode && isSelected ? 'rgba(255, 100, 100, 0.2)' : (isAttuned ? 'rgba(155, 89, 182, 0.1)' : (isEquipped ? 'rgba(100, 255, 100, 0.1)' : 'transparent'))
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
                            {isEquipped && <span className={styles.equippedBadge}>Equipped</span>}
                            {isAttuned && <span className={styles.attunedBadge}>✨ Attuned</span>}
                            {needsAttunement && !isAttuned && <span className={styles.attunementBadge}>⚡ Requires Attunement</span>}
                          </span>
                          <div className={styles.inventoryItemQuickInfo}>
                            {item.item_type && <span className={styles.itemType}>{item.item_type}</span>}
                            
                            {/* ✅ EQUIP/UNEQUIP BUTTON for equippable items */}
                            {isEquippable && !isBulkDeleteMode && (
                              isEquipped ? (
                                <button
                                  className={styles.unequipButton}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    unequipItem(item.inventoryId, item.name);
                                  }}
                                  title="Unequip this item"
                                >
                                  🔓 Unequip
                                </button>
                              ) : (
                                <button
                                  className={styles.equipButton}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    equipItem(item.inventoryId, item.name, itemData);
                                  }}
                                  title="Equip this item"
                                >
                                  🔒 Equip
                                </button>
                              )
                            )}
                            
                            {/* ✅ ATTUNE/UNATTUNE BUTTONS for ALL items that require attunement */}
                            {needsAttunement && !isBulkDeleteMode && (
                              isAttuned ? (
                                <button
                                  className={styles.unattuneButton}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    unattuneItem(item.inventoryId, item.name);
                                  }}
                                  title="Unattune this item"
                                >
                                  ✨ Unattune
                                </button>
                              ) : (
                                <button
                                  className={`${styles.attuneButton} ${!canAttuneMore() ? styles.attuneButtonDisabled : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (canAttuneMore()) {
                                      attuneItem(item.inventoryId, item.name, itemData);
                                    } else {
                                      alert(`❌ Cannot attune: You already have ${attunedCount} attuned items (max: ${attunementSlotLimit}). Unattune an item first.`);
                                    }
                                  }}
                                  disabled={!canAttuneMore()}
                                  title={!canAttuneMore() ? 'Attunement slots full' : 'Attune this item for special abilities'}
                                >
                                  ⚡ Attune
                                </button>
                              )
                            )}
                            
                            {item.maxCharges && (
                              <span className={styles.chargesIndicator}>
                                Charges: {item.currentCharges}/{item.maxCharges}
                                {needsAttunement && !isAttuned && <span className={styles.lockedBadge}> 🔒</span>}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className={styles.emptyInventory}>No items yet. Add items to get started!</p>
          )}
          {showEquippedOnly && character.items?.filter((item: any) => item.is_equipped === true).length === 0 && (
            <p className={styles.emptyInventory}>No equipped items. Equip items to see them here!</p>
          )}
          {showAttunedOnly && character.items?.filter((item: any) => item.is_attuned === true).length === 0 && (
            <p className={styles.emptyInventory}>No attuned items. Attune items to see them here!</p>
          )}
        </div>
      </section>

      {/* ✅ COLLAPSIBLE: Combat Section */}
      <section className={styles.section}>
        <div 
          className={styles.sectionHeader}
          onClick={() => toggleSection('combat')}
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.sectionTitle}>
            <span className={`${styles.toggleIcon} ${collapsedSections.combat ? styles.collapsed : ''}`}>
              ▼
            </span>
            <h2>Combat</h2>
          </div>
          <span className={styles.collapseHint}>
            {collapsedSections.combat ? 'Show' : 'Hide'}
          </span>
        </div>
        
        <div className={`${styles.sectionContent} ${collapsedSections.combat ? styles.collapsed : ''}`}>
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
              title="Click to see AC modifiers (from equipped items only)"
            >
              <strong>AC:</strong>
              <span>{calculateAC()}</span>
            </div>
            <div
              className={`${styles.statBox} ${styles.clickable}`}
              onClick={() => setStatModifiersModal({ isOpen: true, stat: 'Initiative' })}
              title="Click to see Initiative modifiers (from equipped items only)"
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
              title="Click to see Speed modifiers (from equipped items only)"
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
                  <div className={styles.attackRowSpecial}>Special</div>
                </div>
                <div className={styles.attacksList}>
                  {character.items
                    .filter((item: any) => item.item_type === 'Weapon' || item.type === 'Weapon')
                    .map((weapon: any, index: number) => {
                      const bestAbility = getBestAbilityForWeapon(weapon);
                      const attackBonus = bestAbility.modifier + proficiencyBonus;
                      const damageDice = weapon.damageDice || '1d4';
                      const damageType = weapon.damageType || 'bludgeoning';
                      const isAttuned = isItemAttuned(weapon);
                      const needsAttunement = requiresAttunement(weapon);
                      const hasChargeAbilities = weapon.maxCharges && weapon.onHitEffect;
                      
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
                                abilityModifier: bestAbility.modifier,
                                isAttuned,
                                needsAttunement
                              });
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className={styles.attackRowName}>{weapon.name}</div>
                          <div className={styles.attackRowBonus}>+{attackBonus}</div>
                          <div className={styles.attackRowDamage}>{damageDice}</div>
                          <div className={styles.attackRowType}>{damageType}</div>
                          <div className={styles.attackRowSpecial}>
                            {needsAttunement && (
                              <span className={isAttuned ? styles.specialAvailable : styles.specialLocked}>
                                {isAttuned ? '⚡ Ready' : '🔒 Attune'}
                              </span>
                            )}
                            {hasChargeAbilities && !needsAttunement && (
                              <span className={styles.specialAvailable}>⚡ Charge</span>
                            )}
                          </div>
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
                
                {/* ✅ Show attunement warning if weapon requires attunement but not attuned */}
                {attackModalData.needsAttunement && !attackModalData.isAttuned && (
                  <div className={styles.attunementWarningBox}>
                    ⚠️ This weapon requires attunement to use special abilities. Current: {attunedCount}/{attunementSlotLimit} attuned.
                  </div>
                )}
                
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
                    {attackModalData.needsAttunement && !attackModalData.isAttuned && (
                      <p className={styles.lockedNote}>🔒 Requires attunement to use</p>
                    )}
                  </div>
                )}
                
                {attackModalData.weapon.maxCharges && attackModalData.weapon.currentCharges > 0 && (
                  <div className={styles.chargesExpendPrompt}>
                    <label>
                      <input
                        type="checkbox"
                        checked={expendCharge}
                        onChange={(e) => setExpendCharge(e.target.checked)}
                        disabled={attackModalData.needsAttunement && !attackModalData.isAttuned}
                      />
                      Expend 1 charge? ({attackModalData.weapon.currentCharges} remaining)
                      {attackModalData.needsAttunement && !attackModalData.isAttuned && (
                        <span className={styles.lockedNote}> 🔒 Attune to use charges</span>
                      )}
                    </label>
                  </div>
                )}
                
                <div className={styles.attackModalButtons}>
                  <button
                    className={styles.confirmBtn}
                    onClick={() => {
                      if (expendCharge && attackModalData.weapon.currentCharges > 0) {
                        if (attackModalData.needsAttunement && !attackModalData.isAttuned) {
                          alert('❌ Must attune to this weapon first to expend charges!');
                          return;
                        }
                        updateItemCharges(attackModalData.weapon.inventoryId, attackModalData.weapon.currentCharges - 1);
                      }
                      setAttackModalData(null);
                      setExpendCharge(false);
                    }}
                  >
                    OK, Ready to Roll!
                  </button>
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
                          abilityModifier: bestAbility.modifier,
                          isAttuned: isItemAttuned(weaponToVariantSelect),
                          needsAttunement: requiresAttunement(weaponToVariantSelect)
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

                  {selectedAttackForModal.onHitEffect && (
                    <div className={styles.onHitSection}>
                      <h3>On-Hit Effect</h3>
                      <p>{selectedAttackForModal.onHitEffect}</p>
                      {selectedAttackData.needsAttunement && !selectedAttackData.isAttuned && (
                        <p className={styles.lockedNote}>🔒 Requires attunement to use this effect</p>
                      )}
                    </div>
                  )}

                  {selectedAttackForModal.maxCharges && (
                    <div className={styles.chargesInfoSection}>
                      <h3>Charges</h3>
                      <div className={styles.chargesInfo}>
                        <span><strong>Current</strong> {selectedAttackForModal.currentCharges} / {selectedAttackForModal.maxCharges}</span>
                        {selectedAttackForModal.chargeRecharge && (
                          <span><strong>Recharge</strong> {selectedAttackForModal.chargeRecharge}</span>
                        )}
                        {selectedAttackData.needsAttunement && !selectedAttackData.isAttuned && (
                          <span className={styles.lockedNote}>🔒 Attune to expend charges</span>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedAttackForModal.specialAbilities && selectedAttackForModal.specialAbilities.length > 0 && (
                    <div className={styles.abilitiesSection}>
                      <h3>Special Abilities</h3>
                      <ul className={styles.abilitiesList}>
                        {selectedAttackForModal.specialAbilities.map((ability: string, idx: number) => (
                          <li key={idx} className={selectedAttackData.needsAttunement && !selectedAttackData.isAttuned ? styles.abilityLocked : ''}>
                            {ability}
                            {selectedAttackData.needsAttunement && !selectedAttackData.isAttuned && (
                              <span className={styles.lockedBadge}> 🔒</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

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
        </div>
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
            equipItem(selectedItemForDetails.inventoryId, selectedItemForDetails.name, selectedItemForDetails.item || selectedItemForDetails);
          }
        }}
        onUnequip={() => {
          if (selectedItemForDetails) {
            unequipItem(selectedItemForDetails.inventoryId, selectedItemForDetails.name);
          }
        }}
        onAttune={() => {
          if (selectedItemForDetails && canAttuneMore()) {
            attuneItem(selectedItemForDetails.inventoryId, selectedItemForDetails.name, selectedItemForDetails.item || selectedItemForDetails);
          }
        }}
        onUnattune={() => {
          if (selectedItemForDetails) {
            unattuneItem(selectedItemForDetails.inventoryId, selectedItemForDetails.name);
          }
        }}
        canEquip={canEquip(selectedItemForDetails?.item || selectedItemForDetails)}
        isEquipped={selectedItemForDetails?.is_equipped || false}
        requiresAttunement={requiresAttunement(selectedItemForDetails?.item || selectedItemForDetails)}
        isAttuned={isItemAttuned(selectedItemForDetails?.item || selectedItemForDetails)}
        canAttuneMore={canAttuneMore()}
        attunedCount={attunedCount}
        attunementLimit={attunementSlotLimit}
      />

      {/* Spell Details Modal */}
      <SpellDetailsModal
        isOpen={isSpellDetailsModalOpen}
        onClose={() => setIsSpellDetailsModalOpen(false)}
        spell={selectedSpellForDetails}
        spellSaveDC={spellSaveDC}
        spellAttackBonus={spellAttackBonus}
      />

      {/* Stat Modifiers Modal */}
      {character && (
        <StatModifiersModal
          isOpen={statModifiersModal.isOpen}
          onClose={() => setStatModifiersModal({ ...statModifiersModal, isOpen: false })}
          statName={
            statModifiersModal.stat === 'SpellDC'
              ? 'Spell Save DC'
              : statModifiersModal.stat === 'SpellAttack'
                ? 'Spell Attack Bonus'
                : statModifiersModal.stat
          }
          currentValue={
            statModifiersModal.stat === 'AC'
              ? calculateAC()
              : statModifiersModal.stat === 'Initiative'
                ? getAbilityModifier(character.abilityScores?.dex || 10)
                : statModifiersModal.stat === 'Speed'
                  ? character.speed || 30
                  : statModifiersModal.stat === 'SpellDC'
                    ? spellSaveDC
                    : statModifiersModal.stat === 'SpellAttack'
                      ? spellAttackBonus
                      : 0
          }
          modifiers={
            statModifiersModal.stat === 'AC'
              ? getACModifiers()
              : statModifiersModal.stat === 'Initiative'
                ? getInitiativeModifiers()
                : statModifiersModal.stat === 'Speed'
                  ? getSpeedModifiers()
                  : statModifiersModal.stat === 'SpellDC'
                    ? getSpellDCModifiers()
                    : statModifiersModal.stat === 'SpellAttack'
                      ? getSpellAttackModifiers()
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