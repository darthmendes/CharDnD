// src/features/character-creator/steps/Step2Background.tsx

import React, { useEffect, useState } from 'react';
import styles from '../CharacterCreator.module.css';
import { fetchBackgrounds, fetchLanguages } from '../../../services/api';
import type { Background, Language } from '../../../types/api';

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
    Array.isArray(character.backgroundLanguages) ? character.backgroundLanguages : []
  );
  const [selectedToolChoices, setSelectedToolChoices] = useState<Record<string, string[]>>(
    character.backgroundToolChoices && typeof character.backgroundToolChoices === 'object'
      ? character.backgroundToolChoices
      : {}
  );
  const [selectedEquipmentChoices, setSelectedEquipmentChoices] = useState<Record<string, string[]>>(
    character.backgroundEquipmentChoices && typeof character.backgroundEquipmentChoices === 'object'
      ? character.backgroundEquipmentChoices
      : {}
  );

  useEffect(() => {
    // Fetch backgrounds
    fetchBackgrounds().then((data: any) => {
      setBackgroundList(Array.isArray(data) ? data : data?.data || []);
      setLoading(false);
    });

    // Fetch languages
    fetchLanguages().then((languages) => {
      setLanguageList(languages);
      setLoadingLanguages(false);
    }).catch(err => {
      console.error("Failed to fetch languages:", err);
      setLoadingLanguages(false);
    });
  }, []);

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateField('background', e.target.value);
    setSelectedLanguages([]);
    updateField('backgroundLanguages', []);
    setSelectedToolChoices({});
    updateField('backgroundToolChoices', {});
    setSelectedEquipmentChoices({});
    updateField('backgroundEquipmentChoices', {});
  };

  const handleLanguageChange = (languageName: string, isChecked: boolean) => {
    let newLanguages: string[];
    
    if (isChecked) {
      // Add language (respect max limit)
      const selectedBackground = backgroundList.find(b => b.name === character.background);
      const maxLangs = selectedBackground?.language_choices || 0;
      
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

  const handleToolChoiceChange = (
    group: string,
    option: string,
    count: number,
    isChecked: boolean
  ) => {
    const currentChoices = selectedToolChoices[group] ?? [];
    let newChoices: string[];

    if (isChecked) {
      newChoices = currentChoices.includes(option) || currentChoices.length >= count
        ? currentChoices
        : [...currentChoices, option];
    } else {
      newChoices = currentChoices.filter(choice => choice !== option);
    }

    const updatedChoices = { ...selectedToolChoices, [group]: newChoices };
    setSelectedToolChoices(updatedChoices);
    updateField('backgroundToolChoices', updatedChoices);
  };

  const handleEquipmentChoiceChange = (
    group: string,
    option: string,
    count: number,
    isChecked: boolean
  ) => {
    const currentChoices = selectedEquipmentChoices[group] ?? [];
    const updatedChoices = isChecked
      ? currentChoices.length < count && !currentChoices.includes(option)
        ? [...currentChoices, option]
        : currentChoices
      : currentChoices.filter(choice => choice !== option);
    const updated = { ...selectedEquipmentChoices, [group]: updatedChoices };
    setSelectedEquipmentChoices(updated);
    updateField('backgroundEquipmentChoices', updated);
  };

  const selectedBackground = backgroundList.find(b => b.name === character.background);
  const skillProficiencies = selectedBackground?.skill_proficiencies ?? [];
  const toolProficiencies = selectedBackground?.tool_proficiencies ?? [];
  const toolProficiencyChoices = selectedBackground?.tool_proficiency_choices ?? [];
  const languageChoices = selectedBackground?.language_choices ?? 0;
  const startingEquipment = selectedBackground?.starting_equipment ?? [];
  const equipmentChoices = selectedBackground?.equipment_choices ?? [];
  const toolEquipmentChoiceGroups = new Set(
    selectedBackground?.equipment_tool_choice_groups ?? []
  );

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
          {selectedBackground && languageChoices > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Choose {languageChoices} {languageChoices === 1 ? 'language' : 'languages'}
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
                          selectedLanguages.length >= languageChoices
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

              {selectedBackground.feature_name && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>{selectedBackground.feature_name}</strong>
                  {selectedBackground.feature_description && (
                    <p style={{ margin: '0.5rem 0 0 0' }}>
                      {selectedBackground.feature_description}
                    </p>
                  )}
                </div>
              )}

              {startingEquipment.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Starting Equipment</strong>
                  <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0 0 0' }}>
                    {startingEquipment.map(item => (
                      <li key={item.id}>
                        {item.name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {equipmentChoices.filter(choice => !toolEquipmentChoiceGroups.has(choice.group)).map(choice => {
                const chosenOptions = selectedEquipmentChoices[choice.group] ?? [];
                return (
                  <fieldset key={choice.group} style={{ marginBottom: '1rem' }}>
                    <legend>
                      Choose {choice.count} {choice.group}{choice.count === 1 ? '' : 's'}
                    </legend>
                    {choice.options.map(option => {
                      const isSelected = chosenOptions.includes(option.name);
                      return (
                        <label key={option.id} style={{ display: 'block', margin: '0.25rem 0' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={event => handleEquipmentChoiceChange(
                              choice.group,
                              option.name,
                              choice.count,
                              event.target.checked
                            )}
                            disabled={!isSelected && chosenOptions.length >= choice.count}
                          />
                          {' '}{option.name}
                        </label>
                      );
                    })}
                  </fieldset>
                );
              })}

              {skillProficiencies.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Skill Proficiencies</strong>
                  <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0 0 0' }}>
                    {skillProficiencies.map((skill, idx) => (
                      <li key={idx}>{skill}</li>
                    ))}
                  </ul>
                </div>
              )}

              {toolProficiencies.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Tool Proficiencies</strong>
                  <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0 0 0' }}>
                    {toolProficiencies.map((tool, idx) => (
                      <li key={idx}>{tool}</li>
                    ))}
                  </ul>
                </div>
              )}

              {toolProficiencyChoices.map(choice => {
                const chosenOptions = selectedToolChoices[choice.group] ?? [];
                return (
                  <fieldset key={choice.group} style={{ marginBottom: '1rem' }}>
                    <legend>
                      Choose {choice.count} {choice.group}{choice.count === 1 ? '' : 's'}
                    </legend>
                    {toolEquipmentChoiceGroups.has(choice.group) && (
                      <p style={{ margin: '0.25rem 0' }}>
                        Your selection is also added to your starting equipment.
                      </p>
                    )}
                    {choice.options.map(option => {
                      const isSelected = chosenOptions.includes(option);
                      return (
                        <label key={option} style={{ display: 'block', margin: '0.25rem 0' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={event => handleToolChoiceChange(
                              choice.group,
                              option,
                              choice.count,
                              event.target.checked
                            )}
                            disabled={!isSelected && chosenOptions.length >= choice.count}
                          />
                          {' '}{option}
                        </label>
                      );
                    })}
                  </fieldset>
                );
              })}

              {languageChoices > 0 && (
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
                      Choose {languageChoices} {languageChoices === 1 ? 'language' : 'languages'} from the list on the left.
                    </p>
                  )}
                </div>
              )}

              {typeof selectedBackground.starting_gold === 'number' && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#fff9e6',
                  border: '1px solid #d9c8a9',
                  borderRadius: '4px',
                  fontSize: '0.9em'
                }}>
                  <strong>Starting Gold:</strong> {selectedBackground.starting_gold} gp
                </div>
              )}
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