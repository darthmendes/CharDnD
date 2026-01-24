// src/features/character-creator/steps/Step2Background.tsx

import React, { useEffect, useState } from 'react';
import styles from '../CharacterCreator.module.css';
import { fetchBackgrounds } from '../../../services/api';

interface Background {
  id: number;
  name: string;
  description: string;
  skill_proficiencies: string[];
  tool_proficiencies: string[];
  languages: number;
  starting_gold_bonus: number;
}

interface Props {
  character: any;
  updateField: (field: string, value: any) => void;
}

const Step2Background: React.FC<Props> = ({ character, updateField }) => {
  const [backgroundList, setBackgroundList] = useState<Background[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBackgrounds().then((data: any) => {
      setBackgroundList(Array.isArray(data) ? data : data?.data || []);
      setLoading(false);
    });
  }, []);

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateField('background', e.target.value);
  };

  const selectedBackground = backgroundList.find(b => b.name === character.background);

  return (
    <div className={styles.formGroup}>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Left: Selector */}
        <div style={{ flex: 1, minWidth: '250px' }}>
          <label htmlFor="background-select">Background</label>
          <select
            id="background-select"
            className={styles.select}
            value={character.background}
            onChange={handleBackgroundChange}
            disabled={loading}
          >
            <option value="">-- Choose a background --</option>
            {backgroundList.map(bg => (
              <option key={bg.id} value={bg.name}>
                {bg.name}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Preview Panel */}
        <div style={{
          flex: 2,
          minWidth: '300px',
          backgroundColor: '#fdf6e3',
          border: '1px solid #d9c8a9',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#5a3921' }}>
            {selectedBackground ? `${selectedBackground.name}` : 'Select a background to preview'}
          </h4>

          {selectedBackground ? (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontStyle: 'italic', color: '#7a654f' }}>
                  {selectedBackground.description}
                </p>
              </div>

              {selectedBackground.skill_proficiencies.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Skill Proficiencies</strong>
                  <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0 0 0' }}>
                    {selectedBackground.skill_proficiencies.map((skill, idx) => (
                      <li key={idx}>{skill}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedBackground.tool_proficiencies.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Tool Proficiencies</strong>
                  <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0 0 0' }}>
                    {selectedBackground.tool_proficiencies.map((tool, idx) => (
                      <li key={idx}>{tool}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedBackground.languages > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Languages</strong>
                  <p style={{ margin: '0.5rem 0 0 0' }}>
                    Choose {selectedBackground.languages} {selectedBackground.languages === 1 ? 'language' : 'languages'}
                  </p>
                </div>
              )}

              <div style={{
                padding: '0.75rem',
                backgroundColor: '#fff9e6',
                border: '1px solid #d9c8a9',
                borderRadius: '4px',
                fontSize: '0.9em'
              }}>
                <strong>Starting Gold Bonus:</strong> +{selectedBackground.starting_gold_bonus} gp
              </div>
            </>
          ) : (
            <p>Select a background to see its benefits.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step2Background;
