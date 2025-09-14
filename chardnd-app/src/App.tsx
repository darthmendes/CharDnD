// src/App.tsx
import { useState, useEffect } from 'react';
import CharacterList from './features/character-sheet/CharacterList';
import HomePage from './components/Homepage';
import { useNavigate } from 'react-router';

function App() {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState([])

  useEffect(() => {
    fetchCharacters()
  },[])
  const fetchCharacters = async () => {
    const response = await fetch("http://127.0.0.1:8001//API//characters")
    const data = await response.json()
    setCharacters(data)
    console.log(data)
  }

  const goToItemCreator = () => {
    navigate('items/creator');
  }

  return (
    <>
      <header>
        <button onClick={goToItemCreator}>
          Item Creator
        </button>
      </header>
      <div className="app">
        <HomePage />
      </div>
      <div>
        <CharacterList characters={characters}/>
      </div>
    </>
  );
}

export default App;