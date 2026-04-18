// src/features/character-sheet/CharacterCreatorForm.tsx
import React, { useState, useEffect } from 'react';
import { fetchSpecies, fetchClasses, createCharacter } from '../../services/api';
import type { Species, DnDClass } from '../../types/api';

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

const CharacterForm: React.FC = () => {
    const [speciesList, setSpeciesList] = useState<Species[]>([]);
    const [classesList, setClassesList] = useState<DnDClass[]>([]);

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
        CHA: 10,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [species, classes] = await Promise.all([
                    fetchSpecies(),
                    fetchClasses(),
                ]);
                setSpeciesList(species);
                setClassesList(classes);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            }
        };
        loadData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await createCharacter({
                name: formData.name,
                species: formData.species,
                background: '',
                classes: [{
                    className: formData.char_class,
                    level: formData.level,
                }],
                abilityScores: {
                    str: formData.STR,
                    dex: formData.DEX,
                    con: formData.CON,
                    int: formData.INT,
                    wis: formData.WIS,
                    cha: formData.CHA,
                },
            });

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
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create character');
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