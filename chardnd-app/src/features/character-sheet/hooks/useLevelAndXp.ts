import { useState, useCallback } from 'react';
import { updateCharacter } from '../../../services/api';

const LEVEL_XP_TABLE = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];

export const useLevelAndXp = (characterId: string | undefined, initialLevel: number = 1, initialXp: number = 0) => {
  const [localLevel, setLocalLevel] = useState(initialLevel);
  const [localXp, setLocalXp] = useState(initialXp);
  const [saving, setSaving] = useState(false);

  const levelToXp = useCallback((level: number) => {
    return level < 1 ? 0 : level > 20 ? LEVEL_XP_TABLE[19] : LEVEL_XP_TABLE[level - 1];
  }, []);

  const xpToLevel = useCallback((xp: number) => {
    for (let i = 19; i >= 0; i--) {
      if (xp >= LEVEL_XP_TABLE[i]) return i + 1;
    }
    return 1;
  }, []);

  const handleLevelChange = useCallback((delta: number) => {
    const newLevel = Math.max(1, Math.min(20, localLevel + delta));
    setLocalLevel(newLevel);
    setLocalXp(levelToXp(newLevel));
  }, [localLevel, levelToXp]);

  const handleXpChange = useCallback((delta: number) => {
    const newXp = Math.max(0, localXp + delta);
    setLocalXp(newXp);
    setLocalLevel(xpToLevel(newXp));
  }, [localXp, xpToLevel]);

  const handleXpInput = useCallback(
    (value: number) => {
      const newXp = Math.max(0, value);
      setLocalXp(newXp);
      setLocalLevel(xpToLevel(newXp));
    },
    [xpToLevel]
  );

  const saveLevelAndXp = useCallback(async () => {
    if (!characterId || saving) return;

    setSaving(true);
    try {
      await updateCharacter(parseInt(characterId), { level: localLevel, xp: localXp });
      return { level: localLevel, xp: localXp };
    } finally {
      setSaving(false);
    }
  }, [characterId, localLevel, localXp, saving]);

  const getXpToNextLevel = useCallback(() => {
    if (localLevel >= 20) return 0;
    return levelToXp(localLevel + 1) - localXp;
  }, [localLevel, localXp, levelToXp]);

  return {
    localLevel,
    setLocalLevel,
    localXp,
    setLocalXp,
    saving,
    levelToXp,
    xpToLevel,
    handleLevelChange,
    handleXpChange,
    handleXpInput,
    saveLevelAndXp,
    getXpToNextLevel,
  };
};
