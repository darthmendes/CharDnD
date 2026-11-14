import React from 'react';
import { Character } from '../../../types/Character';
import SpellSelectionModal from './SpellModal/SpellSelectionModal';
import SpellManager from './SpellManager/SpellManager';
import styles from '../CharacterDisplay.module.css';

interface CharacterSpellcastingProps {
  character: Character | null;
  spellcasterLevel: number;
  spellcastingAbility: string;
  spellSaveDC: number;
  spellAttackBonus: number;
  spellSlots: Record<string, number>;
  spellSlotsExpended: Record<string, number>;
  characterSpells: any[];
  spellPrepareLimit: number | null;
  spellPreparedCount: number;
  spellPrepareUnlimited: boolean;
  availableSpells: any[];
  isSpellModalOpen: boolean;
  onSpellModalOpen: () => void;
  onSpellModalClose: () => void;
  onAddSpell: (spell: any) => Promise<void>;
  onTogglePreparedSpell: (spellId: number) => Promise<void>;
  onExpendSpellSlot: (level: number) => Promise<void>;
  onStatModifiersModalOpen: (stat: string) => void;
  expanded: boolean;
  onToggle: () => void;
}

const getOrdinal = (n: number) => {
  if (n === 0) return 'Cantrip';
  const lastDigit = n % 10;
  const lastTwoDigits = n % 100;
  if (lastTwoDigits > 10 && lastTwoDigits < 20) return n + 'th';
  if (lastDigit === 1) return n + 'st';
  if (lastDigit === 2) return n + 'nd';
  if (lastDigit === 3) return n + 'rd';
  return n + 'th';
};

const CharacterSpellcasting: React.FC<CharacterSpellcastingProps> = ({
  character,
  spellcasterLevel,
  spellcastingAbility,
  spellSaveDC,
  spellAttackBonus,
  spellSlots,
  spellSlotsExpended,
  characterSpells,
  spellPrepareLimit,
  spellPreparedCount,
  spellPrepareUnlimited,
  availableSpells,
  isSpellModalOpen,
  onSpellModalOpen,
  onSpellModalClose,
  onAddSpell,
  onTogglePreparedSpell,
  onExpendSpellSlot,
  onStatModifiersModalOpen,
  expanded,
  onToggle,
}) => {
  if (!character) return null;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader} onClick={onToggle} style={{ cursor: 'pointer' }}>
        <div className={styles.sectionTitle}>
          <span className={`${styles.toggleIcon} ${expanded ? '' : styles.collapsed}`}>▼</span>
          <h2>Spellcasting</h2>
        </div>
        <span className={styles.collapseHint}>{expanded ? 'Hide' : 'Show'}</span>
      </div>

      <div className={`${styles.sectionContent} ${expanded ? '' : styles.collapsed}`}>
        {spellcasterLevel > 0 && (
          <div className={styles.spellcastingStats} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem', marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0f4f8', borderRadius: '8px' }}>
            <div
              className={`${styles.statBox} ${styles.clickable}`}
              onClick={() => onStatModifiersModalOpen('SpellDC')}
            >  
              <strong>Spell Save DC</strong>
              <span style={{ fontSize: '1.5em', color: '#4a90e2' }}>{spellSaveDC}</span>
            </div>
            <div
              className={`${styles.statBox} ${styles.clickable}`}
              onClick={() => onStatModifiersModalOpen('SpellAttack')}
            >
              <strong>Spell Attack</strong>
              <span style={{ fontSize: '1.5em', color: '#4a90e2' }}>+{spellAttackBonus}</span>
            </div>
            <div className={styles.statBox}>
              <strong>Ability</strong>
              <span style={{ fontSize: '1.5em', color: '#4a90e2' }}>{spellcastingAbility.toUpperCase()}</span>
            </div>
            <div className={styles.statBox}>
              <strong>Caster Level</strong>
              <span style={{ fontSize: '1.5em', color: '#4a90e2' }}>{spellcasterLevel}</span>
            </div>
          </div>
        )}

        {spellcasterLevel > 0 && (
          <div className={styles.spellSlots} style={{ marginBottom: '1rem' }}>
            <h3>Spell Slots</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {Object.entries(spellSlots).map(([l, t]) => {
                const e = spellSlotsExpended[l] || 0;
                const r = t - e;
                return (
                  <div
                    key={l}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: '#fff',
                      border: '2px solid #4a90e2',
                      borderRadius: '8px',
                      textAlign: 'center',
                      minWidth: '80px',
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{getOrdinal(parseInt(l))}</div>
                    <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
                      {r}/{t}
                    </div>
                    <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', marginTop: '0.25rem' }}>
                      {Array.from({ length: t }).map((_, i) => (
                        <div
                          key={i}
                          onClick={() => onExpendSpellSlot(parseInt(l))}
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '2px',
                            backgroundColor: i < e ? '#ccc' : '#4a90e2',
                            cursor: i < e ? 'default' : 'pointer',
                            border: '1px solid #333',
                          }}
                          title={i < e ? 'Expended' : 'Available'}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {characterSpells.length > 0 && (
          <SpellManager
            characterSpells={characterSpells}
            spellSlots={spellSlots}
            spellSaveDC={spellSaveDC}
            spellAttackBonus={spellAttackBonus}
            spellcastingAbility={spellcastingAbility}
            character={character}
            prepareLimit={spellPrepareLimit}
            preparedCount={spellPreparedCount}
            isPrepareUnlimited={spellPrepareUnlimited}
            onTogglePrepare={onTogglePreparedSpell}
            onCastSpell={onExpendSpellSlot}
          />
        )}

        <button className={styles.primary} onClick={onSpellModalOpen} style={{ marginTop: '1rem' }}>
          Add Spell
        </button>

        <SpellSelectionModal
          isOpen={isSpellModalOpen}
          onClose={onSpellModalClose}
          onAddSpell={onAddSpell}
          availableSpells={availableSpells}
          spellSaveDC={spellSaveDC}
          spellAttackBonus={spellAttackBonus}
        />
      </div>
    </section>
  );
};

export default CharacterSpellcasting;
