import { useState, useCallback } from 'react';
import { updateCharacter } from '../../../services/api';

export const useHitPoints = (characterId: string | undefined, initialHpCurrent: number = 0, initialHpMax: number = 10, initialHpTmp: number = 0) => {
  const [hpCurrent, setHpCurrent] = useState(initialHpCurrent);
  const [hpMax, setHpMax] = useState(initialHpMax);
  const [hpTmp, setHpTmp] = useState(initialHpTmp);
  const [hpModalType, setHpModalType] = useState<'heal' | 'damage' | 'temp' | null>(null);
  const [hpModalInput, setHpModalInput] = useState('');
  const [saving, setSaving] = useState(false);

  const heal = useCallback((amount: number) => {
    setHpCurrent((p) => Math.min(hpMax, p + amount));
    setHpModalInput('');
    setHpModalType(null);
  }, [hpMax]);

  const takeDamage = useCallback((amount: number) => {
    let remaining = amount;
    if (hpTmp > 0) {
      const newTmp = Math.max(0, hpTmp - amount);
      remaining -= hpTmp - newTmp;
      setHpTmp(newTmp);
    }
    if (remaining > 0) {
      setHpCurrent((p) => Math.max(-hpMax, p - remaining));
    }
    setHpModalInput('');
    setHpModalType(null);
  }, [hpTmp, hpMax]);

  const addTempHp = useCallback((amount: number) => {
    setHpTmp((p) => p + amount);
    setHpModalInput('');
    setHpModalType(null);
  }, []);

  const handleHpModalSubmit = useCallback(() => {
    const amount = parseInt(hpModalInput) || 0;
    if (amount <= 0) {
      alert('Enter a positive number');
      return;
    }
    if (hpModalType === 'heal') heal(amount);
    else if (hpModalType === 'damage') takeDamage(amount);
    else addTempHp(amount);
  }, [hpModalInput, hpModalType, heal, takeDamage, addTempHp]);

  const saveHp = useCallback(async () => {
    if (!characterId || saving) return;

    setSaving(true);
    try {
      await updateCharacter(parseInt(characterId), { hpCurrent, hpTmp });
      return { hpCurrent, hpTmp };
    } finally {
      setSaving(false);
    }
  }, [characterId, hpCurrent, hpTmp, saving]);

  return {
    hpCurrent,
    setHpCurrent,
    hpMax,
    setHpMax,
    hpTmp,
    setHpTmp,
    hpModalType,
    setHpModalType,
    hpModalInput,
    setHpModalInput,
    saving,
    heal,
    takeDamage,
    addTempHp,
    handleHpModalSubmit,
    saveHp,
  };
};
