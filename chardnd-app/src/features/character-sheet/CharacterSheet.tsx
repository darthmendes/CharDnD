// src/features/character-sheet/CharacterSheet.tsx
/**
 * CharacterSheet - Orchestrator Component
 * Manages state and coordinates between specialized character display sections.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  useCharacterData,
  useInventory,
  useCollapsibleSections,
  useCharacterCalculations,
} from './hooks';
import {
  fetchItems,
  addItemToCharacter,
  deleteInventoryItem as apiDeleteInventoryItem,
  removeOneItem as apiRemoveOneItem,
  updateItemCharges as apiUpdateItemCharges,
  equipItem as apiEquipItem,
  unequipItem as apiUnequipItem,
  attuneItem as apiAttuneItem,
  unattuneItem as apiUnattuneItem,
  addSpellToCharacter,
  toggleSpellPrepared as apiToggleSpellPrepared,
  fetchAllSpells,
  expendSpellSlot as apiExpendSpellSlot,
} from '../../services/api';

// Components
import CharacterSpeciesLevel from './components/CharacterSpeciesLevel';
import CharacterTraits from './components/CharacterTraits';
import CharacterSpellcasting from './components/CharacterSpellcasting';
import CharacterInventory from './components/CharacterInventory';
import CharacterCombat from './components/CharacterCombat';
import CharacterClassResources from './components/CharacterClassResources';
import ProficiencyModal from './components/ProficiencyModal/ProficiencyModal';
import StatModifiersModal from './components/StatModifiersModal/StatModifiersModal';

import styles from './CharacterDisplay.module.css';

const CharacterDisplay = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const characterId = id || '';

  // Core data from hook
  const { 
    character, 
    loading, 
    error, 
    refetch,
    updateField,
    characterSpells, 
    spellSlots, 
    prepareLimit 
  } = useCharacterData(characterId);

  // Collapsible sections
  const { collapsedSections, toggleSection } = useCollapsibleSections();

  // Ability scores
  const [localAbilityScores, setLocalAbilityScores] = useState<Record<string, number> | null>(null);
  const [savingAbilityScores, setSavingAbilityScores] = useState(false);

  // Inventory management
  const {
    showEquippedOnly,
    setShowEquippedOnly,
    showAttunedOnly,
    setShowAttunedOnly,
    isBulkDeleteMode,
    setIsBulkDeleteMode,
    selectedItemsForDelete,
    toggleItemForDelete,
    clearSelectedItems,
  } = useInventory();

  // Items and spells
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [availableSpells, setAvailableSpells] = useState<any[]>([]);

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isSpellModalOpen, setIsSpellModalOpen] = useState(false);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<any | null>(null);
  const [proficiencyModal, setProficiencyModal] = useState<{ isOpen: boolean; type: string }>({ isOpen: false, type: 'skills' });
  const [activeProficiencyTab, setActiveProficiencyTab] = useState<string>('skills');
  const [spellStatModifiersModal, setSpellStatModifiersModal] = useState<{ isOpen: boolean; stat: string }>({ isOpen: false, stat: '' });

  // Calculations
  const calculations = useCharacterCalculations(character, character?.level || 1, localAbilityScores);

  // Transform spell slots for component
  const transformedSpellSlots: Record<string, number> = {};
  const transformedSpellSlotsExpended: Record<string, number> = {};
  if (spellSlots) {
    for (const [key, value] of Object.entries(spellSlots)) {
      if (typeof value === 'object' && value !== null && 'total' in value) {
        transformedSpellSlots[key] = (value as any).total;
        transformedSpellSlotsExpended[key] = (value as any).expended;
      }
    }
  }

  // Determine spellcasting ability and calculate spell DC/attack
  const spellcastingAbility = character?.classes?.find(c => 
    ['Wizard', 'Sorcerer', 'Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Artificer', 'Warlock'].includes(c.className)
  )?.className;
  
  const abilityForSpells = spellcastingAbility === 'Wizard' ? 'int' 
    : spellcastingAbility === 'Sorcerer' ? 'cha'
    : spellcastingAbility === 'Bard' ? 'cha'
    : spellcastingAbility === 'Cleric' ? 'wis'
    : spellcastingAbility === 'Druid' ? 'wis'
    : spellcastingAbility === 'Paladin' ? 'cha'
    : spellcastingAbility === 'Ranger' ? 'wis'
    : spellcastingAbility === 'Artificer' ? 'int'
    : spellcastingAbility === 'Warlock' ? 'cha'
    : 'int';

  const spellcasterLevel = character?.classes?.reduce((max, c) => {
    if (['Wizard', 'Sorcerer', 'Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Artificer', 'Warlock'].includes(c.className)) {
      return Math.max(max, c.level);
    }
    return max;
  }, 0) || 0;

  const calcSpellDC = (): number => {
    if (!localAbilityScores || !spellcastingAbility) return 10;
    const abilityScore = localAbilityScores[abilityForSpells] || 10;
    const abilityMod = Math.floor((abilityScore - 10) / 2);
    return 8 + calculations.proficiencyBonus + abilityMod;
  };

  const calcSpellAttackBonus = (): number => {
    if (!localAbilityScores || !spellcastingAbility) return 0;
    const abilityScore = localAbilityScores[abilityForSpells] || 10;
    const abilityMod = Math.floor((abilityScore - 10) / 2);
    return calculations.proficiencyBonus + abilityMod;
  };

  // Get spell DC modifiers breakdown
  const getSpellDCModifiers = () => {
    const modifiers: any[] = [];
    if (!localAbilityScores) return modifiers;
    
    const abilityScore = localAbilityScores[abilityForSpells] || 10;
    const abilityMod = Math.floor((abilityScore - 10) / 2);
    const abilityName = abilityForSpells.toUpperCase();
    
    modifiers.push({ itemName: 'Base', value: 8, type: 'base' });
    modifiers.push({ itemName: `Proficiency Bonus`, value: calculations.proficiencyBonus, type: 'bonus' });
    if (abilityMod !== 0) {
      modifiers.push({ itemName: `${abilityName} Modifier`, value: abilityMod, type: abilityMod >= 0 ? 'bonus' : 'penalty' });
    }
    
    return modifiers;
  };

  // Get spell attack bonus modifiers breakdown
  const getSpellAttackModifiers = () => {
    const modifiers: any[] = [];
    if (!localAbilityScores) return modifiers;
    
    const abilityScore = localAbilityScores[abilityForSpells] || 10;
    const abilityMod = Math.floor((abilityScore - 10) / 2);
    const abilityName = abilityForSpells.toUpperCase();
    
    modifiers.push({ itemName: `Proficiency Bonus`, value: calculations.proficiencyBonus, type: 'bonus' });
    if (abilityMod !== 0) {
      modifiers.push({ itemName: `${abilityName} Modifier`, value: abilityMod, type: abilityMod >= 0 ? 'bonus' : 'penalty' });
    }
    
    return modifiers;
  };

  // Load ability scores on character change
  useEffect(() => {
    if (character) {
      setLocalAbilityScores(character.abilityScores || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });
    }
  }, [character?.id]);

  // Load items
  useEffect(() => {
    const load = async () => {
      try {
        setAvailableItems(await fetchItems());
      } catch (e) {
        console.error(e);
        setAvailableItems([]);
      } finally {
        setItemsLoading(false);
      }
    };
    load();
  }, []);

  // Load available spells
  useEffect(() => {
    fetchAllSpells()
      .then((s) => setAvailableSpells(s))
      .catch(() => setAvailableSpells([]));
  }, []);

  // Utility functions
  const saveAbilityScores = useCallback(async () => {
    if (!characterId || !localAbilityScores || savingAbilityScores) return;
    setSavingAbilityScores(true);
    try {
      const scores = localAbilityScores as { str: number; dex: number; con: number; int: number; wis: number; cha: number; };
      await updateField('abilityScores', scores);
      alert("Saved!");
    } catch (e: any) {
      alert("Failed: " + e.message);
    } finally {
      setSavingAbilityScores(false);
    }
  }, [characterId, localAbilityScores, savingAbilityScores, updateField]);

  const addItem = useCallback(
    async (item: any, qty = 1) => {
      try {
        await addItemToCharacter(parseInt(characterId), item.id, qty);
        await refetch();
        alert(`Added ${qty} × ${item.name}`);
      } catch (e: any) {
        alert("Could not add");
      }
    },
    [characterId, refetch]
  );

  const addSpell = useCallback(
    async (spell: any) => {
      try {
        if (!spell.id) return alert("No ID");
        await addSpellToCharacter(parseInt(characterId), spell.id);
        setIsSpellModalOpen(false);
        await refetch();
      } catch (e: any) {
        alert("Could not add spell: " + e.message);
      }
    },
    [characterId, refetch]
  );

  const requiresAttunement = (item: any): boolean => {
    if (!item) return false;
    const d = item.item || item;
    return d.requires_attunement || d.property_data?.requires_attunement || (d.rarity && ["Rare", "Very Rare", "Legendary", "Artifact"].includes(d.rarity));
  };

  const isItemAttuned = (item: any): boolean => item?.is_attuned === true;

  const canEquip = (item: any): boolean => {
    if (!item) return false;
    const d = item.item || item;
    const t = d.item_type || d.type || "";
    const c = d.item_category || "";
    return t === "Wondrous Item" || t === "Ring" || c.includes("Ring") || t === "Armor" || (t === "Armor" && c.includes("Shield"));
  };

  const getAttunedCount = (): number => character?.items?.filter((i: any) => i.is_attuned)?.length || 0;

  const canAttuneMore = (): boolean => {
    const limit = 4 + (character?.attunementSlotBonus || 0);
    return getAttunedCount() < limit;
  };

  const equipItem = useCallback(
    async (invId: number, name: string) => {
      try {
        await apiEquipItem(parseInt(characterId), invId);
        await refetch();
        setSelectedItemForDetails(null);
        alert(`${name} equipped!`);
      } catch {
        alert("Could not equip");
      }
    },
    [characterId, refetch]
  );

  const unequipItem = useCallback(
    async (invId: number, name: string) => {
      try {
        await apiUnequipItem(parseInt(characterId), invId);
        await refetch();
        setSelectedItemForDetails(null);
        alert(`${name} unequipped!`);
      } catch {
        alert("Could not unequip");
      }
    },
    [characterId, refetch]
  );

  const attuneItem = useCallback(
    async (invId: number, name: string) => {
      const c = getAttunedCount();
      const limit = 4 + (character?.attunementSlotBonus || 0);
      if (c >= limit) return alert(`Max attuned: ${c}/${limit}`);
      try {
        await apiAttuneItem(parseInt(characterId), invId);
        await refetch();
        alert(`${name} attuned!`);
      } catch (e: any) {
        alert("Could not attune");
      }
    },
    [characterId, character?.attunementSlotBonus, refetch]
  );

  const unattuneItem = useCallback(
    async (invId: number, name: string) => {
      try {
        await apiUnattuneItem(parseInt(characterId), invId);
        await refetch();
        alert(`${name} unattuned!`);
      } catch {
        alert("Could not unattune");
      }
    },
    [characterId, refetch]
  );

  const deleteInventoryItem = useCallback(
    async (invId: number, name: string) => {
      if (!window.confirm(`Delete ${name}?`)) return;
      try {
        await apiDeleteInventoryItem(parseInt(characterId), invId);
        await refetch();
      } catch {
        alert("Could not delete");
      }
    },
    [characterId, refetch]
  );

  const removeOneItem = useCallback(
    async (invId: number, name: string, qty: number) => {
      try {
        await apiRemoveOneItem(parseInt(characterId), invId);
        await refetch();
        alert(qty > 1 ? `Removed 1 × ${name}` : `Deleted last × ${name}`);
      } catch {
        alert("Could not remove");
      }
    },
    [characterId, refetch]
  );

  const updateItemCharges = useCallback(
    async (invId: number, charges: number) => {
      try {
        await apiUpdateItemCharges(parseInt(characterId), invId, charges);
        await refetch();
      } catch {
        alert("Could not update");
      }
    },
    [characterId, refetch]
  );

  const toggleSpellPrepared = useCallback(
    async (spellId: number) => {
      try {
        await apiToggleSpellPrepared(parseInt(characterId), spellId);
        await refetch();
      } catch (e) {
        console.error(e);
      }
    },
    [characterId, refetch]
  );

  const expendSpellSlot = useCallback(
    async (level: number) => {
      try {
        await apiExpendSpellSlot(parseInt(characterId), level, 1);
        await refetch();
      } catch (e) {
        console.error(e);
      }
    },
    [characterId, refetch]
  );

  const bulkDeleteItems = useCallback(
    async () => {
      if (selectedItemsForDelete.size === 0) return alert("Select items");
      if (!window.confirm(`Delete ${selectedItemsForDelete.size} items?`)) return;
      try {
        for (const invId of selectedItemsForDelete) {
          await apiDeleteInventoryItem(parseInt(characterId), invId);
        }
        await refetch();
        setIsBulkDeleteMode(false);
        clearSelectedItems();
      } catch {
        alert("Could not delete");
      }
    },
    [selectedItemsForDelete, characterId, refetch, setIsBulkDeleteMode, clearSelectedItems]
  );

  const getAllTraits = (): any[] => {
    const traits: any[] = [];
    const seen = new Set<string>();

    // Add character traits
    if (character?.traits) {
      for (const tr of character.traits) {
        if (!seen.has(tr.name)) {
          traits.push({ 
            name: tr.name, 
            description: tr.description || '', 
            source: tr.source || "Character" 
          });
          seen.add(tr.name);
        }
      }
    }

    // Add traits from equipped items
    if (character?.items) {
      for (const inv of character.items) {
        if (inv.is_equipped && (inv.is_attuned || !requiresAttunement(inv))) {
          const i = inv.item || inv;
          if (i.property_data?.traits) {
            for (const tr of i.property_data.traits) {
              if (!seen.has(tr.name)) {
                traits.push({ 
                  name: tr.name, 
                  description: tr.description || '', 
                  source: i.name 
                });
                seen.add(tr.name);
              }
            }
          }
        }
      }
    }

    return traits;
  };

  // URL parameter handling for new items
  useEffect(() => {
    const p = new URLSearchParams(location.search).get("newItem");
    if (p) {
      try {
        addItem(JSON.parse(p));
        navigate(`/characters/${characterId}`, { replace: true });
      } catch {}
    }
  }, [location.search, addItem, characterId, navigate]);

  const goToMain = () => navigate("/");
  const goToItemCreator = () => navigate("/items/creator");

  if (loading) return <p className={styles.loading}>Loading character...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!character || !localAbilityScores) return <p className={styles.error}>Character not found or missing ability scores.</p>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={goToMain} className={styles.button}>
          Home
        </button>
        <button onClick={goToItemCreator} className={styles.button}>
          Item Creator
        </button>
      </header>

      <h1>{character.name}</h1>

      <CharacterSpeciesLevel
        character={character}
        localAbilityScores={localAbilityScores}
        onAbilityScoresChange={setLocalAbilityScores}
        onAbilityScoresSave={saveAbilityScores}
        attunedCount={getAttunedCount()}
        attunementSlotLimit={4 + (character.attunementSlotBonus || 0)}
        proficiencyBonus={calculations.proficiencyBonus}
        displayedSkills={{ skills: [], sources: {} }}
        skillModifiers={[]}
        skillAdvantages={[]}
        knownLanguages={character.knownLanguages || []}
        proficientSkills={character.proficientSkills || []}
        proficientWeapons={character.proficientWeapons || []}
        proficientTools={character.proficientTools || []}
        proficiencyModal={proficiencyModal}
        onProficiencyModalOpen={(type) => setProficiencyModal({ isOpen: true, type })}
        onProficiencyModalClose={() => setProficiencyModal({ isOpen: false, type: "" })}
        activeProficiencyTab={activeProficiencyTab}
        onActiveProficiencyTabChange={setActiveProficiencyTab}
        expanded={!collapsedSections.speciesLevel}
        onToggle={() => toggleSection("speciesLevel")}
      />

      <CharacterTraits traits={getAllTraits()} expanded={!collapsedSections.traits} onToggle={() => toggleSection("traits")} />

      <CharacterSpellcasting
        character={character}
        spellcasterLevel={spellcasterLevel}
        spellcastingAbility={abilityForSpells}
        spellSaveDC={calcSpellDC()}
        spellAttackBonus={calcSpellAttackBonus()}
        spellSlots={transformedSpellSlots}
        spellSlotsExpended={transformedSpellSlotsExpended}
        characterSpells={characterSpells}
        spellPrepareLimit={prepareLimit?.limit || null}
        spellPreparedCount={prepareLimit?.prepared || 0}
        spellPrepareUnlimited={prepareLimit?.unlimited || false}
        availableSpells={availableSpells}
        isSpellModalOpen={isSpellModalOpen}
        onSpellModalOpen={() => setIsSpellModalOpen(true)}
        onSpellModalClose={() => setIsSpellModalOpen(false)}
        onAddSpell={addSpell}
        onTogglePreparedSpell={toggleSpellPrepared}
        onExpendSpellSlot={expendSpellSlot}
        onStatModifiersModalOpen={(stat: string) => setSpellStatModifiersModal({ isOpen: true, stat })}
        expanded={!collapsedSections.spellcasting}
        onToggle={() => toggleSection("spellcasting")}
      />

      <CharacterInventory
        character={character}
        characterId={characterId}
        isItemModalOpen={isItemModalOpen}
        onItemModalOpen={() => setIsItemModalOpen(true)}
        onItemModalClose={() => setIsItemModalOpen(false)}
        availableItems={availableItems}
        itemsLoading={itemsLoading}
        showEquippedOnly={showEquippedOnly}
        onShowEquippedOnlyChange={setShowEquippedOnly}
        showAttunedOnly={showAttunedOnly}
        onShowAttunedOnlyChange={setShowAttunedOnly}
        isBulkDeleteMode={isBulkDeleteMode}
        selectedItemsForDelete={selectedItemsForDelete}
        onBulkDeleteModeToggle={() => setIsBulkDeleteMode(!isBulkDeleteMode)}
        onItemSelectForDelete={toggleItemForDelete}
        onBulkDelete={bulkDeleteItems}
        onAddItem={addItem}
        onDeleteItem={deleteInventoryItem}
        onRemoveOne={removeOneItem}
        onAddMore={addItem}
        onUpdateCharges={updateItemCharges}
        onEquipItem={equipItem}
        onUnequipItem={unequipItem}
        onAttuneItem={attuneItem}
        onUnattuneItem={unattuneItem}
        selectedItemForDetails={selectedItemForDetails}
        onSelectItemForDetails={setSelectedItemForDetails}
        attunedCount={getAttunedCount()}
        attunementSlotLimit={4 + (character.attunementSlotBonus || 0)}
        requiresAttunement={requiresAttunement}
        isItemAttuned={isItemAttuned}
        canEquip={canEquip}
        canAttuneMore={canAttuneMore}
        expanded={!collapsedSections.inventory}
        onToggle={() => toggleSection("inventory")}
      />

      <CharacterCombat
        character={character}
        localLevel={character.level || 1}
        localAbilityScores={localAbilityScores}
        expanded={!collapsedSections.combat}
        onToggle={() => toggleSection("combat")}
        onAttackClick={() => {}}
      />

      <CharacterClassResources
        character={character}
        characterId={characterId}
        expanded={!collapsedSections.classResources}
        onToggle={() => toggleSection("classResources")}
      />

      <ProficiencyModal
        isOpen={proficiencyModal.isOpen}
        onClose={() => setProficiencyModal({ ...proficiencyModal, isOpen: false })}
        modalType={proficiencyModal.type as any}
        proficiencies={[]}
      />
      
      <StatModifiersModal
        isOpen={spellStatModifiersModal.isOpen}
        onClose={() => setSpellStatModifiersModal({ isOpen: false, stat: '' })}
        statName={spellStatModifiersModal.stat === 'SpellDC' ? 'Spell Save DC' : 'Spell Attack'}
        currentValue={
          spellStatModifiersModal.stat === 'SpellDC' 
            ? calcSpellDC() 
            : calcSpellAttackBonus()
        }
        modifiers={
          spellStatModifiersModal.stat === 'SpellDC' 
            ? getSpellDCModifiers() 
            : getSpellAttackModifiers()
        }
      />
    </div>
  );
};

export default CharacterDisplay;
