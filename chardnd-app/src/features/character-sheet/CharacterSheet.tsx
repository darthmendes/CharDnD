// src/features/character-sheet/CharacterDisplay.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Character } from '../../types/Character';
import AbsScores from './components/AbilityScores/AbsScores';
import ClassList from './components/ClassList/ClassList';
import ProficiencyList from './components/ProficiencyList/ProficiencyList';
import styles from './CharacterSheet.module.css';
import ItemModal from '../Items/ItemModal/ItemModal';
import SpellModal from './components/SpellModal/SpellModal';
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
  };

  const takeDamage = (amount: number) => {
    let remaining = amount;
    if (hpTmp > 0) {
      const newTemp = Math.max(0, hpTmp - amount);
      const usedOnTemp = amount - newTemp;
      setHpTmp(newTemp);
      remaining -= usedOnTemp;
    }
    if (remaining > 0) {
      setHpCurrent(prev => Math.max(-hpMax, prev - remaining));
    }
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
        setLocalAbilityScores(data.abilityScores);
        setLocalLevel(data.level);
        setLocalXp(data.xp);
        setHpCurrent(data.hpCurrent || data.hitPoints || 0);
        setHpMax(data.hpMax || data.hitPoints || 10);
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
        setAvailableItems([]); // fallback
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

  // Add spell (using items as placeholder — update later if needed)
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

  const availableSpells = [...availableItems]; // ⚠️ Temporary — replace with real spells later

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

    // Extract from character data
    if (character?.proficientSkills) {
      skills.push(...character.proficientSkills);
    }
    if (character?.proficientWeapons) {
      weapons.push(...character.proficientWeapons);
    }
    if (character?.proficientTools) {
      tools.push(...character.proficientTools);
    }
    if (character?.knownLanguages) {
      languages.push(...character.knownLanguages);
    }

    return { skills, weapons, tools, languages };
  };

  const { skills: proficientSkills, weapons: proficientWeapons, tools: proficientTools, languages: knownLanguages } = getAllProficiencies();

  // ✅ Calculate final ability scores with bonuses
  const getFinalAbilityScore = (baseKey: string) => {
    const baseScore = localAbilityScores?.[baseKey] || 10;
    // In a real implementation, you'd add species/subspecies bonuses here
    // For now, just return base score since bonuses are already applied during creation
    return baseScore;
  };

  const getAbilityModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

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
        {character.subspecies && <label><strong>Subspecies:</strong> {character.subspecies}</label>}
        {character.background && <label><strong>Background:</strong> {character.background}</label>}

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

        {/* ✅ Multiclass Display */}
        <label><strong>Classes:</strong></label>
        {character.classes ? (
          <ClassList classes={character.classes} />
        ) : (
          <p>{character.char_class}</p>
        )}

        <div>
          <strong>Ability Scores:</strong>
          <AbsScores abilityScores={localAbilityScores} onScoreChange={handleScoreChange} />
          <button onClick={saveScores} disabled={saving} className={styles.saveBtn}>
            {saving ? 'Saving...' : 'Save Scores'}
          </button>
        </div>

        {/* ✅ Updated Proficiency Display */}
        <div>
          <strong>Proficiencies:</strong>
          
          {/* Skills */}
          {proficientSkills.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Skills:</strong>
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

          {/* Weapons & Armor */}
          {proficientWeapons.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Weapons & Armor:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {proficientWeapons.map(weapon => (
                  <span key={weapon} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#e0e0e0', borderRadius: '4px' }}>
                    {weapon}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tools */}
          {proficientTools.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Tools:</strong>
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
          <strong>Languages:</strong>
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
          <p>{hpMax} (current: {hpCurrent})</p>
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
        />
      </section>

      {/* Inventory */}
      <section className={styles.section}>
        <h2>Inventory</h2>
        <button 
          className={styles.primary} 
          onClick={() => setIsItemModalOpen(true)}
          disabled={itemsLoading}
        >
          {itemsLoading ? 'Loading Items...' : 'Add Item'}
        </button>
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
        <div className={styles.hpSection}>
          <strong>HP:</strong>
          <div className={styles.hpRow}>
            <div className={styles.hpMain}>{hpCurrent} / {hpMax}</div>
            {hpTmp > 0 && <div className={styles.tempHpBadge}>+ {hpTmp} temp</div>}
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