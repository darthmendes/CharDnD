
// Example: Fetching a single character in a component
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Character } from '../types/Character';

const CharacterDisplay: React.FC = () => {
    const { id } = useParams();
    const [character, setCharacter] = useState<Character | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCharacter = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8001/API/characters/${id}`);
            if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            console.log(data)
            setCharacter(data as Character);
        } catch (err: any) {
            setError(err.message || 'Failed to load character.');
        } finally {
            setLoading(false);
        }
        };

        fetchCharacter();
    }, [id]);

    if (loading) return <p>Loading character...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!character) return <p>No character found.</p>;

    return (
        <div>
            <h1>{character.name}</h1>
            <p><strong>Species:</strong> {character.species}</p>
            <p><strong>Class:</strong> {character.char_class}</p>
            <p><strong>Level:</strong> {character.level}</p>
            <div><strong>Ability Scores:</strong> 
                <p>Strenght: {character.abilityScores.strenght}</p>
                <p>Constitution: {character.abilityScores.constitution}</p>
                <p>Dexterity: {character.abilityScores.dexterity}</p>
                <p>Intelligence: {character.abilityScores.intelligence}</p>
                <p>Wisdom: {character.abilityScores.wisdom}</p>
                <p>Charisma: {character.abilityScores.charisma}</p>
            </div>
        </div>
    );
};

export default CharacterDisplay;