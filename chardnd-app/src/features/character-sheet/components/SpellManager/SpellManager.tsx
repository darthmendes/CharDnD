// src/features/character-sheet/components/SpellManager/SpellManager.tsx
import React, { useState } from 'react';
import styles from './SpellManager.module.css';
import SpellCastModal from '../SpellModal/SpellModal';
// import SpellDetailsModal from '../SpellModal/SpellDetailsModal'; // [NOTE] TODO: Fix path

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
  
  // [NOTE] NEW: Modal states
  const [isSpellCastModalOpen, setIsSpellCastModalOpen] = useState(false);
  const [selectedSpellForCast, setSelectedSpellForCast] = useState<any | null>(null);
  
  // [NOTE] BULK OPERATIONS: Selection state
  const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
  const [selectedSpellIds, setSelectedSpellIds] = useState<Set<number>>(new Set());

  // [NOTE] FILTER & SORT: State for spell filtering and sorting
  const [sortBy, setSortBy] = useState<'name' | 'level-asc' | 'level-desc'>('level-asc');
  const [levelFilters, setLevelFilters] = useState<Set<number>>(new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));

  // [NOTE] FILTER & SORT: Apply filtering and sorting to spells
  const applyFilterAndSort = (spells: any[]) => {
    // First, filter by selected levels
    let filtered = spells.filter(cs => {
      const spellLevel = cs.spell?.level ?? 0;
      return levelFilters.has(spellLevel);
    });

    // Then, sort by selected criteria
    filtered.sort((a, b) => {
      const aSpell = a.spell;
      const bSpell = b.spell;

      switch (sortBy) {
        case 'name':
          return (aSpell?.name ?? '').localeCompare(bSpell?.name ?? '');
        case 'level-asc':
          return (aSpell?.level ?? 0) - (bSpell?.level ?? 0);
        case 'level-desc':
          return (bSpell?.level ?? 0) - (aSpell?.level ?? 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  // [NOTE] FILTER & SORT: Toggle level filter
  const toggleLevelFilter = (level: number) => {
    const newSet = new Set(levelFilters);
    if (newSet.has(level)) {
      newSet.delete(level);
    } else {
      newSet.add(level);
    }
    setLevelFilters(newSet);
  };

  // Separate spells into known and prepared - ensure proper filtering
  const allKnownSpells = Array.isArray(characterSpells) 
    ? characterSpells.filter(cs => {
        // Must have id and spell object
        if (!cs || !cs.id || !cs.spell) return false;
        // [NOTE] EXCLUDE CANTRIPS (level 0) from known spells
        if (cs.spell.level === 0) return false;
        return true;
      })
    : [];
  
  const allPreparedSpells = allKnownSpells.filter(cs => {
    // Only include if explicitly marked as prepared AND not always_prepared counts separately
    return cs.is_prepared === true;
  });

  // [NOTE] FILTER & SORT: Apply filters and sorting
  const knownSpells = applyFilterAndSort(allKnownSpells);
  const preparedSpells = applyFilterAndSort(allPreparedSpells);

  const canPrepareMore = isPrepareUnlimited || !prepareLimit || preparedCount < prepareLimit;

  const handleTogglePrepare = (charSpell: any) => {
    if (!charSpell.always_prepared) {
      onTogglePrepare(charSpell.spellID);
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

  // [NOTE] BULK OPERATIONS
  const toggleBulkSelection = (spellId: number) => {
    const newSet = new Set(selectedSpellIds);
    if (newSet.has(spellId)) {
      newSet.delete(spellId);
    } else {
      newSet.add(spellId);
    }
    setSelectedSpellIds(newSet);
  };

  const selectAllVisible = () => {
    const allIds = new Set<number>();
    const spellsToSelect = activeTab === 'prepared' ? preparedSpells : knownSpells;
    spellsToSelect.forEach(cs => {
      if (cs.id) allIds.add(cs.id);
    });
    setSelectedSpellIds(allIds);
  };

  const deselectAll = () => {
    setSelectedSpellIds(new Set());
  };

  const bulkTogglePrepare = async () => {
    for (const spellId of selectedSpellIds) {
      await onTogglePrepare(spellId);
    }
    setSelectedSpellIds(new Set());
    setIsBulkSelectMode(false);
  };

  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // [NOTE] Get source badge color and label
  const getSourceBadge = (source: string) => {
    const sourceMap: { [key: string]: { label: string; color: string } } = {
      class: { label: 'Class', color: '#4a90e2' },
      species: { label: 'Species', color: '#7ed321' },
      background: { label: 'Background', color: '#f5a623' },
      feat: { label: 'Feat', color: '#bd10e0' },
      item: { label: 'Item', color: '#50e3c2' },
    };
    return sourceMap[source] || { label: source, color: '#999' };
  };

  const renderSpellRow = (charSpell: any, isExpanded: boolean) => {
    const spell = charSpell.spell;
    if (!spell) return null;

    const sourceBadge = getSourceBadge(charSpell.source || 'class');
    const isSelected = selectedSpellIds.has(charSpell.id);

    return (
      <div key={charSpell.id} className={styles.spellRow} style={{ 
        backgroundColor: isSelected ? '#e3f2fd' : 'transparent'
      }}>
        <div className={styles.spellHeader}>
          {/* [NOTE] BULK: Checkbox when in bulk mode */}
          {isBulkSelectMode && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleBulkSelection(charSpell.id)}
              style={{ marginRight: '0.5rem', cursor: 'pointer' }}
            />
          )}
          
          <div className={styles.spellInfo}>
            <button
              className={styles.expandBtn}
              onClick={() => handleExpandSpell(charSpell.id)}
              title="Expand/collapse details"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
            <div className={styles.spellName}>
              <strong>{spell.name}</strong>
              <span className={styles.spellLevel}>
                {spell.level === 0 ? 'Cantrip' : `${getOrdinal(spell.level)} Level`}
              </span>
              {spell.concentration && <span className={styles.concentration}>Conc.</span>}
              {/* [NOTE] NEW: Source badge */}
              <span 
                className={styles.sourceBadge}
                style={{ backgroundColor: sourceBadge.color }}
                title={`Source: ${sourceBadge.label}`}
              >
                {sourceBadge.label}
              </span>
            </div>
          </div>

          <div className={styles.spellActions}>
            {activeTab === 'prepared' && (
              <button
                className={styles.castBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCastFromPrepared(charSpell);
                }}
                title="Cast this spell"
              >
                Cast
              </button>
            )}
            {!charSpell.always_prepared && !isBulkSelectMode && (
              <button
                className={`${styles.toggleBtn} ${charSpell.is_prepared ? styles.prepared : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTogglePrepare(charSpell);
                }}
                title={charSpell.is_prepared ? 'Unprepare spell' : 'Prepare spell'}
                disabled={!charSpell.is_prepared && !canPrepareMore && activeTab === 'known'}
              >
                {charSpell.is_prepared ? 'Prepared' : 'Prepare'}
              </button>
            )}
            {charSpell.always_prepared && (
              <span className={styles.alwaysPrepared} title="Always prepared">
                Always Prepared
              </span>
            )}
          </div>
        </div>

        {/* Keep existing inline expansion */}
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
    <div className={styles.container}>
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
          [BOOK] Known ({knownSpells.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'prepared' ? styles.active : ''}`}
          onClick={() => setActiveTab('prepared')}
        >
          Prepared ({preparedSpells.length})
        </button>
        
        {/* [NOTE] BULK: Bulk select button */}
        <button
          className={styles.bulkSelectBtn}
          onClick={() => {
            setIsBulkSelectMode(!isBulkSelectMode);
            setSelectedSpellIds(new Set());
          }}
          style={{
            marginLeft: 'auto',
            padding: '0.5rem 1rem',
            backgroundColor: isBulkSelectMode ? '#ff9800' : '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          {isBulkSelectMode ? '[CHECK] Bulk Select Mode' : 'Bulk Select'}
        </button>
      </div>

      {/* [NOTE] FILTER & SORT: Controls for sorting and filtering */}
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        padding: '0.75rem 1rem',
        backgroundColor: '#e8d5c4',
        borderRadius: '4px',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center',
        border: '1px solid #d4bfa8'
      }}>
        {/* Sort dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <label style={{ fontWeight: 'bold', fontSize: '0.85em', whiteSpace: 'nowrap' }}>Sort:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'level-asc' | 'level-desc')}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: '4px',
              border: '1px solid #c9a961',
              cursor: 'pointer',
              fontSize: '0.85em',
              backgroundColor: 'white',
              color: '#333'
            }}
          >
            <option value="level-asc">Level (Low to High)</option>
            <option value="level-desc">Level (High to Low)</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>

        {/* Level filter checkboxes - Compact inline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
          <label style={{ fontWeight: 'bold', fontSize: '0.85em', marginRight: '0.3rem', whiteSpace: 'nowrap' }}>Levels:</label>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
            <label
              key={level}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                padding: '0.2rem 0.4rem',
                backgroundColor: levelFilters.has(level) ? '#4a90e2' : 'white',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '0.75em',
                fontWeight: levelFilters.has(level) ? 'bold' : 'normal',
                color: levelFilters.has(level) ? 'white' : '#333',
                border: levelFilters.has(level) ? '1px solid #2563eb' : '1px solid #c9a961',
                transition: 'all 0.2s'
              }}
            >
              <input
                type="checkbox"
                checked={levelFilters.has(level)}
                onChange={() => toggleLevelFilter(level)}
                style={{ cursor: 'pointer', width: '14px', height: '14px' }}
              />
              <span>{level === 0 ? 'C' : level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* [NOTE] BULK: Controls when in bulk mode */}
      {isBulkSelectMode && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          marginBottom: '1rem',
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <button
            onClick={selectAllVisible}
            style={{
              padding: '0.4rem 0.8rem',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9em',
            }}
          >
            Select All
          </button>
          <button
            onClick={deselectAll}
            style={{
              padding: '0.4rem 0.8rem',
              backgroundColor: '#757575',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9em',
            }}
          >
            Deselect All
          </button>
          
          {selectedSpellIds.size > 0 && (
            <>
              <span style={{ color: '#666', fontWeight: 'bold', marginLeft: '0.5rem' }}>
                {selectedSpellIds.size} spell(s) selected
              </span>
              <button
                onClick={bulkTogglePrepare}
                style={{
                  padding: '0.4rem 0.8rem',
                  backgroundColor: activeTab === 'known' ? '#4caf50' : '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9em',
                  fontWeight: 'bold'
                }}
              >
                {activeTab === 'known' ? '✓ Prepare Selected' : '✗ Unprepare Selected'}
              </button>
            </>
          )}
        </div>
      )}

      <div className={styles.spellList}>
        {activeTab === 'known' && (
          <>
            {knownSpells.length === 0 ? (
              <div className={styles.emptyMessage}>No spells known yet</div>
            ) : (
              knownSpells.map(cs =>
                renderSpellRow(cs, expandedSpellId === cs.id)
              )
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

      {/* [NOTE] Spell Cast Modal (existing) */}
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