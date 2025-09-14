// ItemModal.tsx
import React, { useState, useEffect } from 'react';
import styles from './SpellModal.module.css';

interface SpellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSpell: (spell: { name: string; [key: string]: any }) => void;
  availableSpells: { name: string; type: string }[];
}

const SpellModal: React.FC<SpellModalProps> = ({ isOpen, onClose, onAddSpell, availableSpells }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter items by name
  const filteredSpells = availableSpells.filter((spell) =>
    spell.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h3>Add Spell</h3>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
            ×
          </button>
        </div>

        {/* Search */}
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            autoFocus
          />
        </div>

        {/* Item List */}
        <div className={styles.listContainer}>
          {filteredSpells.length === 0 ? (
            <p className={styles.noResults}>No spells found</p>
          ) : (
            filteredSpells.map((spell) => (
              <div
                key={spell.name}
                onClick={() => {
                  onAddSpell(spell);
                  setSearchTerm('');
                }}
                className={styles.itemRow}
                role="button"
                tabIndex={0}
                aria-label={`Add ${spell.name}`}
              >
                <span className={styles.spellName}>{spell.name}</span>
                <small className={styles.spellType}>{spell.type}</small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SpellModal;