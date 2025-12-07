// src/components/CharacterCreator/CharacterCreator.tsx

import React, { useState } from 'react';
import { CharacterData, AbilityScores, CharacterClassLevel } from './types';
import Step1Name from "./steps/Step1Name";
import Step2Species from "./steps/Step2Species";
import Step3Class from "./steps/Step3Class";
import Step4Level from "./steps/Step4Level";
import Step5Abilities from "./steps/Step5AbilityScores";
import Step6Equipment from "./steps/Step6Equipment";
import { createCharacter } from '../../services/api';

const CharacterCreator: React.FC = () => {
  const [step, setStep] = useState(1);
  const [character, setCharacter] = useState<CharacterData>({
    name: '',
    species: '',
    speciesChoices: {},
    classes: [{ className: '', level: 1 }],
    abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    equipment: [],
    gold: 0,
  });

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const updateField = (field: keyof CharacterData, value: any) => {
    setCharacter(prev => ({ ...prev, [field]: value }));
  };

  const updateClasses = (classes: CharacterClassLevel[]) => {
    setCharacter(prev => ({ ...prev, classes }));
  };

  const submitCharacter = async () => {
    try {
      // Prepare payload for your backend
      const payload = {
        name: character.name,
        species: character.species,
        char_class: character.classes[0].className, // for now, single class
        level: character.classes.reduce((sum, c) => sum + c.level, 0),
        STR: character.abilityScores.str,
        DEX: character.abilityScores.dex,
        CON: character.abilityScores.con,
        INT: character.abilityScores.int,
        WIS: character.abilityScores.wis,
        CHA: character.abilityScores.cha,
        // Add equipment/gold later via separate API calls
      };

      await createCharacter(payload);
      alert('Character created successfully!');
    } catch (err) {
      alert('Failed to create character: ' + (err as Error).message);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1Name character={character} updateField={updateField} />;
      case 2: return <Step2Species character={character} updateField={updateField} />;
      case 3: return <Step3Class character={character} updateField={updateField} />;
      case 4: return <Step4Level character={character} updateClasses={updateClasses} />;
      case 5: return <Step5Abilities character={character} updateField={updateField} />;
      case 6: return <Step6Equipment character={character} updateField={updateField} />;
      default: return null;
    }
  };

  return (
    <div className="character-creator">
      <h2>Create D&D Character (Step {step} of 6)</h2>
      {renderStep()}
      <div className="wizard-controls">
        {step > 1 && <button onClick={prevStep}>Back</button>}
        {step < 6 ? (
          <button onClick={nextStep}>Next</button>
        ) : (
          <button onClick={submitCharacter}>Create Character</button>
        )}
      </div>
    </div>
  );
};

export default CharacterCreator;