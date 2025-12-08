// ItemModal.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ItemModal.module.css';
import { VIRTUAL_PACKS, PACK_NAMES } from '../../../constants';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: { name: string; [key: string]: any }, quantity: number) => void;
  availableItems: Array<{
    name: string;
    type: string;
    desc?: string;
    weight?: number;
    cost?: number;
    item_category?: string;
    rarity?: string;
    damageType?: string;
    damageDice?: string;
    properties?: string[];
    specialAbilities?: string[];
    [key: string]: any;
  }>;
  characterId: number;
}

const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
  availableItems,
  characterId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<ItemModalProps['availableItems'][0] | null>(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  // ✅ Merge real items with virtual packs
  const itemsWithPacks = useMemo(() => {
    const realItemNames = new Set(availableItems.map(item => item.name));
    const packsToAdd = VIRTUAL_PACKS.filter(pack => !realItemNames.has(pack.name));
    return [...availableItems, ...packsToAdd];
  }, [availableItems]);

  const filteredItems = itemsWithPacks.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  // ✅ Unified API call
  const sendAddRequest = async (isPack: boolean, body: any): Promise<boolean> => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8001/API/characters/${characterId}/items`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        alert(`Error: ${err.error || 'Unknown error'}`);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Network error:', err);
      alert('Failed to connect to server.');
      return false;
    }
  };

  const handleAdd = async () => {
    if (!selectedItem) return;

    const isPack = PACK_NAMES.includes(selectedItem.name);
    let success = false;

    if (isPack) {
      success = await sendAddRequest(true, { pack_name: selectedItem.name });
    } else {
      success = await sendAddRequest(false, { itemID: selectedItem.id, quantity });
      if (success) {
        onAddItem(selectedItem, quantity);
        setQuantity(1);
      }
    }

    if (success) {
      onClose();
    }
  };

  const handleAddAndContinue = async () => {
    if (!selectedItem) return;

    const isPack = PACK_NAMES.includes(selectedItem.name);
    let success = false;

    if (isPack) {
      success = await sendAddRequest(true, { pack_name: selectedItem.name });
    } else {
      success = await sendAddRequest(false, { itemID: selectedItem.id, quantity });
      if (success) {
        onAddItem(selectedItem, quantity);
        setQuantity(1);
      }
    }

    // Do NOT close modal
  };

  return (
    <div className={styles.overlay} onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div
        className={`${styles.modal} ${selectedItem ? styles.modalExpanded : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3>{selectedItem ? 'Item Details' : 'Add Item'}</h3>
          <button onClick={() => selectedItem ? setSelectedItem(null) : onClose()} className={styles.closeBtn}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.menuPanel}>
            <div className={styles.newButtonContainer}>
              <button
                onClick={() => {
                  onClose();
                  navigate(`/items/creator?returnTo=/characters/${characterId}`);
                }}
                className={styles.newBtn}
              >
                ➕ New Item
              </button>
            </div>

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

            <div className={styles.listContainer}>
              {filteredItems.length === 0 ? (
                <p className={styles.noResults}>No items found</p>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.name}
                    onClick={() => {
                      if (selectedItem && selectedItem.name === item.name) {
                        setSelectedItem(null);
                      } else {
                        setSelectedItem(item);
                      }
                    }}
                    className={`${styles.itemRow} ${
                      selectedItem?.name === item.name ? styles.selected : ''
                    }`}
                  >
                    <span className={styles.itemName}>{item.name}</span>
                    <small className={styles.itemType}>{item.type}</small>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedItem && (
            <div className={styles.detailsPanel}>
              <div className={styles.detailsContent}>
                <h4 className={styles.detailsTitle}>{selectedItem.name}</h4>

                <div className={styles.detailGrid}>
                  {selectedItem.type && (
                    <div><strong>Type:</strong> {selectedItem.type}</div>
                  )}
                  {selectedItem.item_category && (
                    <div><strong>Category:</strong> {selectedItem.item_category}</div>
                  )}
                  {typeof selectedItem.weight === 'number' && (
                    <div><strong>Weight:</strong> {selectedItem.weight} lbs</div>
                  )}
                  {typeof selectedItem.cost === 'number' && (
                    <div><strong>Cost:</strong> {selectedItem.cost} gp</div>
                  )}
                  {selectedItem.rarity && (
                    <div>
                      <strong>Rarity:</strong>{' '}
                      <span
                        className={`${styles.rarityBadge} ${styles[selectedItem.rarity.toLowerCase()]}`}
                      >
                        {selectedItem.rarity}
                      </span>
                    </div>
                  )}
                </div>

                {selectedItem.desc && (
                  <div className={styles.description}>
                    <strong>Description:</strong>
                    <p>{selectedItem.desc}</p>
                  </div>
                )}

                {selectedItem.type === 'Weapon' && (
                  <div className={styles.weaponDetails}>
                    {selectedItem.damageDice && (
                      <div><strong>Damage:</strong> {selectedItem.damageDice}</div>
                    )}
                    {selectedItem.damageType && (
                      <div><strong>Damage Type:</strong> {selectedItem.damageType}</div>
                    )}
                    {selectedItem.properties && selectedItem.properties.length > 0 && (
                      <div>
                        <strong>Properties:</strong>{' '}
                        {selectedItem.properties.join(', ')}
                      </div>
                    )}
                    {selectedItem.specialAbilities && selectedItem.specialAbilities.length > 0 && (
                      <div>
                        <strong>Special Abilities:</strong>
                        <ul>
                          {selectedItem.specialAbilities.map((ability, i) => (
                            <li key={i}>{ability}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Hide quantity for packs */}
                {!PACK_NAMES.includes(selectedItem.name) && (
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
                  </div>
                )}

                <div className={styles.buttonGroup}>
                  <button onClick={handleAdd} className={styles.addBtn}>
                    Add {PACK_NAMES.includes(selectedItem.name) ? 'Pack' : 'Item'}
                  </button>
                  <button onClick={handleAddAndContinue} className={styles.addMoreBtn}>
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

export default ItemModal;