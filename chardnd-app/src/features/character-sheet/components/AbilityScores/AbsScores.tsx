import React from 'react';
import styles from './AbsScores.module.css';

const AbsScores = ({ abilityScores, onScoreChange }) => {
  const abilityOrder = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

  // 🔹 Ensure valid scores
  const validScores = abilityOrder.reduce((acc, ability) => {
    const val = abilityScores?.[ability];
    acc[ability] = parseInt(val)
    return acc;
  }, {});

  const handleChange = (ability, delta) => {
    const current = validScores[ability];
    const newValue = Math.max(1, Math.min(20, current + delta));
    const updated = { ...validScores, [ability]: newValue };
    onScoreChange(updated);
  };

  return (
    <div className={styles.container}>
      {abilityOrder.map((ability) => {
        const score = validScores[ability];
        const mod = Math.floor((score - 10) / 2);
        const modStr = mod >= 0 ? `+${mod}` : mod;
        return (
          <div key={ability} className={styles.card}>
            <div className={styles.name}>{ability.slice(0, 3).toUpperCase()}</div>
            <div className={styles.value}>{score}</div>
            <div className={styles.modifier}>{modStr}</div>
            <div className={styles.controls}>
              <button type="button" onClick={() => handleChange(ability, 1)} className={styles.btnUp}>▲</button>
              <button type="button" onClick={() => handleChange(ability, -1)} className={styles.btnDown}>▼</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AbsScores;