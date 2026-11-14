import styles from './AbsScores.module.css';

type Ability = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

interface AbsScoresProps {
  abilityScores: Record<string, number> | null;
  onScoreChange: (scores: Record<string, number>) => void;
}

const AbsScores = ({ abilityScores, onScoreChange }: AbsScoresProps) => {
  const abilityOrder: Ability[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

  // [NOTE] Ensure valid scores with defaults
  const validScores = abilityOrder.reduce<Record<Ability, number>>((acc, ability) => {
    const val = abilityScores?.[ability];
    const score = Number(val) || 10;
    acc[ability] = Math.max(1, Math.min(20, score));
    return acc;
  }, { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });

  const handleChange = (ability: Ability, delta: number) => {
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