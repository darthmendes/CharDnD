// src/features/character-sheet/components/SpellModal/SpellDetailsModal.tsx
import React from 'react';
import styles from './SpellDetailsModal.module.css';

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
    requires_attack_roll?: boolean;
    healing_dice?: string;
    healing_type?: string;
    aoe_type?: string;
    aoe_size?: number;
    damage_at_character_level?: boolean;
    cantrip_scaling_dice?: string;
    upcast_damage_per_slot?: string;
    source?: string;
    source_page?: number;
  } | null;
  spellSaveDC?: number;
  spellAttackBonus?: number;
}

const SpellDetailsModal: React.FC<SpellDetailsModalProps> = ({
  isOpen,
  onClose,
  spell,
  spellSaveDC = 0,
  spellAttackBonus = 0,
}) => {
  if (!isOpen || !spell) return null;

  const getOrdinal = (n: number): string => {
    if (n === 0) return 'Cantrip';
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        {/* Header */}
        <div className={styles.spellHeader}>
          <h2>{spell.name}</h2>
          <p className={styles.spellLevel}>
            {getOrdinal(spell.level)} Level {spell.school && `• ${spell.school}`}
          </p>
        </div>

        {/* Content */}
        <div className={styles.spellContent}>
          {/* Casting Information */}
          <div className={styles.spellSection}>
            <div className={styles.infoGrid}>
              {spell.casting_time && (
                <div className={styles.infoRow}>
                  <strong>Casting Time:</strong>
                  <span>{spell.casting_time}</span>
                </div>
              )}
              {spell.range && (
                <div className={styles.infoRow}>
                  <strong>Range:</strong>
                  <span>{spell.range}</span>
                </div>
              )}
              {spell.components && (
                <div className={styles.infoRow}>
                  <strong>Components:</strong>
                  <span>{spell.components}</span>
                </div>
              )}
              {spell.material_components && (
                <div className={styles.infoRow}>
                  <strong>Material:</strong>
                  <span>{spell.material_components}</span>
                </div>
              )}
              {spell.duration && (
                <div className={styles.infoRow}>
                  <strong>Duration:</strong>
                  <span>{spell.duration}</span>
                </div>
              )}
            </div>
            {spell.concentration && (
              <div className={styles.concentrationTag}>
                ⚠️ Requires Concentration
              </div>
            )}
            {spell.ritual && (
              <div className={styles.ritualTag}>
                📖 Can be cast as a ritual
              </div>
            )}
          </div>

          {/* Description */}
          {spell.description && (
            <div className={styles.spellSection}>
              <p className={styles.description}>{spell.description}</p>
            </div>
          )}

          {/* Save Ability - Yellow/Orange */}
          {spell.save_ability && (
            <div className={styles.spellSection}>
              <div className={styles.abilityBox}>
                <strong>💾 DC {spellSaveDC} {spell.save_ability.toUpperCase()} Save</strong>
                {spell.save_half_on_success && (
                  <span className={styles.saveNote}>Half damage on success</span>
                )}
              </div>
            </div>
          )}

          {/* Spell Attack - Green */}
          {spell.requires_attack_roll && (
            <div className={styles.spellSection}>
              <div className={styles.attackBox}>
                <strong>⚔️ Spell Attack</strong>
                <span>+{spellAttackBonus} to hit</span>
                {spell.attack_type && <span>{spell.attack_type.replace(/_/g, ' ')}</span>}
              </div>
            </div>
          )}

          {/* Damage - Orange */}
          {spell.damage_dice && (
            <div className={styles.spellSection}>
              <div className={styles.damageBox}>
                <strong>🎲 Damage: {spell.damage_dice}</strong>
                <span>{spell.damage_type || 'damage'}</span>
                {spell.upcast_damage_per_slot && (
                  <span>⬆️ Upcast: +{spell.upcast_damage_per_slot} per slot level</span>
                )}
              </div>
            </div>
          )}

          {/* Healing - Pink */}
          {spell.healing_dice && (
            <div className={styles.spellSection}>
              <div className={styles.healingBox}>
                <strong>💚 Healing: {spell.healing_dice}</strong>
                <span>{spell.healing_type?.replace(/_/g, ' ') || 'hit points'}</span>
              </div>
            </div>
          )}

          {/* Area of Effect - Blue */}
          {spell.aoe_type && (
            <div className={styles.spellSection}>
              <div className={styles.aoeBox}>
                <strong>📍 Area of Effect:</strong>
                <span>
                  {spell.aoe_size ? `${spell.aoe_size}-foot ` : ''}{spell.aoe_type}
                </span>
              </div>
            </div>
          )}

          {/* Higher Levels */}
          {spell.higher_levels && (
            <div className={styles.spellSection}>
              <strong style={{ marginBottom: '8px' }}>⬆️ At Higher Levels:</strong>
              <p className={styles.higherLevels}>{spell.higher_levels}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpellDetailsModal;