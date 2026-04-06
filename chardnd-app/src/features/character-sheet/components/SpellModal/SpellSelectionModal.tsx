// SpellSelectionModal.tsx - Spell selection modal (Add Spell) with integrated details panel

import React, { useState, useMemo } from 'react';
import styles from './SpellModal.module.css';

interface SpellSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSpell: (spell: any) => void;
  availableSpells: any[];
  spellSaveDC?: number;
  spellAttackBonus?: number;
}

const SpellSelectionModal: React.FC<SpellSelectionModalProps> = ({
  isOpen,
  onClose,
  onAddSpell,
  availableSpells,
  spellSaveDC = 0,
  spellAttackBonus = 0,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpell, setSelectedSpell] = useState<any>(null);
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');

  const uniqueLevels = useMemo(() => {
    const levels = new Set<number>();
    availableSpells.forEach((spell) => {
      levels.add(spell.level);
    });
    return Array.from(levels).sort();
  }, [availableSpells]);

  const filteredSpells = availableSpells.filter((spell) => {
    const matchesSearch = spell.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || spell.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  if (!isOpen) return null;

  const handleAddSpell = () => {
    if (selectedSpell) {
      onAddSpell(selectedSpell);
      setSelectedSpell(null);
      onClose();
    }
  };

  const handleAddAndContinue = () => {
    if (selectedSpell) {
      onAddSpell(selectedSpell);
      setSelectedSpell(null);
    }
  };

  const getOrdinal = (n: number) => {
    if (n === 0) return 'Cantrip';
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div 
      className={styles.overlay} 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className={`${styles.spellModal} ${selectedSpell ? styles.spellModalExpanded : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.spellHeader}>
          <h3>
            {selectedSpell ? selectedSpell.name : 'Add Spell to Character'}
          </h3>
          <button 
            onClick={() => selectedSpell ? setSelectedSpell(null) : onClose()} 
            className={styles.spellCloseBtn}
          >
            ×
          </button>
        </div>

        <div className={styles.spellContent}>
          <div className={styles.spellMenuPanel}>
            {/* Search Container */}
            <div className={styles.spellSearchContainer}>
              <input
                type="text"
                placeholder="Search spells..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.spellSearchInput}
                autoFocus
              />
            </div>

            {/* Filter Controls */}
            <div style={{ padding: '0.75rem', borderTop: '1px solid #8b7355' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.25rem', color: '#5d4e37' }}>
                Level:
              </label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className={styles.spellSearchInput}
                style={{ fontSize: '0.9rem' }}
              >
                <option value="all">All Levels</option>
                {uniqueLevels.map((level) => (
                  <option key={level} value={level}>
                    {getOrdinal(level)}
                  </option>
                ))}
              </select>
            </div>

            {/* Spell List Container */}
            <div className={styles.spellListContainer}>
              {filteredSpells.length === 0 ? (
                <p className={styles.spellNoResults}>No spells found</p>
              ) : (
                filteredSpells.map((spell) => (
                  <div
                    key={spell.id}
                    onClick={() => {
                      if (selectedSpell?.id === spell.id) {
                        setSelectedSpell(null);
                      } else {
                        setSelectedSpell(spell);
                      }
                    }}
                    className={`${styles.spellRow} ${selectedSpell?.id === spell.id ? styles.spellRowSelected : ''}`}
                  >
                    <span className={styles.spellRowName}>{spell.name}</span>
                    <small className={styles.spellRowLevel}>
                      {getOrdinal(spell.level)}
                    </small>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Spell Details Panel */}
          {selectedSpell && (
            <div className={styles.spellDetailsPanel}>
              <div className={styles.spellDetailsContent}>
                <h4 className={styles.spellDetailsTitle}>{selectedSpell.name}</h4>

                <div className={styles.spellDetailGrid}>
                  <div>
                    <strong>Level:</strong> {getOrdinal(selectedSpell.level)}
                  </div>
                  {selectedSpell.school && (
                    <div>
                      <strong>School:</strong> {selectedSpell.school}
                    </div>
                  )}
                  {selectedSpell.casting_time && (
                    <div>
                      <strong>Casting Time:</strong> {selectedSpell.casting_time}
                    </div>
                  )}
                  {selectedSpell.range && (
                    <div>
                      <strong>Range:</strong> {selectedSpell.range}
                    </div>
                  )}
                  {selectedSpell.components && (
                    <div>
                      <strong>Components:</strong> {selectedSpell.components}
                    </div>
                  )}
                  {selectedSpell.duration && (
                    <div>
                      <strong>Duration:</strong> {selectedSpell.duration}
                    </div>
                  )}
                  {selectedSpell.concentration && (
                    <div>
                      <span className={styles.spellConcentrationBadge}>⚠️ Concentration</span>
                    </div>
                  )}
                  {selectedSpell.ritual && (
                    <div>
                      <span className={styles.spellRitualBadge}>✨ Ritual</span>
                    </div>
                  )}
                </div>

                {selectedSpell.save_ability && (
                  <div className={styles.spellSaveSection}>
                    <strong>Saving Throw:</strong>
                    <div>DC {spellSaveDC} {selectedSpell.save_ability.toUpperCase()} save</div>
                    {selectedSpell.save_half_on_success && (
                      <div style={{ fontSize: '0.9em', color: '#6b5344' }}>
                        Half damage on success
                      </div>
                    )}
                  </div>
                )}

                {selectedSpell.attack_type && (
                  <div className={styles.spellAttackSection}>
                    <strong>Spell Attack:</strong>
                    <div>+{spellAttackBonus} to hit</div>
                  </div>
                )}

                {selectedSpell.damage_dice && (
                  <div className={styles.spellDamageSection}>
                    <strong>Damage:</strong>
                    <div>
                      {selectedSpell.damage_dice}
                      {selectedSpell.damage_type && ` ${selectedSpell.damage_type} damage`}
                    </div>
                    {selectedSpell.upcast_damage_per_slot && (
                      <div style={{ fontSize: '0.9em', color: '#6b5344', fontStyle: 'italic' }}>
                        +{selectedSpell.upcast_damage_per_slot} per slot level
                      </div>
                    )}
                  </div>
                )}

                {selectedSpell.healing_dice && (
                  <div className={styles.spellHealingSection}>
                    <strong>Healing:</strong>
                    <div>{selectedSpell.healing_dice} hit points</div>
                  </div>
                )}

                {selectedSpell.aoe_type && (
                  <div className={styles.spellAoeSection}>
                    <strong>Area of Effect:</strong>
                    <div>{selectedSpell.aoe_size}-foot {selectedSpell.aoe_type}</div>
                  </div>
                )}

                {selectedSpell.description && (
                  <div className={styles.spellDescription}>
                    <strong>Description:</strong>
                    <p>{selectedSpell.description}</p>
                  </div>
                )}

                {selectedSpell.higher_levels && (
                  <div className={styles.spellHigherLevels}>
                    <strong>At Higher Levels:</strong>
                    <p>{selectedSpell.higher_levels}</p>
                  </div>
                )}

                <div className={styles.spellButtonGroup}>
                  <button onClick={handleAddSpell} className={styles.spellAddBtn}>
                    Add Spell
                  </button>
                  <button onClick={handleAddAndContinue} className={styles.spellAddMoreBtn}>
                    Add & Add Another
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpellSelectionModal;
