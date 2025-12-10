// src/features/item-creator/ItemForm.tsx

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../../character-creator/CharacterCreator.module.css';

// ✅ Official D&D 5e item types — no "None"
const VALID_ITEM_TYPES = [
  "Armor",
  "Potion",
  "Ring",
  "Rod",
  "Scroll",
  "Staff",
  "Tool",
  "Wand",
  "Weapon",
  "Wondrous Item"
] as const;

// ✅ Allow empty string for unselected state
type ItemType = typeof VALID_ITEM_TYPES[number] | '';

interface ItemFormData {
  name: string;
  desc: string;
  weight: number;
  cost: number;
  item_type: ItemType;
  item_category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythic';
}

const ItemForm: React.FC = () => {
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    desc: '',
    weight: 0,
    cost: 0,
    item_type: '', // ✅ Start empty
    item_category: '',
    rarity: 'common',
  });

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const returnTo = queryParams.get('returnTo');

  const goToMain = () => navigate('/');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'weight' || name === 'cost'
          ? parseFloat(value) || 0
          : value,
    }));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // Block minus sign (-), underscore (_), and e/E (scientific notation)
  if (e.key === '-' || e.key === '_' || e.key === 'e' || e.key === 'E') {
    e.preventDefault();
  }
};
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ⚠️ Ensure type is selected (required field)
    if (!formData.item_type) {
      setError('Please select an item type.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://127.0.0.1:8001/API/items/creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const newItem = await response.json();
      console.log('Item created:', newItem);

      if (returnTo) {
        try {
          let targetPath = returnTo.startsWith('http') 
            ? new URL(returnTo).pathname 
            : returnTo;
          
          const searchParams = new URLSearchParams();
          searchParams.set('newItem', JSON.stringify(newItem));
          navigate(`${targetPath}?${searchParams.toString()}`, { replace: true });
        } catch (err) {
          console.error('Invalid returnTo:', returnTo);
          alert('Failed to auto-add item. Please add manually.');
          navigate('/');
        }
      } else {
        alert('✅ Item created successfully!');
        // ✅ Reset to empty (shows placeholder)
        setFormData({
          name: '',
          desc: '',
          weight: 0,
          cost: 0,
          item_type: '',
          item_category: '',
          rarity: 'common',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create item.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button onClick={goToMain} className={styles.button}>
          Home
        </button>
      </header>

      <div className={styles.header}>
        <h2>Create New Item</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className={styles.formGroup}>
          <label htmlFor="item-name">Name</label>
          <input
            id="item-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="item-desc">Description</label>
          <input
            id="item-desc"
            name="desc"
            value={formData.desc}
            onChange={handleChange}
            className={styles.input}
            placeholder="e.g., A fiery longsword that deals extra fire damage..."
          />
        </div>

        <div className={styles.formGroup}>
          <label>Weight & Cost</label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <label htmlFor="item-weight" style={{ display: 'block', marginBottom: '0.3rem' }}>
                Weight (lbs)
              </label>
              <input
                id="item-weight"
                type="number"
                min="0"
                step="0.01"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={styles.numberInput}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <label htmlFor="item-cost" style={{ display: 'block', marginBottom: '0.3rem' }}>
                Cost (gp)
              </label>
              <input
                id="item-cost"
                type="number"
                min="0"
                step="1"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={styles.numberInput}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="item-type">Type</label>
          <select
            id="item-type"
            name="item_type"
            value={formData.item_type}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="" disabled>
              Select item type
            </option>
            {VALID_ITEM_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="item-category">Category</label>
          <input
            id="item-category"
            type="text"
            name="item_category"
            value={formData.item_category}
            onChange={handleChange}
            className={styles.input}
            placeholder="e.g., Longsword, Chain Mail, Ring of Protection"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="item-rarity">Rarity</label>
          <select
            id="item-rarity"
            name="rarity"
            value={formData.rarity}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="legendary">Legendary</option>
            <option value="mythic">Mythic</option>
          </select>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.controls}>
          <button
            type="submit"
            className={styles.createBtn}
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Creating...' : 'Create Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItemForm;