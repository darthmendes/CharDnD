// src/components/CharacterCreator/steps/Step3Class.tsx

import React, { useEffect, useState } from 'react';
import { DnDClass } from '../types';
import { fetchClasses } from '../../../services/api';

interface Props {
  character: { 
    classes: { className: string; subclass?: string }[] 
  };
  updateField: (field: string, value: any) => void;
}

const Step3Class: React.FC<Props> = ({ character, updateField }) => {
  const [classList, setClassList] = useState<DnDClass[]>([]);
  const [subclass, setSubclass] = useState<string>('');

  useEffect(() => {
    fetchClasses().then(setClassList);
  }, []);

  const selectedClass = classList.find(cls => cls.name === character.classes[0]?.className);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const className = e.target.value;
    updateField('classes', [{ className, level: 1 }]);
    setSubclass(''); // reset subclass when class changes
  };

  const handleSubclassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sub = e.target.value;
    setSubclass(sub);
    // Update the first class's subclass
    const updatedClasses = [...character.classes];
    updatedClasses[0] = { ...updatedClasses[0], subclass: sub };
    updateField('classes', updatedClasses);
  };

  return (
    <div>
      <h3>Choose Your Class</h3>
      <label>
        Class:
        <select
          value={character.classes[0]?.className || ''}
          onChange={handleClassChange}
          required
        >
          <option value="">-- Select a class --</option>
          {classList.map(cls => (
            <option key={cls.id} value={cls.name}>
              {cls.name}
            </option>
          ))}
        </select>
      </label>

      {selectedClass?.hasSubclass && (
        <label style={{ display: 'block', marginTop: '1rem' }}>
          Subclass (Archetype):
          <select
            value={subclass}
            onChange={handleSubclassChange}
          >
            <option value="">-- Choose at level 3+ (optional now) --</option>
            {selectedClass.subclasses?.map(sc => (
              <option key={sc} value={sc}>
                {sc}
              </option>
            ))}
          </select>
        </label>
      )}

      {selectedClass?.equipmentOptions && (
        <div style={{ marginTop: '1rem', fontSize: '0.9em', color: '#555' }}>
          <strong>Starting Equipment Options:</strong>
          <ul>
            {selectedClass.equipmentOptions.map((opt, i) => (
              <li key={i}>{opt}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Step3Class;