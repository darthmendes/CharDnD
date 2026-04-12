// SpellDetailsModal.tsx - View full details of a spell
import React from 'react';
import styles from './SpellModal.module.css';

interface SpellDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  spell: {
    id?: number;
    name: string;
    level: number;
    school?: string;
    casting_time?: string;
    range?: string;
    components?: string;
    material_components?: string;
    duration?: string;
    concentration?: boolean;
    ritual?: boolean;
    description?: string;
    higher_levels?: string;
    damage_dice?: string;
    damage_type?: string;
    save_ability?: string;
    save_half_on_success?: boolean;
    attack_type?: string;
    healing_dice?: string;
    healing_type?: string;
    aoe_type?: string;
    aoe_size?: number;
    cantrip_scaling_levels?: number[];
    cantrip_scaling_dice?: string;
    upcast_damage_per_slot?: string;
  } | null;
  spellSaveDC?: number;
  spellAttackBonus?: number;
  spellcastingAbility?: string;
}

const SpellDetailsModal: React.FC<SpellDetailsModalProps> = ({
  isOpen,
  onClose,
  spell,
  spellSaveDC = 0,
  spellAttackBonus = 0,
  spellcastingAbility = 'int',
}) => {
  if (!isOpen || !spell) return null;

  const getOrdinal = (n: number) => {
    if (n === 0) return 'Cantrip';
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.spellDetailsContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        {/* Header */}
        <div className={styles.spellDetailsHeader}>
          <h2>{spell.name}</h2>
          <div className={styles.spellHeaderMeta}>
            <span className={styles.spellLevel}>
              {getOrdinal(spell.level)} {spell.level !== 0 && 'Level'} Spell
            </span>
            {spell.school && (
              <span className={styles.spellSchool}>{spell.school}</span>
            )}
            {spell.ritual && (
              <span className={styles.spellTag}>Ritual</span>
            )}
            {spell.concentration && (
              <span className={styles.spellConcentration}>Concentration</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={styles.spellDetailsContent}>
          
          {/* Basic Casting Info */}
          <div className={styles.spellInfoSection}>
            <h4 className={styles.sectionTitle}>Casting Details</h4>
            <div className={styles.infoPair}>
              <strong>Casting Time:</strong>
              <span>{spell.casting_time || 'N/A'}</span>
            </div>
            <div className={styles.infoPair}>
              <strong>Range:</strong>
              <span>{spell.range || 'N/A'}</span>
            </div>
            <div className={styles.infoPair}>
              <strong>Components:</strong>
              <span>{spell.components || 'N/A'}</span>
            </div>
            {spell.material_components && (
              <div className={styles.infoPair}>
                <strong>Materials:</strong>
                <span>{spell.material_components}</span>
              </div>
            )}
            <div className={styles.infoPair}>
              <strong>Duration:</strong>
              <span>{spell.duration || 'N/A'}</span>
            </div>
          </div>

          {/* Saving Throw Info */}
          {spell.save_ability && (
            <div className={styles.spellInfoSection}>
              <h4 className={styles.sectionTitle}>Saving Throw</h4>
              <div className={styles.saveInfo}>
                <div className={styles.saveDetail}>
                  <strong>DC {spellSaveDC}</strong> {spell.save_ability.toUpperCase()} save
                </div>
                <div className={styles.saveDetail}>
                  {spell.save_half_on_success
                    ? '→ Half damage on success'
                    : '→ No effect on success'}
                </div>
              </div>
            </div>
          )}

          {/* Spell Attack Info */}
          {spell.attack_type && (
            <div className={styles.spellInfoSection}>
              <h4 className={styles.sectionTitle}>Spell Attack</h4>
              <div className={styles.attackInfo}>
                <strong>+{spellAttackBonus}</strong> to hit (
                {spellcastingAbility.toUpperCase()})
              </div>
            </div>
          )}

          {/* Damage Info */}
          {spell.damage_dice && (
            <div className={styles.spellInfoSection}>
              <h4 className={styles.sectionTitle}>Damage [BOOM]</h4>
              <div className={styles.damageInfo}>
                <div className={styles.damageDice}>
                  <strong>{spell.damage_dice}</strong>
                  {spell.damage_type && ` ${spell.damage_type} damage`}
                </div>
                {spell.upcast_damage_per_slot && (
                  <div className={styles.upcastInfo}>
                    <em>
                      +{spell.upcast_damage_per_slot} damage per spell slot
                      level
                    </em>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Healing Info */}
          {spell.healing_dice && (
            <div className={styles.spellInfoSection}>
              <h4 className={styles.sectionTitle}>Healing</h4>
              <div className={styles.healingInfo}>
                <strong>{spell.healing_dice}</strong> hit points
              </div>
            </div>
          )}

          {/* Area of Effect */}
          {spell.aoe_type && (
            <div className={styles.spellInfoSection}>
              <h4 className={styles.sectionTitle}>Area of Effect [LOCATION]</h4>
              <div className={styles.aoeInfo}>
                {spell.aoe_size}-foot {spell.aoe_type}
              </div>
            </div>
          )}

          {/* Cantrip Scaling */}
          {spell.level === 0 && spell.cantrip_scaling_levels && spell.cantrip_scaling_dice && (
            <div className={styles.spellInfoSection}>
              <h4 className={styles.sectionTitle}>Cantrip Scaling [CHART]</h4>
              <div className={styles.scalingInfo}>
                <p>
                  Damage increases as you level up:
                </p>
                <ul>
                  {spell.cantrip_scaling_levels.map((level) => (
                    <li key={level}>
                      {level}th level: {spell.cantrip_scaling_dice}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Description */}
          {spell.description && (
            <div className={styles.spellInfoSection}>
              <h4 className={styles.sectionTitle}>Description [BOOK]</h4>
              <div className={styles.description}>
                {spell.description}
              </div>
            </div>
          )}

          {/* Higher Levels */}
          {spell.higher_levels && (
            <div className={styles.spellInfoSection}>
              <h4 className={styles.sectionTitle}>At Higher Levels [UPCAST]</h4>
              <div className={styles.higherLevels}>
                {spell.higher_levels}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.spellDetailsFooter}>
          <button className={styles.doneBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpellDetailsModal;
