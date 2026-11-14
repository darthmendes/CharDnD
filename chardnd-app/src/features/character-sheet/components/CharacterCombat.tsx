import React from 'react';
import { Character } from '../../../types/Character';
import { useHitPoints } from '../hooks';
import { useCharacterCalculations } from '../hooks';
import StatModifiersModal from './StatModifiersModal/StatModifiersModal';
import styles from '../CharacterDisplay.module.css';

interface CharacterCombatProps {
  character: Character | null;
  localLevel: number;
  localAbilityScores: Record<string, number> | null;
  expanded: boolean;
  onToggle: () => void;
  onAttackClick: (weapon: any) => void;
}

const CharacterCombat: React.FC<CharacterCombatProps> = ({
  character,
  localLevel,
  localAbilityScores,
  expanded,
  onToggle,
  onAttackClick,
}) => {
  const { hpCurrent, hpMax, hpTmp, hpModalType, setHpModalType, hpModalInput, setHpModalInput, saving, handleHpModalSubmit, saveHp } = useHitPoints(
    character?.id?.toString(),
    character?.hpCurrent || 0,
    character?.hpMax || 10,
    character?.hpTmp || 0
  );

  const calculations = useCharacterCalculations(character, localLevel, localAbilityScores);
  const [statModifiersModal, setStatModifiersModal] = React.useState<{ isOpen: boolean; stat: string }>({ isOpen: false, stat: 'AC' });

  if (!character) return null;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader} onClick={onToggle} style={{ cursor: 'pointer' }}>
        <div className={styles.sectionTitle}>
          <span className={`${styles.toggleIcon} ${expanded ? '' : styles.collapsed}`}>▼</span>
          <h2>Combat</h2>
        </div>
        <span className={styles.collapseHint}>{expanded ? 'Hide' : 'Show'}</span>
      </div>

      <div className={`${styles.sectionContent} ${expanded ? '' : styles.collapsed}`}>
        <div className={styles.hpSection}>
          <div className={styles.hpRow}>
            <div className={styles.hpContainer}>
              <strong>Hit Points:</strong>
              <div className={styles.hpDisplay}>
                <div className={styles.hpMainDisplay}>
                  <span className={styles.hpCurrent}>{hpCurrent}</span>
                  <span className={styles.hpSeparator}>/</span>
                  <span className={styles.hpMax}>{hpMax}</span>
                  {hpTmp > 0 && <span className={styles.hpTemp}>(+{hpTmp} temp)</span>}
                </div>
              </div>
              <div className={styles.hpControls}>
                <button type="button" onClick={() => setHpModalType('heal')} disabled={saving} className={styles.hpButton}>
                  Heal
                </button>
                <button type="button" onClick={() => setHpModalType('damage')} disabled={saving} className={styles.hpButton}>
                  Damage
                </button>
                <button type="button" onClick={() => setHpModalType('temp')} disabled={saving} className={styles.hpButton}>
                  Temp HP
                </button>
              </div>
            </div>
            <div className={styles.totalHpContainer}>
              <strong>Total HP:</strong>
              <div className={styles.totalHpDisplay}>
                <span className={styles.totalHpValue}>{hpCurrent + hpTmp} / {hpMax}</span>
              </div>
            </div>
          </div>

          {hpModalType && (
            <div className={styles.hpModal}>
              <div className={styles.hpModalContent}>
                <label>
                  {hpModalType === 'heal' && 'Heal amount:'}
                  {hpModalType === 'damage' && 'Damage amount:'}
                  {hpModalType === 'temp' && 'Temporary HP:'}
                </label>
                <input
                  type="number"
                  value={hpModalInput}
                  onChange={(e) => setHpModalInput(e.target.value)}
                  placeholder="Enter amount"
                  className={styles.hpModalInput}
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleHpModalSubmit();
                  }}
                />
                <div className={styles.hpModalButtons}>
                  <button onClick={handleHpModalSubmit} className={styles.confirmBtn}>
                    Apply
                  </button>
                  <button
                    onClick={() => {
                      setHpModalType(null);
                      setHpModalInput('');
                    }}
                    className={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <button onClick={saveHp} disabled={saving} className={styles.saveBtn}>
            {saving ? 'Saving...' : 'Save HP'}
          </button>
        </div>

        <div className={styles.combatStats}>
          <div className={`${styles.statBox} ${styles.clickable}`} onClick={() => setStatModifiersModal({ isOpen: true, stat: 'AC' })}>
            <strong>AC:</strong>
            <span>{calculations.ac}</span>
          </div>
          <div className={`${styles.statBox} ${styles.clickable}`} onClick={() => setStatModifiersModal({ isOpen: true, stat: 'Initiative' })}>
            <strong>Initiative:</strong>
            <span>{calculations.initiative >= 0 ? '+' : ''}{calculations.initiative}</span>
          </div>
          <div className={`${styles.statBox} ${styles.clickable}`} onClick={() => setStatModifiersModal({ isOpen: true, stat: 'Speed' })}>
            <strong>Speed:</strong>
            <span>{character.speed || 30} ft</span>
          </div>
        </div>

        <div className={styles.attacksSection}>
          <h3>Possible Attacks</h3>
          {character.items && Array.isArray(character.items) && character.items.length > 0 ? (
            <>
              <div className={styles.attackRowHeader}>
                <div className={styles.attackRowName}>Name</div>
                <div className={styles.attackRowBonus}>Attack Bonus</div>
                <div className={styles.attackRowDamage}>Damage</div>
                <div className={styles.attackRowType}>Damage Type</div>
                <div className={styles.attackRowSpecial}>Special</div>
              </div>
              <div className={styles.attacksList}>
                {character.items
                  .filter((i: any) => i.item_type === 'Weapon' || i.type === 'Weapon')
                  .map((w: any, i: number) => {
                    const bestAbility = calculations.getBestAbilityForWeapon(w);
                    const attackBonus = bestAbility.modifier + calculations.proficiencyBonus;
                    const damageDice = w.damageDice || '1d4';
                    const damageType = w.damageType || 'bludgeoning';
                    const isAttuned = w.is_attuned === true;
                    const needsAttunement = w.requires_attunement || w.item?.requires_attunement;
                    const hasCharges = w.maxCharges && w.onHitEffect;

                    return (
                      <div
                        key={i}
                        className={styles.attackRow}
                        onClick={() => onAttackClick(w)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className={styles.attackRowName}>{w.name}</div>
                        <div className={styles.attackRowBonus}>+{attackBonus}</div>
                        <div className={styles.attackRowDamage}>{damageDice}</div>
                        <div className={styles.attackRowType}>{damageType}</div>
                        <div className={styles.attackRowSpecial}>
                          {needsAttunement && (
                            <span className={isAttuned ? styles.specialAvailable : styles.specialLocked}>
                              {isAttuned ? 'Ready' : 'Attune'}
                            </span>
                          )}
                          {hasCharges && !needsAttunement && <span className={styles.specialAvailable}>Charge</span>}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          ) : (
            <p className={styles.noAttacks}>No weapons in inventory.</p>
          )}
        </div>

        <StatModifiersModal
          isOpen={statModifiersModal.isOpen}
          onClose={() => setStatModifiersModal({ ...statModifiersModal, isOpen: false })}
          statName={statModifiersModal.stat === 'AC' ? 'AC' : statModifiersModal.stat === 'Initiative' ? 'Initiative' : 'Speed'}
          currentValue={
            statModifiersModal.stat === 'AC'
              ? calculations.ac
              : statModifiersModal.stat === 'Initiative'
                ? calculations.initiative
                : character.speed || 30
          }
          modifiers={
            statModifiersModal.stat === 'AC'
              ? calculations.acModifiers
              : statModifiersModal.stat === 'Initiative'
                ? calculations.initiativeModifiers
                : calculations.speedModifiers
          }
        />
      </div>
    </section>
  );
};

export default CharacterCombat;
