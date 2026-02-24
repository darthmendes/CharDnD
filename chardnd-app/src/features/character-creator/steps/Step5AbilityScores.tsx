// src/features/character-creator/steps/Step5AbilityScores.tsx

import React from 'react';
import styles from '../CharacterCreator.module.css';

interface Props {
  character: any;
  updateField: (field: string, value: any) => void;
  speciesList?: any[];
  dndClasses?: any[];
  backgroundList?: any[];
}

const Step5AbilityScores: React.FC<Props> = ({ character, updateField, speciesList = [], dndClasses = [], backgroundList = [] }) => {
  const abilities = [
    { key: 'str', label: 'Strength (STR)' },
    { key: 'dex', label: 'Dexterity (DEX)' },
    { key: 'con', label: 'Constitution (CON)' },
    { key: 'int', label: 'Intelligence (INT)' },
    { key: 'wis', label: 'Wisdom (WIS)' },
    { key: 'cha', label: 'Charisma (CHA)' },
  ];

  // ✅ Get species and subspecies bonuses
  const selectedSpecies = speciesList.find(s => s.name === character.species);
  const selectedSubspecies = selectedSpecies?.subspecies?.find(
    (sub: any) => sub.name === character.subspecies
  );

  const abilityBonuses: Record<string, number> = {};

  // Add species bonuses
  if (selectedSpecies?.ability_bonuses) {
    Object.entries(selectedSpecies.ability_bonuses).forEach(([ability, bonus]) => {
      const key = ability.toLowerCase();
      abilityBonuses[key] = (abilityBonuses[key] || 0) + (bonus as number);
    });
  }

  // ✅ Add subspecies bonuses
  if (selectedSubspecies?.ability_bonuses) {
    Object.entries(selectedSubspecies.ability_bonuses).forEach(([ability, bonus]) => {
      const key = ability.toLowerCase();
      abilityBonuses[key] = (abilityBonuses[key] || 0) + (bonus as number);
    });
  }

  // Add species ability choices (e.g., Human chooses +1 to 2 abilities)
  if (character.speciesChoices && selectedSpecies?.ability_choices) {
    Object.entries(character.speciesChoices).forEach(([key, value]) => {
      if (typeof value === 'number' && value > 0) {
        abilityBonuses[key.toLowerCase()] = (abilityBonuses[key.toLowerCase()] || 0) + value;
      }
    });
  }

  // Calculate final ability scores and modifiers
  const getFinalAbilityScore = (baseKey: string) => {
    const baseScore = character.abilityScores[baseKey] || 10;
    const totalBonus = (abilityBonuses[baseKey] || 0);
    return baseScore + totalBonus;
  };

  const getAbilityModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

  // Calculate proficiency bonus based on total level
  const getTotalCharacterLevel = () => {
    if (character.classes && character.classes.length > 0) {
      return character.classes.reduce((sum: number, c: any) => sum + (c.level || 1), 0);
    }
    return character.level || 1;
  };

  const getProficiencyBonus = () => {
    const level = getTotalCharacterLevel();
    if (level <= 4) return 2;
    if (level <= 8) return 3;
    if (level <= 12) return 4;
    if (level <= 16) return 5;
    return 6;
  };

  const proficiencyBonus = getProficiencyBonus();

  const calculateRecommendedHitPoints = () => {
    let hp = 0;
    const conMod = getAbilityModifier(getFinalAbilityScore('con'));
    
    if (character.classes && character.classes.length > 0) {
      character.classes.forEach((cls: any, index: number) => {
        const classData = dndClasses.find(c => c.name === cls.className);
        if (classData) {
          const hitDie = classData.hit_dice;
          if (index === 0) {
            // First class: full hit die + CON mod
            hp += hitDie + Math.max(conMod, 0);
          } else {
            // Multiclass: average hit die + CON mod
            const avgHitDie = Math.floor(hitDie / 2) + 1;
            hp += avgHitDie + Math.max(conMod, 0);
          }
          // Remaining levels: average hit die + CON mod
          if (cls.level > 1) {
            const avgHitDie = Math.floor(hitDie / 2) + 1;
            hp += (cls.level - 1) * (avgHitDie + Math.max(conMod, 0));
          }
        }
      });
    } else {
      const hitDie = 10;
      hp = hitDie + Math.max(getAbilityModifier(getFinalAbilityScore('con')), 0);
    }
    
    return Math.max(1, hp);
  };

  // For MAX HP with all maximum rolls (rare, but possible)
  const calculateAbsoluteMaxHitPoints = () => {
    let hp = 0;
    const conMod = getAbilityModifier(getFinalAbilityScore('con'));
    
    if (character.classes && character.classes.length > 0) {
      character.classes.forEach((cls: any) => {
        const classData = dndClasses.find(c => c.name === cls.className);
        if (classData) {
          const hitDie = classData.hit_dice;
          // All levels: maximum hit die + CON mod
          hp += cls.level * (hitDie + Math.max(conMod, 0));
        }
      });
    } else {
      const hitDie = 10;
      hp = hitDie + Math.max(getAbilityModifier(getFinalAbilityScore('con')), 0);
    }
    
    return Math.max(1, hp);
  };

  const recommendedHitPoints = calculateRecommendedHitPoints();
  const absoluteMaxHitPoints = calculateAbsoluteMaxHitPoints();
  const currentHitPoints = character.hitPoints || recommendedHitPoints;

  // Get hit dice info for display
  const getHitDiceInfo = () => {
    const hitDice: string[] = [];
    
    if (character.classes && character.classes.length > 0) {
      character.classes.forEach((cls: any) => {
        const classData = dndClasses.find(c => c.name === cls.className);
        if (classData) {
          hitDice.push(`${cls.level}d${classData.hit_dice}`);
        }
      });
    }
    
    return hitDice.join(' + ') || '1d10';
  };

  // Handle HP change
  const handleHitPointsChange = (value: string) => {
    const num = parseInt(value) || 1;
    const clamped = Math.min(absoluteMaxHitPoints, Math.max(1, num));
    updateField('hitPoints', clamped);
  };

  // Set to recommended HP
  const setRecommendedHP = () => {
    updateField('hitPoints', recommendedHitPoints);
  };

  // Set to absolute max HP
  const setMaxHP = () => {
    updateField('hitPoints', absoluteMaxHitPoints);
  };

  // ✅ CORRECTED: Only first class grants proficiencies (skills, weapons, tools)
  const getAllProficiencies = () => {
    const skills: Set<string> = new Set();
    const weapons: Set<string> = new Set();
    const tools: Set<string> = new Set();
    const languages: Set<string> = new Set();

    // Species proficiencies (always apply)
    if (selectedSpecies) {
      if (selectedSpecies.guaranteed_proficiencies) {
        selectedSpecies.guaranteed_proficiencies.forEach((prof: any) => {
          if (prof.name && prof.name.includes('Skill: ')) {
            skills.add(prof.name.replace('Skill: ', ''));
          } else if (prof.name && !prof.name.includes('Saving Throw: ')) {
            tools.add(prof.name);
          }
        });
      }
    }

    // Class proficiencies (ONLY FIRST CLASS)
    if (character.classes && character.classes.length > 0) {
      const firstClass = character.classes[0];
      const classData = dndClasses.find(c => c.name === firstClass.className);
      
      if (classData) {
        // Chosen skills from first class only
        if (firstClass.chosenSkills && firstClass.chosenSkills.length > 0) {
          firstClass.chosenSkills.forEach((skill: string) => skills.add(skill));
        }
        
        // Other proficiencies from first class only
        if (classData.guaranteed_proficiencies) {
          classData.guaranteed_proficiencies.forEach((prof: any) => {
            if (prof.name && prof.name.includes('Skill: ')) {
              skills.add(prof.name.replace('Skill: ', ''));
            } else if (prof.name && prof.name.includes('Weapon')) {
              weapons.add(prof.name);
            } else if (prof.name && !prof.name.includes('Saving Throw: ')) {
              tools.add(prof.name);
            }
          });
        }
        
        // Armor/weapon proficiencies from first class only
        if (classData.armor_proficiencies) {
          classData.armor_proficiencies.forEach((armor: string) => weapons.add(armor));
        }
        if (classData.weapon_proficiencies) {
          classData.weapon_proficiencies.forEach((weapon: string) => weapons.add(weapon));
        }
        if (classData.tool_proficiencies) {
          classData.tool_proficiencies.forEach((tool: string) => tools.add(tool));
        }
      }
    }

    // Background proficiencies (always apply)
    if (backgroundList.length > 0 && character.background) {
      const backgroundData = backgroundList.find((bg: any) => bg.name === character.background);
      if (backgroundData) {
        if (Array.isArray(backgroundData.skill_proficiencies)) {
          backgroundData.skill_proficiencies.forEach((skill: string) => {
            if (typeof skill === 'string') {
              skills.add(skill);
            }
          });
        }
        if (Array.isArray(backgroundData.tool_proficiencies)) {
          backgroundData.tool_proficiencies.forEach((tool: string) => {
            if (typeof tool === 'string') {
              tools.add(tool);
            }
          });
        }
      }
    }

    // Background languages
    if (character.backgroundLanguages && character.backgroundLanguages.length > 0) {
      character.backgroundLanguages.forEach((lang: string) => languages.add(lang));
    }

    // Species guaranteed languages
    if (character.species) {
      const speciesData = speciesList.find(s => s.name === character.species);
      
      // Human always speaks Common
      if (character.species === 'Human') {
        languages.add('Common');
      }
      
      if (speciesData?.languages && Array.isArray(speciesData.languages)) {
        speciesData.languages.forEach((lang: any) => {
          const langName = typeof lang === 'string' ? lang : lang.name;
          if (langName) languages.add(langName);
        });
      }
    }

    // Species chosen languages (optional)
    if (character.speciesLanguages && character.speciesLanguages.length > 0) {
      character.speciesLanguages.forEach((lang: string) => languages.add(lang));
    }

    return { skills: Array.from(skills), weapons: Array.from(weapons), tools: Array.from(tools), languages: Array.from(languages) };
  };

  const { skills: proficientSkills, weapons: proficientWeapons, tools: proficientTools, languages: knownLanguages } = getAllProficiencies();

  // ✅ CORRECTED: Only first class grants saving throw proficiencies
  const getSavingThrowProficiencies = () => {
    const saves: Set<string> = new Set();
    
    // Only check the FIRST class for saving throws
    if (character.classes && character.classes.length > 0) {
      const firstClass = character.classes[0];
      const classData = dndClasses.find(c => c.name === firstClass.className);
      if (classData?.saving_throws) {
        classData.saving_throws.forEach((save: string) => {
          saves.add(save.toLowerCase());
        });
      }
    }
    
    return Array.from(saves);
  };

  const proficientSavingThrows = getSavingThrowProficiencies();

  // Helper: Map skills to abilities
  const getSkillAbility = (skillName: string): string => {
    const skillMap: Record<string, string> = {
      'Acrobatics': 'dex',
      'Animal Handling': 'wis',
      'Arcana': 'int',
      'Athletics': 'str',
      'Deception': 'cha',
      'History': 'int',
      'Insight': 'wis',
      'Intimidation': 'cha',
      'Investigation': 'int',
      'Medicine': 'wis',
      'Nature': 'int',
      'Perception': 'wis',
      'Performance': 'cha',
      'Persuasion': 'cha',
      'Religion': 'int',
      'Sleight of Hand': 'dex',
      'Stealth': 'dex',
      'Survival': 'wis'
    };
    return skillMap[skillName] || 'varies';
  };

  // All possible skills for display
  const allSkills = [
    'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception',
    'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine',
    'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion',
    'Sleight of Hand', 'Stealth', 'Survival'
  ];

  const handleAbilityChange = (key: string, value: string) => {
    const num = parseInt(value) || 10;
    const clamped = Math.min(30, Math.max(1, num));
    const newScores = { ...character.abilityScores, [key]: clamped };
    updateField('abilityScores', newScores);
  };

  const applyStandardArray = () => {
    const standard = [15, 14, 13, 12, 10, 8];
    const shuffled = [...standard].sort(() => 0.5 - Math.random());
    const newScores = {
      str: shuffled[0],
      dex: shuffled[1],
      con: shuffled[2],
      int: shuffled[3],
      wis: shuffled[4],
      cha: shuffled[5],
    };
    updateField('abilityScores', newScores);
  };

  return (
    <div>
      <div className={styles.formGroup}>
        <label>Ability Scores (1–30)</label>
        <button
          type="button"
          className={styles.inlineActionBtn}
          onClick={applyStandardArray}
          style={{ marginBottom: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.95rem' }}
        >
          Use Standard Array (15,14,13,12,10,8)
        </button>

        <div className={styles.abilityScores}>
          {abilities.map(ability => {
            const score = character.abilityScores[ability.key];
            const modifier = Math.floor((score - 10) / 2);
            const displayMod = modifier >= 0 ? `+${modifier}` : `${modifier}`;
            
            // ✅ Calculate bonuses breakdown
            const speciesBonus = selectedSpecies?.ability_bonuses?.[ability.key.toUpperCase()] || 0;
            const subspeciesBonus = selectedSubspecies?.ability_bonuses?.[ability.key.toUpperCase()] || 0;
            const choiceBonus = (character.speciesChoices?.[ability.key] || 0);
            const totalBonus = speciesBonus + subspeciesBonus + choiceBonus;
            
            const finalScore = score + totalBonus;
            const finalModifier = Math.floor((finalScore - 10) / 2);
            const displayFinalMod = finalModifier >= 0 ? `+${finalModifier}` : `${finalModifier}`;
            
            return (
              <div key={ability.key} className={styles.abilityItem}>
                <label>{ability.label}</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={score}
                  onChange={e => handleAbilityChange(ability.key, e.target.value)}
                  className={styles.numberInput}
                />
                <div style={{ fontSize: '0.85em' }}>
                  <div className={styles.modifier}>Base: {score} (Mod: {displayMod})</div>
                  {totalBonus !== 0 && (
                    <>
                      {speciesBonus !== 0 && (
                        <div style={{ color: '#5a3921', fontSize: '0.9em' }}>
                          Species: +{speciesBonus}
                        </div>
                      )}
                      {subspeciesBonus !== 0 && (
                        <div style={{ color: '#5a3921', fontSize: '0.9em' }}>
                          Subspecies: +{subspeciesBonus}
                        </div>
                      )}
                      {choiceBonus !== 0 && (
                        <div style={{ color: '#5a3921', fontSize: '0.9em' }}>
                          Choice: +{choiceBonus}
                        </div>
                      )}
                      <div style={{ color: '#2d5016', fontWeight: 'bold', fontSize: '0.95em', marginTop: '0.25rem' }}>
                        Final: {finalScore} (Mod: {displayFinalMod})
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hit Points Section with Manual Control */}
        <div className={styles.formGroup} style={{ marginTop: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#5a3921' }}>Hit Points</h3>
          
          <div style={{ 
            backgroundColor: '#fdf6e3', 
            border: '1px solid #d9c8a9', 
            borderRadius: '8px', 
            padding: '1rem'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Hit Dice:</strong> {getHitDiceInfo()}
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label htmlFor="hitpoints-input">Current Hit Points</label>
                <input
                  id="hitpoints-input"
                  type="number"
                  min="1"
                  max={absoluteMaxHitPoints}
                  value={currentHitPoints}
                  onChange={e => handleHitPointsChange(e.target.value)}
                  className={styles.input}
                  style={{ width: '100%' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={setRecommendedHP}
                  className={styles.inlineActionBtn}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  Recommended ({recommendedHitPoints})
                </button>
                <button
                  type="button"
                  onClick={setMaxHP}
                  className={styles.inlineActionBtn}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  Max ({absoluteMaxHitPoints})
                </button>
              </div>
            </div>
            
            <div style={{ marginTop: '1rem', fontSize: '0.9em', color: '#7a654f' }}>
              <p style={{ margin: '0.25rem 0' }}>
                <strong>Recommended:</strong> First class: full hit die, subsequent levels/classes: average rolls + CON modifier
              </p>
              <p style={{ margin: '0.25rem 0' }}>
                <strong>Maximum:</strong> Rolling maximum on all hit dice + CON modifier (rare in practice)
              </p>
            </div>
          </div>
        </div>

        {/* Proficiency Bonus Display */}
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          backgroundColor: '#f0e6d2', 
          border: '1px solid #d9c8a9', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#5a3921' }}>
            Proficiency Bonus: +{proficiencyBonus}
          </h3>
          <p style={{ margin: 0, fontSize: '0.9em', color: '#7a654f' }}>
            Based on total character level: {getTotalCharacterLevel()}
          </p>
        </div>

        {/* ✅ SAVING THROWS: Only from first class */}
        <div className={styles.formGroup} style={{ marginTop: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#5a3921' }}>Saving Throws</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '0.5rem'
          }}>
            {abilities.map(ability => {
              const isProficient = proficientSavingThrows.includes(ability.key);
              const finalScore = getFinalAbilityScore(ability.key);
              const abilityMod = getAbilityModifier(finalScore);
              const totalMod = abilityMod + (isProficient ? proficiencyBonus : 0);
              const displayMod = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;
              
              return (
                <div 
                  key={ability.key} 
                  style={{ 
                    padding: '0.5rem', 
                    border: '1px solid #d9c8a9', 
                    borderRadius: '4px',
                    backgroundColor: isProficient ? '#f0e6d2' : '#fdf6e3'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isProficient ? (
                      <span style={{ 
                        width: '12px', 
                        height: '12px', 
                        backgroundColor: '#2d5016', 
                        borderRadius: '50%',
                        display: 'inline-block'
                      }}></span>
                    ) : (
                      <span style={{ 
                        width: '12px', 
                        height: '12px', 
                        backgroundColor: '#ccc', 
                        borderRadius: '50%',
                        display: 'inline-block'
                      }}></span>
                    )}
                    <strong>{ability.key.toUpperCase()}</strong>
                  </div>
                  <div style={{ fontSize: '0.85em', color: '#7a654f', marginTop: '0.25rem' }}>
                    {displayMod}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.85em', color: '#7a654f' }}>
            <em>Saving throw proficiencies come only from your first class.</em>
          </div>
        </div>

        {/* Skills Section */}
        <div className={styles.formGroup} style={{ marginTop: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#5a3921' }}>Skills</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '0.5rem'
          }}>
            {allSkills.map(skill => {
              const ability = getSkillAbility(skill);
              const finalScore = getFinalAbilityScore(ability);
              const abilityMod = getAbilityModifier(finalScore);
              const totalMod = abilityMod + (proficientSkills.includes(skill) ? proficiencyBonus : 0);
              const displayMod = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;
              
              return (
                <div 
                  key={skill} 
                  style={{ 
                    padding: '0.5rem', 
                    border: '1px solid #d9c8a9', 
                    borderRadius: '4px',
                    backgroundColor: proficientSkills.includes(skill) ? '#f0e6d2' : '#fdf6e3'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {proficientSkills.includes(skill) ? (
                      <span style={{ 
                        width: '12px', 
                        height: '12px', 
                        backgroundColor: '#2d5016', 
                        borderRadius: '50%',
                        display: 'inline-block'
                      }}></span>
                    ) : (
                      <span style={{ 
                        width: '12px', 
                        height: '12px', 
                        backgroundColor: '#ccc', 
                        borderRadius: '50%',
                        display: 'inline-block'
                      }}></span>
                    )}
                    <strong>{skill}</strong>
                  </div>
                  <div style={{ fontSize: '0.85em', color: '#7a654f', marginTop: '0.25rem' }}>
                    {ability.toUpperCase()} ({displayMod})
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weapons & Tools Section */}
        {(proficientWeapons.length > 0 || proficientTools.length > 0) && (
          <div className={styles.formGroup} style={{ marginTop: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#5a3921' }}>
              Weapon & Tool Proficiencies
            </h3>
            
            {proficientWeapons.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Weapons & Armor:</strong>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '0.5rem', 
                  marginTop: '0.5rem' 
                }}>
                  {proficientWeapons.map(weapon => (
                    <span 
                      key={weapon}
                      style={{ 
                        padding: '0.25rem 0.5rem', 
                        backgroundColor: '#e8dcb7', 
                        borderRadius: '4px',
                        fontSize: '0.9em'
                      }}
                    >
                      {weapon}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {proficientTools.length > 0 && (
              <div>
                <strong>Tools:</strong>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '0.5rem', 
                  marginTop: '0.5rem' 
                }}>
                  {proficientTools.map(tool => (
                    <span 
                      key={tool}
                      style={{ 
                        padding: '0.25rem 0.5rem', 
                        backgroundColor: '#e8dcb7', 
                        borderRadius: '4px',
                        fontSize: '0.9em'
                      }}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Languages Section */}
        {knownLanguages.length > 0 && (
          <div className={styles.formGroup} style={{ marginTop: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#5a3921' }}>Languages</h3>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '0.5rem' 
            }}>
              {knownLanguages.map(lang => (
                <span 
                  key={lang}
                  style={{ 
                    padding: '0.25rem 0.5rem', 
                    backgroundColor: '#e8dcb7', 
                    borderRadius: '4px',
                    fontSize: '0.9em'
                  }}
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step5AbilityScores;