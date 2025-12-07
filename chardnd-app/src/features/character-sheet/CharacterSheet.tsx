// CharacterDisplay.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Character } from '../../types/Character';
import AbsScores from './components/AbilityScores/AbsScores';
import ClassList from './components/ClassList/ClassList';
import ProficiencyList from './components/ProficiencyList/ProficiencyList';
import styles from './CharacterSheet.module.css';
import ItemModal from './components/ItemModal/ItemModal';
import SpellModal from './components/SpellModal/SpellModal';

// 🔽 D&D 5e XP Thresholds
const LEVEL_XP_TABLE = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
];

// 🧠 Class Features (Example: Barbarian)
export const classFeatures = {
  Barbarian: [
    { name: "Rage", level: 1 },
    { name: "Unarmored Defense", level: 1 },
    { name: "Reckless Attack", level: 2 },
    { name: "Danger Sense", level: 2 },
    { name: "Extra Attack", level: 5 },
    { name: "Fast Movement", level: 5 },
    { name: "Feral Instinct", level: 7 },
    { name: "Brutal Critical", level: 9 }
  ],
  Wizard: [
    { name: "Arcane Recovery", level: 1 },
    { name: "Arcane Tradition", level: 2 },
    { name: "Ability Score Improvement", level: 4 },
    { name: "Spell Mastery", level: 18 }
  ]
};

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

  // 🩸 HP Logic: Heal & Take Damage
  const heal = (amount: number) => {
    setHpCurrent(prev => Math.min(hpMax, prev + amount));
  };

  const takeDamage = (amount: number) => {
    let remaining = amount;

    // First: reduce temp HP
    if (hpTmp > 0) {
      const newTemp = Math.max(0, hpTmp - amount);
      const usedOnTemp = amount - newTemp;
      setHpTmp(newTemp);
      remaining -= usedOnTemp;
    }

    // Then: apply to current HP
    if (remaining > 0) {
      setHpCurrent(prev => Math.max(-hpMax, prev - remaining)); // Can go negative
    }
  };

  // 💾 Save HP to Backend
  const saveHp = async () => {
    if (!id || saving) return;
    setSaving(true);
    try {
      const response = await fetch(`http://127.0.0.1:8001/API/characters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hpCurrent,
          hpTmp
        }),
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

  // 📥 Load character data
  useEffect(() => {
    const fetchCharacter = async () => {
      if (!id) return;
      try {
        const response = await fetch(`http://127.0.0.1:8001/API/characters/${id}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: Character = await response.json();
        setCharacter(data);

        // Initialize all local states
        setLocalAbilityScores(data.abilityScores);
        setLocalLevel(data.level);
        setLocalXp(data.xp);
        setHpCurrent(data.hpCurrent);
        setHpMax(data.hpMax);
        setHpTmp(data.hpTmp || 0);
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

  // Save ability scores
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

  // Add item with quantity
  const addItem = async (item: { name: string; [key: string]: any }, quantity: number = 1) => {
    try {
      const response = await fetch(`http://127.0.0.1:8001/API/characters/${id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, quantity }),
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

  // Mock items
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

  const availableSpells = [...availableItems]; // Replace later

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

  // 🔍 Get unlocked class features
  const unlockedFeatures = [];
  if (character?.char_class && localLevel) {
    const className = character.char_class;
    const featuresForClass = classFeatures[className as keyof typeof classFeatures];
    if (featuresForClass) {
      unlockedFeatures.push(
        ...featuresForClass.filter(feat => feat.level <= localLevel)
      );
    }
  }

  // Render
  if (loading) return <p className={styles.loading}>Loading character...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!character || !localAbilityScores)
    return <p className={styles.error}>Character not found.</p>;

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

        {/* Class List */}
        <label><strong>Class:</strong></label>
        <ClassList classes={character.char_class} />

        {/* Ability Scores */}
        <div>
          <strong>Ability Scores:</strong>
          <AbsScores abilityScores={localAbilityScores} onScoreChange={handleScoreChange} />
          <button onClick={saveScores} disabled={saving} className={styles.saveBtn}>
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
          {unlockedFeatures.length === 0 ? (
            <p>No features yet.</p>
          ) : (
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              {unlockedFeatures.map((feat, index) => (
                <li key={index}>
                  <strong>{feat.name}</strong> (unlocked at Level {feat.level})
                </li>
              ))}
            </ul>
          )}
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
          characterId={character.id}
        />
      </section>

      {/* Combat */}
      <section className={styles.section}>
        <h2>Combat</h2>

        {/* HP Controls */}
        <div className={styles.hpSection}>
          <strong>HP:</strong>
          <div className={styles.hpRow}>
            <div className={styles.hpMain}>{hpCurrent} / {hpMax}</div>
            {hpTmp > 0 && (
              <div className={styles.tempHpBadge}>+ {hpTmp} temp</div>
            )}
          </div>

          <div className={styles.hpControls}>
            <button type="button" onClick={() => heal(1)} disabled={saving}>+1</button>
            <button type="button" onClick={() => heal(5)} disabled={saving}>+5</button>
            <button type="button" onClick={() => takeDamage(1)} disabled={saving}>−1</button>
            <button type="button" onClick={() => takeDamage(5)} disabled={saving}>−5</button>
          </div>

          <button onClick={saveHp} disabled={saving} className={styles.saveBtn}>
            {saving ? 'Saving...' : 'Save HP'}
          </button>
        </div>

        <p><strong>AC:</strong> {character.ac}</p>
        <p><strong>Initiative:</strong> {character.initiative}</p>
        <p><strong>Speed:</strong> {character.speed}</p>
      </section>
    </div>
  );
};

export default CharacterDisplay;