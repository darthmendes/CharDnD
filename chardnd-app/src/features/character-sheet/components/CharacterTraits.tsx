import React, { useState } from 'react';
import styles from '../CharacterDisplay.module.css';

interface Trait {
  name: string;
  description: string;
  source: string;
}

interface CharacterTraitsProps {
  traits: Trait[];
  expanded: boolean;
  onToggle: () => void;
}

const CharacterTraits: React.FC<CharacterTraitsProps> = ({ traits, expanded, onToggle }) => {
  const [expandedTrait, setExpandedTrait] = useState<string | null>(null);

  const toggleTraitExpand = (name: string) => {
    setExpandedTrait(expandedTrait === name ? null : name);
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader} onClick={onToggle} style={{ cursor: 'pointer' }}>
        <div className={styles.sectionTitle}>
          <span className={`${styles.toggleIcon} ${expanded ? '' : styles.collapsed}`}>▼</span>
          <h2>Traits</h2>
        </div>
        <span className={styles.collapseHint}>{expanded ? 'Hide' : 'Show'}</span>
      </div>

      <div className={`${styles.sectionContent} ${expanded ? '' : styles.collapsed}`}>
        {traits.length > 0 ? (
          <div className={styles.traitsList}>
            {traits.map((t, i) => (
              <div
                key={i}
                className={`${styles.traitCard} ${expandedTrait === t.name ? styles.traitCardExpanded : ''}`}
                onClick={() => toggleTraitExpand(t.name)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.traitCardHeader}>
                  <span className={styles.traitName}>{t.name}</span>
                  <span className={styles.traitSource}>{t.source}</span>
                  <span className={styles.traitExpandIcon}>{expandedTrait === t.name ? '▲' : '▼'}</span>
                </div>
                {expandedTrait === t.name && <div className={styles.traitDescription}>{t.description}</div>}
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyInventory}>No traits yet.</p>
        )}
      </div>
    </section>
  );
};

export default CharacterTraits;
