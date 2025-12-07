// Fetch species from /API/species, show dropdown + dynamic options

import React, { useEffect, useState } from 'react';
import { Species } from '../types';
import { fetchSpecies } from '../../../services/api';

const Step2Species: React.FC<{ character: any; updateField: any }> = ({ character, updateField }) => {
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [subrace, setSubrace] = useState('');

  useEffect(() => {
    fetchSpecies().then(setSpeciesList);
  }, []);

  const selectedSpecies = speciesList.find(s => s.name === character.species);
  
  return (
    <div>
      <label>
        Species:
        <select value={character.species} onChange={e => updateField('species', e.target.value)}>
          <option value="">-- Select --</option>
          {speciesList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
      </label>

      {selectedSpecies?.hasSubrace && (
        <label>
          Subrace:
          <select value={subrace} onChange={e => setSubrace(e.target.value)}>
            <option value="">-- Choose --</option>
            {selectedSpecies.subraces?.map(sr => <option key={sr} value={sr}>{sr}</option>)}
          </select>
        </label>
      )}
    </div>
  );
};

export default Step2Species;