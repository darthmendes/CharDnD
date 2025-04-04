// src/components/CharacterForm.tsx
import React, { useState, useEffect } from 'react';

interface CharacterFormData {
    name: string;
    species: string; // Selected species
    char_class: string; // Selected class
    level: number;

    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
}

interface Aux {
    id?: number; // Optional ID if your backend provides it
    name: string;
}

const CharacterForm: React.FC = () => {
    const [speciesList, setSpeciesList] = useState<Aux[]>([]);
    const [classesList, setClassesList] = useState<Aux[]>([]);

    const [formData, setFormData] = useState<CharacterFormData>({
        name: '',
        species: '', // Default value for species
        char_class: '', // Default value for class
        level: 1,
        STR: 10,
        DEX: 10,
        CON: 10,
        INT: 10,
        WIS: 10,
        CHA: 10,
    });

    const [loading, setLoading] = useState(false); // Track loading state
    const [error, setError] = useState<string | null>(null); // Track errors

    // Fetch species list
    useEffect(() => {
        fetchSpecies();
        fetchClasses();
    }, []);

    const fetchSpecies = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8001/API/species");
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setSpeciesList(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load species.');
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8001/API/classes");
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setClassesList(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load classes.');
        }
    };

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError(null);

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

            const result = await response.json();
            console.log('Character created successfully:', result);

            // Reset the form after successful submission
            setFormData({
                name: '',
                species: '',
                char_class: '',
                level: 1,
                STR: 10,
                DEX: 10,
                CON: 10,
                INT: 10,
                WIS: 10,
                CHA: 10,
            });
            alert('Character created successfully!');
        } catch (err: any) {
            setError(err.message || 'An error occurred while creating the character.');
            console.error('Error creating character:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="character-form">
            <h2>Create a New Character</h2>

            {/* Name Field */}
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

            {/* Species Dropdown */}
            <label>
                Species:
                <select
                    name="species"
                    value={formData.species}
                    onChange={handleChange}
                    required
                >
                    <option value="" disabled hidden>
                        Select a species
                    </option>
                    {speciesList.map((species) => (
                        <option key={species.name} value={species.name}>
                            {species.name}
                        </option>
                    ))}
                </select>
            </label>

            {/* Class Dropdown */}
            <label>
                Class:
                <select
                    name="char_class"
                    value={formData.char_class}
                    onChange={handleChange}
                    required
                >
                    <option value="" disabled hidden>
                        Select a class
                    </option>
                    {classesList.map((cls) => (
                        <option key={cls.name} value={cls.name}>
                            {cls.name}
                        </option>
                    ))}
                </select>
            </label>

            {/* Level Field */}
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

            {/* Ability Scores */}
            <div>
                Ability Scores:
                <label>
                    Strength:
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

            {/* Submit Button */}
            <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Character'}
            </button>

            {/* Error Message */}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    );
};

export default CharacterForm;