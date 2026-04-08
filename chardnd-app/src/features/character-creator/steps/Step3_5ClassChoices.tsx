// src/features/character-creator/steps/Step4ClassChoices.tsx
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
  type: 'cantrips' | 'spells' | 'fighting_style' | 'subclass' | 'favored_enemy';
  count: number;
  label: string;
  options?: any[];
}

interface Props {
  character: any;
  updateField: (field: string, value: any) => void;
  dndClasses: any[];
}

const Step3_5ClassChoices: React.FC<Props> = ({ character, updateField, dndClasses }) => {
  const [loading, setLoading] = useState(true);
  const [availableCantrips, setAvailableCantrips] = useState<Spell[]>([]);
  const [availableSpells, setAvailableSpells] = useState<Spell[]>([]);
  const [availableFightingStyles, setAvailableFightingStyles] = useState<FightingStyle[]>([]);
  
  // Get current class info
  const currentClass = character.classes?.[0];
  const className = currentClass?.className;
  const classData = dndClasses.find(c => c.name === className);
  
  // Determine what choices this class needs
  const getClassChoices = (): ClassChoice[] => {
    const choices: ClassChoice[] = [];
    
    if (!className) return choices;
    
    // Cantrips (Sorcerer, Warlock, Wizard, Druid, Cleric, Bard)
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
    
    // Level 1 Spells (Sorcerer, Warlock, Wizard, Druid, Cleric, Bard)
    if (['Sorcerer', 'Warlock', 'Wizard', 'Druid', 'Cleric', 'Bard'].includes(className)) {
      const spellCount = className === 'Wizard' ? 6 :
                        className === 'Sorcerer' ? 2 :
                        className === 'Warlock' ? 2 :
                        className === 'Druid' ? 2 :
                        className === 'Cleric' ? 2 : 2;
      choices.push({
        type: 'spells',
        count: spellCount,
        label: `Choose ${spellCount} Level 1 Spell${spellCount > 1 ? 's' : ''}`
      });
    }
    
    // Fighting Style (Fighter, Paladin, Ranger)
    if (['Fighter', 'Paladin', 'Ranger'].includes(className)) {
      choices.push({
        type: 'fighting_style',
        count: 1,
        label: 'Choose a Fighting Style'
      });
    }
    
    // Subclass (some at level 1, some later)
    if (classData?.subclasses && classData.subclasses.length > 0) {
      const subclassLevel = classData.subclass_level || 3;
      if (currentClass?.level >= subclassLevel) {
        choices.push({
          type: 'subclass',
          count: 1,
          label: `Choose ${classData.subclasses[0]?.subclass_flavor || 'Subclass'}`
        });
      }
    }
    
    return choices;
  };
  
  const classChoices = getClassChoices();
  
  // Load spells and options
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch cantrips (level 0 spells)
        const cantripsResponse = await fetch(`http://127.0.0.1:8001/API/classes/${className}/spells`);
        if (cantripsResponse.ok) {
          const cantrips = await cantripsResponse.json();
          // Filter by class spell list
          const classCantrips = cantrips.filter((spell: Spell) => {
            // In production, check spell's class list
            return true; // For now, show all
          });
          setAvailableCantrips(classCantrips);
        }
        
        // Fetch fighting styles
        const stylesResponse = await fetch('http://127.0.0.1:8001/API/fighting-styles');
        if (stylesResponse.ok) {
          const styles = await stylesResponse.json();
          setAvailableFightingStyles(styles);
        }
      } catch (err) {
        console.error('Failed to load class choices:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (className) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [className]);
  
  // Handle cantrip selection
  const handleCantripChange = (spellName: string, isChecked: boolean) => {
    const currentCantrips = character.classChoices?.cantrips || [];
    let newCantrips: string[];
    
    if (isChecked) {
      const cantripChoice = classChoices.find(c => c.type === 'cantrips');
      if (currentCantrips.length < (cantripChoice?.count || 0)) {
        newCantrips = [...currentCantrips, spellName];
      } else {
        return; // Max reached
      }
    } else {
      newCantrips = currentCantrips.filter(s => s !== spellName);
    }
    
    updateField('classChoices', {
      ...character.classChoices,
      cantrips: newCantrips
    });
  };
  
  // Handle spell selection
  const handleSpellChange = (spellName: string, isChecked: boolean) => {
    const currentSpells = character.classChoices?.spells || [];
    let newSpells: string[];
    
    if (isChecked) {
      const spellChoice = classChoices.find(c => c.type === 'spells');
      if (currentSpells.length < (spellChoice?.count || 0)) {
        newSpells = [...currentSpells, spellName];
      } else {
        return; // Max reached
      }
    } else {
      newSpells = currentSpells.filter(s => s !== spellName);
    }
    
    updateField('classChoices', {
      ...character.classChoices,
      spells: newSpells
    });
  };
  
  // Handle fighting style selection
  const handleFightingStyleChange = (styleName: string) => {
    updateField('classChoices', {
      ...character.classChoices,
      fightingStyle: styleName
    });
  };
  
  // Handle subclass selection
  const handleSubclassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateField('classChoices', {
      ...character.classChoices,
      subclass: e.target.value
    });
  };
  
  if (loading) {
    return <div className={styles.loading}>Loading class options...</div>;
  }
  
  if (!className) {
    return (
      <div className={styles.formGroup}>
        <p style={{ textAlign: 'center', color: '#7a654f' }}>
          Please select a class first in Step 3.
        </p>
      </div>
    );
  }
  
  if (classChoices.length === 0) {
    return (
      <div className={styles.formGroup}>
        <p style={{ textAlign: 'center', color: '#7a654f' }}>
          No additional choices required for {className} at this level.
        </p>
      </div>
    );
  }
  
  return (
    <div className={styles.formGroup}>
      <h3 style={{ color: '#5a3921', marginBottom: '1rem' }}>
        {className} Class Choices
      </h3>
      
      {/* Cantrips Selection */}
      {classChoices.find(c => c.type === 'cantrips') && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {classChoices.find(c => c.type === 'cantrips')?.label}
          </label>
          <div style={{ 
            maxHeight: '200px', 
            overflowY: 'auto', 
            border: '1px solid #d9c8a9', 
            borderRadius: '4px',
            padding: '0.5rem'
          }}>
            {availableCantrips.map(spell => (
              <label key={spell.id} style={{ display: 'block', margin: '0.25rem 0' }}>
                <input
                  type="checkbox"
                  checked={(character.classChoices?.cantrips || []).includes(spell.name)}
                  onChange={(e) => handleCantripChange(spell.name, e.target.checked)}
                />
                {' '} {spell.name} ({spell.school})
              </label>
            ))}
          </div>
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
            Selected: {(character.classChoices?.cantrips || []).join(', ') || 'None'}
          </p>
        </div>
      )}
      
      {/* Spells Selection */}
      {classChoices.find(c => c.type === 'spells') && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {classChoices.find(c => c.type === 'spells')?.label}
          </label>
          <div style={{ 
            maxHeight: '200px', 
            overflowY: 'auto', 
            border: '1px solid #d9c8a9', 
            borderRadius: '4px',
            padding: '0.5rem'
          }}>
            {availableSpells.map(spell => (
              <label key={spell.id} style={{ display: 'block', margin: '0.25rem 0' }}>
                <input
                  type="checkbox"
                  checked={(character.classChoices?.spells || []).includes(spell.name)}
                  onChange={(e) => handleSpellChange(spell.name, e.target.checked)}
                />
                {' '} {spell.name} ({spell.school})
              </label>
            ))}
          </div>
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
            Selected: {(character.classChoices?.spells || []).join(', ') || 'None'}
          </p>
        </div>
      )}
      
      {/* Fighting Style Selection */}
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
              <option key={style.id} value={style.name}>
                {style.name}
              </option>
            ))}
          </select>
          {character.classChoices?.fightingStyle && (
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
              Selected: {character.classChoices.fightingStyle}
            </p>
          )}
        </div>
      )}
      
      {/* Subclass Selection */}
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
            {classData.subclasses.map(sub => (
              <option key={sub.id} value={sub.name}>
                {sub.name}
              </option>
            ))}
          </select>
          {character.classChoices?.subclass && (
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
              Selected: {character.classChoices.subclass}
            </p>
          )}
        </div>
      )}
      
      {/* Summary Box */}
      <div style={{
        padding: '1rem',
        backgroundColor: '#f0e6d2',
        border: '1px solid #d9c8a9',
        borderRadius: '8px',
        marginTop: '1.5rem'
      }}>
        <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#5a3921' }}>
          Class Choices Summary
        </strong>
        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
          {character.classChoices?.cantrips?.length > 0 && (
            <li>Cantrips: {character.classChoices.cantrips.join(', ')}</li>
          )}
          {character.classChoices?.spells?.length > 0 && (
            <li>Spells: {character.classChoices.spells.join(', ')}</li>
          )}
          {character.classChoices?.fightingStyle && (
            <li>Fighting Style: {character.classChoices.fightingStyle}</li>
          )}
          {character.classChoices?.subclass && (
            <li>Subclass: {character.classChoices.subclass}</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Step3_5ClassChoices;