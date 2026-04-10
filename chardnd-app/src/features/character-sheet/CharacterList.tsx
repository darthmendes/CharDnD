import React from 'react';

interface CharacterSummary {
    id: number;
    name: string;
}

interface Props {
    characters: CharacterSummary[];
}

const CharacterList: React.FC<Props> = ({ characters }) => {
    return (
        <div>
            <h2>Character List</h2>
            <ul>
                {characters.map((character) => (
                    <li key={character.id}>
                        <a href={`/characters/${character.id}`}>{character.name}</a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CharacterList;
