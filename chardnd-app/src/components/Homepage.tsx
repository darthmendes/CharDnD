// src/components/HomePage.tsx
import React, { useState } from 'react';
import CharacterCreatorForm from './CharacterCreatorForm';

const HomePage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  const handleShowForm = () => {
    setShowForm(!showForm); // Toggle the form visibility
  };

  return (
    <div className="home-page">
      <h1>Welcome to the D&D Character Creator</h1>
      <button onClick={handleShowForm}>
        {showForm ? 'Home Page' : 'Create Character'}
      </button>

      {/* Conditionally render the CharacterForm */}
      {showForm && <CharacterCreatorForm />}
    </div>
  );
};

export default HomePage;