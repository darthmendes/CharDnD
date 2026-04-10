// src/App.tsx
import { useState, useEffect } from 'react';
import CharacterList from './features/character-sheet/CharacterList';
import HomePage from './components/Homepage';
import { useNavigate } from 'react-router';
import { fetchAllCharacters } from './services/api';

interface CharacterSummary {
  id: number;
  name: string;
}

function App() {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      const data = await fetchAllCharacters();
      setCharacters(data);
    } catch (err) {
      console.error('Failed to fetch characters:', err);
    }
  };

  const goToItemCreator = () => {
    navigate('items/creator');
  }

  const goToCharacterCreator = () => {
    navigate('characters/creator');
  }

  return (
    <>
      <header>
        <button onClick={goToItemCreator}>
          Item Creator
        </button>
        <button onClick={goToCharacterCreator}>
          Character Creator
        </button>
      </header>
      <div className="app">
        <HomePage />
      </div>
      <div>
        <CharacterList characters={characters} />
      </div>
    </>
  );
}

export default App;