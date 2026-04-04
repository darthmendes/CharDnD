// src/components/ItemModal/ItemModal.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ItemModal.module.css';
import { VIRTUAL_PACKS, PACK_NAMES } from '../../../constants'; // ✅ Adjust path as needed

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: { name: string; [key: string]: any }, quantity: number) => void;
  onAddPack?: (packName: string) => void;
  availableItems: Array<{
    name: string;
    item_type: string;
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
  onAddPack,
  availableItems,
  characterId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [filterType, setFilterType] = useState<string | 'all'>('all');
  const [filterRarity, setFilterRarity] = useState<string | 'all'>('all');
  const navigate = useNavigate();

  const itemsWithPacks = useMemo(() => {
    const realItemNames = new Set(availableItems.map(item => item.name));
    const packsToAdd = VIRTUAL_PACKS.filter(pack => !realItemNames.has(pack.name));
    return [...availableItems, ...packsToAdd];
  }, [availableItems]);

  // Get unique item types and rarities for filter options
  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    itemsWithPacks.forEach((item) => {
      if (item.item_type) types.add(item.item_type);
    });
    return Array.from(types).sort();
  }, [itemsWithPacks]);

  const uniqueRarities = useMemo(() => {
    const rarities = new Set<string>();
    itemsWithPacks.forEach((item) => {
      if (item.rarity) rarities.add(item.rarity);
    });
    return Array.from(rarities).sort();
  }, [itemsWithPacks]);

  const filteredItems = itemsWithPacks.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.item_type === filterType;
    const matchesRarity = filterRarity === 'all' || item.rarity === filterRarity;
    return matchesSearch && matchesType && matchesRarity;
  });

  if (!isOpen) return null;

  const handleAddItemOrPack = async (closeAfter: boolean) => {
    if (!selectedItem) return;

    const isPack = PACK_NAMES.includes(selectedItem.name);

    if (isPack) {
      onAddPack?.(selectedItem.name);
      onClose();
    } else {
      onAddItem(selectedItem, quantity);
      setQuantity(1);
      if (closeAfter) {
        onClose();
      }
    }
  };

  const handleAdd = () => handleAddItemOrPack(true);
  const handleAddAndContinue = () => handleAddItemOrPack(false);

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

            {/* Filter Controls */}
            <div style={{ padding: '0.75rem', borderTop: '1px solid #ddd' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.25rem' }}>
                  Type:
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className={styles.searchInput}
                  style={{ fontSize: '0.9rem' }}
                >
                  <option value="all">All Types</option>
                  {uniqueTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.25rem' }}>
                  Rarity:
                </label>
                <select
                  value={filterRarity}
                  onChange={(e) => setFilterRarity(e.target.value)}
                  className={styles.searchInput}
                  style={{ fontSize: '0.9rem' }}
                >
                  <option value="all">All Rarities</option>
                  {uniqueRarities.map((rarity) => (
                    <option key={rarity} value={rarity}>
                      {rarity}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.listContainer}>
              {filteredItems.length === 0 ? (
                <p className={styles.noResults}>No items found</p>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.name}
                    onClick={() => {
                      if (selectedItem?.name === item.name) {
                        setSelectedItem(null);
                      } else {
                        setSelectedItem(item);
                      }
                    }}
                    className={`${styles.itemRow} ${selectedItem?.name === item.name ? styles.selected : ''}`}
                  >
                    <span className={styles.itemName}>{item.name}</span>
                    <small className={styles.itemType}>{item.item_type}</small>
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
                  {selectedItem.item_type && <div><strong>Type:</strong> {selectedItem.item_type}</div>}
                  {selectedItem.item_category && <div><strong>Category:</strong> {selectedItem.item_category}</div>}
                  {typeof selectedItem.weight === 'number' && <div><strong>Weight:</strong> {selectedItem.weight} lbs</div>}
                  {typeof selectedItem.cost === 'number' && <div><strong>Cost:</strong> {selectedItem.cost} gp</div>}
                  {selectedItem.rarity && (
                    <div>
                      <strong>Rarity:</strong>
                      <span className={`${styles.rarityBadge} ${styles[selectedItem.rarity.toLowerCase()]}`}>
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

                {selectedItem.item_type === 'Weapon' && (
                  <div className={styles.weaponDetails}>
                    {selectedItem.damageDice && <div><strong>Damage:</strong> {selectedItem.damageDice}</div>}
                    {selectedItem.damageType && <div><strong>Damage Type:</strong> {selectedItem.damageType}</div>}
                    {selectedItem.properties?.length && (
                      <div><strong>Properties:</strong> {selectedItem.properties.join(', ')}</div>
                    )}
                    {selectedItem.specialAbilities?.length && (
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