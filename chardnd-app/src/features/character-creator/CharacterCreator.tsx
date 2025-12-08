// src/features/character-creator/CharacterCreator.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CharacterCreator.module.css';

// Steps
import Step1Name from './steps/Step1Name';
import Step2Species from './steps/Step2Species';
import Step3Class from './steps/Step3Class';
import Step4Level from './steps/Step4Level';
import Step5Abilities from './steps/Step5AbilityScores';
import Step6Equipment from './steps/Step6Equipment';

// Types & API
import { CharacterData } from './types';
import { createCharacter, fetchSpecies, fetchClasses } from '../../services/api';

// Define types for fetched data
interface SpeciesOption {
  id: number;
  name: string;
  hasSubrace?: boolean;
  subraces?: string[];
}

interface ClassOption {
  id: number;
  name: string;
  hasSubclass?: boolean;
  subclasses?: string[];
  equipmentOptions?: string[];
}

const CharacterCreator: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [character, setCharacter] = useState<CharacterData>({
    name: '',
    species: '',
    speciesChoices: {},
    classes: [{ className: '', level: 1, subclass: '' }],
    abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    equipment: [],
    gold: 0,
  });

  // Fetch data once on mount
  const [speciesList, setSpeciesList] = useState<SpeciesOption[]>([]);
  const [classList, setClassList] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [species, classes] = await Promise.all([
          fetchSpecies(),
          fetchClasses(),
        ]);
        setSpeciesList(species);
        setClassList(classes);
      } catch (err) {
        console.error('Failed to load species or classes:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalSteps = 6;

  const nextStep = () => step < totalSteps && setStep(step + 1);
  const prevStep = () => step > 1 && setStep(step - 1);
  const goToMain = () => navigate('/');
  const goToItemCreator = () => navigate('/items/creator');

  const updateField = (field: keyof CharacterData, value: any) => {
    setCharacter(prev => ({ ...prev, [field]: value }));
  };

  const updateClasses = (classes: any[]) => {
    setCharacter(prev => ({ ...prev, classes }));
  };

  const submitCharacter = async () => {
    try {
      const payload = {
        name: character.name,
        species: character.species,
        char_class: character.classes[0].className,
        level: character.classes.reduce((sum, c) => sum + c.level, 0),
        STR: character.abilityScores.str,
        DEX: character.abilityScores.dex,
        CON: character.abilityScores.con,
        INT: character.abilityScores.int,
        WIS: character.abilityScores.wis,
        CHA: character.abilityScores.cha,
      };

      const result = await createCharacter(payload);
      navigate(`/characters/${result.id}`);
    } catch (err) {
      alert('Creation failed: ' + (err as Error).message);
    }
  };

  // Shared props for steps
  const commonProps = {
    character,
    updateField,
    updateClasses,
    speciesList,
    dndClasses: classList,
  };

  const renderStep = () => {
    if (loading && (step === 2 || step === 3 || step === 4)) {
      return <div className={styles.loading}>Loading options...</div>;
    }

    switch (step) {
      case 1: return <Step1Name {...commonProps} />;
      case 2: return <Step2Species {...commonProps} />;
      case 3: return <Step3Class {...commonProps} />;
      case 4: return <Step4Level {...commonProps} />;
      case 5: return <Step5Abilities {...commonProps} />;
      case 6: return <Step6Equipment {...commonProps} />;
      default: return null;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button onClick={goToMain} className={styles.button}>Home</button>
        <button onClick={goToItemCreator} className={styles.button}>Item Creator</button>
      </header>

      <div className={styles.header}>
        <h2>Create Your Hero</h2>
        <p>Step {step} of {totalSteps}</p>
      </div>

      {/* Step indicator dots */}
      <div className={styles.stepIndicator}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`${styles.stepDot} ${i + 1 === step ? styles.active : ''}`}
          />
        ))}
      </div>

      {/* Step content */}
      <div>{renderStep()}</div>

      {/* Navigation buttons */}
      <div className={styles.controls}>
        {step > 1 && (
          <button className={styles.backBtn} onClick={prevStep}>
            ← Back
          </button>
        )}
        {step < totalSteps ? (
          <button className={styles.nextBtn} onClick={nextStep}>
            Next →
          </button>
        ) : (
          <button className={styles.createBtn} onClick={submitCharacter}>
            Create Character
          </button>
        )}
      </div>
    </div>
  );
};

export default CharacterCreator;