// src/features/character-creator/steps/Step2Species.tsx

import React, { useEffect, useState } from 'react';
import styles from '../CharacterCreator.module.css';

interface Species {
  id: number;
  name: string;
  description?: string;
  ability_bonuses: Record<string, number>;
  ability_choices: any[];
  size: string;
  age_adulthood: number;
  lifespan: number;
  alignment_tendency: string;
  movement: Record<string, number>;
  ignore_heavy_armor_speed_penalty: boolean;
  darkvision: number;
  has_subspecies: boolean;
  subspecies: any[];
  guaranteed_proficiencies: any[];
  optional_proficiencies: any[];
  traits: any[];
  languages: any[];
  optional_languages: any[]; // ✅ Language choice groups
}

interface Props {
  character: any;
  updateField: (field: string, value: any) => void;
  speciesList?: Species[];
}

const Step2Species: React.FC<Props> = ({ character, updateField, speciesList = [] }) => {
  const [loading, setLoading] = useState(true);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    character.speciesLanguages || []
  );

  useEffect(() => {
    if (speciesList.length > 0) {
      setLoading(false);
    }
  }, [speciesList]);

  const handleSpeciesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateField('species', e.target.value);
    // Reset subspecies and languages when species changes
    updateField('subspecies', '');
    setSelectedLanguages([]);
    updateField('speciesLanguages', []);
  };

  const handleSubspeciesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateField('subspecies', e.target.value);
  };

  // ✅ Handle species language selection (mimics background logic)
  const handleLanguageChange = (languageName: string, isChecked: boolean) => {
    let newLanguages: string[];
    
    if (isChecked) {
      // Add language (respect max limit)
      const maxLangs = languageOptions?.n_choices || 0;
      
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
    updateField('speciesLanguages', newLanguages);
  };

  const safeArray = (arr: any) => Array.isArray(arr) ? arr : [];

  const selectedSpecies = speciesList.find(s => s.name === character.species);

  // ✅ Extract language options from traits (e.g., "Extra Language" trait)
  const getLanguageOptionsFromTraits = () => {
    if (!selectedSpecies?.traits) return null;
    
    const languageTraits = selectedSpecies.traits.filter((trait: any) => 
      trait.name && (trait.name.includes('Language') || trait.name.includes('language'))
    );
    
    if (languageTraits.length === 0) return null;
    
    // Parse description to extract language options
    const languageTrait = languageTraits[0];
    const description = languageTrait.description || '';
    
    // Try to extract available languages from description
    // Example: "You can speak, read, and write Common and one extra language of your choice."
    const parseLanguageCount = (desc: string) => {
      const matches = desc.match(/(\d+|\w+)\s+extra\s+language/i) || desc.match(/choose\s+(\d+|\w+)\s+language/i);
      return matches ? (isNaN(Number(matches[1])) ? 1 : Number(matches[1])) : 1;
    };
    
    const count = parseLanguageCount(description);
    
    return {
      name: languageTrait.name,
      description: description,
      n_choices: count,
      allLanguages: [
        "Common",
        "Dwarvish", "Elvish", "Giant", "Gnomish", "Goblin", "Halfling",
        "Orc", "Abyssal", "Celestial", "Draconic", "Deep Speech", "Infernal",
        "Primordial", "Sylvan", "Undercommon"
      ]
    };
  };

  // ✅ Get available languages for species
  const getSpeciesAvailableLanguages = () => {
    const allLanguages = [
      "Dwarvish", "Elvish", "Giant", "Gnomish", "Goblin", "Halfling",
      "Orc", "Abyssal", "Celestial", "Draconic", "Deep Speech", "Infernal",
      "Primordial", "Sylvan", "Undercommon"
    ];
    
    // Remove languages already known from species guaranteed languages
    const guaranteedLangs = selectedSpecies?.languages?.map(l => l.name) || [];
    return allLanguages.filter(lang => !guaranteedLangs.includes(lang));
  };

  const languageOptions = getLanguageOptionsFromTraits();

  return (
    <div className={styles.formGroup}>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Left: Selector */}
        <div style={{ flex: 1, minWidth: '250px' }}>
          <label htmlFor="species-select">Species</label>
          <select
            id="species-select"
            className={styles.select}
            value={character.species}
            onChange={handleSpeciesChange}
            disabled={loading}
          >
            <option value="">-- Choose a species --</option>
            {speciesList.map(species => (
              <option key={species.id} value={species.name}>
                {species.name}
              </option>
            ))}
          </select>

          {/* Subspecies Selector */}
          {selectedSpecies?.has_subspecies && (
            <>
              <label htmlFor="subspecies-select" style={{ marginTop: '1rem' }}>
                Subspecies
              </label>
              <select
                id="subspecies-select"
                className={styles.select}
                value={character.subspecies || ''}
                onChange={handleSubspeciesChange}
              >
                <option value="">-- Choose a subspecies --</option>
                {safeArray(selectedSpecies.subspecies).map(sub => (
                  <option key={sub.id} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* Species Language Selection */}
          {selectedSpecies && (languageOptions || (selectedSpecies.optional_languages && selectedSpecies.optional_languages.length > 0)) && (
            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                {languageOptions 
                  ? `Choose ${languageOptions.n_choices} ${languageOptions.n_choices === 1 ? 'language' : 'languages'}`
                  : selectedSpecies.optional_languages 
                    ? `Choose languages`
                    : 'Choose languages'
                }
              </label>
              {languageOptions && (
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#6b4423' }}>
                  {languageOptions.description}
                </p>
              )}
              <div style={{ 
                maxHeight: '200px', 
                overflowY: 'auto', 
                border: '1px solid #d9c8a9', 
                borderRadius: '4px',
                padding: '0.5rem'
              }}>
                {(() => {
                  const allLangs = languageOptions 
                    ? languageOptions.allLanguages
                    : getSpeciesAvailableLanguages();
                  const maxSelectableLanguages = languageOptions 
                    ? languageOptions.n_choices 
                    : (selectedSpecies.optional_languages?.reduce((sum: number, group: any) => sum + group.n_choices, 0) || 0);
                  
                  return allLangs.length > 0 ? (
                    allLangs.map(lang => (
                      <label key={lang} style={{ display: 'block', margin: '0.25rem 0' }}>
                        <input
                          type="checkbox"
                          checked={selectedLanguages.includes(lang)}
                          onChange={(e) => handleLanguageChange(lang, e.target.checked)}
                          disabled={
                            !selectedLanguages.includes(lang) && 
                            selectedLanguages.length >= maxSelectableLanguages
                          }
                        />
                        {' '} {lang}
                      </label>
                    ))
                  ) : (
                    <p style={{ margin: '0.25rem 0', color: '#999', fontStyle: 'italic' }}>All available languages already known</p>
                  );
                })()}
              </div>
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
            {selectedSpecies ? `${selectedSpecies.name}` : 'Select a species to preview'}
          </h4>

          {selectedSpecies ? (
            <>
              {/* Ability Bonuses */}
              {Object.keys(selectedSpecies.ability_bonuses).length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Ability Score Bonuses</strong>
                  <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0 0 0' }}>
                    {Object.entries(selectedSpecies.ability_bonuses).map(([ability, bonus]) => (
                      <li key={ability}>{ability}: +{bonus}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Size & Physical Traits */}
              <div style={{ marginBottom: '1rem' }}>
                <strong>Size:</strong> {selectedSpecies.size}<br />
                <strong>Age of Adulthood:</strong> {selectedSpecies.age_adulthood}<br />
                <strong>Lifespan:</strong> {selectedSpecies.lifespan} years<br />
                {selectedSpecies.alignment_tendency && (
                  <>
                    <strong>Alignment Tendency:</strong> {selectedSpecies.alignment_tendency}<br />
                  </>
                )}
                {selectedSpecies.darkvision > 0 && (
                  <>
                    <strong>Darkvision:</strong> {selectedSpecies.darkvision} ft<br />
                  </>
                )}
              </div>

              {/* Traits */}
              {safeArray(selectedSpecies.traits).length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Racial Traits</strong>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.95em' }}>
                    {safeArray(selectedSpecies.traits).map(trait => (
                      <div key={trait.id} style={{ marginBottom: '0.8rem' }}>
                        <em>{trait.name}</em>: {trait.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {selectedSpecies && (selectedSpecies.languages?.length > 0 || selectedSpecies.optional_languages?.length > 0 || languageOptions) && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Languages</strong>
                  {(selectedSpecies.languages && selectedSpecies.languages.length > 0) || selectedSpecies.name === 'Human' ? (
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong style={{ fontSize: '0.9rem' }}>Known:</strong>
                      <ul style={{ paddingLeft: '1.2rem', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                        {selectedSpecies.name === 'Human' && (
                          <li>Common</li>
                        )}
                        {selectedSpecies.languages && selectedSpecies.languages.map((lang: any) => (
                          <li key={lang.id}>{lang.name}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  
                  {languageOptions && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong style={{ fontSize: '0.9rem' }}>Extra Language:</strong>
                      <div style={{ paddingLeft: '1.2rem', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                        <em>You can choose {languageOptions.n_choices} extra language(s)</em>
                      </div>
                      
                      {selectedLanguages.length > 0 && (
                        <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#e8f5e9', borderRadius: '3px' }}>
                          <strong style={{ fontSize: '0.85rem' }}>Selected:</strong>
                          <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                            {selectedLanguages.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {selectedSpecies.optional_languages && selectedSpecies.optional_languages.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong style={{ fontSize: '0.9rem' }}>Choose:</strong>
                      <ul style={{ paddingLeft: '1.2rem', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                        {selectedSpecies.optional_languages.map((group: any, idx: number) => (
                          <li key={idx}>
                            {group.n_choices} from: {group.options.map((opt: any) => opt.name).join(', ')}
                          </li>
                        ))}
                      </ul>
                      
                      {selectedLanguages.length > 0 && (
                        <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#e8f5e9', borderRadius: '3px' }}>
                          <strong style={{ fontSize: '0.85rem' }}>Selected:</strong>
                          <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                            {selectedLanguages.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {/* Proficiencies */}
              {selectedSpecies && (selectedSpecies.guaranteed_proficiencies?.length > 0 || selectedSpecies.optional_proficiencies?.length > 0) && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Proficiencies</strong>
                  {selectedSpecies.guaranteed_proficiencies && selectedSpecies.guaranteed_proficiencies.length > 0 && (
                    <div>
                      <strong>Guaranteed:</strong>
                      <ul style={{ paddingLeft: '1.2rem', margin: '0.25rem 0 0 0' }}>
                        {selectedSpecies.guaranteed_proficiencies.map((prof: any) => (
                          <li key={prof.id}>{prof.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedSpecies.optional_proficiencies && selectedSpecies.optional_proficiencies.length > 0 && (
                    <div>
                      <strong>Choose from:</strong>
                      {selectedSpecies.optional_proficiencies.map((group: any, idx: number) => (
                        <div key={idx} style={{ marginLeft: '1rem' }}>
                          Choose {group.n_choices} from: {group.options.map((opt: any) => opt.name).join(', ')}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <p>Select a species to see its benefits.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step2Species;