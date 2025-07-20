
// Example: Fetching a single character in a component
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Character } from '../types/Character';


const ClassList = ({ classes }) => {
    return  <ul>
                {classes.map((dndclass) => (
                    <li>
                        {dndclass.name} {dndclass.level}
                    </li>
                ))}
            </ul>
};
const AbsScores = ({ abilityScores }) => {
    const abilityOrder = [
        "strength", "dexterity", "constitution",
        "intelligence", "wisdom", "charisma"
    ];
        return <ul>
                    {abilityOrder.map((ability) => {
                        const score = abilityScores[ability];
                        const modifier = Math.floor((score - 10) / 2);  // D&D modifier formula
                        return (
                            <li key={ability}>
                                {ability}: {score} (Modifier: {modifier >= 0 ? `+${modifier}` : modifier})
                            </li>
                        );
                    })}
                </ul>
};
const ProficiencyList = ({ proficiencies }) => {
    return  <>
            Proficiencies
            </>;
};


const CharacterDisplay: React.FC = () => {
    const { id } = useParams();
    const [character, setCharacter] = useState<Character | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Navigation buttons 
    const navigate = useNavigate()
    const goToMain = () => {
        navigate("/");
    }
    const goToItemCreator = () => {
        navigate("/items/creator");
    }

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
        <>
            <header>
                <button onClick={goToMain}>Home</button>
                <button onClick={goToItemCreator}>Item Creator</button>
            </header>
            <h1>{character.name}</h1>
            <div><h2><strong>Species:</strong></h2>
                <label><strong>Species:</strong> {character.species}</label>
                <label><strong>Level:</strong> {character.level}</label>
                <label><strong>XP:</strong> {character.xp}</label>
                <label><strong>Class:</strong>
                    <ClassList classes={character.char_class}/></label>
                <div><strong>Ability Scores:</strong>
                    <AbsScores abilityScores={character.abilityScores}/> 
                </div>
                <div><strong>Proficiencies:</strong>
                    <ProficiencyList proficiencies={character.proficiencies}></ProficiencyList>
                </div>
                <div><strong>Languages:</strong>
                </div>
                <div><strong>Features:</strong>
                </div>
            </div>
            <div><h2><strong>SpellCasting:</strong></h2>
            </div>
            <div><h2><strong>Inventory:</strong></h2>
                <button>Inventory</button>
            </div>
            <div><h2><strong>Combat</strong></h2>
            </div>
        </>
    );
};

export default CharacterDisplay;