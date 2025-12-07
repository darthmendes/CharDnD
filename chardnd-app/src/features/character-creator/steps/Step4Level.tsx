// Allow adding multiple classes with level sliders

import React from 'react';
import { CharacterClassLevel } from '../types';

interface Props {
  character: { classes: CharacterClassLevel[] };
  updateClasses: (classes: CharacterClassLevel[]) => void;
}

const Step4Level: React.FC<Props> = ({ character, updateClasses }) => {
  const totalLevel = character.classes.reduce((sum, c) => sum + c.level, 0);

  const addClass = () => {
    updateClasses([...character.classes, { className: '', level: 1 }]);
  };

  const updateClass = (index: number, field: keyof CharacterClassLevel, value: string | number) => {
    const newClasses = [...character.classes];
    newClasses[index] = { ...newClasses[index], [field]: value };
    updateClasses(newClasses);
  };

  const removeClass = (index: number) => {
    const newClasses = character.classes.filter((_, i) => i !== index);
    updateClasses(newClasses);
  };

  return (
    <div>
      <h3>Total Level: {totalLevel} (Max 20)</h3>
      {character.classes.map((cls, i) => (
        <div key={i} className="class-entry">
          <select
            value={cls.className}
            onChange={e => updateClass(i, 'className', e.target.value)}
          >
            <option value="">-- Class --</option>
            {/* Populate from /API/classes */}
          </select>
          <input
            type="number"
            min="1"
            max={20 - (totalLevel - cls.level)}
            value={cls.level}
            onChange={e => updateClass(i, 'level', parseInt(e.target.value) || 1)}
          />
          {character.classes.length > 1 && (
            <button onClick={() => removeClass(i)}>Remove</button>
          )}
        </div>
      ))}
      {totalLevel < 20 && (
        <button onClick={addClass}>Add Class (Multiclass)</button>
      )}
    </div>
  );
};


export default Step4Level;