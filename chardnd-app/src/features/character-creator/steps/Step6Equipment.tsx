// src/features/character-creator/steps/Step6Equipment.tsx

import React, { useState, useEffect } from 'react';
import styles from '../CharacterCreator.module.css';
import ItemModal from '../../Items/ItemModal/ItemModal';
import { fetchItems } from '../../../services/api';
import { PACK_CONTENTS } from '../../../constants'; 

interface Props {
  character: any;
  updateField: (field: string, value: any) => void;
}

const Step6Equipment: React.FC<Props> = ({ character, updateField }) => {
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const items = await fetchItems();
        setAvailableItems(items);
      } catch (err) {
        console.error('Failed to load items:', err);
      } finally {
        setLoading(false);
      }
    };
    loadItems();
  }, []);

  const handleAddItem = (item: any, quantity: number) => {
    const newItem = {
      id: item.id,
      name: item.name,
      quantity,
      isCustom: false,
    };
    updateField('equipment', [...character.equipment, newItem]);
    setIsItemModalOpen(false);
  };

  // ✅ Handle pack: manually add all items with proper IDs
  const handleAddPack = (packName: string) => {
    const itemsToAdd = PACK_CONTENTS[packName] || [];
    const newEquipment = itemsToAdd
      .map(({ name, quantity }) => {
        // Try to find item by name in availableItems
        const foundItem = availableItems.find(item => item.name === name);
        return {
          id: foundItem?.id || undefined,
          name,
          quantity,
          isCustom: false,
        };
      })
      .filter(item => item.id !== undefined); // Only include items that were found in DB
    
    if (newEquipment.length < itemsToAdd.length) {
      console.warn(`⚠️ Not all pack items found in database. Found ${newEquipment.length}/${itemsToAdd.length}`);
    }
    
    updateField('equipment', [...character.equipment, ...newEquipment]);
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
      {/* ... gold input ... */}

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
                readOnly={!item.isCustom}
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
              <button type="button" className={styles.removeBtn} onClick={() => removeItem(i)}>
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
          {loading ? 'Loading...' : '+ Add Existing Item'}
        </button>
      </div>

      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onAddItem={handleAddItem}
        onAddPack={handleAddPack} // ✅ NEW PROP
        availableItems={availableItems}
        characterId={0}
      />
    </div>
  );
};

export default Step6Equipment;