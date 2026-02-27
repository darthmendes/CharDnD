// src/features/character-creator/CharacterCreator.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CharacterCreator.module.css';

// Steps
import Step1Name from './steps/Step1Name';
import Step2Background from './steps/Step2Background';
import Step2Species from './steps/Step2Species';
import Step3Class from './steps/Step3Class';
import Step5Abilities from './steps/Step5AbilityScores';
import Step6Equipment from './steps/Step6Equipment';

// Types & API
import { CharacterData } from './types';
import { createCharacter, fetchSpecies, fetchClasses, fetchBackgrounds } from '../../services/api';

// Define types for fetched data
interface SpeciesOption {
  [key: string]: any;
}

interface ClassOption {
  [key: string]: any;
}

// ✅ Add Background type
interface BackgroundOption {
  [key: string]: any;
}

const CharacterCreator: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [character, setCharacter] = useState<CharacterData>({
    name: '',
    background: '',
    species: '',
    subspecies: '',
    speciesChoices: {},
    speciesLanguages: [],
    classes: [{ className: '', level: 1, subclass: '' }],
    abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    equipment: [],
    gold: 0,
  });

  // Fetch data once on mount
  const [speciesList, setSpeciesList] = useState<SpeciesOption[]>([]);
  const [classList, setClassList] = useState<ClassOption[]>([]);
  const [backgroundList, setBackgroundList] = useState<BackgroundOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [species, classes, backgrounds] = await Promise.all([
          fetchSpecies(),
          fetchClasses(),
          fetchBackgrounds(),
        ]);
        setSpeciesList(Array.isArray(species) ? species : []);
        setClassList(Array.isArray(classes) ? classes : []);
        setBackgroundList(Array.isArray(backgrounds) ? backgrounds : []);
      } catch (err) {
        console.error('Failed to load data:', err);
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

  const updateField = (field: string, value: any) => {
    setCharacter(prev => ({ ...prev, [field]: value }));
  };

  const updateClasses = (classes: any[]) => {
    setCharacter(prev => ({ ...prev, classes }));
  };

  // ✅ Helper function to get all proficiencies
  const getAllProficiencies = () => {
    const skills: string[] = [];
    const weapons: string[] = [];
    const tools: string[] = [];
    const allLanguages: string[] = [];

    // Class proficiencies (ONLY FIRST CLASS)
    if (character.classes && character.classes.length > 0) {
      const classEntry = character.classes[0];
      const classData = classList.find(c => c.name === classEntry.className);
      
      if (classData) {
        // ✅ Add chosen skills from skill_choices (stored in chosenSkills array)
        if (classEntry.chosenSkills && Array.isArray(classEntry.chosenSkills)) {
          for (const skill of classEntry.chosenSkills) {
            if (!skills.includes(skill)) {
              skills.push(skill);
            }
          }
        }
        
        // ✅ Add weapon proficiencies from class
        if (classData.weapon_proficiencies && Array.isArray(classData.weapon_proficiencies)) {
          for (const weapon of classData.weapon_proficiencies) {
            if (!weapons.includes(weapon)) {
              weapons.push(weapon);
            }
          }
        }
        
        // ✅ Add tool proficiencies from class
        if (classData.tool_proficiencies && Array.isArray(classData.tool_proficiencies)) {
          for (const tool of classData.tool_proficiencies) {
            if (!tools.includes(tool)) {
              tools.push(tool);
            }
          }
        }
        
        // ✅ Add armor proficiencies as weapons (for display consistency)
        if (classData.armor_proficiencies && Array.isArray(classData.armor_proficiencies)) {
          for (const armor of classData.armor_proficiencies) {
            if (!weapons.includes(armor)) {
              weapons.push(armor);
            }
          }
        }
      }
    }

    // Background proficiencies
    if (backgroundList.length > 0 && character.background) {
      const backgroundData = backgroundList.find((bg: any) => bg.name === (typeof character.background === 'string' ? character.background : character.background?.name));
      if (backgroundData) {
        if (backgroundData.skill_proficiencies) {
          backgroundData.skill_proficiencies.forEach((skill: string) => skills.push(skill));
        }
        if (backgroundData.tool_proficiencies) {
          backgroundData.tool_proficiencies.forEach((tool: string) => tools.push(tool));
        }
      }
    }

    // ✅ Collect all languages from all sources
    // Background languages
    if (character.backgroundLanguages && Array.isArray(character.backgroundLanguages)) {
      character.backgroundLanguages.forEach((lang: string) => {
        if (!allLanguages.includes(lang)) allLanguages.push(lang);
      });
    }

    // Human guaranteed language (Common)
    if (character.species === 'Human' && !allLanguages.includes('Common')) {
      allLanguages.push('Common');
    }

    // Species chosen languages
    if (character.speciesLanguages && Array.isArray(character.speciesLanguages)) {
      character.speciesLanguages.forEach((lang: string) => {
        if (!allLanguages.includes(lang)) allLanguages.push(lang);
      });
    }

    return { skills, weapons, tools, allLanguages };
  };
  
  const { allLanguages: langList } = getAllProficiencies();
  const allLanguages = langList || [];

  const submitCharacter = async () => {
    try {
      // ✅ Simple validation
      if (!character.name) {
        alert('Please enter a character name');
        return;
      }
      if (!character.species) {
        alert('Please select a species');
        return;
      }
      if (!character.classes || !character.classes[0]?.className) {
        alert('Please select a class');
        return;
      }
      if (!character.abilityScores?.str) {
        alert('Please set ability scores');
        return;
      }

      // ✅ Get all proficiencies for submission
      const { skills, weapons, tools } = getAllProficiencies();
      
      const payload = {
        name: character.name,
        species: character.species,
        subspecies: character.subspecies,
        background: character.background,
        classes: character.classes.map(cls => ({
          className: cls.className,
          level: cls.level,
          subclass: cls.subclass
        })),
        level: character.classes.reduce((sum, c) => sum + c.level, 0),
        xp: 300,
        abilityScores: character.abilityScores,
        proficientSkills: skills,
        proficientWeapons: weapons,
        proficientTools: tools,
        knownLanguages: allLanguages,
        equipment: character.equipment.map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          isCustom: item.isCustom
        }))
      };

      console.log('Submitting payload:', JSON.stringify(payload, null, 2));
      const result = await createCharacter(payload);
      navigate(`/characters/${result.id}`);
    } catch (err) {
      alert('Creation failed: ' + (err as Error).message);
    }
  };

  // Shared props for steps
  const commonProps: any = {
    character,
    updateField,
    updateClasses,
    speciesList,
    dndClasses: classList,
    backgroundList,
  };

  const renderStep = () => {
    if (loading && (step === 3 || step === 5)) {
      return <div className={styles.loading}>Loading options...</div>;
    }

    switch (step) {
      case 1: return <Step1Name {...commonProps} />;
      case 2: return <Step2Background {...commonProps} />;
      case 3: return <Step2Species {...commonProps} />;
      case 4: return <Step3Class {...commonProps} />;
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