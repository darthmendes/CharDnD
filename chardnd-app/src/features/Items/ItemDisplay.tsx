import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Item } from '../../types/Item';
import { fetchItem } from '../../services/api';


const ItemDisplay: React.FC = () => {
    const { id } = useParams();
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadItem = async () => {
            try {
                const data = await fetchItem(id!);
                setItem(data as Item);
            } catch (err: any) {
                setError(err.message || 'Failed to load item.');
            } finally {
                setLoading(false);
            }
        };

        loadItem();
    }, [id]);

    if (loading) return <p>Loading item...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!item) return <p style={{ color: 'red' }}>No Item found.</p>;
    return (
        <>
            <h1>Item Display</h1>
            <label><strong>Name : </strong>{item.name}</label>
            <label><strong>Rarity : </strong>{item.rarity}</label>
            <label><strong>Description : </strong>{item.desc}</label>
            <label><strong>Type : </strong>{item.item_type}</label>
            <label><strong>Category : </strong>{item.item_category}</label>
        </>
    );
}

export default ItemDisplay;