import { useMemo } from 'react';
import type { Character } from '../../../types/Character';

export interface Modifier {
  itemName: string;
  value: number;
  type: 'bonus' | 'penalty' | 'base';
}

export interface CharacterCalculations {
  proficiencyBonus: number;
  ac: number;
  initiative: number;
  acModifiers: Modifier[];
  speedModifiers: Modifier[];
  initiativeModifiers: Modifier[];
  spellDCModifiers: (spellcastingAbility: string) => Modifier[];
  spellAttackModifiers: (spellcastingAbility: string) => Modifier[];
  abilityModifier: (score: number) => number;
  getAbilityScore: (ability: string) => number;
  getBestAbilityForWeapon: (weapon: any) => { modifier: number; ability: string };
  getWeaponVariants: (weapon: any) => Array<{
    id: string;
    name: string;
    damageDice: string;
    damageType: string;
    range?: string;
  }>;
}

export const useCharacterCalculations = (
  character: Character | null,
  localLevel: number,
  localAbilityScores: Record<string, number> | null
): CharacterCalculations => {
  const abilityModifier = (score: number) => Math.floor((score - 10) / 2);
  const getAbilityScore = (ability: string) => localAbilityScores?.[ability] || 10;

  const proficiencyBonus = useMemo(() => {
    if (localLevel <= 4) return 2;
    if (localLevel <= 8) return 3;
    if (localLevel <= 12) return 4;
    if (localLevel <= 16) return 5;
    return 6;
  }, [localLevel]);

  const ac = useMemo(() => {
    if (!character?.items) return 10;
    let base = 10,
      armor = 0,
      shield = 0;
    const dex = abilityModifier(character.abilityScores?.dex || 10);

    for (const inv of character.items) {
      if (!inv.is_equipped) continue;
      const i = inv.item || inv;
      if (i.item_category?.includes('Shield') && i.property_data?.ac_bonus) shield += i.property_data.ac_bonus;
      else if (i.item_type === 'Armor' && i.property_data?.ac_base) armor = i.property_data.ac_base;
    }

    base =
      armor > 0
        ? armor + (!character.items?.some((inv) => inv.is_equipped && inv.item?.property_data?.ac_type === 'dex_no') ? dex : 0)
        : 10 + dex;
    return Math.max(10, base + shield);
  }, [character?.items, character?.abilityScores?.dex]);

  const initiative = useMemo(
    () => abilityModifier(character?.abilityScores?.dex || 10),
    [character?.abilityScores?.dex]
  );

  const acModifiers = useMemo(() => {
    if (!character?.items) return [];
    const modifiers: Modifier[] = [];

    for (const inv of character.items) {
      if (!inv.is_equipped) continue;
      const i = inv.item || inv;
      if (i.item_category?.includes('Shield') && i.property_data?.ac_bonus) {
        modifiers.push({ itemName: i.name, value: i.property_data.ac_bonus, type: 'bonus' });
      } else if (i.item_type === 'Armor' && i.property_data?.ac_base) {
        modifiers.push({ itemName: i.name, value: i.property_data.ac_base, type: 'base' });
      }
    }

    const dexMod = abilityModifier(character.abilityScores?.dex || 10);
    if (dexMod !== 0) {
      modifiers.push({ itemName: 'DEX Mod', value: Math.abs(dexMod), type: dexMod > 0 ? 'bonus' : 'penalty' });
    }

    return modifiers;
  }, [character?.items, character?.abilityScores?.dex]);

  const speedModifiers = useMemo(() => {
    if (!character?.items) return [];
    return character.items
      .filter((i) => i.is_equipped && i.item?.property_data?.speed_modifier)
      .map((i) => {
        const item = i.item || i;
        const speedModifier = item.property_data?.speed_modifier ?? 0;
        return {
          itemName: item.name,
          value: speedModifier,
          type: speedModifier >= 0 ? ('bonus' as const) : ('penalty' as const),
        };
      });
  }, [character?.items]);

  const initiativeModifiers = useMemo(() => {
    if (!character?.items) return [];
    const dex = abilityModifier(character.abilityScores?.dex || 10);
    const modifiers: Modifier[] = [{ itemName: 'DEX Mod', value: Math.abs(dex), type: 'base' }];

    const itemMods = character.items
      .filter((i) => i.is_equipped && i.item?.property_data?.initiative_modifier)
      .map((i) => {
        const item = i.item || i;
        const initiativeModifier = item.property_data?.initiative_modifier ?? 0;
        return {
          itemName: item.name,
          value: initiativeModifier,
          type: initiativeModifier >= 0 ? ('bonus' as const) : ('penalty' as const),
        };
      });

    return [...modifiers, ...itemMods];
  }, [character?.items, character?.abilityScores?.dex]);

  const spellDCModifiers = (spellcastingAbility: string): Modifier[] => {
    if (!character?.abilityScores) return [];
    const profBonus = proficiencyBonus;
    const modifiers: Modifier[] = [{ itemName: 'Base', value: 8 + profBonus, type: 'base' }];

    const abilityScore = (character.abilityScores as any)[spellcastingAbility] || 10;
    const mod = abilityModifier(abilityScore);
    if (mod !== 0) {
      modifiers.push({
        itemName: `${spellcastingAbility.toUpperCase()} Mod`,
        value: Math.abs(mod),
        type: mod > 0 ? 'bonus' : 'penalty',
      });
    }

    return modifiers;
  };

  const spellAttackModifiers = (spellcastingAbility: string): Modifier[] => {
    if (!character?.abilityScores) return [];
    const profBonus = proficiencyBonus;
    const modifiers: Modifier[] = [{ itemName: 'Prof Bonus', value: profBonus, type: 'base' }];

    const abilityScore = (character.abilityScores as any)[spellcastingAbility] || 10;
    const mod = abilityModifier(abilityScore);
    if (mod !== 0) {
      modifiers.push({
        itemName: `${spellcastingAbility.toUpperCase()} Mod`,
        value: Math.abs(mod),
        type: mod > 0 ? 'bonus' : 'penalty',
      });
    }

    return modifiers;
  };

  const getBestAbilityForWeapon = (weapon: any) => {
    const properties = (weapon.properties || []).map((p: any) =>
      typeof p === 'string' ? p.toLowerCase() : (p.name || '').toLowerCase()
    );

    if (properties.some((p: string) => p.includes('finesse'))) {
      const strMod = abilityModifier(character?.abilityScores?.str || 10);
      const dexMod = abilityModifier(character?.abilityScores?.dex || 10);
      return { modifier: Math.max(strMod, dexMod), ability: strMod >= dexMod ? 'STR' : 'DEX' };
    }

    return { modifier: abilityModifier(character?.abilityScores?.str || 10), ability: 'STR' };
  };

  const getWeaponVariants = (weapon: any) => {
    const variants: Array<{
      id: string;
      name: string;
      damageDice: string;
      damageType: string;
      range?: string;
    }> = [{ id: 'melee', name: 'Melee Attack', damageDice: weapon.damageDice || '1d4', damageType: weapon.damageType || 'bludgeoning' }];
    const properties = (weapon.properties || []).map((p: any) => typeof p === 'string' ? p.toLowerCase() : (p.name || '').toLowerCase());
    const propertyData = weapon.property_data || {};

    if (properties.some((p: string) => p.includes('thrown'))) {
      variants.push({
        id: 'thrown',
        name: `Thrown (Range: ${propertyData.thrown?.range || '20/60'})`,
        damageDice: weapon.damageDice || '1d4',
        damageType: weapon.damageType || 'bludgeoning',
        range: propertyData.thrown?.range,
      });
    }

    if (properties.some((p: string) => p.includes('versatile'))) {
      variants.push({
        id: 'versatile',
        name: 'Two-Handed',
        damageDice: propertyData.versatile?.damage_dice || weapon.damageDice?.replace('d4', 'd6').replace('d6', 'd8').replace('d8', 'd10') || '1d8',
        damageType: weapon.damageType || 'bludgeoning',
      });
    }

    return variants;
  };

  return {
    proficiencyBonus,
    ac,
    initiative,
    acModifiers,
    speedModifiers,
    initiativeModifiers,
    spellDCModifiers,
    spellAttackModifiers,
    abilityModifier,
    getAbilityScore,
    getBestAbilityForWeapon,
    getWeaponVariants,
  };
};
