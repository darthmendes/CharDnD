import React, { useState } from 'react';

interface ItemFormData {
    name : string;
    desc: string;
    weight: number;
    cost : number;
    item_type: string;
    item_category: string;
    rarity : string;
};

const ItemForm : React.FC = () => {
    const [formData, setFormData] = useState<ItemFormData>({
        name : '',
        desc: '',
        weight: 0,
        cost : 0,
        item_type: '',
        item_category: '',
        rarity : 'common'
    });

    const [loading, setLoading] = useState(false); // Track loading state
    const [error, setError] = useState<string | null>(null); // Track errors
    
    // Handle Input Changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name] : value,
        }));
    }

    // Handle Submission
    const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
    
            try {
                setLoading(true);
                setError(null);
    
                // Prepare the data to send
                const response = await fetch('http://127.0.0.1:8001/API/items/creator', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
    
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
    
                const result = await response.json();
                console.log('Item created successfully:', result);
    
                // Reset the form after successful submission
                setFormData(formData);
                alert('Item created successfully!');
            } catch (err: any) {
                setError(err.message || 'An error occurred while creating the item.');
                console.error('Error creating item:', err);
            } finally {
                setLoading(false);
            }
        };

    return (
        <form onSubmit={handleSubmit} className="character-form">
        <h1>Item Creator</h1>
        <div>
            <label>
                Name:
                <input  type='text'
                        name='name'
                        value={formData.name}
                        onChange={handleChange}
                        required
                /> 
            </label>
            <div>
                Description:
                <input name='desc' onChange={handleChange} placeholder='Enter Description here...'/>
            </div>
            <label>
                Weight:
                <input  type='number'
                        step='0.01'
                        name='weight'
                        value={formData.weight}
                        onChange={handleChange}
                /> 
            </label>
            <label>
                Cost:
                <input  type='number'
                        step='0.01'
                        name='cost'
                        value={formData.cost}
                        onChange={handleChange}
                /> 
            </label>
            <label>
                Type:
                <input  type='text'
                        name='item_type'
                        value={formData.item_type}
                        onChange={handleChange}
                        required
                /> 
            </label>
            <label>
                Category:
                <input  type='text'
                        name='item_category'
                        value={formData.item_category}
                        onChange={handleChange}
                        required
                /> 
            </label>
            <label>
                Rarity:
                <select
                    name="rarity"
                    onChange={handleChange}
                    required
                >
                    <option value="" disabled selected>Select rarity</option>
                    <option value='common'>Common</option>
                    <option value='uncommon'>Uncommon</option>
                    <option value='rare'>Rare</option>
                    <option value='legendary'>Legendary</option>
                    <option value='mythic'>Mythic</option>
                </select>
            </label>
        </div>
        {/* Submit Button */}
        <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Item'}
        </button>

        {/* Error Message */}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    );
};

export default ItemForm;