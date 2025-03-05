// src/components/CharacterForm.tsx
import React, { useState, useEffect } from 'react';

interface CharacterFormData {
    name: string;
    species: string;
    char_class: string;
    level: number;

    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;


}

interface SpecieAux {
    name: string
}
const CharacterForm: React.FC = () => {  
    const [speciesList, setSpeciesList] = useState<SpecieAux[]>([])

    useEffect(() => {
        fetchSpecies()
    },[])
    const fetchSpecies = async () => {
        const response = await fetch("http://127.0.0.1:8001//API//species")
        const data = await response.json()
        setSpeciesList(data)
        console.log(data)
    }
    const [formData, setFormData] = useState<CharacterFormData>({
        name: '',
        species: '',
        char_class: '',
        level: 1,
        STR: 10,
        DEX: 10,
        CON: 10,
        INT: 10,
        WIS: 10,
        CHA: 10
    });

    
  const [loading, setLoading] = useState(false); // Track loading state
  const [error, setError] = useState<string | null>(null); // Track errors
  const proxy_url = import.meta.env.PROXY_URL; 

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
        ...prevData,
        [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting character:', formData);
        // Here you can send the formData to the backend via an API call  const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true); // Set loading state to true
            setError(null); // Clear any previous errors

            // Prepare the data to send
            const response = await fetch('http://127.0.0.1:8001/API/characters/creator', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json(); // Parse the response as JSON
            console.log('Character created successfully:', result);

            // Optionally, reset the form after successful submission
            setFormData({   name: '',
                            species: '',
                            char_class: '',
                            level: 1,
                            STR: 10,
                            DEX: 10,
                            CON: 10,
                            INT: 10,
                            WIS: 10,
                            CHA: 10});
            alert('Character created successfully!');
        } catch (err: any) {
            setError(err.message || 'An error occurred while creating the character.');
            console.error('Error creating character:', err);
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    return (
        <form onSubmit={handleSubmit} className="character-form">
        <h2>Create a New Character</h2>

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
        <label>
            Species:
            <select name="species" id="species">
                {speciesList.map(({name}) => (
                    <option value={name}>{name}</option>))}
            </select>
            {/* <input
            type="text"
            name="species"
            value={formData.species}
            onChange={handleChange}
            required
            /> */}
        </label>

        <label>
            Class:
            <input
            type="text"
            name="char_class"
            value={formData.char_class}
            onChange={handleChange}
            required
            />
        </label>

        <label>
            Level:
            <input
            type="number"
            name="level"
            value={formData.level}
            onChange={handleChange}
            min={1}
            max={20}
            required
            />
        </label>

        <div>
            Ability Scores:
            <label>
                Strenght:
                <input
                type="number"
                name="STR"
                value={formData.STR}
                onChange={handleChange}
                min={1}
                max={20}
                required
                />
            </label>
            <label>
                Dexterity:
                <input
                type="number"
                name="DEX"
                value={formData.DEX}
                onChange={handleChange}
                min={1}
                max={20}
                required
                />
            </label>
            <label>
                Constitution:
                <input
                type="number"
                name="CON"
                value={formData.CON}
                onChange={handleChange}
                min={1}
                max={20}
                required
                />
            </label>
            <label>
                Intelligence:
                <input
                type="number"
                name="INT"
                value={formData.INT}
                onChange={handleChange}
                min={1}
                max={20}
                required
                />
            </label>
            <label>
                Wisdom:
                <input
                type="number"
                name="WIS"
                value={formData.WIS}
                onChange={handleChange}
                min={1}
                max={20}
                required
                />
            </label>
            <label>
                Charisma:
                <input
                type="number"
                name="CHA"
                value={formData.CHA}
                onChange={handleChange}
                min={1}
                max={20}
                required
                />
            </label>
        </div>
        <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Character'}
        </button>
        </form>
    );
};

export default CharacterForm;