import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Item } from '../../types/Item';


const ItemDisplay : React.FC = () => {
    const { id } = useParams();
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchItem = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8001/API/items/${id}`);
            if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            console.log(data)
            setItem(data as Item);
        } catch (err: any) {
            setError(err.message || 'Failed to load item.');
        } finally {
            setLoading(false);
        }
        };

        fetchItem();
    }, [id]);

    if (loading) return <p>Loading item...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!item) return <p style={{color:'red'}}>No Item found.</p>;
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