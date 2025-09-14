// CharacterDisplay.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Character } from '../../types/Character';
import AbsScores from './components/AbilityScores/AbsScores'; // Adjust path if needed
import ClassList from './components/ClassList/ClassList';
import ProficiencyList from './components/ProficiencyList/ProficiencyList';
import styles from './CharacterSheet.module.css';
import ItemModal from './components/ItemModal/ItemModal';
import SpellModal from './components/SpellModal/SpellModal';


const CharacterDisplay = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [character, setCharacter] = useState<Character | null>(null);
  const [localAbilityScores, setLocalAbilityScores] = useState<{ [key: string]: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false); // for item menu pop up
  const [IsSpellModalOpen, setIsSpellModalOpen] = useState(false); // for spell menu pop up

  // Navigation
  const goToMain = () => navigate('/');
  const goToItemCreator = () => navigate('/items/creator');

  // Fetch character data
  useEffect(() => {
    const fetchCharacter = async () => {
      if (!id) return;
      try {
        const response = await fetch(`http://127.0.0.1:8001/API/characters/${id}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: Character = await response.json();
        setCharacter(data);
        setLocalAbilityScores(data.abilityScores); // Initialize local copy
      } catch (err: any) {
        setError(err.message || 'Failed to load character');
      } finally {
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [id]);

  // Handle ability score changes
  const handleScoreChange = (newScores: { [key: string]: number }) => {
    setLocalAbilityScores(newScores);
  };

  // Save updated ability scores to backend
  const saveScores = async () => {
    if (!id || !localAbilityScores || saving) return;
    setSaving(true);
    try {
      const response = await fetch(`http://127.0.0.1:8001/API/characters/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          abilityScores: localAbilityScores,
        }),
      });

      if (!response.ok) throw new Error('Save failed');

      const updatedCharacter: Character = await response.json();
      setCharacter(updatedCharacter); // Update full character if needed
      alert('✅ Ability scores saved!');
    } catch (err: any) {
      console.error(err);
      alert('❌ Failed to save scores: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Function to add items to character
  const addItem = async (item: { name: string }) => {
    try {
      const response = await fetch(`http://127.0.0.1:8001/API/characters/${id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) throw new Error('Failed to add item');

      const updatedCharacter: Character = await response.json();
      setCharacter(updatedCharacter); // Update inventory
      setIsItemModalOpen(false); // Close modal
      alert(`✅ Added ${item.name} to inventory`);
    } catch (err: any) {
      console.error(err);
      alert('❌ Could not add item');
    }
  };
  // Mock data — replace with API call later
  const availableItems = [
    { name: "Longsword", type: "Weapon" },
    { name: "Spellbook", type: "Container" },
    { name: "Leather Armor", type: "Armor" },
    { name: "Ring of Protection", type: "Magic Ring" },
    { name: "Potion of Healing", type: "Consumable" },
    { name: "Dagger", type: "Weapon" },
    { name: "Backpack", type: "Container" },
    { name: "Wand of Fireballs", type: "Magic Staff" },
  ];
  
  // Function to add spells to character
  const addSpell = async (spell: { name: string }) => {
    try {
      const response = await fetch(`http://127.0.0.1:8001/API/characters/${id}/spells`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(spell),
      });

      if (!response.ok) throw new Error('Failed to add Spell');

      const updatedCharacter: Character = await response.json();
      setCharacter(updatedCharacter); // Update inventory
      setIsSpellModalOpen(false); // Close modal
      alert(`✅ Added ${spell.name} to inventory`);
    } catch (err: any) {
      console.error(err);
      alert('❌ Could not add spell');
    }
  };
  const availableSpells = [
    { name: "Longsword", type: "Weapon" },
    { name: "Spellbook", type: "Container" },
    { name: "Leather Armor", type: "Armor" },
    { name: "Ring of Protection", type: "Magic Ring" },
    { name: "Potion of Healing", type: "Consumable" },
    { name: "Dagger", type: "Weapon" },
    { name: "Backpack", type: "Container" },
    { name: "Wand of Fireballs", type: "Magic Staff" },
  ];

  if (loading) return <p className={styles.loading}>Loading character...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!character || !localAbilityScores)
    return <p className={styles.error}>Character not found.</p>;

  return (
    <div className={styles.container}>
      {/* Header Buttons */}
      <header className={styles.header}>
        <button onClick={goToMain} className={styles.button}>
          Home
        </button>
        <button onClick={goToItemCreator} className={styles.button}>
          Item Creator
        </button>
      </header>

      {/* Character Name */}
      <h1>{character.name}</h1>

      {/* Species & Core Info */}
      <section className={styles.section}>
        <h2>Species & Level</h2>
        <div className={styles.infoGrid}>
          <label><strong>Species:</strong> {character.species}</label>
          <label><strong>Level:</strong> {character.level}</label>
          <label><strong>XP:</strong> {character.xp}</label>
        </div>

        {/* Class List */}
        <label><strong>Class:</strong></label>
        <ClassList classes={character.char_class} />

        {/* Ability Scores */}
        <div>
          <strong>Ability Scores:</strong>
          <AbsScores abilityScores={localAbilityScores} onScoreChange={handleScoreChange} />
          <button
            onClick={saveScores}
            disabled={saving}
            className={styles.saveBtn}
          >
            {saving ? 'Saving...' : 'Save Scores'}
          </button>
        </div>

        {/* Proficiencies */}
        <div>
          <strong>Proficiencies:</strong>
          <ProficiencyList proficiencies={character.proficiencies} />
        </div>

        {/* Languages */}
        <div>
          <strong>Languages:</strong>
          <p>{character.languages?.join(', ') || 'None'}</p>
        </div>

        {/* Features */}
        <div>
          <strong>Features:</strong>
          <p>Coming soon...</p>
        </div>
      </section>

      {/* Spellcasting */}
      <section className={styles.section}>
        <h2>Spellcasting</h2>
        <button className={styles.primary} onClick={() => setIsSpellModalOpen(true)}>Add Spell</button>
        <SpellModal
          isOpen={IsSpellModalOpen}
          onClose={() => setIsSpellModalOpen(false)}
          onAddSpell={addSpell}
          availableSpells={availableSpells}
        />
      </section>

      {/* Inventory */}
      <section className={styles.section}>
        <h2>Inventory</h2>
        <button className={styles.primary} onClick={() => setIsItemModalOpen(true)}>Add Item</button>
        <ItemModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          onAddItem={addItem}
          availableItems={availableItems}
        />
      </section>

      {/* Combat */}
      <section className={styles.section}>
        <h2>Combat</h2>
        {/* HP Bar */}
        <div>
          <strong>HP:</strong> {character.hpCurrent} / {character.hpMax}
          {character.hpTmp > 0 && (
            <span> + {character.hpTmp} temporary HP</span>
          )}
        </div>
        <p><strong>AC:</strong> {character.ac}</p>
        <p><strong>Initiative:</strong> {character.initiative}</p>
        <p><strong>Speed:</strong> {character.speed}</p>
      </section>
    </div>
  );
};

export default CharacterDisplay;