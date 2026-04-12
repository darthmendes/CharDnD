// src/features/character-creator/steps/Step3_5ClassChoices.tsx
import React, { useState, useEffect } from 'react';
import styles from '../CharacterCreator.module.css';

interface Spell {
  id: number;
  name: string;
  level: number;
  school: string;
}

interface FightingStyle {
  id: number;
  name: string;
  description: string;
}

interface Subclass {
  id: number;
  name: string;
  subclass_flavor?: string;
  description?: string;
}

interface ClassChoice {
  type: 'cantrips' | 'fighting_style' | 'subclass' | 'asi';
  count: number;
  label: string;
}

interface Props {
  character: any;
  updateField: (field: string, value: any) => void;
  dndClasses: any[];
}

// [NOTE] Standard 5e ASI levels per class
const getASILevels = (className: string): number[] => {
  switch (className) {
    case 'Fighter': return [4, 6, 8, 12, 14, 16, 19];
    case 'Rogue': return [4, 8, 10, 12, 16, 19];
    case 'Bard': return [4, 8, 12, 16, 19];
    default: return [4, 8, 12, 16, 19];
  }
};

const Step3_5ClassChoices: React.FC<Props> = ({ character, updateField, dndClasses }) => {
  const [loading, setLoading] = useState(true);
  const [availableCantrips, setAvailableCantrips] = useState<Spell[]>([]);
  const [availableFightingStyles, setAvailableFightingStyles] = useState<FightingStyle[]>([]);
  const [asiPendingChanges, setAsiPendingChanges] = useState<Record<string, number>>({
    str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0
  });

  // [DEBUG] Log critical data on mount/change
  useEffect(() => {
    console.log('[DEBUG] dndClasses:', dndClasses);
    console.log('[DEBUG] character.classes:', character.classes);
  }, [dndClasses, character.classes]);

  const currentClass = character.classes?.[0];
  const className = currentClass?.className;
  const classLevel = currentClass?.level || 1;
  
  // [NOTE] Find matching class data from API response
  const classData = dndClasses.find(c => c.name?.toLowerCase() === className?.toLowerCase());

  // [DEBUG] Log resolved class data
  useEffect(() => {
    console.log('[DEBUG] Resolved classData:', classData);
    console.log('[DEBUG] classLevel:', classLevel);
  }, [classData, classLevel]);

  const calculateAvailableASIs = (): number => {
    if (!className || !classLevel) return 0;
    return getASILevels(className).filter(l => classLevel >= l).length;
  };

  const availableASIs = calculateAvailableASIs();
  const asiPointsUsed = Object.values(asiPendingChanges).reduce((a, b) => a + b, 0);
  const asiPointsRemaining = (availableASIs * 2) - asiPointsUsed;

  // [NOTE] Determine required choices
  const getClassChoices = (): ClassChoice[] => {
    const choices: ClassChoice[] = [];
    if (!className || !classData) return choices;

    // Cantrips
    if (['Sorcerer', 'Warlock', 'Wizard', 'Druid', 'Cleric', 'Bard'].includes(className)) {
      const counts: Record<string, number> = { Wizard: 3, Sorcerer: 4, Warlock: 2, Druid: 2, Cleric: 3, Bard: 2 };
      const count = counts[className] || 2;
      choices.push({ type: 'cantrips', count, label: `Choose ${count} Cantrip${count > 1 ? 's' : ''}` });
    }

    // Fighting Style
    if (['Fighter', 'Paladin', 'Ranger'].includes(className)) {
      choices.push({ type: 'fighting_style', count: 1, label: 'Choose a Fighting Style' });
    }

    // [NOTE] SUBCLASS
    const subclassLevel = classData?.subclass_level ?? 3; // Default to 3 if missing
    const hasSubclasses = Array.isArray(classData?.subclasses) && classData.subclasses.length > 0;

    console.log('[DEBUG] Subclass Check:', { className, classLevel, subclassLevel, hasSubclasses, subclasses: classData?.subclasses });

    if (classLevel >= subclassLevel && hasSubclasses) {
      const labelMap: Record<string, string> = {
        Cleric: 'Choose Divine Domain',
        Wizard: 'Choose Arcane Tradition',
        Fighter: 'Choose Martial Archetype',
        Paladin: 'Choose Sacred Oath',
        Ranger: 'Choose Hunter Archetype',
        Barbarian: 'Choose Primal Path',
        Druid: 'Choose Druid Circle',
        Monk: 'Choose Monastic Tradition',
        Rogue: 'Choose Roguish Archetype',
        Sorcerer: 'Choose Sorcerous Origin',
        Warlock: 'Choose Otherworldly Patron',
        Bard: 'Choose Bard College'
      };
      choices.push({ type: 'subclass', count: 1, label: labelMap[className] || 'Choose Subclass' });
    }

    // ASIs
    if (availableASIs > 0) {
      choices.push({ type: 'asi', count: availableASIs, label: `Ability Score Improvements (${availableASIs})` });
    }

    return choices;
  };

  const classChoices = getClassChoices();

  // Fetch class-specific data
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!className) { setLoading(false); return; }
        
        const cantripsRes = await fetch(`http://127.0.0.1:8001/API/classes/${encodeURIComponent(className)}/spells?level=0`);
        if (cantripsRes.ok) setAvailableCantrips(await cantripsRes.json());

        const stylesRes = await fetch('http://127.0.0.1:8001/API/fighting-styles');
        if (stylesRes.ok) setAvailableFightingStyles(await stylesRes.json());
      } catch (err) {
        console.error('Failed to load class choices:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [className]);

  // [NOTE] Handlers
  const handleCantripChange = (spellName: string, isChecked: boolean) => {
    const current = character.classChoices?.cantrips || [];
    const choice = classChoices.find(c => c.type === 'cantrips');
    if (isChecked && current.length >= (choice?.count || 0)) return;
    
    const updated = isChecked ? [...current, spellName] : current.filter(s => s !== spellName);
    updateField('classChoices', { ...character.classChoices, cantrips: updated });
  };

  const handleFightingStyleChange = (styleName: string) => {
    updateField('classChoices', { ...character.classChoices, fightingStyle: styleName });
  };

  const handleSubclassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateField('classChoices', { ...character.classChoices, subclass: e.target.value });
  };

  const handleASIChange = (ability: string, amount: number) => {
    const currentScore = character.abilityScores[ability] || 10;
    const pending = asiPendingChanges[ability] || 0;
    if (amount > 0 && (currentScore + pending + amount > 20 || asiPointsRemaining <= 0)) return;

    const newChanges = { ...asiPendingChanges, [ability]: pending + amount };
    setAsiPendingChanges(newChanges);
    updateField('abilityScores', { ...character.abilityScores, [ability]: currentScore + amount });
  };

  if (loading) return <div className={styles.loading}>Loading class options...</div>;
  if (!className) return <p style={{ textAlign: 'center', color: '#7a654f' }}>Please select a class first in Step 3.</p>;

  return (
    <div className={styles.formGroup}>
      <h3 style={{ color: '#5a3921', marginBottom: '1rem' }}>{className} Class Choices</h3>

      {/* Cantrips */}
      {classChoices.find(c => c.type === 'cantrips') && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {classChoices.find(c => c.type === 'cantrips')?.label}
          </label>
          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #d9c8a9', borderRadius: '4px', padding: '0.5rem' }}>
            {availableCantrips.map(spell => (
              <label key={spell.id} style={{ display: 'block', margin: '0.25rem 0' }}>
                <input 
                  type="checkbox" 
                  checked={(character.classChoices?.cantrips || []).includes(spell.name)} 
                  onChange={(e) => handleCantripChange(spell.name, e.target.checked)} 
                />
                {' '}{spell.name} ({spell.school})
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Fighting Style */}
      {classChoices.find(c => c.type === 'fighting_style') && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {classChoices.find(c => c.type === 'fighting_style')?.label}
          </label>
          <select 
            className={styles.select} 
            value={character.classChoices?.fightingStyle || ''} 
            onChange={(e) => handleFightingStyleChange(e.target.value)} 
          >
            <option value="">-- Choose a Fighting Style --</option>
            {availableFightingStyles.map(style => (
              <option key={style.id} value={style.name}>{style.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* [NOTE] SUBCLASS / DIVINE DOMAIN DROPDOWN */}
      {classChoices.find(c => c.type === 'subclass') && classData?.subclasses && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {classChoices.find(c => c.type === 'subclass')?.label}
          </label>
          <select 
            className={styles.select} 
            value={character.classChoices?.subclass || ''} 
            onChange={handleSubclassChange} 
          >
            <option value="">-- Choose --</option>
            {classData.subclasses.map((sub: Subclass) => (
              <option key={sub.id} value={sub.name}>{sub.name}</option>
            ))}
          </select>
          {character.classChoices?.subclass && classData.subclasses && (
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem', fontStyle: 'italic' }}>
              {classData.subclasses.find((s: Subclass) => s.name === character.classChoices.subclass)?.subclass_flavor}
            </p>
          )}
        </div>
      )}

      {/* ASI Section */}
      {availableASIs > 0 && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fdf6e3', borderRadius: '8px', border: '1px solid #d9c8a9' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#5a3921' }}>Ability Score Improvements</h4>
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#666' }}>
            Level {classLevel} reached. <strong>{availableASIs} ASI(s) available.</strong><br />
            <em>Points Remaining: {asiPointsRemaining}</em>
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(ability => {
              const currentTotal = character.abilityScores[ability] || 10;
              return (
                <div key={ability} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <span style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem' }}>{ability}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', width: '30px', textAlign: 'center' }}>{currentTotal}</span>
                    <button type="button" onClick={() => handleASIChange(ability, 1)} disabled={asiPointsRemaining < 1 || currentTotal >= 20} style={{ width: '24px', height: '24px', cursor: (asiPointsRemaining < 1 || currentTotal >= 20) ? 'not-allowed' : 'pointer', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px' }}>+</button>
                    <button type="button" onClick={() => handleASIChange(ability, -1)} disabled={asiPendingChanges[ability] <= 0} style={{ width: '24px', height: '24px', cursor: asiPendingChanges[ability] <= 0 ? 'not-allowed' : 'pointer', background: '#c0392b', color: 'white', border: 'none', borderRadius: '4px' }}>-</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      <div style={{ padding: '1rem', backgroundColor: '#f0e6d2', border: '1px solid #d9c8a9', borderRadius: '8px', marginTop: '1.5rem' }}>
        <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#5a3921' }}>Class Choices Summary</strong>
        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
          {character.classChoices?.cantrips?.length > 0 && <li>Cantrips: {character.classChoices.cantrips.join(', ')}</li>}
          {character.classChoices?.fightingStyle && <li>Fighting Style: {character.classChoices.fightingStyle}</li>}
          {character.classChoices?.subclass && <li>Subclass/Domain: {character.classChoices.subclass}</li>}
          {availableASIs > 0 && (
            <li>
              ASIs: {asiPointsUsed / 2} used ({asiPointsRemaining / 2} left)
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