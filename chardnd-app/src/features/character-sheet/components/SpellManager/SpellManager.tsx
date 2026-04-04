import React, { useState } from 'react';
import styles from './SpellManager.module.css';
import SpellCastModal from '../SpellModal/SpellModal';

interface SpellManagerProps {
  characterSpells: any[];
  spellSlots: { [key: string]: number };
  spellSaveDC: number;
  spellAttackBonus: number;
  spellcastingAbility: string;
  character: any;
  prepareLimit: number | null;
  preparedCount: number;
  isPrepareUnlimited: boolean;
  onTogglePrepare: (spellId: number) => void;
  onCastSpell: (slotLevel: number) => void;
}

const SpellManager: React.FC<SpellManagerProps> = ({
  characterSpells,
  spellSlots,
  spellSaveDC,
  spellAttackBonus,
  spellcastingAbility,
  character,
  prepareLimit,
  preparedCount,
  isPrepareUnlimited,
  onTogglePrepare,
  onCastSpell,
}) => {
  const [activeTab, setActiveTab] = useState<'known' | 'prepared'>('known');
  const [expandedSpellId, setExpandedSpellId] = useState<number | null>(null);
  const [isSpellCastModalOpen, setIsSpellCastModalOpen] = useState(false);
  const [selectedSpellForCast, setSelectedSpellForCast] = useState<any | null>(null);

  // Separate spells into known and prepared
  const knownSpells = characterSpells.filter(cs => cs.spell);
  const preparedSpells = knownSpells.filter(cs => cs.is_prepared);
  const unpreparedSpells = knownSpells.filter(cs => !cs.is_prepared && !cs.always_prepared);

  const canPrepareMore = isPrepareUnlimited || !prepareLimit || preparedCount < prepareLimit;

  const handleTogglePrepare = (charSpell: any) => {
    if (!charSpell.always_prepared) {
      onTogglePrepare(charSpell.spell_id);
    }
  };

  const handleExpandSpell = (charSpellId: number) => {
    setExpandedSpellId(expandedSpellId === charSpellId ? null : charSpellId);
  };

  const handleCastFromPrepared = (charSpell: any) => {
    setSelectedSpellForCast(charSpell.spell);
    setIsSpellCastModalOpen(true);
  };

  const handleCloseSpellModal = () => {
    setIsSpellCastModalOpen(false);
    setSelectedSpellForCast(null);
  };

  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const renderSpellRow = (charSpell: any, isExpanded: boolean) => {
    const spell = charSpell.spell;
    if (!spell) return null;

    return (
      <div key={charSpell.id} className={styles.spellRow}>
        <div className={styles.spellHeader}>
          <div className={styles.spellInfo}>
            <button
              className={styles.expandBtn}
              onClick={() => handleExpandSpell(charSpell.id)}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
            <div className={styles.spellName}>
              <strong>{spell.name}</strong>
              <span className={styles.spellLevel}>
                {spell.level === 0 ? 'Cantrip' : `${getOrdinal(spell.level)} Level`}
              </span>
              {spell.concentration && <span className={styles.concentration}>⚠️ Conc.</span>}
            </div>
          </div>

          <div className={styles.spellActions}>
            {activeTab === 'prepared' && (
              <button
                className={styles.castBtn}
                onClick={() => handleCastFromPrepared(charSpell)}
                title="Cast this spell"
              >
                ✨ Cast
              </button>
            )}
            {!charSpell.always_prepared && (
              <button
                className={`${styles.toggleBtn} ${charSpell.is_prepared ? styles.prepared : ''}`}
                onClick={() => handleTogglePrepare(charSpell)}
                title={charSpell.is_prepared ? 'Unprepare spell' : 'Prepare spell'}
                disabled={!charSpell.is_prepared && !canPrepareMore && activeTab === 'known'}
              >
                {charSpell.is_prepared ? '★ Prepared' : '☆ Prepare'}
              </button>
            )}
            {charSpell.always_prepared && (
              <span className={styles.alwaysPrepared} title="Always prepared">
                ⭐ Always Prepared
              </span>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className={styles.spellDetails}>
            <div className={styles.detailRow}>
              <strong>School:</strong> {spell.school}
            </div>
            <div className={styles.detailRow}>
              <strong>Casting Time:</strong> {spell.casting_time}
            </div>
            <div className={styles.detailRow}>
              <strong>Range:</strong> {spell.range}
            </div>
            <div className={styles.detailRow}>
              <strong>Components:</strong> {spell.components}
            </div>
            <div className={styles.detailRow}>
              <strong>Duration:</strong> {spell.duration}
            </div>

            {spell.save_ability && (
              <div className={styles.detailRow}>
                <strong>Save:</strong> DC {spellSaveDC} {spell.save_ability.toUpperCase()} save
                {spell.save_half_on_success && ' (half damage on success)'}
              </div>
            )}

            {spell.attack_type === 'spell_attack' && (
              <div className={styles.detailRow}>
                <strong>Spell Attack:</strong> +{spellAttackBonus} to hit
              </div>
            )}

            {spell.damage_dice && (
              <div className={styles.detailRow}>
                <strong>Damage:</strong> {spell.damage_dice}
                {spell.damage_type && ` ${spell.damage_type} damage`}
              </div>
            )}

            {spell.area_of_effect_type && (
              <div className={styles.detailRow}>
                <strong>Area:</strong> {spell.area_of_effect_size}-foot {spell.area_of_effect_type}
              </div>
            )}

            <div className={styles.description}>{spell.description}</div>

            {spell.higher_levels && (
              <div className={styles.higherLevels}>
                <strong>At Higher Levels:</strong> {spell.higher_levels}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.spellManager}>
      <div className={styles.header}>
        <h3>Spells</h3>
        {prepareLimit !== null && (
          <div className={styles.prepareStatus}>
            {preparedCount} / {prepareLimit} Prepared
          </div>
        )}
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'known' ? styles.active : ''}`}
          onClick={() => setActiveTab('known')}
        >
          📖 Known ({knownSpells.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'prepared' ? styles.active : ''}`}
          onClick={() => setActiveTab('prepared')}
        >
          ★ Prepared ({preparedSpells.length})
        </button>
      </div>

      <div className={styles.spellList}>
        {activeTab === 'known' && (
          <>
            {knownSpells.length === 0 ? (
              <div className={styles.emptyMessage}>No spells known yet</div>
            ) : (
              <>
                {preparedSpells.length > 0 && (
                  <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>★ Prepared</h4>
                    {preparedSpells.map(cs =>
                      renderSpellRow(cs, expandedSpellId === cs.id)
                    )}
                  </div>
                )}

                {unpreparedSpells.length > 0 && (
                  <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>
                      ☆ Can Prepare {canPrepareMore ? '' : '(Limit Reached)'}
                    </h4>
                    {unpreparedSpells.map(cs =>
                      renderSpellRow(cs, expandedSpellId === cs.id)
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'prepared' && (
          <>
            {preparedSpells.length === 0 ? (
              <div className={styles.emptyMessage}>
                No prepared spells. Switch to "Known" tab to prepare spells.
              </div>
            ) : (
              preparedSpells.map(cs => renderSpellRow(cs, expandedSpellId === cs.id))
            )}
          </>
        )}
      </div>

      <SpellCastModal
        isOpen={isSpellCastModalOpen}
        onClose={handleCloseSpellModal}
        spell={selectedSpellForCast}
        character={character}
        spellSaveDC={spellSaveDC}
        spellAttackBonus={spellAttackBonus}
        spellcastingAbility={spellcastingAbility}
        spellSlots={spellSlots}
        onCast={onCastSpell}
      />
    </div>
  );
};

export default SpellManager;
