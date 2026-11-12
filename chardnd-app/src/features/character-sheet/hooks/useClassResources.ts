import { useState, useCallback, useEffect } from 'react';
import { updateCharacter } from '../../../services/api';
import type { Character } from '../../../types/Character';

const DEFAULT_ATTUNEMENT_SLOTS = 4;

export type ClassResource = {
  id: string;
  name: string;
  current: number;
  max: number;
  recharge: 'short' | 'long' | 'both';
  icon?: string;
  customRecovery?: Array<{ restType: 'short' | 'long' | 'both'; amount: number }>;
};

const deriveAndEnhanceClassResources = (character: Character): ClassResource[] => {
  if (!character.classes || character.classes.length === 0) return [];
  const resources: ClassResource[] = [];

  for (const cls of character.classes) {
    const name = cls.className.trim().toLowerCase();
    const lvl = cls.level;
    const prefix = cls.className.replace(/\s+/g, '');

    switch (name) {
      case 'druid':
        if (lvl >= 2) {
          resources.push({
            id: `${prefix}_wild_shape`,
            name: 'Wild Shape',
            current: lvl >= 18 ? 3 : 2,
            max: lvl >= 18 ? 3 : 2,
            recharge: 'short',
            icon: '🐾',
          });
        }
        break;
      case 'barbarian':
        if (lvl >= 1) {
          const max = lvl >= 17 ? 4 : lvl >= 12 ? 3 : lvl >= 2 ? 2 : 1;
          resources.push({ id: `${prefix}_rage`, name: 'Rage', current: max, max, recharge: 'long', icon: '🔥' });
        }
        break;
      case 'monk':
        if (lvl >= 2) {
          resources.push({
            id: `${prefix}_ki_points`,
            name: 'Ki Points',
            current: lvl,
            max: lvl,
            recharge: 'short',
            icon: '☯️',
          });
        }
        break;
      case 'sorcerer':
        if (lvl >= 2) {
          resources.push({
            id: `${prefix}_sorcery_points`,
            name: 'Sorcery Points',
            current: lvl,
            max: lvl,
            recharge: 'long',
            icon: '✨',
          });
        }
        break;
      case 'bard':
        if (lvl >= 1) {
          const max = lvl >= 10 ? 4 : 3;
          resources.push({
            id: `${prefix}_bardic_inspiration`,
            name: 'Bardic Inspiration',
            current: max,
            max,
            recharge: 'both',
            icon: '🎵',
          });
        }
        break;
      case 'fighter':
        if (lvl >= 1) {
          resources.push({
            id: `${prefix}_second_wind`,
            name: 'Second Wind',
            current: 1,
            max: 1,
            recharge: 'short',
            icon: '🛡️',
          });
        }
        if (lvl >= 2) {
          const max = lvl >= 17 ? 2 : 1;
          resources.push({
            id: `${prefix}_action_surge`,
            name: 'Action Surge',
            current: max,
            max,
            recharge: 'short',
            icon: '⚡',
          });
        }
        break;
      case 'paladin':
        if (lvl >= 1) {
          resources.push({
            id: `${prefix}_lay_on_hands`,
            name: 'Lay on Hands',
            current: lvl * 5,
            max: lvl * 5,
            recharge: 'long',
            icon: '✋',
          });
        }
        break;
    }
  }

  // Apply item modifiers
  if (character.items) {
    for (const inv of character.items) {
      if (!inv.is_equipped) continue;
      const needsAtt =
        inv.requires_attunement ||
        inv.item?.requires_attunement ||
        (inv.item?.rarity && ['Rare', 'Very Rare', 'Legendary', 'Artifact'].includes(inv.item.rarity));
      if (needsAtt && !inv.is_attuned) continue;

      const itemData = inv.item || inv;
      const mods = itemData.property_data?.resourceModifiers;
      if (mods && Array.isArray(mods)) {
        for (const mod of mods) {
          const target = resources.find(
            (r) =>
              r.id === mod.resourceId ||
              r.name.toLowerCase().includes((mod.resourceName || '').toLowerCase())
          );
          if (target) {
            if (mod.maxIncrease) {
              target.max += mod.maxIncrease;
              target.current = Math.min(target.max, target.current + mod.maxIncrease);
            }
            if (mod.currentIncrease) {
              target.current = Math.min(target.max, target.current + mod.currentIncrease);
            }
            if (mod.extraRecovery) {
              target.customRecovery = target.customRecovery || [];
              target.customRecovery.push(mod.extraRecovery);
            }
          }
        }
      }
    }
  }

  return resources;
};

export const useClassResources = (character: Character | null, characterId: string | undefined) => {
  const [classResources, setClassResources] = useState<ClassResource[]>([]);
  const [savingResource, setSavingResource] = useState<string | null>(null);

  // Initialize resources from character
  useEffect(() => {
    if (!character) return;

    if (character.classResources && character.classResources.length > 0) {
      setClassResources(character.classResources);
    } else {
      setClassResources(deriveAndEnhanceClassResources(character));
    }
  }, [character?.id]);

  // Update resources when class/item count changes
  useEffect(() => {
    if (!character) return;

    const derived = deriveAndEnhanceClassResources(character);
    setClassResources((prev) =>
      derived.map((res) => {
        const existing = prev.find((p) => p.id === res.id);
        return { ...res, current: existing ? Math.min(res.max, existing.current) : res.max };
      })
    );
  }, [character?.id, character?.classes?.length, character?.items?.length]);

  const adjustResource = useCallback(
    (resourceId: string, delta: number) => {
      setClassResources((prev) => {
        const next = prev.map((res) =>
          res.id !== resourceId
            ? res
            : { ...res, current: Math.max(0, Math.min(res.max, res.current + delta)) }
        );

        // Save in background
        if (characterId) {
          setSavingResource(resourceId);
          updateCharacter(parseInt(characterId), { classResources: next })
            .catch((err) => console.error('Failed to save resource:', err))
            .finally(() => setSavingResource(null));
        }

        return next;
      });
    },
    [characterId]
  );

  const restRecovery = useCallback(
    (type: 'short' | 'long') => {
      setClassResources((prev) => {
        const next = prev.map((res) => {
          let recovered = res.max;
          if (res.customRecovery) {
            for (const rule of res.customRecovery) {
              if ((rule.restType === type || rule.restType === 'both') && rule.amount) {
                recovered = Math.min(res.max, recovered + rule.amount);
              }
            }
          }
          return { ...res, current: recovered };
        });

        if (characterId) {
          updateCharacter(parseInt(characterId), { classResources: next }).catch((err) =>
            console.error(err)
          );
        }

        return next;
      });

      alert(`${type === 'short' ? 'Short' : 'Long'} rest completed!`);
    },
    [characterId]
  );

  return {
    classResources,
    savingResource,
    adjustResource,
    restRecovery,
  };
};
