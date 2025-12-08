// src/features/character-creator/steps/Step5AbilityScores.tsx

import React from 'react';
import styles from '../CharacterCreator.module.css';

interface Props {
  character: any;
  updateField: (field: string, value: any) => void;
}

const Step5AbilityScores: React.FC<Props> = ({ character, updateField }) => {
  const abilities = [
    { key: 'str', label: 'Strength (STR)' },
    { key: 'dex', label: 'Dexterity (DEX)' },
    { key: 'con', label: 'Constitution (CON)' },
    { key: 'int', label: 'Intelligence (INT)' },
    { key: 'wis', label: 'Wisdom (WIS)' },
    { key: 'cha', label: 'Charisma (CHA)' },
  ];

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
                <div className={styles.modifier}>Modifier: {displayMod}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Step5AbilityScores;