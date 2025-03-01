const CharacterList = ({ characters }) => {
    return  <div>
                <h2>Character List</h2>
                <ul>
                    {characters.map((character) => (
                        <li>
                            <a href={`http://127.0.0.1:8001//API//characters//${character.id}`} key={character.id}>{character.name}</a>
                        </li>
                    ))}
                </ul>
            </div>
}

export default CharacterList
