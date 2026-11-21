// src/features/character-creator/steps/Step1BasicInfo.tsx

import React from 'react';
import styles from '../CharacterCreator.module.css';

interface Props {
  character: any;
  updateField: (field: string, value: any) => void;
}

const Step1BasicInfo: React.FC<Props> = ({ character, updateField }) => {
  const alignments = [
    "Lawful Good", "Neutral Good", "Chaotic Good",
    "Lawful Neutral", "True Neutral", "Chaotic Neutral", 
    "Lawful Evil", "Neutral Evil", "Chaotic Evil"
  ];

  return (
    <div className={styles.formGroup}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        
        {/* Character Name */}
        <div>
          <label htmlFor="char-name">Character Name</label>
          <input
            id="char-name"
            type="text"
            value={character.name || ''}
            onChange={e => updateField('name', e.target.value)}
            className={styles.input}
            placeholder="Enter character name"
          />
        </div>

        {/* Alignment */}
        <div>
          <label htmlFor="alignment">Alignment</label>
          <select
            id="alignment"
            className={styles.select}
            value={character.alignment || ''}
            onChange={e => updateField('alignment', e.target.value)}
          >
            <option value="">-- Choose alignment --</option>
            {alignments.map(align => (
              <option key={align} value={align}>{align}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Backstory (Optional) */}
      <div className={styles.formGroup} style={{ marginTop: '2rem' }}>
        <label htmlFor="backstory">Backstory (Optional)</label>
        <textarea
          id="backstory"
          value={character.backstory || ''}
          onChange={e => updateField('backstory', e.target.value)}
          className={styles.textarea}
          rows={4}
          placeholder="Tell your character's story..."
        />
      </div>
    </div>
  );
};

export default Step1BasicInfo;