// SpellCastModal.tsx

import React, { useState } from 'react';
import styles from './SpellModal.module.css';

interface SpellCastModalProps {
  isOpen: boolean;
  onClose: () => void;
  spell: any;
  character: any;
  spellSaveDC: number;
  spellAttackBonus: number;
  spellcastingAbility: string;
  spellSlots: {[key: string]: number};
  onCast: (slotLevel: number) => void;
}

const SpellCastModal: React.FC<SpellCastModalProps> = ({
  isOpen,
  onClose,
  spell,
  character,
  spellSaveDC,
  spellAttackBonus,
  spellcastingAbility,
  spellSlots,
  onCast
}) => {
  if (!isOpen || !spell) return null;
  
  const [selectedSlotLevel, setSelectedSlotLevel] = useState(spell.level || 1);
  
  // Calculate damage for selected slot level
  const getDamageForLevel = (slotLevel: number) => {
    if (!spell.damage_dice) return null;
    
    if (slotLevel <= spell.level) {
      return spell.damage_dice;
    }
    
    // Add upcast damage
    const extraDice = slotLevel - spell.level;
    const upcastDie = spell.upcast_damage_per_level || '1d6';
    return `${spell.damage_dice} + ${extraDice}${upcastDie}`;
  };
  
  const hasAvailableSlot = (level: number) => {
    if (spell.level === 0) return true; // Cantrips don't use slots
    return (spellSlots[level] || 0) > 0;
  };
  
  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  
  return (
    <div className={styles.spellCastModal}>
      <div className={styles.spellCastContent}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        
        <h2>{spell.name}</h2>
        <p className={styles.spellInfo}>
          {spell.level === 0 ? 'Cantrip' : `${spell.level}${getOrdinal(spell.level)} Level`} 
          {' • '}{spell.school}
        </p>
        
        {/* Spell Details */}
        <div className={styles.spellDetails}>
          <div><strong>Casting Time:</strong> {spell.casting_time}</div>
          <div><strong>Range:</strong> {spell.range}</div>
          <div><strong>Components:</strong> {spell.components}</div>
          <div><strong>Duration:</strong> {spell.duration}</div>
          {spell.concentration && <div className={styles.concentration}>⚠️ Concentration</div>}
        </div>
        
        {/* Saving Throw Info */}
        {spell.save_ability && (
          <div className={styles.saveInfo}>
            <h4>💾 Saving Throw</h4>
            <div className={styles.saveBox}>
              <div className={styles.saveDC}>
                <strong>DC {spellSaveDC}</strong> {spell.save_ability.toUpperCase()} save
              </div>
              <div className={styles.saveEffect}>
                {spell.save_half_on_success ? 'Half damage on success' : 'No effect on success'}
              </div>
            </div>
          </div>
        )}
        
        {/* Spell Attack Info */}
        {spell.attack_type === 'spell_attack' && (
          <div className={styles.attackInfo}>
            <h4>⚔️ Spell Attack</h4>
            <div className={styles.attackBox}>
              <div className={styles.attackBonus}>
                <strong>+{spellAttackBonus}</strong> to hit
              </div>
            </div>
          </div>
        )}
        
        {/* Damage Info */}
        {spell.damage_dice && (
          <div className={styles.damageInfo}>
            <h4>⚔️ Damage</h4>
            <div className={styles.damageBox}>
              <div className={styles.damageDice}>
                <strong>{getDamageForLevel(selectedSlotLevel)}</strong> 
                {spell.damage_type && ` ${spell.damage_type} damage`}
              </div>
              
              {/* Slot Level Selector for Upcasting */}
              {spell.level > 0 && (
                <div className={styles.slotSelector}>
                  <label>Casting at level:</label>
                  <select 
                    value={selectedSlotLevel} 
                    onChange={(e) => setSelectedSlotLevel(parseInt(e.target.value))}
                  >
                    {Array.from({length: 9}, (_, i) => i + 1).map(level => (
                      <option 
                        key={level} 
                        value={level}
                        disabled={!hasAvailableSlot(level)}
                      >
                        {getOrdinal(level)} {level > spell.level && spell.upcast_damage_per_level && 
                          ` (+${level - spell.level}${spell.upcast_damage_per_level})`}
                        {!hasAvailableSlot(level) && ' (None)'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Area of Effect */}
        {spell.area_of_effect_type && (
          <div className={styles.areaInfo}>
            <h4>📍 Area of Effect</h4>
            <div className={styles.areaBox}>
              {spell.area_of_effect_size}-foot {spell.area_of_effect_type}
            </div>
          </div>
        )}
        
        {/* Description */}
        <div className={styles.description}>
          <p>{spell.description}</p>
          {spell.higher_levels && selectedSlotLevel > spell.level && (
            <p className={styles.higherLevels}>
              <strong>At Higher Levels:</strong> {spell.higher_levels}
            </p>
          )}
        </div>
        
        {/* Cast Button */}
        <div className={styles.castButtons}>
          <button 
            className={styles.castBtn}
            onClick={() => onCast(spell.level === 0 ? 0 : selectedSlotLevel)}
            disabled={spell.level > 0 && !hasAvailableSlot(selectedSlotLevel)}
          >
            ✨ Cast Spell
          </button>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default SpellCastModal;