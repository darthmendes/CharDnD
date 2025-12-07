// Class-based equipment + custom items + gold

import React from 'react';
import { EquipmentItem } from '../types';

interface Props {
  character: { equipment: EquipmentItem[]; gold: number };
  updateField: (field: string, value: any) => void;
}

const Step6Equipment: React.FC<Props> = ({ character, updateField }) => {
  const addCustomItem = () => {
    const newItem: EquipmentItem = { name: '', quantity: 1, isCustom: true };
    updateField('equipment', [...character.equipment, newItem]);
  };

  const updateItem = (index: number, field: keyof EquipmentItem, value: string | number) => {
    const newItems = [...character.equipment];
    newItems[index] = { ...newItems[index], [field]: value };
    updateField('equipment', newItems);
  };

  return (
    <div>
      <h3>Starting Gold</h3>
      <input
        type="number"
        value={character.gold}
        onChange={e => updateField('gold', parseInt(e.target.value) || 0)}
        placeholder="Gold Pieces (GP)"
      />

      <h3>Equipment</h3>
      {character.equipment.map((item, i) => (
        <div key={i}>
          <input
            type="text"
            value={item.name}
            onChange={e => updateItem(i, 'name', e.target.value)}
            placeholder="Item name"
          />
          <input
            type="number"
            value={item.quantity}
            onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
            min="1"
          />
        </div>
      ))}
      <button onClick={addCustomItem}>+ Add Custom Item</button>
    </div>
  );
};


export default Step6Equipment;