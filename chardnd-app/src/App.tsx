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

  return (
    <>
      <nav>
        <button onClick={() => navigate('items/creator')}>Item Creator</button>
        <button onClick={() => navigate('characters/creator')}>Character Creator</button>
        <button onClick={() => navigate('monsters/creator')}>Monster Creator</button>
      </nav>
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