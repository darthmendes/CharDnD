// ItemDetailsModal.tsx
import React from 'react';
import styles from './ItemDetailsModal.module.css';

interface ItemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    name: string;
    type: string;
    desc?: string;
    weight?: number;
    cost?: number;
    rarity?: string;
    properties?: string[];
    damageDice?: string;
    damageType?: string;
    versatileDamage?: string;
    specialAbilities?: string[];
    maxCharges?: number;
    currentCharges?: number;
    chargeRecharge?: string;
    onHitEffect?: string;
    quantity: number;
    inventoryId?: number;
    isEquipped?: boolean;
    is_equipped?: boolean;
  } | null;
  onUpdateCharges?: (newCharges: number) => void;
  onAddItem?: () => void;
  onRemoveOne?: () => void;
  onDelete?: () => void;
  onEquip?: () => void;
  onUnequip?: () => void;
}

const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  isOpen,
  onClose,
  item,
  onUpdateCharges,
  onAddItem,
  onRemoveOne,
  onDelete,
  onEquip,
  onUnequip,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        <div className={styles.itemHeader}>
          <h2>{item.name}</h2>
          <p className={styles.itemType}>{item.type}</p>
          {item.quantity > 1 && (
            <p className={styles.quantity}>Quantity: {item.quantity}</p>
          )}
        </div>

        <div className={styles.itemContent}>
          {item.desc && (
            <div className={styles.itemSection}>
              <p className={styles.itemDesc}>{item.desc}</p>
            </div>
          )}

          <div className={styles.itemStats}>
            {item.weight && (
              <div className={styles.statRow}>
                <strong>Weight:</strong>
                <span>{item.weight} lbs</span>
              </div>
            )}
            {item.cost && (
              <div className={styles.statRow}>
                <strong>Cost:</strong>
                <span>{item.cost} gp</span>
              </div>
            )}
            {item.rarity && (
              <div className={styles.statRow}>
                <strong>Rarity:</strong>
                <span className={styles.rarity}>{item.rarity}</span>
              </div>
            )}
          </div>

          {item.damageDice && (
            <div className={styles.itemSection}>
              <strong>Damage:</strong>
              <p>{item.damageDice} {item.damageType}</p>
              {item.versatileDamage && (
                <p className={styles.versatileDamage}>
                  <em>Two-handed: {item.versatileDamage} {item.damageType}</em>
                </p>
              )}
            </div>
          )}

          {item.properties && item.properties.length > 0 && (
            <div className={styles.itemSection}>
              <strong>Properties:</strong>
              <div className={styles.propertiesList}>
                {item.properties.map((prop: string, idx: number) => (
                  <span key={idx} className={styles.propertyTag}>{prop}</span>
                ))}
              </div>
            </div>
          )}

          {item.specialAbilities && item.specialAbilities.length > 0 && (
            <div className={styles.itemSection}>
              <strong>Special Abilities:</strong>
              <ul className={styles.abilitiesList}>
                {item.specialAbilities.map((ability: string, idx: number) => (
                  <li key={idx}>{ability}</li>
                ))}
              </ul>
            </div>
          )}

          {item.onHitEffect && (
            <div className={styles.itemSection}>
              <strong>On-Hit Effect:</strong>
              <p>{item.onHitEffect}</p>
            </div>
          )}

          {item.maxCharges && onUpdateCharges && (
            <div className={styles.chargesSection}>
              <div className={styles.chargesHeader}>
                <strong>Charges: {item.currentCharges} / {item.maxCharges}</strong>
                {item.chargeRecharge && (
                  <span className={styles.rechargeInfo}>Recharge: {item.chargeRecharge}</span>
                )}
              </div>
              <div className={styles.chargesButtons}>
                <button
                  onClick={() => onUpdateCharges(Math.max(0, (item.currentCharges || 0) - 1))}
                  disabled={(item.currentCharges || 0) <= 0}
                  className={styles.chargeBtn}
                >
                  − Decrease
                </button>
                <button
                  onClick={() => onUpdateCharges(Math.min(item.maxCharges || 0, (item.currentCharges || 0) + 1))}
                  disabled={(item.currentCharges || 0) >= (item.maxCharges || 0)}
                  className={styles.chargeBtn}
                >
                  + Increase
                </button>
                <button
                  onClick={() => onUpdateCharges(item.maxCharges || 0)}
                  className={styles.chargeBtn}
                >
                  Restore Full
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.closeAction}>
          <div className={styles.actionButtons}>
            {item.type === 'Armor' && onEquip && !(item.isEquipped || item.is_equipped) && (
              <button onClick={onEquip} className={styles.equipBtn}>
                ⚔️ Equip
              </button>
            )}
            {item.type === 'Armor' && onUnequip && (item.isEquipped || item.is_equipped) && (
              <button onClick={onUnequip} className={styles.unequipBtn}>
                ✓ Unequip
              </button>
            )}
            {onAddItem && (
              <button onClick={onAddItem} className={styles.addMoreBtn}>
                + Add 1 More
              </button>
            )}
            {onRemoveOne && (
              <button onClick={onRemoveOne} className={styles.removeOneBtn}>
                − Remove 1
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className={styles.deleteBtn}>
                🗑️ Delete
              </button>
            )}
          </div>
          <button onClick={onClose} className={styles.closeActionBtn}>Done</button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsModal;
