// src/features/character-creator/steps/Step3Class.tsx

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
  skill_choices: { n_choices: number; options: string[] };
  class_features: Feature[];
  subclasses?: Subclass[];
  subclass_level?: number;
}

interface Props {
  character: any;
  updateField: (field: string, value: any) => void;
  updateClasses: (classes: any[]) => void;
  dndClasses: CharacterClass[];
}

const Step3Class: React.FC<Props> = ({ character, updateClasses, dndClasses }) => {
  const [previewIndex, setPreviewIndex] = useState(0);
  const classList = dndClasses;

  // Get all classes for the character
  const characterClasses = character.classes || [];

  // Calculate total level
  const totalLevel = characterClasses.reduce((sum: number, c: any) => sum + (c.level || 1), 0);

  // Add a new class level (multiclass)
  const addClassLevel = () => {
    updateClasses([...characterClasses, { className: '', level: 1, subclass: '' }]);
  };

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

  // Remove a class level
  const removeClassLevel = (index: number) => {
    if (characterClasses.length > 1) {
      const filtered = characterClasses.filter((_: any, i: number) => i !== index);
      updateClasses(filtered);
      // Adjust preview index if needed
      if (previewIndex >= filtered.length) {
        setPreviewIndex(Math.max(0, filtered.length - 1));
      }
    }
  };

  const handleClassChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    updateClassEntry(index, 'className', e.target.value);
  };

  const handleLevelChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newLevel = parseInt(e.target.value) || 1;
    updateClassEntry(index, 'level', Math.min(Math.max(newLevel, 1), 20));
  };

  const handleSubclassChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    updateClassEntry(index, 'subclass', e.target.value);
  };

  const safeArray = (arr: any) => Array.isArray(arr) ? arr : [];

  // Get available classes for a specific index (excluding already selected classes)
  const getAvailableClassesForIndex = (currentIndex: number) => {
    const selectedClassNames = characterClasses
      .map((c: any, i: number) => i !== currentIndex && c.className ? c.className : null)
      .filter(Boolean);
    
    return classList.filter(cls => !selectedClassNames.includes(cls.name));
  };

  // Deduplicate features by name
  const getUniqueFeatures = (features: Feature[]) => {
    const seen = new Set<string>();
    return features.filter(feature => {
      if (seen.has(feature.name)) {
        return false;
      }
      seen.add(feature.name);
      return true;
    });
  };

  // Filter features by current level
  const getFeaturesByLevel = (features: Feature[], currentLevel: number) => {
    return getUniqueFeatures(features).filter(f => !f.level || f.level <= currentLevel);
  };

  // Get the class to preview
  const previewClass = characterClasses[previewIndex];
  const selectedClassData = previewClass && previewClass.className 
    ? classList.find(c => c.name === previewClass.className) 
    : null;
  const selectedSubclass = selectedClassData?.subclasses?.find(
    (sc: any) => sc.name === previewClass?.subclass
  );
  const previewLevel = previewClass?.level || 1;
  const subclassAvailableLevel = selectedClassData?.subclass_level || 3;

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
          <h4 style={{ marginTop: 0 }}>Class Levels</h4>

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
                style={{ marginBottom: '0.5rem' }}
              />

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPreviewIndex(index)}
                  style={{
                    flex: 1,
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.85em',
                    backgroundColor: previewIndex === index ? '#5a3921' : '#d9c8a9',
                    color: previewIndex === index ? 'white' : '#5a3921',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {previewIndex === index ? '✓ Viewing' : 'View'}
                </button>

                {characterClasses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeClassLevel(index)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.85em',
                      backgroundColor: '#d9534f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add another class button */}
          <button
            type="button"
            onClick={addClassLevel}
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#5a3921',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 'bold'
            }}
          >
            + Add Class
          </button>
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
                {selectedClassData.name}
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
                  {selectedClassData.skill_choices?.options && (
                    <li>
                      <b>Skills</b>: Choose {selectedClassData.skill_choices.n_choices} from{' '}
                      {safeArray(selectedClassData.skill_choices.options).join(', ')}
                    </li>
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

              {/* Class Features */}
              {safeArray(selectedClassData.class_features).length > 0 && (
                <div>
                  <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Class Features (Level {previewLevel})</strong>
                  <div style={{ fontSize: '0.9em' }}>
                    {getFeaturesByLevel(safeArray(selectedClassData.class_features), previewLevel).map(feature => (
                      <div key={feature.name} style={{ marginBottom: '0.75rem' }}>
                        <em><b>{feature.name}</b></em>: {feature.description || "No description available."}
                      </div>
                    ))}
                  </div>
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

export default Step3Class;