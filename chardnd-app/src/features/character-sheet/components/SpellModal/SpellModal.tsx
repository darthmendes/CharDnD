// SpellModal.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SpellModal.module.css';

interface SpellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSpell: (Spell: { name: string; [key: string]: any }, quantity: number) => void;
  availableSpells: Array<{
    name: string;
    type: string;
    desc?: string;
    weight?: number;
    cost?: number;
    Spell_category?: string;
    rarity?: string;
    [key: string]: any;
  }>;
  characterId: number;
}

const SpellModal: React.FC<SpellModalProps> = ({
  isOpen,
  onClose,
  onAddSpell,
  availableSpells,
  characterId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpell, setSelectedSpell] = useState<SpellModalProps['availableSpells'][0] | null>(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  const filteredSpells = availableSpells.filter((Spell) =>
    Spell.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!selectedSpell) return;
    onAddSpell({ ...selectedSpell }, quantity);
    setQuantity(1);
  };

  const handleAddAndContinue = () => {
    if (!selectedSpell) return;
    onAddSpell({ ...selectedSpell }, quantity);
    setQuantity(1);
    // Do NOT close details — reset for next
  };

  return (
    <div className={styles.overlay} onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      {/* Conditionally wider modal */}
      <div
        className={`${styles.modal} ${selectedSpell ? styles.modalExpanded : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <h3>{selectedSpell ? 'Spell Details' : 'Add Spell'}</h3>
          <button onClick={() => selectedSpell ? setSelectedSpell(null) : onClose()} className={styles.closeBtn}>
            ×
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Left: Original Menu */}
          <div className={styles.menuPanel}>
            {/* "New" Button */}
            <div className={styles.newButtonContainer}>
              <button
                onClick={() => {
                  onClose();
                  navigate(`/Spells/creator?returnTo=/characters/${characterId}`);
                }}
                className={styles.newBtn}
              >
                ➕ New Spell
              </button>
            </div>

            {/* Search */}
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search Spells..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
                autoFocus
              />
            </div>

            {/* Spell List */}
            <div className={styles.listContainer}>
              {filteredSpells.length === 0 ? (
                <p className={styles.noResults}>No Spells found</p>
              ) : (
                filteredSpells.map((Spell) => (
                  <div
                    key={Spell.name}
                    onClick={() => {
                      if (selectedSpell && selectedSpell.name === Spell.name) {
                        setSelectedSpell(null);
                      } else {
                        setSelectedSpell(Spell);
                      }
                    }}
                    className={`${styles.SpellRow} ${
                      selectedSpell?.name === Spell.name ? styles.selected : ''
                    }`}
                  >
                    <span className={styles.SpellName}>{Spell.name}</span>
                    <small className={styles.SpellType}>{Spell.type}</small>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Details Panel – Only shown when expanded */}
          {selectedSpell && (
            <div className={styles.detailsPanel}>
              <div className={styles.detailsContent}>
                <h4 className={styles.detailsTitle}>{selectedSpell.name}</h4>

                <div className={styles.detailGrid}>
                  {selectedSpell.type && (
                    <div><strong>Type:</strong> {selectedSpell.type}</div>
                  )}
                  {selectedSpell.Spell_category && (
                    <div><strong>Category:</strong> {selectedSpell.Spell_category}</div>
                  )}
                  {typeof selectedSpell.weight === 'number' && (
                    <div><strong>Weight:</strong> {selectedSpell.weight} lbs</div>
                  )}
                  {typeof selectedSpell.cost === 'number' && (
                    <div><strong>Cost:</strong> {selectedSpell.cost} gp</div>
                  )}
                  {selectedSpell.rarity && (
                    <div>
                      <strong>Rarity:</strong>{' '}
                      <span
                        className={`${styles.rarityBadge} ${styles[selectedSpell.rarity.toLowerCase()]}`}
                      >
                        {selectedSpell.rarity}
                      </span>
                    </div>
                  )}
                </div>

                {selectedSpell.desc && (
                  <div className={styles.description}>
                    <strong>Description:</strong>
                    <p>{selectedSpell.desc}</p>
                  </div>
                )}

                <div className={styles.quantitySection}>
                  <label>
                    Quantity:
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className={styles.quantityInput}
                    />
                  </label>

                  <div className={styles.buttonGroup}>
                    <button onClick={handleAdd} className={styles.addBtn}>
                      Add Spell
                    </button>
                    <button onClick={handleAddAndContinue} className={styles.addMoreBtn}>
                      Add & Add Another
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpellModal;