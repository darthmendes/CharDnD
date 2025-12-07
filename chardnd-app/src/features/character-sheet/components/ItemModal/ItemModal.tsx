// ItemModal.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ItemModal.module.css';

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

  const filteredItems = availableItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!selectedItem) return;
    onAddItem({ ...selectedItem }, quantity);
    setQuantity(1);
  };

  const handleAddAndContinue = () => {
    if (!selectedItem) return;
    onAddItem({ ...selectedItem }, quantity);
    setQuantity(1);
    // Do NOT close details — reset for next
  };

  return (
    <div className={styles.overlay} onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      {/* Conditionally wider modal */}
      <div
        className={`${styles.modal} ${selectedItem ? styles.modalExpanded : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <h3>{selectedItem ? 'Item Details' : 'Add Item'}</h3>
          <button onClick={() => selectedItem ? setSelectedItem(null) : onClose()} className={styles.closeBtn}>
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
                  navigate(`/items/creator?returnTo=/characters/${characterId}`);
                }}
                className={styles.newBtn}
              >
                ➕ New Item
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
              {filteredItems.length === 0 ? (
                <p className={styles.noResults}>No items found</p>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.name}
                    onClick={() => setSelectedItem(item)}
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

          {/* Right: Details Panel – Only shown when expanded */}
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
                      Add Item
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

export default ItemModal;