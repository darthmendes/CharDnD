// ItemModal.tsx
import React, { useState, useEffect } from 'react';
import styles from './ItemModal.module.css';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: { name: string; [key: string]: any }) => void;
  availableItems: { name: string; type: string }[];
}

const ItemModal: React.FC<ItemModalProps> = ({ isOpen, onClose, onAddItem, availableItems }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter items by name
  const filteredItems = availableItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h3>Add Item</h3>
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
          {filteredItems.length === 0 ? (
            <p className={styles.noResults}>No items found</p>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.name}
                onClick={() => {
                  onAddItem(item);
                  setSearchTerm('');
                }}
                className={styles.itemRow}
                role="button"
                tabIndex={0}
                aria-label={`Add ${item.name}`}
              >
                <span className={styles.itemName}>{item.name}</span>
                <small className={styles.itemType}>{item.type}</small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemModal;