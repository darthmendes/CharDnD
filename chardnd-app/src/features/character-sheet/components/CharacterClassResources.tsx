import React from 'react';
import { useClassResources, type ClassResource } from '../hooks';
import { Character } from '../../../types/Character';
import styles from '../CharacterDisplay.module.css';

interface CharacterClassResourcesProps {
  character: Character | null;
  characterId: string | undefined;
  expanded: boolean;
  onToggle: () => void;
}

const CharacterClassResources: React.FC<CharacterClassResourcesProps> = ({
  character,
  characterId,
  expanded,
  onToggle,
}) => {
  const { classResources, savingResource, adjustResource, restRecovery } = useClassResources(character, characterId);

  if (!character) return null;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader} onClick={onToggle} style={{ cursor: 'pointer' }}>
        <div className={styles.sectionTitle}>
          <span className={`${styles.toggleIcon} ${expanded ? '' : styles.collapsed}`}>▼</span>
          <h2>Class Resources</h2>
        </div>
        <span className={styles.collapseHint}>{expanded ? 'Hide' : 'Show'}</span>
      </div>

      <div className={`${styles.sectionContent} ${expanded ? '' : styles.collapsed}`}>
        {classResources.length > 0 ? (
          <>
            <div className={styles.resourcesGrid}>
              {classResources.map((res) => (
                <div key={res.id} className={styles.resourceCard}>
                  <div className={styles.resourceHeader}>
                    <strong>
                      {res.icon ? `${res.icon} ` : ''}
                      {res.name}
                    </strong>
                    <span className={styles.rechargeBadge}>
                      {res.recharge === 'short' ? 'SR' : res.recharge === 'long' ? 'LR' : 'Both'}
                    </span>
                  </div>
                  <div className={styles.resourceCount}>
                    {res.current}/{res.max}
                  </div>
                  <div className={styles.resourceControls}>
                    <button
                      onClick={() => adjustResource(res.id, -1)}
                      disabled={res.current <= 0 || savingResource === res.id}
                      title="Expend 1 use"
                    >
                      −
                    </button>
                    <button
                      onClick={() => adjustResource(res.id, 1)}
                      disabled={res.current >= res.max || savingResource === res.id}
                      title="Recover 1 use"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.restButtons}>
              <button className={styles.restBtnShort} onClick={() => restRecovery('short')}>
                Short Rest
              </button>
              <button className={styles.restBtnLong} onClick={() => restRecovery('long')}>
                Long Rest
              </button>
            </div>
          </>
        ) : (
          <p className={styles.emptyStateMessage}>No class resources available.</p>
        )}
      </div>
    </section>
  );
};

export default CharacterClassResources;
