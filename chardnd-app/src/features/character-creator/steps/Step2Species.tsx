// src/features/character-creator/steps/Step2Species.tsx

import React, { useEffect, useState } from 'react';
import styles from '../CharacterCreator.module.css';
import { fetchSpecies } from '../../../services/api';

interface Species {
  id: number;
  name: string;
  hasSubrace?: boolean;
  subraces?: string[];
}

interface Props {
  character: any;
  updateField: (field: string, value: any) => void;
}

const Step2Species: React.FC<Props> = ({ character, updateField }) => {
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [subrace, setSubrace] = useState('');

  useEffect(() => {
    fetchSpecies().then(setSpeciesList);
  }, []);

  const selectedSpecies = speciesList.find(s => s.name === character.species);

  return (
    <div>
      <div className={styles.formGroup}>
        <label htmlFor="species-select">Species</label>
        <select
          id="species-select"
          className={styles.select}
          value={character.species}
          onChange={e => {
            updateField('species', e.target.value);
            setSubrace(''); // reset subrace
          }}
        >
          <option value="">-- Choose a species --</option>
          {speciesList.map(species => (
            <option key={species.id} value={species.name}>
              {species.name}
            </option>
          ))}
        </select>
      </div>

      {selectedSpecies?.hasSubrace && (
        <div className={styles.formGroup}>
          <label htmlFor="subrace-select">Subrace</label>
          <select
            id="subrace-select"
            className={styles.select}
            value={subrace}
            onChange={e => {
              setSubrace(e.target.value);
              updateField('speciesChoices', { ...character.speciesChoices, subrace: e.target.value });
            }}
          >
            <option value="">-- Choose a subrace --</option>
            {selectedSpecies.subraces?.map(sr => (
              <option key={sr} value={sr}>{sr}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default Step2Species;