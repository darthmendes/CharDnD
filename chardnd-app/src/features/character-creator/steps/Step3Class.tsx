// src/features/character-creator/steps/Step3Class.tsx

import React, { useState, useEffect } from 'react';
import styles from '../CharacterCreator.module.css';

// Match the shape from your backend
interface DnDClass {
  id: number;
  name: string;
  hasSubclass?: boolean;
  subclasses?: string[];
  equipmentOptions?: string[];
}

interface Props {
  character: any;
  updateField: (field: string, value: any) => void;
  dndClasses: DnDClass[]; // ✅ Passed from parent
}

const Step3Class: React.FC<Props> = ({ character, updateField, dndClasses }) => {
  const [subclass, setSubclass] = useState('');

  // Sync subclass state when character class changes (e.g., on back/next)
  useEffect(() => {
    const currentSubclass = character.classes[0]?.subclass || '';
    setSubclass(currentSubclass);
  }, [character.classes]);

  const selectedClass = dndClasses.find(cls => cls.name === character.classes[0]?.className);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const className = e.target.value;
    updateField('classes', [{ className, level: 1, subclass: '' }]);
    setSubclass(''); // Reset subclass when class changes
  };

  const handleSubclassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sub = e.target.value;
    setSubclass(sub);
    const updatedClasses = [...character.classes];
    updatedClasses[0] = { ...updatedClasses[0], subclass: sub };
    updateField('classes', updatedClasses);
  };

  return (
    <div>
      <div className={styles.formGroup}>
        <label htmlFor="class-select">Class</label>
        <select
          id="class-select"
          className={styles.select}
          value={character.classes[0]?.className || ''}
          onChange={handleClassChange}
        >
          <option value="">-- Choose a class --</option>
          {dndClasses.map(cls => (
            <option key={cls.id} value={cls.name}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {selectedClass?.hasSubclass && (
        <div className={styles.formGroup}>
          <label htmlFor="subclass-select">Subclass (Archetype)</label>
          <select
            id="subclass-select"
            className={styles.select}
            value={subclass}
            onChange={handleSubclassChange}
          >
            <option value="">-- Choose at level 3+ --</option>
            {selectedClass.subclasses?.map(sc => (
              <option key={sc} value={sc}>{sc}</option>
            ))}
          </select>
        </div>
      )}

      {selectedClass?.equipmentOptions && (
        <div className={styles.formGroup}>
          <label>Starting Equipment Options</label>
          <ul style={{ 
            paddingLeft: '1.2rem', 
            marginTop: '0.3rem', 
            fontSize: '0.95rem', 
            color: '#5a3921' 
          }}>
            {selectedClass.equipmentOptions.map((opt, i) => (
              <li key={i}>{opt}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Step3Class;