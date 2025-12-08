// src/features/character-creator/steps/Step1Name.tsx

import React from 'react';
import styles from '../CharacterCreator.module.css';

interface Props {
  character: any;
  updateField: (field: string, value: any) => void;
}

const Step1Name: React.FC<Props> = ({ character, updateField }) => {
  return (
    <div className={styles.formGroup}>
      <label htmlFor="char-name">Character Name</label>
      <input
        id="char-name"
        type="text"
        className={styles.input}
        value={character.name}
        onChange={e => updateField('name', e.target.value)}
        placeholder="e.g., Elrond"
        required
      />
    </div>
  );
};

export default Step1Name;