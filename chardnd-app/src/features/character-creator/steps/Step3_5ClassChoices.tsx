// src/features/character-creator/steps/Step3_5ClassChoices.tsx
import React, { useState, useEffect } from 'react';
import styles from '../CharacterCreator.module.css';

interface Spell {
  id: number;
  name: string;
  level: number;
  school: string;
  description: string;
}

interface FightingStyle {
  id: number;
  name: string;
  description: string;
}

interface Subclass {
  id: number;
  name: string;
  subclass_flavor: string;
  description: string;
  features?: any[];
}

interface ClassChoice {
  type: 'cantrips' | 'spells' | 'fighting_style' | 'subclass' | 'asi';
  count: number;
  label: string;
  options?: any[];
}

interface Props {
  character: any;
  updateField: (field: string, value: any) => void;
  dndClasses: any[];
}

// ✅ ASI Levels per Class (Standard 5e Rules)
const getASILevels = (className: string): number[] => {
  switch (className) {
    case 'Fighter': return [4, 6, 8, 12, 14, 16, 19];
    case 'Rogue': return [4, 8, 10, 12, 16, 19]; // Rogues get one at 10
    case 'Bard': return [4, 8, 12, 16, 19];
    default: return [4, 8, 12, 16, 19];
  }
};

const Step3_5ClassChoices: React.FC<Props> = ({ character, updateField, dndClasses }) => {
  const [loading, setLoading] = useState(true);
  const [availableCantrips, setAvailableCantrips] = useState<Spell[]>([]);
  const [availableSpells, setAvailableSpells] = useState<Spell[]>([]);
  const [availableFightingStyles, setAvailableFightingStyles] = useState<FightingStyle[]>([]);
  
  // ✅ NEW: State for tracking pending ASI changes
  const [asiPendingChanges, setAsiPendingChanges] = useState<{ [key: string]: number }>({
    str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0
  });

  // Get current class info
  const currentClass = character.classes?.[0];
  const className = currentClass?.className;
  const classLevel = currentClass?.level || 1;
  const classData = dndClasses.find(c => c.name === className);

  // ✅ Helper: Calculate available ASIs based on level
  const calculateAvailableASIs = (): number => {
    if (!className || !classLevel) return 0;
    const levels = getASILevels(className);
    return levels.filter(l => classLevel >= l).length;
  };

  const availableASIs = calculateAvailableASIs();
  const asiPointsUsed = Object.values(asiPendingChanges).reduce((a, b) => a + b, 0);
  const asiPointsRemaining = (availableASIs * 2) - asiPointsUsed; // Each ASI = 2 points

  // Determine what choices this class needs
  const getClassChoices = (): ClassChoice[] => {
    const choices: ClassChoice[] = [];
    if (!className) return choices;

    // ... existing cantrip/spell/fighting style logic ...
    if (['Sorcerer', 'Warlock', 'Wizard', 'Druid', 'Cleric', 'Bard'].includes(className)) {
      const cantripCount = className === 'Wizard' ? 3 : 
                          className === 'Sorcerer' ? 4 :
                          className === 'Warlock' ? 2 :
                          className === 'Druid' ? 2 :
                          className === 'Cleric' ? 3 : 2;
      choices.push({
        type: 'cantrips',
        count: cantripCount,
        label: `Choose ${cantripCount} Cantrip${cantripCount > 1 ? 's' : ''}`
      });
    }
    if (['Fighter', 'Paladin', 'Ranger'].includes(className)) {
      choices.push({ type: 'fighting_style', count: 1, label: 'Choose a Fighting Style' });
    }

    // ✅ ADD ASI TO CHOICES IF AVAILABLE
    if (availableASIs > 0) {
      choices.push({
        type: 'asi',
        count: availableASIs,
        label: `Ability Score Improvements (${availableASIs})`
      });
    }

    return choices;
  };
  
  const classChoices = getClassChoices();

  // ... existing useEffect for fetching data ...
  useEffect(() => {
    const loadData = async () => {
      try {
        const cantripsResponse = await fetch(`http://127.0.0.1:8001/API/classes/${className}/spells?level=0`);
        if (cantripsResponse.ok) setAvailableCantrips(await cantripsResponse.json());
        
        const spellsResponse = await fetch(`http://127.0.0.1:8001/API/classes/${className}/spells?level=1`);
        if (spellsResponse.ok) setAvailableSpells(await spellsResponse.json());

        const stylesResponse = await fetch('http://127.0.0.1:8001/API/fighting-styles');
        if (stylesResponse.ok) setAvailableFightingStyles(await stylesResponse.json());
      } catch (err) {
        console.error('Failed to load class choices:', err);
      } finally {
        setLoading(false);
      }
    };
    if (className) loadData();
    else setLoading(false);
  }, [className]);

  // ... existing handlers ...
  const handleCantripChange = (spellName: string, isChecked: boolean) => {
    const currentCantrips = character.classChoices?.cantrips || [];
    let newCantrips: string[];
    if (isChecked) {
      const cantripChoice = classChoices.find(c => c.type === 'cantrips');
      if (currentCantrips.length < (cantripChoice?.count || 0)) {
        newCantrips = [...currentCantrips, spellName];
      } else return;
    } else {
      newCantrips = currentCantrips.filter(s => s !== spellName);
    }
    updateField('classChoices', { ...character.classChoices, cantrips: newCantrips });
  };

  const handleFightingStyleChange = (styleName: string) => {
    updateField('classChoices', { ...character.classChoices, fightingStyle: styleName });
  };

  const handleSubclassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateField('classChoices', { ...character.classChoices, subclass: e.target.value });
  };

  // ✅ NEW: ASI Handlers
  const handleASIChange = (ability: string, amount: number) => {
    // Validation: Max score 20
    const currentScore = character.abilityScores[ability] || 10;
    const pending = asiPendingChanges[ability] || 0;
    
    if (amount > 0 && currentScore + pending + amount > 20) return;
    
    // Validation: Must have points available
    if (amount > 0 && asiPointsRemaining <= 0) return;

    const newChanges = { ...asiPendingChanges, [ability]: pending + amount };
    setAsiPendingChanges(newChanges);

    // Apply to character scores immediately for preview
    const newScores = { ...character.abilityScores };
    newScores[ability] = currentScore + amount;
    updateField('abilityScores', newScores);
  };

  if (loading) return <div className={styles.loading}>Loading class options...</div>;
  if (!className) return <p style={{ textAlign: 'center', color: '#7a654f' }}>Please select a class first in Step 3.</p>;

  return (
    <div className={styles.formGroup}>
      <h3 style={{ color: '#5a3921', marginBottom: '1rem' }}>{className} Class Choices</h3>

      {/* ... Cantrip/Spell/Style UI (same as before) ... */}
      {classChoices.find(c => c.type === 'cantrips') && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {classChoices.find(c => c.type === 'cantrips')?.label}
          </label>
          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #d9c8a9', borderRadius: '4px', padding: '0.5rem' }}>
            {availableCantrips.map(spell => (
              <label key={spell.id} style={{ display: 'block', margin: '0.25rem 0' }}>
                <input type="checkbox" checked={(character.classChoices?.cantrips || []).includes(spell.name)} onChange={(e) => handleCantripChange(spell.name, e.target.checked)} />
                {' '} {spell.name} ({spell.school})
              </label>
            ))}
          </div>
        </div>
      )}

      {classChoices.find(c => c.type === 'fighting_style') && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {classChoices.find(c => c.type === 'fighting_style')?.label}
          </label>
          <select className={styles.select} value={character.classChoices?.fightingStyle || ''} onChange={(e) => handleFightingStyleChange(e.target.value)}>
            <option value="">-- Choose a Fighting Style --</option>
            {availableFightingStyles.map(style => (
              <option key={style.id} value={style.name}>{style.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* ✅ ASI UI SECTION */}
      {availableASIs > 0 && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fdf6e3', borderRadius: '8px', border: '1px solid #d9c8a9' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#5a3921' }}>Ability Score Improvements</h4>
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#666' }}>
            You have reached Level {classLevel}. You have gained <strong>{availableASIs} Ability Score Improvement(s)</strong>.
            <br />
            <em>Points Available to Spend: {asiPointsRemaining}</em>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(ability => {
              const baseScore = character.abilityScores[ability] || 10;
              // We need to find the "original" score before this step's changes to calculate pending correctly
              // This is a simplification; ideally you track "base" scores separately.
              // For this demo, we just show current + ability to add/remove.
              const currentTotal = baseScore; 
              
              return (
                <div key={ability} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <span style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem' }}>{ability}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', width: '30px', textAlign: 'center' }}>{currentTotal}</span>
                    <button 
                      type="button" 
                      onClick={() => handleASIChange(ability, 1)} 
                      disabled={asiPointsRemaining < 1 || currentTotal >= 20}
                      style={{ width: '24px', height: '24px', cursor: (asiPointsRemaining < 1 || currentTotal >= 20) ? 'not-allowed' : 'pointer', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px' }}
                    >+</button>
                    <button 
                      type="button" 
                      onClick={() => handleASIChange(ability, -1)} 
                      disabled={asiPendingChanges[ability] <= 0}
                      style={{ width: '24px', height: '24px', cursor: asiPendingChanges[ability] <= 0 ? 'not-allowed' : 'pointer', background: '#c0392b', color: 'white', border: 'none', borderRadius: '4px' }}
                    >-</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subclass Selection */}
      {classChoices.find(c => c.type === 'subclass') && classData?.subclasses && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {classChoices.find(c => c.type === 'subclass')?.label}
          </label>
          <select className={styles.select} value={character.classChoices?.subclass || ''} onChange={handleSubclassChange}>
            <option value="">-- Choose --</option>
            {classData.subclasses.map((sub: any) => (
              <option key={sub.id} value={sub.name}>{sub.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Summary Box */}
      <div style={{ padding: '1rem', backgroundColor: '#f0e6d2', border: '1px solid #d9c8a9', borderRadius: '8px', marginTop: '1.5rem' }}>
        <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#5a3921' }}>Class Choices Summary</strong>
        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
          {character.classChoices?.cantrips?.length > 0 && <li>Cantrips: {character.classChoices.cantrips.join(', ')}</li>}
          {character.classChoices?.fightingStyle && <li>Fighting Style: {character.classChoices.fightingStyle}</li>}
          {character.classChoices?.subclass && <li>Subclass: {character.classChoices.subclass}</li>}
          {/* ✅ ASI Summary */}
          {availableASIs > 0 && (
            <li>
              ASIs Used: {asiPointsUsed / 2} (Remaining: {asiPointsRemaining / 2})
              <div style={{ fontSize: '0.8em', color: '#555' }}>
                {Object.entries(asiPendingChanges).filter(([_, v]) => v > 0).map(([k, v]) => `${k.toUpperCase()} +${v}`).join(', ')}
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Step3_5ClassChoices;