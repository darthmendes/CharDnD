// src/features/character-creator/steps/Step2Species.tsx

import React, { useEffect, useState } from 'react';
import styles from '../CharacterCreator.module.css';
import { fetchSpecies } from '../../../services/api';

// Extend interfaces to include traits/proficiencies
interface Trait {
  id: number;
  name: string;
  description: string;
}

interface Proficiency {
  id: number;
  name: string;
}

interface Language {
  id: number;
  name: string;
}

interface Subspecies {
  id: number;
  name: string;
  ability_bonuses: Record<string, number>;
  hp_bonus_per_level: number;
  movement: Record<string, number> | null;
  darkvision: number | null;
  traits: Trait[];
  guaranteed_proficiencies: Proficiency[];
}

interface Species {
  id: number;
  name: string;
  has_subspecies: boolean;
  subspecies: Subspecies[];
  ability_bonuses: Record<string, number>;
  ability_choices: any[];
  size: string;
  age_adulthood: number;
  lifespan: number;
  alignment_tendency: string;
  movement: Record<string, number>;
  ignore_heavy_armor_speed_penalty: boolean;
  darkvision: number;
  traits: Trait[];
  guaranteed_proficiencies: Proficiency[];
  languages: Language[];
}

interface Props {
  character: any;
  updateField: (field: string, value: any) => void;
}

const Step2Species: React.FC<Props> = ({ character, updateField }) => {
  const [speciesList, setSpeciesList] = useState<Species[]>([]);

  useEffect(() => {
    fetchSpecies().then(setSpeciesList);
  }, []);

  const selectedSpecies = speciesList.find(s => s.name === character.species);
  const selectedSubspecies = selectedSpecies?.subspecies.find(
    s => s.name === character.subspecies
  );

  const handleSpeciesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateField('species', e.target.value);
    updateField('subspecies', '');
    updateField('speciesChoices', {}); // Clear previous species choices
  };

  const handleSubspeciesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateField('subspecies', e.target.value);
  };

  // Handle ability choice selection
  const handleAbilityChoice = (ability: string, isSelected: boolean) => {
    const currentChoices = character.speciesChoices || {};
    const choiceGroup = selectedSpecies?.ability_choices[0];
    const selectedCount = Object.values(currentChoices).filter((v: any) => v > 0).length;
    
    if (isSelected) {
      // Only add if we haven't reached the max choices
      if (selectedCount < choiceGroup?.n_choices) {
        updateField('speciesChoices', {
          ...currentChoices,
          [ability.toLowerCase()]: choiceGroup?.bonus || 1
        });
      }
    } else {
      // Remove the choice
      const newChoices = { ...currentChoices };
      delete newChoices[ability.toLowerCase()];
      updateField('speciesChoices', newChoices);
    }
  };

  const isAbilityChosen = (ability: string) => {
    return character.speciesChoices?.[ability.toLowerCase()] > 0;
  };

  // Helper: Format ability bonuses
  const formatBonuses = (bonuses: Record<string, number>) => {
    return Object.entries(bonuses)
      .map(([ability, value]) => `+${value} ${ability}`)
      .join(', ');
  };

  // Helper: Get final movement
  const getMovement = () => {
    if (selectedSubspecies?.movement) return selectedSubspecies.movement;
    return selectedSpecies?.movement || { walk: 30 };
  };

  // Helper: Get final darkvision
  const getDarkvision = () => {
    if (selectedSubspecies?.darkvision !== null && selectedSubspecies?.darkvision !== undefined) {
      return selectedSubspecies.darkvision;
    }
    return selectedSpecies?.darkvision || 0;
  };

  // Combine traits from species and subspecies
  const allTraits = [
    ...(selectedSpecies?.traits || []),
    ...(selectedSubspecies?.traits || [])
  ];

  // Combine proficiencies
  const allProficiencies = [
    ...(selectedSpecies?.guaranteed_proficiencies || []),
    ...(selectedSubspecies?.guaranteed_proficiencies || [])
  ];

  return (
    <div className={styles.formGroup}>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Left: Selectors */}
        <div style={{ flex: 1, minWidth: '250px' }}>
          <label htmlFor="species-select">Species</label>
          <select
            id="species-select"
            className={styles.select}
            value={character.species}
            onChange={handleSpeciesChange}
          >
            <option value="">-- Choose a species --</option>
            {speciesList.map(species => (
              <option key={species.id} value={species.name}>
                {species.name}
              </option>
            ))}
          </select>

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
                {selectedSpecies.subspecies.map((sub) => (
                  <option key={sub.id} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </>
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
            {selectedSpecies ? `Preview: ${selectedSpecies.name}` : 'Select a species to preview'}
          </h4>

          {selectedSpecies ? (
            <>
              {/* Base Species Summary */}
              <div style={{ marginBottom: '1.5rem' }}>
                <strong>{selectedSpecies.name}</strong>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                  {Object.keys(selectedSpecies.ability_bonuses).length > 0 && (
                    <li>+{formatBonuses(selectedSpecies.ability_bonuses)}</li>
                  )}
                  {selectedSpecies.ability_choices.length > 0 && (
                    <li>
                      Choose {selectedSpecies.ability_choices[0].n_choices} abilities to +{selectedSpecies.ability_choices[0].bonus}
                    </li>
                  )}
                  {selectedSpecies.ability_choices.length > 0 && (
                    <li style={{ listStyle: 'none', marginTop: '1rem' }}>
                      {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map(ability => (
                        <label key={ability} style={{ display: 'block', marginBottom: '0.5rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isAbilityChosen(ability)}
                            onChange={(e) => handleAbilityChoice(ability, e.target.checked)}
                            disabled={!isAbilityChosen(ability) && Object.values(character.speciesChoices || {}).filter((v: any) => v > 0).length >= selectedSpecies.ability_choices[0].n_choices}
                            style={{ marginRight: '0.5rem' }}
                          />
                          {ability}
                        </label>
                      ))}
                    </li>
                  )}
                  <li>Size: {selectedSpecies.size}</li>
                  <li>Speed: {getMovement().walk} ft</li>
                  {getDarkvision() > 0 && <li>Darkvision: {getDarkvision()} ft</li>}
                  {selectedSpecies.ignore_heavy_armor_speed_penalty && (
                    <li>Speed not reduced by heavy armor</li>
                  )}
                  {selectedSpecies.languages.length > 0 && (
                    <li>Languages: {selectedSpecies.languages.map(l => l.name).join(', ')}</li>
                  )}
                </ul>
              </div>

              {/* Subspecies Summary */}
              {selectedSubspecies && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <strong>{selectedSubspecies.name}</strong>
                  <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                    {Object.keys(selectedSubspecies.ability_bonuses).length > 0 && (
                      <li>+{formatBonuses(selectedSubspecies.ability_bonuses)}</li>
                    )}
                    {selectedSubspecies.hp_bonus_per_level > 0 && (
                      <li>+{selectedSubspecies.hp_bonus_per_level} HP per level</li>
                    )}
                    {selectedSubspecies.movement && (
                      <li>Speed: {selectedSubspecies.movement.walk} ft</li>
                    )}
                    {selectedSubspecies.darkvision !== null && selectedSubspecies.darkvision !== undefined && selectedSubspecies.darkvision > 0 && (
                      <li>Darkvision: {selectedSubspecies.darkvision} ft</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Proficiencies */}
              {allProficiencies.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <strong>Proficiencies</strong>
                  <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                    {allProficiencies.map(prof => (
                      <li key={prof.id}>{prof.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Traits */}
              {allTraits.length > 0 && (
                <div>
                  <strong>Racial Traits</strong>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.95em' }}>
                    {allTraits.map(trait => (
                      <div key={trait.id} style={{ marginBottom: '0.8rem' }}>
                        <em>{trait.name}</em>: {trait.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Age/Lifespan */}
              <div style={{ marginTop: '1rem', fontSize: '0.9em', color: '#7a654f' }}>
                <em>
                  Adulthood: {selectedSpecies.age_adulthood} years • Lifespan: ~{selectedSpecies.lifespan} years
                </em>
              </div>
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