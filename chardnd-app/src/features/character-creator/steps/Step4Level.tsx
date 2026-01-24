// src/features/character-creator/steps/Step4Level.tsx

import React, { useState } from 'react';
import styles from '../CharacterCreator.module.css';

interface Feature {
  id: number;
  name: string;
  description: string;
  level?: number;
}

interface Subclass {
  id: number;
  name: string;
  subclass_flavor: string;
  features?: Feature[];
}

interface CharacterClass {
  id: number;
  name: string;
  hit_dice: number;
  primary_ability: string;
  saving_throws: string[];
  armor_proficiencies: string[];
  weapon_proficiencies: string[];
  tool_proficiencies: string[];
  subclasses?: Subclass[];
  subclass_level?: number;
}

interface Props {
  character: any;
  updateField: (field: string, value: any) => void;
  updateClasses: (classes: any[]) => void;
  dndClasses: CharacterClass[];
}

const Step4Level: React.FC<Props> = ({ character, updateClasses, dndClasses }) => {
  const [previewIndex, setPreviewIndex] = useState(0);
  const availableClasses = Array.isArray(dndClasses) ? dndClasses : [];
  const characterClasses = character.classes || [];

  // Calculate total level
  const totalLevel = characterClasses.reduce((sum: number, c: any) => sum + (c.level || 1), 0);

  // Update a specific class entry
  const updateClassEntry = (index: number, field: string, value: any) => {
    const updated = [...characterClasses];
    updated[index] = { ...updated[index], [field]: value };
    updateClasses(updated);
    // Switch preview to this class when it's selected
    if (field === 'className') {
      setPreviewIndex(index);
    }
  };

  const handleLevelChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newLevel = parseInt(e.target.value) || 1;
    updateClassEntry(index, 'level', Math.min(Math.max(newLevel, 1), 20));
  };

  const handleSubclassChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    updateClassEntry(index, 'subclass', e.target.value);
  };

  const handleClassChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    updateClassEntry(index, 'className', e.target.value);
  };

  // Get the class to preview
  const previewClass = characterClasses[previewIndex];
  const selectedClassData = previewClass && previewClass.className 
    ? availableClasses.find(c => c.name === previewClass.className) 
    : null;
  const selectedSubclass = selectedClassData?.subclasses?.find(
    sc => sc.name === previewClass?.subclass
  );
  const previewLevel = previewClass?.level || 1;  const subclassAvailableLevel = selectedClassData?.subclass_level || 3;
  const safeArray = (arr: any) => Array.isArray(arr) ? arr : [];

  // Get unique features and filter by level
  const getUniqueFeatures = (features: Feature[]): Feature[] => {
    const seen = new Set<string>();
    return features.filter(f => {
      if (seen.has(f.name)) return false;
      seen.add(f.name);
      return true;
    });
  };

  const getFeaturesByLevel = (features: Feature[], currentLevel: number) => {
    return getUniqueFeatures(features).filter(f => !f.level || f.level <= currentLevel);
  };

  // Get available classes for a specific index (excluding already selected classes)
  const getAvailableClassesForIndex = (currentIndex: number) => {
    const selectedClassNames = characterClasses
      .map((c: any, i: number) => i !== currentIndex && c.className ? c.className : null)
      .filter(Boolean);
    
    return availableClasses.filter(cls => !selectedClassNames.includes(cls.name));
  };

  return (
    <div className={styles.formGroup}>
      {/* Total Level Display at Top */}
      <div style={{
        padding: '1rem',
        backgroundColor: '#fdf6e3',
        border: '2px solid #5a3921',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: 0, color: '#5a3921' }}>Total Character Level: {totalLevel}</h3>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Left: Class and Level Selectors */}
        <div style={{ flex: 1, minWidth: '250px' }}>
          <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>Select Levels</h4>

          {/* Class level entries */}
          {characterClasses.map((classLevel: any, index: number) => (
            <div key={index} style={{ marginBottom: '1.5rem' }}>
              <label htmlFor={`class-select-${index}`} style={{ display: 'block', marginBottom: '0.5rem' }}>
                Class {index + 1}
              </label>
              <select
                id={`class-select-${index}`}
                className={styles.select}
                value={classLevel.className}
                onChange={(e) => handleClassChange(index, e)}
                style={{ marginBottom: '0.5rem' }}
              >
                <option value="">-- Choose a class --</option>
                {getAvailableClassesForIndex(index).map(cls => (
                  <option key={cls.id} value={cls.name}>
                    {cls.name}
                  </option>
                ))}
              </select>

              <label htmlFor={`level-input-${index}`} style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9em' }}>
                Level
              </label>
              <input
                id={`level-input-${index}`}
                type="number"
                min="1"
                max="20"
                value={classLevel.level || 1}
                onChange={(e) => handleLevelChange(index, e)}
                className={styles.input}
              />

              <button
                type="button"
                onClick={() => setPreviewIndex(index)}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.85em',
                  backgroundColor: previewIndex === index ? '#5a3921' : '#d9c8a9',
                  color: previewIndex === index ? 'white' : '#5a3921',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                {previewIndex === index ? '✓ Viewing' : 'View Details'}
              </button>
            </div>
          ))}
        </div>

        {/* Right: Preview Panel */}
        <div
          style={{
            flex: 2,
            minWidth: '300px',
            backgroundColor: '#fdf6e3',
            border: '1px solid #d9c8a9',
            borderRadius: '8px',
            padding: '1.5rem'
          }}
        >
          {selectedClassData ? (
            <>
              <h4 style={{ margin: '0 0 1rem 0', color: '#5a3921' }}>
                Level {previewLevel} {selectedClassData.name}
              </h4>

              {/* Class Details */}
              <div style={{ marginBottom: '1rem', fontSize: '0.95em' }}>
                <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                  <li><b>Hit Die</b>: d{selectedClassData.hit_dice}</li>
                  {selectedClassData.primary_ability && (
                    <li><b>Primary Ability</b>: {selectedClassData.primary_ability}</li>
                  )}
                  {safeArray(selectedClassData.saving_throws).length > 0 && (
                    <li><b>Saving Throws</b>: {safeArray(selectedClassData.saving_throws).join(', ')}</li>
                  )}
                  {safeArray(selectedClassData.armor_proficiencies).length > 0 && (
                    <li><b>Armor</b>: {safeArray(selectedClassData.armor_proficiencies).join(', ')}</li>
                  )}
                  {safeArray(selectedClassData.weapon_proficiencies).length > 0 && (
                    <li><b>Weapons</b>: {safeArray(selectedClassData.weapon_proficiencies).join(', ')}</li>
                  )}
                  {safeArray(selectedClassData.tool_proficiencies).length > 0 && (
                    <li><b>Tools</b>: {safeArray(selectedClassData.tool_proficiencies).join(', ')}</li>
                  )}
                </ul>
              </div>

              {/* Subclass Selector and Info */}
              {previewLevel >= subclassAvailableLevel && selectedClassData.subclasses && selectedClassData.subclasses.length > 0 && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#fff9e6',
                  border: '1px solid #d9c8a9',
                  borderRadius: '4px',
                  marginTop: '1rem'
                }}>
                  <label htmlFor={`subclass-select-${previewIndex}`} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    {selectedClassData.subclasses[0]?.subclass_flavor || 'Subclass'}
                  </label>
                  <select
                    id={`subclass-select-${previewIndex}`}
                    className={styles.select}
                    value={previewClass?.subclass || ''}
                    onChange={(e) => handleSubclassChange(previewIndex, e)}
                    style={{ marginBottom: '0.5rem' }}
                  >
                    <option value="">-- Choose a subclass --</option>
                    {selectedClassData.subclasses.map((sc: any) => (
                      <option key={sc.id} value={sc.name}>
                        {sc.name}
                      </option>
                    ))}
                  </select>

                  {selectedSubclass && (
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9em' }}>
                      <em>Your subclass grants unique features at levels 3, 6, 10, and 14.</em>
                    </p>
                  )}
                </div>
              )}

              {/* Subclass Features */}
              {selectedSubclass && selectedSubclass.features && selectedSubclass.features.length > 0 && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#f0e6d2',
                  border: '1px solid #d9c8a9',
                  borderRadius: '4px',
                  marginTop: '1rem'
                }}>
                  <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Subclass Features (Level {previewLevel})</strong>
                  <div style={{ fontSize: '0.9em' }}>
                    {getFeaturesByLevel(selectedSubclass.features, previewLevel).map((feature: Feature) => (
                      <div key={feature.name} style={{ marginBottom: '0.5rem' }}>
                        <em><b>{feature.name}</b></em>
                        {feature.description && <p style={{ margin: '0.25rem 0 0 0' }}>{feature.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewLevel < subclassAvailableLevel && selectedClassData.subclasses && selectedClassData.subclasses.length > 0 && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#fff9e6',
                  border: '1px solid #d9c8a9',
                  borderRadius: '4px',
                  marginTop: '1rem',
                  fontSize: '0.95em'
                }}>
                  <p style={{ margin: '0 0 0.5rem 0' }}>Subclass chosen at level {subclassAvailableLevel}.</p>
                  <p style={{ margin: '0 0 0.5rem 0' }}>Available options:</p>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                    {selectedClassData.subclasses.map((sc: any) => (
                      <li key={sc.id} style={{ fontSize: '0.9em' }}>{sc.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p style={{ color: '#7a654f', textAlign: 'center' }}>Select a class to see details</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step4Level;