// src/components/CharacterCreator/steps/Step1Name.tsx
import React from 'react';
import { CharacterData } from '../types';

interface Props {
  character: CharacterData;
  updateField: (field: keyof CharacterData, value: any) => void;
}

const Step1Name: React.FC<Props> = ({ character, updateField }) => (
  <div>
    <label>
      Character Name:
      <input
        type="text"
        value={character.name}
        onChange={e => updateField('name', e.target.value)}
        placeholder="e.g., Legolas"
        required
      />
    </label>
  </div>
);

export default Step1Name;