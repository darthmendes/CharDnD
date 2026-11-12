import React from 'react';
import { Character } from '../../../types/Character';
import ItemModal from '../../Items/ItemModal/ItemModal';
import ItemDetailsModal from './ItemDetailsModal/ItemDetailsModal';
import styles from '../CharacterDisplay.module.css';

interface CharacterInventoryProps {
  character: Character | null;
  characterId: string | undefined;
  isItemModalOpen: boolean;
  onItemModalOpen: () => void;
  onItemModalClose: () => void;
  availableItems: any[];
  itemsLoading: boolean;
  showEquippedOnly: boolean;
  onShowEquippedOnlyChange: (value: boolean) => void;
  showAttunedOnly: boolean;
  onShowAttunedOnlyChange: (value: boolean) => void;
  isBulkDeleteMode: boolean;
  selectedItemsForDelete: Set<number>;
  onBulkDeleteModeToggle: () => void;
  onItemSelectForDelete: (inventoryId: number) => void;
  onBulkDelete: () => Promise<void>;
  onAddItem: (item: any, qty?: number) => Promise<void>;
  onDeleteItem: (inventoryId: number, name: string) => Promise<void>;
  onRemoveOne: (inventoryId: number, name: string, qty: number) => Promise<void>;
  onAddMore: (item: any) => Promise<void>;
  onUpdateCharges: (inventoryId: number, charges: number) => Promise<void>;
  onEquipItem: (inventoryId: number, name: string, item: any) => Promise<void>;
  onUnequipItem: (inventoryId: number, name: string) => Promise<void>;
  onAttuneItem: (inventoryId: number, name: string, item: any) => Promise<void>;
  onUnattuneItem: (inventoryId: number, name: string) => Promise<void>;
  selectedItemForDetails: any | null;
  onSelectItemForDetails: (item: any | null) => void;
  attunedCount: number;
  attunementSlotLimit: number;
  requiresAttunement: (item: any) => boolean;
  isItemAttuned: (item: any) => boolean;
  canEquip: (item: any) => boolean;
  canAttuneMore: () => boolean;
  expanded: boolean;
  onToggle: () => void;
}

const CharacterInventory: React.FC<CharacterInventoryProps> = ({
  character,
  characterId,
  isItemModalOpen,
  onItemModalOpen,
  onItemModalClose,
  availableItems,
  itemsLoading,
  showEquippedOnly,
  onShowEquippedOnlyChange,
  showAttunedOnly,
  onShowAttunedOnlyChange,
  isBulkDeleteMode,
  selectedItemsForDelete,
  onBulkDeleteModeToggle,
  onItemSelectForDelete,
  onBulkDelete,
  onAddItem,
  onDeleteItem,
  onRemoveOne,
  onAddMore,
  onUpdateCharges,
  onEquipItem,
  onUnequipItem,
  onAttuneItem,
  onUnattuneItem,
  selectedItemForDetails,
  onSelectItemForDetails,
  attunedCount,
  attunementSlotLimit,
  requiresAttunement,
  isItemAttuned,
  canEquip,
  canAttuneMore,
  expanded,
  onToggle,
}) => {
  if (!character) return null;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader} onClick={onToggle} style={{ cursor: 'pointer' }}>
        <div className={styles.sectionTitle}>
          <span className={`${styles.toggleIcon} ${expanded ? '' : styles.collapsed}`}>▼</span>
          <h2>Inventory</h2>
        </div>
        <span className={styles.collapseHint}>{expanded ? 'Hide' : 'Show'}</span>
      </div>

      <div className={`${styles.sectionContent} ${expanded ? '' : styles.collapsed}`}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <button className={styles.primary} onClick={onItemModalOpen} disabled={itemsLoading}>
            {itemsLoading ? 'Loading Items...' : 'Add Item'}
          </button>
          {character.items && Array.isArray(character.items) && character.items.length > 0 && (
            <>
              <button className={isBulkDeleteMode ? styles.danger : styles.secondary} onClick={onBulkDeleteModeToggle}>
                {isBulkDeleteMode ? 'Cancel Bulk Delete' : 'Delete Items'}
              </button>
              <button className={showEquippedOnly ? styles.active : styles.secondary} onClick={() => onShowEquippedOnlyChange(!showEquippedOnly)}>
                {showEquippedOnly ? 'Show All Items' : 'Equipped Only'}
              </button>
              <button className={showAttunedOnly ? styles.active : styles.secondary} onClick={() => onShowAttunedOnlyChange(!showAttunedOnly)}>
                {showAttunedOnly ? 'Show All Items' : 'Attuned Only'}
              </button>
            </>
          )}
          {isBulkDeleteMode && selectedItemsForDelete.size > 0 && (
            <button className={styles.danger} onClick={onBulkDelete}>
              Delete {selectedItemsForDelete.size} Item(s)
            </button>
          )}
        </div>

        <ItemModal
          isOpen={isItemModalOpen}
          onClose={onItemModalClose}
          onAddItem={onAddItem}
          availableItems={availableItems}
          characterId={character.id}
        />

        {character.items && Array.isArray(character.items) && character.items.length > 0 ? (
          <div className={styles.inventoryList}>
            {character.items
              .filter((item: any) => {
                if (showEquippedOnly) return item.is_equipped === true;
                if (showAttunedOnly) return item.is_attuned === true;
                return true;
              })
              .map((item: any) => {
                const isSelected = selectedItemsForDelete.has(item.inventoryId);
                const itemData = item.item || item;
                const canEq = canEquip(item);
                const isEq = item.is_equipped || false;
                const needsAtt = requiresAttunement(item);
                const isAtt = isItemAttuned(item);

                return (
                  <div
                    key={item.inventoryId}
                    className={`${styles.inventoryItem} ${isBulkDeleteMode && isSelected ? styles.selectedForDelete : ''} ${isEq ? styles.equippedItem : ''} ${isAtt ? styles.attunedItem : ''}`}
                    onClick={() => {
                      if (isBulkDeleteMode) onItemSelectForDelete(item.inventoryId);
                      else onSelectItemForDetails(item);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {isBulkDeleteMode && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          onItemSelectForDelete(item.inventoryId);
                        }}
                        style={{ cursor: 'pointer', flexShrink: 0, marginTop: '2px' }}
                      />
                    )}
                    <div className={styles.inventoryItemContent}>
                      <div className={styles.inventoryItemHeader}>
                        <span className={styles.inventoryItemName}>
                          {item.name} {item.quantity > 1 && `(x${item.quantity})`}
                          {isEq && <span className={styles.equippedBadge}>Equipped</span>}
                          {isAtt && <span className={styles.attunedBadge}>[ATTUNED]</span>}
                          {needsAtt && !isAtt && <span className={styles.attunementBadge}>[REQUIRES ATTUNEMENT]</span>}
                        </span>
                        <div className={styles.inventoryItemQuickInfo}>
                          {item.item_type && <span className={styles.itemType}>{item.item_type}</span>}
                          {canEq &&
                            !isBulkDeleteMode &&
                            (isEq ? (
                              <button
                                className={styles.unequipButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUnequipItem(item.inventoryId, item.name);
                                }}
                              >
                                Unequip
                              </button>
                            ) : (
                              <button
                                className={styles.equipButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEquipItem(item.inventoryId, item.name, itemData);
                                }}
                              >
                                Equip
                              </button>
                            ))}
                          {needsAtt &&
                            !isBulkDeleteMode &&
                            (isAtt ? (
                              <button
                                className={styles.unattuneButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUnattuneItem(item.inventoryId, item.name);
                                }}
                              >
                                Unattune
                              </button>
                            ) : (
                              <button
                                className={`${styles.attuneButton} ${!canAttuneMore() ? styles.attuneButtonDisabled : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (canAttuneMore()) onAttuneItem(item.inventoryId, item.name, itemData);
                                  else alert(`Cannot attune: Max ${attunementSlotLimit}`);
                                }}
                                disabled={!canAttuneMore()}
                              >
                                Attune
                              </button>
                            ))}
                          {item.maxCharges && (
                            <span className={styles.chargesIndicator}>
                              Charges: {item.currentCharges}/{item.maxCharges}
                              {needsAtt && !isAtt && <span className={styles.lockedBadge}> [LOCKED]</span>}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <p className={styles.emptyInventory}>No items yet.</p>
        )}

        <ItemDetailsModal
          isOpen={selectedItemForDetails !== null}
          onClose={() => onSelectItemForDetails(null)}
          item={selectedItemForDetails}
          onUpdateCharges={(nc) => {
            if (selectedItemForDetails?.inventoryId) {
              onUpdateCharges(selectedItemForDetails.inventoryId, nc).then(() =>
                onSelectItemForDetails({ ...selectedItemForDetails, currentCharges: nc })
              );
            }
          }}
          onAddItem={() => {
            if (selectedItemForDetails) {
              onAddMore(selectedItemForDetails);
              onSelectItemForDetails(null);
            }
          }}
          onRemoveOne={() => {
            if (selectedItemForDetails) {
              onRemoveOne(selectedItemForDetails.inventoryId, selectedItemForDetails.name, selectedItemForDetails.quantity);
              onSelectItemForDetails(null);
            }
          }}
          onDelete={() => {
            if (selectedItemForDetails) {
              onDeleteItem(selectedItemForDetails.inventoryId, selectedItemForDetails.name);
              onSelectItemForDetails(null);
            }
          }}
          onEquip={() => {
            if (selectedItemForDetails) onEquipItem(selectedItemForDetails.inventoryId, selectedItemForDetails.name, selectedItemForDetails.item || selectedItemForDetails);
          }}
          onUnequip={() => {
            if (selectedItemForDetails) onUnequipItem(selectedItemForDetails.inventoryId, selectedItemForDetails.name);
          }}
          onAttune={() => {
            if (selectedItemForDetails && canAttuneMore()) onAttuneItem(selectedItemForDetails.inventoryId, selectedItemForDetails.name, selectedItemForDetails.item || selectedItemForDetails);
          }}
          onUnattune={() => {
            if (selectedItemForDetails) onUnattuneItem(selectedItemForDetails.inventoryId, selectedItemForDetails.name);
          }}
          canEquip={canEquip(selectedItemForDetails?.item || selectedItemForDetails)}
          isEquipped={selectedItemForDetails?.is_equipped || false}
          requiresAttunement={requiresAttunement(selectedItemForDetails?.item || selectedItemForDetails)}
          isAttuned={isItemAttuned(selectedItemForDetails?.item || selectedItemForDetails)}
          canAttuneMore={canAttuneMore()}
          attunedCount={attunedCount}
          attunementLimit={attunementSlotLimit}
        />
      </div>
    </section>
  );
};

export default CharacterInventory;
