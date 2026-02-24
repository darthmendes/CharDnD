// StatModifiersModal.tsx
import React from 'react';
import styles from './StatModifiersModal.module.css';

interface StatModifier {
  itemName: string;
  value: number;
  type: 'bonus' | 'penalty' | 'base';
}

interface StatModifiersModalProps {
  isOpen: boolean;
  onClose: () => void;
  statName: string;
  currentValue: number;
  modifiers: StatModifier[];
  baseValue?: number;
}

const StatModifiersModal: React.FC<StatModifiersModalProps> = ({
  isOpen,
  onClose,
  statName,
  currentValue,
  modifiers,
  baseValue = 0,
}) => {
  if (!isOpen) return null;

  const totalBonus = modifiers
    .filter(m => m.type === 'bonus')
    .reduce((sum, m) => sum + m.value, 0);
  
  const totalPenalty = modifiers
    .filter(m => m.type === 'penalty')
    .reduce((sum, m) => sum + m.value, 0);

  const baseModifier = modifiers.find(m => m.type === 'base');

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        <div className={styles.modalHeader}>
          <h2>{statName} Modifiers</h2>
          <div className={styles.currentValue}>
            Current Value: <strong>{currentValue}</strong>
          </div>
        </div>

        <div className={styles.modifiersContainer}>
          {modifiers.length === 0 ? (
            <p className={styles.noModifiers}>No modifiers applied</p>
          ) : (
            <>
              {baseModifier && (
                <div className={styles.modifierGroup}>
                  <h3>Base</h3>
                  <div className={styles.modifier}>
                    <span className={styles.itemName}>{baseModifier.itemName}</span>
                    <span className={`${styles.value} ${styles.base}`}>
                      {baseModifier.value}
                    </span>
                  </div>
                </div>
              )}

              {modifiers.filter(m => m.type === 'bonus').length > 0 && (
                <div className={styles.modifierGroup}>
                  <h3>
                    Bonuses
                    {totalBonus > 0 && <span className={styles.groupTotal}>+{totalBonus}</span>}
                  </h3>
                  {modifiers
                    .filter(m => m.type === 'bonus')
                    .map((mod, idx) => (
                      <div key={idx} className={styles.modifier}>
                        <span className={styles.itemName}>{mod.itemName}</span>
                        <span className={`${styles.value} ${styles.bonus}`}>+{mod.value}</span>
                      </div>
                    ))}
                </div>
              )}

              {modifiers.filter(m => m.type === 'penalty').length > 0 && (
                <div className={styles.modifierGroup}>
                  <h3>
                    Penalties
                    {totalPenalty > 0 && <span className={styles.groupTotal}>-{totalPenalty}</span>}
                  </h3>
                  {modifiers
                    .filter(m => m.type === 'penalty')
                    .map((mod, idx) => (
                      <div key={idx} className={styles.modifier}>
                        <span className={styles.itemName}>{mod.itemName}</span>
                        <span className={`${styles.value} ${styles.penalty}`}>-{mod.value}</span>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
        </div>

        <button onClick={onClose} className={styles.closeBtn} style={{ marginTop: '20px' }}>
          Close
        </button>
      </div>
    </div>
  );
};

export default StatModifiersModal;
