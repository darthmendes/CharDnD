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

        {/* Pronouns */}
        <div>
          <label htmlFor="pronouns">Pronouns</label>
          <input
            id="pronouns"
            type="text"
            value={character.pronouns || ''}
            onChange={e => updateField('pronouns', e.target.value)}
            className={styles.input}
            placeholder="he/him, she/her, they/them"
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

        {/* Height */}
        <div>
          <label htmlFor="height">Height</label>
          <input
            id="height"
            type="text"
            value={character.height || ''}
            onChange={e => updateField('height', e.target.value)}
            className={styles.input}
            placeholder="5'6 or 168 cm"
          />
        </div>

        {/* Weight */}
        <div>
          <label htmlFor="weight">Weight</label>
          <input
            id="weight"
            type="text"
            value={character.weight || ''}
            onChange={e => updateField('weight', e.target.value)}
            className={styles.input}
            placeholder="150 lbs or 68 kg"
          />
        </div>

        {/* Eyes */}
        <div>
          <label htmlFor="eyes">Eye Color</label>
          <input
            id="eyes"
            type="text"
            value={character.eyes || ''}
            onChange={e => updateField('eyes', e.target.value)}
            className={styles.input}
            placeholder="Blue, brown, green, etc."
          />
        </div>

        {/* Hair */}
        <div>
          <label htmlFor="hair">Hair Color</label>
          <input
            id="hair"
            type="text"
            value={character.hair || ''}
            onChange={e => updateField('hair', e.target.value)}
            className={styles.input}
            placeholder="Black, blonde, red, etc."
          />
        </div>

        {/* Skin */}
        <div>
          <label htmlFor="skin">Skin Tone</label>
          <input
            id="skin"
            type="text"
            value={character.skin || ''}
            onChange={e => updateField('skin', e.target.value)}
            className={styles.input}
            placeholder="Fair, olive, dark, etc."
          />
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