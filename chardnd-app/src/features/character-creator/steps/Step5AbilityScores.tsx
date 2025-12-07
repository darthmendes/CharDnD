// src/components/CharacterCreator/steps/Step5Abilities.tsx

import React from 'react';
import { AbilityScores } from '../types';

interface Props {
  character: { abilityScores: AbilityScores };
  updateField: (field: string, value: any) => void;
}

const Step5Abilities: React.FC<Props> = ({ character, updateField }) => {
  const abilities = [
    { key: 'str', label: 'Strength (STR)' },
    { key: 'dex', label: 'Dexterity (DEX)' },
    { key: 'con', label: 'Constitution (CON)' },
    { key: 'int', label: 'Intelligence (INT)' },
    { key: 'wis', label: 'Wisdom (WIS)' },
    { key: 'cha', label: 'Charisma (CHA)' },
  ];

  const handleAbilityChange = (key: keyof AbilityScores, value: string) => {
    const num = parseInt(value) || 10;
    // Clamp between 1 and 30
    const clamped = Math.min(30, Math.max(1, num));
    const newScores = { ...character.abilityScores, [key]: clamped };
    updateField('abilityScores', newScores);
  };

  // Optional: Add Point Buy or Standard Array buttons
  const applyStandardArray = () => {
    const standard = [15, 14, 13, 12, 10, 8];
    const shuffled = [...standard].sort(() => 0.5 - Math.random());
    const newScores: AbilityScores = {
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
      <h3>Ability Scores</h3>
      <p>Enter scores between 1 and 30.</p>

      <button type="button" onClick={applyStandardArray} style={{ marginBottom: '1rem' }}>
        Use Standard Array (15,14,13,12,10,8)
      </button>

      {abilities.map(ability => (
        <label key={ability.key} style={{ display: 'block', margin: '0.5rem 0' }}>
          {ability.label}:
          <input
            type="number"
            min="1"
            max="30"
            value={character.abilityScores[ability.key as keyof AbilityScores]}
            onChange={e => handleAbilityChange(ability.key as keyof AbilityScores, e.target.value)}
            style={{ width: '80px', marginLeft: '0.5rem' }}
          />
        </label>
      ))}

      {/* Optional: Show modifiers */}
      <div style={{ marginTop: '1rem', fontSize: '0.9em', color: '#444' }}>
        {abilities.map(ability => {
          const score = character.abilityScores[ability.key as keyof AbilityScores];
          const modifier = Math.floor((score - 10) / 2);
          const displayMod = modifier >= 0 ? `+${modifier}` : `${modifier}`;
          return (
            <div key={ability.key}>
              {ability.label} Modifier: {displayMod}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Step5Abilities;