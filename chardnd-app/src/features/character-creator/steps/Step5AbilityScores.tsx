// src/features/character-creator/steps/Step5AbilityScores.tsx

import React from 'react';
import styles from '../CharacterCreator.module.css';

interface Props {
  character: any;
  updateField: (field: string, value: any) => void;
  speciesList?: any[];
  dndClasses?: any[];
}

const Step5AbilityScores: React.FC<Props> = ({ character, updateField, speciesList = [], dndClasses = [] }) => {
  const abilities = [
    { key: 'str', label: 'Strength (STR)' },
    { key: 'dex', label: 'Dexterity (DEX)' },
    { key: 'con', label: 'Constitution (CON)' },
    { key: 'int', label: 'Intelligence (INT)' },
    { key: 'wis', label: 'Wisdom (WIS)' },
    { key: 'cha', label: 'Charisma (CHA)' },
  ];

  // Get species bonuses
  const selectedSpecies = speciesList.find(s => s.name === character.species);
  const speciesBonuses: Record<string, number> = {};
  
  // Add static ability bonuses from species
  if (selectedSpecies?.ability_bonuses) {
    Object.entries(selectedSpecies.ability_bonuses).forEach(([ability, bonus]) => {
      const key = ability.toLowerCase();
      speciesBonuses[key] = (speciesBonuses[key] || 0) + (bonus as number);
    });
  }
  
  // Add bonuses from species ability choices (e.g., Human chooses +1 to 2 abilities)
  if (character.speciesChoices && selectedSpecies?.ability_choices) {
    Object.entries(character.speciesChoices).forEach(([key, value]) => {
      if (typeof value === 'number' && value > 0) {
        speciesBonuses[key.toLowerCase()] = (speciesBonuses[key.toLowerCase()] || 0) + value;
      }
    });
  }

  // Get class bonuses (from all selected classes)
  const classBonuses: Record<string, number> = {};
  if (character.classes && character.classes.length > 0) {
    character.classes.forEach((classLevel: any) => {
      const classData = dndClasses.find(c => c.name === classLevel.className);
      // For now, classes don't have ability bonuses in the current model
      // but this is set up if they're added in the future
    });
  }

  const handleAbilityChange = (key: string, value: string) => {
    const num = parseInt(value) || 10;
    const clamped = Math.min(30, Math.max(1, num));
    const newScores = { ...character.abilityScores, [key]: clamped };
    updateField('abilityScores', newScores);
  };

  const applyStandardArray = () => {
    const standard = [15, 14, 13, 12, 10, 8];
    const shuffled = [...standard].sort(() => 0.5 - Math.random());
    const newScores = {
      str: shuffled[0],
      dex: shuffled[1],
      con: shuffled[2],
      int: shuffled[3],
      wis: shuffled[4],
      cha: shuffled[5],
    };
    updateField('abilityScores', newScores);
  };

  return (
    <div>
      <div className={styles.formGroup}>
        <label>Ability Scores (1–30)</label>
        <button
          type="button"
          className={styles.inlineActionBtn}
          onClick={applyStandardArray}
          style={{ marginBottom: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.95rem' }}
        >
          Use Standard Array (15,14,13,12,10,8)
        </button>

        <div className={styles.abilityScores}>
          {abilities.map(ability => {
            const score = character.abilityScores[ability.key];
            const modifier = Math.floor((score - 10) / 2);
            const displayMod = modifier >= 0 ? `+${modifier}` : `${modifier}`;
            const speciesBonus = speciesBonuses[ability.key] || 0;
            const classBonus = classBonuses[ability.key] || 0;
            const totalBonus = speciesBonus + classBonus;
            const finalScore = score + totalBonus;
            const finalModifier = Math.floor((finalScore - 10) / 2);
            const displayFinalMod = finalModifier >= 0 ? `+${finalModifier}` : `${finalModifier}`;
            
            return (
              <div key={ability.key} className={styles.abilityItem}>
                <label>{ability.label}</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={score}
                  onChange={e => handleAbilityChange(ability.key, e.target.value)}
                  className={styles.numberInput}
                />
                <div style={{ fontSize: '0.85em' }}>
                  <div className={styles.modifier}>Base: {score} (Mod: {displayMod})</div>
                  {totalBonus !== 0 && (
                    <>
                      {speciesBonus !== 0 && (
                        <div style={{ color: '#5a3921', fontSize: '0.9em' }}>
                          Species: +{speciesBonus}
                        </div>
                      )}
                      {classBonus !== 0 && (
                        <div style={{ color: '#5a3921', fontSize: '0.9em' }}>
                          Class: +{classBonus}
                        </div>
                      )}
                      <div style={{ color: '#2d5016', fontWeight: 'bold', fontSize: '0.95em', marginTop: '0.25rem' }}>
                        Final: {finalScore} (Mod: {displayFinalMod})
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Step5AbilityScores;