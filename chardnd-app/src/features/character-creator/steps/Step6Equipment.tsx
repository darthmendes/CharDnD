// src/features/character-creator/steps/Step6Equipment.tsx

import React, { useState, useEffect } from 'react';
import styles from '../CharacterCreator.module.css';
import ItemModal from '../../character-sheet/components/ItemModal/ItemModal';
import { fetchItems } from '../../../services/api'; 

interface Props {
  character: any;
  updateField: (field: string, value: any) => void;
}

const Step6Equipment: React.FC<Props> = ({ character, updateField }) => {
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch items on mount
  useEffect(() => {
    const loadItems = async () => {
      try {
        const items = await fetchItems(); // Returns list of items
        setAvailableItems(items);
      } catch (err) {
        console.error('Failed to load items:', err);
      } finally {
        setLoading(false);
      }
    };
    loadItems();
  }, []);

  // Handle adding selected item from modal
  const handleAddItem = (item: any, quantity: number) => {
    const newItem = {
      id: item.id,
      name: item.name,
      quantity,
      isCustom: false, // ← important: not custom
    };
    updateField('equipment', [...character.equipment, newItem]);
    setIsItemModalOpen(false);
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...character.equipment];
    newItems[index] = { ...newItems[index], [field]: value };
    updateField('equipment', newItems);
  };

  const removeItem = (index: number) => {
    const newItems = character.equipment.filter((_: any, i: number) => i !== index);
    updateField('equipment', newItems);
  };

  return (
    <div>
      <div className={styles.formGroup}>
        <label htmlFor="gold-input">Starting Gold (GP)</label>
        <input
          id="gold-input"
          type="number"
          min="0"
          value={character.gold}
          onChange={(e) => updateField('gold', parseInt(e.target.value) || 0)}
          className={styles.numberInput}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Equipment</label>
        {character.equipment.length === 0 ? (
          <p className={styles.noItems}>No equipment added yet.</p>
        ) : (
          character.equipment.map((item: any, i: number) => (
            <div key={i} className={styles.equipmentItem}>
              <input
                type="text"
                value={item.name}
                readOnly={!item.isCustom} // ← non-custom items are read-only
                onChange={(e) => updateItem(i, 'name', e.target.value)}
                className={styles.input}
                style={{ backgroundColor: item.isCustom ? '#fff' : '#f8f4e9' }}
              />
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
                className={styles.numberInput}
                style={{ width: '80px' }}
              />
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeItem(i)}
              >
                Remove
              </button>
            </div>
          ))
        )}

        <button
          type="button"
          className={styles.inlineActionBtn}
          onClick={() => setIsItemModalOpen(true)}
          disabled={loading}
        >
          {loading ? 'Loading items...' : '+ Add Existing Item'}
        </button>
      </div>

      {/* Item Selection Modal */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onAddItem={handleAddItem}
        availableItems={availableItems}
        characterId={0} // ← dummy ID; adjust if needed
      />
    </div>
  );
};

export default Step6Equipment;