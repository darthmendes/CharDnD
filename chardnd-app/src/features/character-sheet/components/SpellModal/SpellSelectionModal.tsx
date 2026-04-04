// SpellSelectionModal.tsx - For selecting and adding spells to character

import React, { useState } from 'react';
import styles from './SpellModal.module.css';

interface SpellSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSpell: (spell: any) => void;
  availableSpells: any[];
  characterId: number;
}

const SpellSelectionModal: React.FC<SpellSelectionModalProps> = ({
  isOpen,
  onClose,
  onAddSpell,
  availableSpells,
  characterId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');

  if (!isOpen) return null;

  // Filter spells based on search and level
  const filteredSpells = availableSpells.filter((spell) => {
    const matchesSearch = spell.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || spell.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div className={styles.spellCastModal}>
      <div className={styles.spellCastContent}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        <h2>Add Spell to Character</h2>

        {/* Search Bar */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search spells..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              marginBottom: '0.5rem',
            }}
          />

          {/* Level Filter */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <input
                type="radio"
                name="level"
                value="all"
                checked={filterLevel === 'all'}
                onChange={() => setFilterLevel('all')}
              />
              All Levels
            </label>
            {Array.from({ length: 10 }, (_, i) => i).map((level) => (
              <label key={level} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <input
                  type="radio"
                  name="level"
                  value={level}
                  checked={filterLevel === level}
                  onChange={() => setFilterLevel(level)}
                />
                {level === 0 ? 'Cantrips' : getOrdinal(level)}
              </label>
            ))}
          </div>
        </div>

        {/* Spell List */}
        <div style={{
          maxHeight: '400px',
          overflowY: 'auto',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '0.5rem',
          marginBottom: '1rem',
        }}>
          {filteredSpells.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999' }}>No spells found</p>
          ) : (
            filteredSpells.map((spell) => (
              <div
                key={spell.id}
                style={{
                  padding: '0.75rem',
                  borderRadius: '4px',
                  marginBottom: '0.5rem',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #e0e0e0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold' }}>{spell.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>
                    {spell.level === 0 ? 'Cantrip' : `${getOrdinal(spell.level)} Level`}
                    {spell.school && ` • ${spell.school}`}
                  </div>
                </div>
                <button
                  onClick={() => onAddSpell(spell)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Add
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', color: '#999', fontSize: '0.9rem' }}>
          Found {filteredSpells.length} spell{filteredSpells.length !== 1 ? 's' : ''}
        </div>

        <button
          className={styles.cancelBtn}
          onClick={onClose}
          style={{ width: '100%', marginTop: '1rem' }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SpellSelectionModal;
