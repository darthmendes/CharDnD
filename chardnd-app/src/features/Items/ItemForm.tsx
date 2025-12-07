// ItemForm.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 

interface ItemFormData {
  name: string;
  desc: string;
  weight: number;
  cost: number;
  item_type: string;
  item_category: string;
  rarity: string;
}

const ItemForm: React.FC = () => {
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    desc: '',
    weight: 0,
    cost: 0,
    item_type: '',
    item_category: '',
    rarity: 'common',
  });

  const navigate = useNavigate();
  const location = useLocation(); // 📌 Get current URL/query params

  // Extract returnTo from query params (e.g., ?returnTo=/characters/5)
  const queryParams = new URLSearchParams(location.search);
  const returnTo = queryParams.get('returnTo');

  const goToMain = () => {
    navigate('/');
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'weight' || name === 'cost' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://127.0.0.1:8001/API/items/creator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const newItem = await response.json(); // Backend should return the created item
      console.log('Item created successfully:', newItem);
      if (returnTo) {
        try {
            let targetPath;

            // If returnTo is a full URL, extract pathname
            if (/^https?:\/\//.test(returnTo)) {
            const urlObj = new URL(returnTo);
            targetPath = urlObj.pathname;
            } else {
            targetPath = returnTo; // It's already a relative path like "/characters/1"
            }

            // ✅ Use navigate() directly with search params
            const searchParams = new URLSearchParams();
            searchParams.set('newItem', JSON.stringify(newItem));

            navigate(`${targetPath}?${searchParams.toString()}`, { replace: true });
        } catch (err) {
            console.error('Invalid returnTo:', returnTo);
            alert('Failed to add item automatically. Please re-open the character and add it manually.');
            navigate('/'); // Fallback home
        }
        } else {
        alert('Item created successfully!');
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
      setError(err.message || 'An error occurred while creating the item.');
      console.error('Error creating item:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header>
        <button onClick={goToMain}>Home</button>
      </header>

      <form onSubmit={handleSubmit} className="character-form">
        <h1>Item Creator</h1>

        <div>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <div>
            Description:
            <input
              name="desc"
              value={formData.desc}
              onChange={handleChange}
              placeholder="Enter Description here..."
            />
          </div>

          <label>
            Weight:
            <input
              type="number"
              step="0.01"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
            />
          </label>

          <label>
            Cost:
            <input
              type="number"
              step="0.01"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
            />
          </label>

          <label>
            Type:
            <input
              type="text"
              name="item_type"
              value={formData.item_type}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Category:
            <input
              type="text"
              name="item_category"
              value={formData.item_category}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Rarity:
            <select name="rarity" value={formData.rarity} onChange={handleChange} required>
              <option value="" disabled>
                Select rarity
              </option>
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="legendary">Legendary</option>
              <option value="mythic">Mythic</option>
            </select>
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Item'}
        </button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </>
  );
};

export default ItemForm;