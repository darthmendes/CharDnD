import React from 'react';
import { Character } from '../../../types/Character';
import AbsScores from './AbilityScores/AbsScores';
import { useLevelAndXp } from '../hooks';
import styles from '../CharacterDisplay.module.css';

interface CharacterSpeciesLevelProps {
  character: Character | null;
  localAbilityScores: Record<string, number> | null;
  onAbilityScoresChange: (scores: Record<string, number>) => void;
  onAbilityScoresSave: () => Promise<void>;
  attunedCount: number;
  attunementSlotLimit: number;
  proficiencyBonus: number;
  displayedSkills: { skills: string[]; sources: Record<string, string[]> };
  skillModifiers: any[];
  skillAdvantages: any[];
  knownLanguages: string[];
  proficientSkills: string[];
  proficientWeapons: string[];
  proficientTools: string[];
  proficiencyModal: { isOpen: boolean; type: string };
  onProficiencyModalOpen: (type: string) => void;
  onProficiencyModalClose: () => void;
  activeProficiencyTab: string;
  onActiveProficiencyTabChange: (tab: string) => void;
  expanded: boolean;
  onToggle: () => void;
}

const CharacterSpeciesLevel: React.FC<CharacterSpeciesLevelProps> = ({
  character,
  localAbilityScores,
  onAbilityScoresChange,
  onAbilityScoresSave,
  attunedCount,
  attunementSlotLimit,
  proficiencyBonus,
  expanded,
  onToggle,
}) => {
  const { localLevel, localXp, saveLevelAndXp, handleLevelChange, handleXpChange, handleXpInput, getXpToNextLevel, saving } = useLevelAndXp(
    character?.id?.toString(),
    character?.level || 1,
    character?.xp || 0
  );

  const xpToNextLevel = getXpToNextLevel();

  if (!character || !localAbilityScores) return null;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader} onClick={onToggle} style={{ cursor: 'pointer' }}>
        <div className={styles.sectionTitle}>
          <span className={`${styles.toggleIcon} ${expanded ? '' : styles.collapsed}`}>▼</span>
          <h2>Species & Level</h2>
        </div>
        <span className={styles.collapseHint}>{expanded ? 'Hide' : 'Show'}</span>
      </div>

      <div className={`${styles.sectionContent} ${expanded ? '' : styles.collapsed}`}>
        <label>
          <strong>Species:</strong> {character.species}
        </label>
        {character.subspecies && (
          <label>
            <strong>Subspecies:</strong> {character.subspecies}
          </label>
        )}
        {character.background && (
          <label>
            <strong>Background:</strong> {character.background.name}
          </label>
        )}

        <div className={styles.levelXpGroup}>
          <div className={styles.levelXpRow}>
            <span className={styles.levelXpLabel}>Level:</span>
            <strong>{localLevel}</strong>
            <div className={styles.levelButtons}>
              <button
                type="button"
                onClick={() => handleLevelChange(-1)}
                disabled={saving || localLevel <= 1}
                className={styles.levelButton}
              >
                −
              </button>
              <button
                type="button"
                onClick={() => handleLevelChange(1)}
                disabled={saving || localLevel >= 20}
                className={styles.levelButton}
              >
                +
              </button>
            </div>
          </div>

          <div className={styles.levelXpRow}>
            <span className={styles.levelXpLabel}>XP:</span>
            <input
              type="number"
              value={localXp}
              onChange={(e) => handleXpInput(parseInt(e.target.value) || 0)}
              disabled={saving}
              className={styles.xpInput}
            />
            <div className={styles.xpButtons}>
              <button
                type="button"
                onClick={() => handleXpChange(-100)}
                disabled={saving}
                className={styles.xpStepButton}
              >
                −100
              </button>
              <button
                type="button"
                onClick={() => handleXpChange(100)}
                disabled={saving}
                className={styles.xpStepButton}
              >
                +100
              </button>
            </div>
          </div>

          {localLevel < 20 && <div className={styles.xpHint}>{xpToNextLevel} XP to Level {localLevel + 1}</div>}

          <button onClick={saveLevelAndXp} disabled={saving} className={styles.saveBtn}>
            {saving ? 'Saving...' : 'Save Level & XP'}
          </button>
        </div>

        <label>
          <strong>Classes:</strong>
        </label>
        {character.classes?.length > 0 ? (
          <div>
            {character.classes.map((c, i) => (
              <div key={i}>
                {c.className} (Level {c.level})
                {c.subclass && ` - ${c.subclass}`}
              </div>
            ))}
          </div>
        ) : (
          <p>No classes assigned</p>
        )}

        <div>
          <strong>Ability Scores:</strong>
          <AbsScores abilityScores={localAbilityScores} onScoreChange={onAbilityScoresChange} />
          <button onClick={onAbilityScoresSave} className={styles.saveBtn}>
            Save Scores
          </button>
        </div>

        <div>
          <strong>Proficiency Bonus:</strong> +{proficiencyBonus}
        </div>

        <div>
          <strong>Languages:</strong>
          {character.knownLanguages && character.knownLanguages.length > 0 ? (
            <div style={{ marginLeft: '1rem' }}>
              {character.knownLanguages.map((lang, i) => (
                <div key={i}>{lang}</div>
              ))}
            </div>
          ) : (
            <p style={{ marginLeft: '1rem', color: '#999' }}>None</p>
          )}
        </div>

        <div>
          <strong>Attunement Slots:</strong>
          <span className={attunedCount >= attunementSlotLimit ? styles.attunementFull : styles.attunementAvailable}>
            {attunedCount} / {attunementSlotLimit}
          </span>
          {attunedCount >= attunementSlotLimit && <span className={styles.attunementWarning}> Max attuned items reached!</span>}
        </div>
      </div>
    </section>
  );
};

export default CharacterSpeciesLevel;
