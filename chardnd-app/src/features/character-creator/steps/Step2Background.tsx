// src/features/character-creator/steps/Step2Background.tsx

import React, { useEffect, useState } from 'react';
import styles from '../CharacterCreator.module.css';
import { fetchBackgrounds, fetchLanguages } from '../../../services/api';

interface Background {
  id: number;
  name: string;
  description: string;
  skill_proficiencies: string[];
  tool_proficiencies: string[];
  languages: number;
  starting_gold_bonus: number;
}

interface Language {
  id: number;
  name: string;
  desc: string;
}

interface Props {
  character: any;
  updateField: (field: string, value: any) => void;
}

const Step2Background: React.FC<Props> = ({ character, updateField }) => {
  const [backgroundList, setBackgroundList] = useState<Background[]>([]);
  const [languageList, setLanguageList] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    character.backgroundLanguages || []
  );

  useEffect(() => {
    // Fetch backgrounds
    fetchBackgrounds().then((data: any) => {
      setBackgroundList(Array.isArray(data) ? data : data?.data || []);
      setLoading(false);
    });

    // Fetch languages
    fetchLanguages().then((languages: Language[]) => {
      setLanguageList(languages);
      setLoadingLanguages(false);
    }).catch(err => {
      console.error("Failed to fetch languages:", err);
      setLoadingLanguages(false);
    });
  }, []);

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateField('background', e.target.value);
    // Reset languages when background changes
    setSelectedLanguages([]);
    updateField('backgroundLanguages', []);
  };

  const handleLanguageChange = (languageName: string, isChecked: boolean) => {
    let newLanguages: string[];
    
    if (isChecked) {
      // Add language (respect max limit)
      const selectedBackground = backgroundList.find(b => b.name === character.background);
      const maxLangs = selectedBackground?.languages || 0;
      
      if (selectedLanguages.length < maxLangs) {
        newLanguages = [...selectedLanguages, languageName];
      } else {
        newLanguages = selectedLanguages;
      }
    } else {
      // Remove language
      newLanguages = selectedLanguages.filter(lang => lang !== languageName);
    }
    
    setSelectedLanguages(newLanguages);
    updateField('backgroundLanguages', newLanguages);
  };

  const selectedBackground = backgroundList.find(b => b.name === character.background);

  // Filter out languages already known from species
  const availableLanguages = languageList.map(lang => lang.name);

  return (
    <div className={styles.formGroup}>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Left: Selector + Language Picker */}
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

          {/* Language Selection */}
          {selectedBackground && selectedBackground.languages > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Choose {selectedBackground.languages} {selectedBackground.languages === 1 ? 'language' : 'languages'}
              </label>
              {loadingLanguages ? (
                <p>Loading languages...</p>
              ) : (
                <div style={{ 
                  maxHeight: '200px', 
                  overflowY: 'auto', 
                  border: '1px solid #d9c8a9', 
                  borderRadius: '4px',
                  padding: '0.5rem'
                }}>
                  {availableLanguages.map(lang => (
                    <label key={lang} style={{ display: 'block', margin: '0.25rem 0' }}>
                      <input
                        type="checkbox"
                        checked={selectedLanguages.includes(lang)}
                        onChange={(e) => handleLanguageChange(lang, e.target.checked)}
                        disabled={
                          !selectedLanguages.includes(lang) && 
                          selectedLanguages.length >= selectedBackground.languages
                        }
                      />
                      {' '} {lang}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
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
                  {selectedLanguages.length > 0 ? (
                    <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0 0 0' }}>
                      {selectedLanguages.map((lang, idx) => (
                        <li key={idx}>{lang}</li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ margin: '0.5rem 0 0 0' }}>
                      Choose {selectedBackground.languages} {selectedBackground.languages === 1 ? 'language' : 'languages'} from the list on the left.
                    </p>
                  )}
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