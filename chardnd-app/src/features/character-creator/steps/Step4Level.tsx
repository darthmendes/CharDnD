// src/features/character-creator/steps/Step4Level.tsx

import React from 'react';
import styles from '../CharacterCreator.module.css';

interface DnDClass {
  id: number;
  name: string;
}

interface Props {
  character: any;
  updateClasses: (classes: any[]) => void;
  dndClasses: DnDClass[];
}

const Step4Level: React.FC<Props> = ({ character, updateClasses, dndClasses }) => {
  const totalLevel = character.classes.reduce((sum: number, c: any) => sum + c.level, 0);

  const addClass = () => {
    updateClasses([...character.classes, { className: '', level: 1 }]);
  };

  const updateClass = (index: number, field: string, value: string | number) => {
    const newClasses = [...character.classes];
    newClasses[index] = { ...newClasses[index], [field]: value };
    updateClasses(newClasses);
  };

  const removeClass = (index: number) => {
    if (character.classes.length <= 1 || index === 0) return; // Never remove first class
    const newClasses = character.classes.filter((_: any, i: number) => i !== index);
    updateClasses(newClasses);
  };

  return (
    <div>
      <div className={styles.formGroup}>
        <label>Total Character Level: {totalLevel} / 20</label>
        {character.classes.map((cls: any, i: number) => {
          const isPrimaryClass = i === 0;

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '0.8rem',
                marginTop: '0.6rem',
                alignItems: 'center',
              }}
            >
              {isPrimaryClass ? (
                // 🔒 Class name is read-only for primary class
                <div
                  className={styles.input}
                  style={{
                    flex: 2,
                    backgroundColor: '#f0e6d2',
                    cursor: 'default',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.6rem',
                    color: '#5a3921',
                    fontWeight: 600,
                  }}
                >
                  {cls.className || '—'}
                </div>
              ) : (
                // ✏️ Editable class dropdown for additional classes
                <select
                  className={styles.select}
                  value={cls.className}
                  onChange={(e) => updateClass(i, 'className', e.target.value)}
                  style={{ flex: 2 }}
                >
                  <option value="">-- Select Class --</option>
                  {dndClasses.map((dndClass) => (
                    <option key={dndClass.id} value={dndClass.name}>
                      {dndClass.name}
                    </option>
                  ))}
                </select>
              )}

              {/* ✅ Level is ALWAYS editable */}
              <input
                type="number"
                min="1"
                max={20 - (totalLevel - cls.level)}
                value={cls.level}
                onChange={(e) =>
                  updateClass(i, 'level', parseInt(e.target.value) || 1)
                }
                className={styles.numberInput}
                style={{ width: '80px' }}
                // No readOnly — level is always editable
              />

              {/* Remove button only for non-primary classes */}
              {!isPrimaryClass && (
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeClass(i)}
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}

        {totalLevel < 20 && (
          <button
            type="button"
            className={styles.inlineActionBtn}
            onClick={addClass}
            style={{ marginTop: '1rem' }}
          >
            + Add Class (Multiclass)
          </button>
        )}
      </div>
    </div>
  );
};

export default Step4Level;