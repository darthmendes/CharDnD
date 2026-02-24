// ProficiencyModal.tsx
import React from 'react';
import styles from './ProficiencyModal.module.css';

interface ProficiencySource {
  itemName: string;
  proficiency: string;
}

interface ProficiencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalType: 'skills' | 'weapons' | 'tools' | 'languages';
  proficiencies: ProficiencySource[];
  title?: string;
}

const ProficiencyModal: React.FC<ProficiencyModalProps> = ({
  isOpen,
  onClose,
  modalType,
  proficiencies,
  title,
}) => {
  if (!isOpen) return null;

  const getTitle = (): string => {
    if (title) return title;
    switch (modalType) {
      case 'skills':
        return 'Skill Proficiencies';
      case 'weapons':
        return 'Weapon Proficiencies';
      case 'tools':
        return 'Tool Proficiencies';
      case 'languages':
        return 'Languages';
      default:
        return 'Proficiencies';
    }
  };

  const getIcon = (): string => {
    switch (modalType) {
      case 'skills':
        return '🎯';
      case 'weapons':
        return '⚔️';
      case 'tools':
        return '🔧';
      case 'languages':
        return '💬';
      default:
        return '📋';
    }
  };

  // Group proficiencies by item source
  const groupedByItem = proficiencies.reduce(
    (acc, prof) => {
      if (!acc[prof.itemName]) {
        acc[prof.itemName] = [];
      }
      acc[prof.itemName].push(prof.proficiency);
      return acc;
    },
    {} as Record<string, string[]>
  );

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        <div className={styles.modalHeader}>
          <h2>
            <span className={styles.icon}>{getIcon()}</span>
            {getTitle()}
          </h2>
          <p className={styles.count}>{proficiencies.length} proficiencies</p>
        </div>

        <div className={styles.proficienciesContainer}>
          {proficiencies.length === 0 ? (
            <p className={styles.emptyMessage}>No proficiencies from equipped items</p>
          ) : (
            <div className={styles.proficienciesList}>
              {Object.entries(groupedByItem).map(([itemName, profs]) => (
                <div key={itemName} className={styles.itemGroup}>
                  <div className={styles.itemName}>
                    <span className={styles.itemIcon}>📦</span>
                    {itemName}
                  </div>
                  <div className={styles.proficienciesInItem}>
                    {profs.map((prof, idx) => (
                      <div key={idx} className={styles.proficiencyTag}>
                        {prof}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={onClose} className={styles.closeBtn} style={{ marginTop: '20px' }}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ProficiencyModal;
