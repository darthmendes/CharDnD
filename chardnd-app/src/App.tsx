// src/App.tsx
import { useState, useEffect } from 'react';
import CharacterList from './Character/CharacterList';
import HomePage from './components/Homepage';

function App() {
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

  return (
    <>
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