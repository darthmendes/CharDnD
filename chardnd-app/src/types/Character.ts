// src/types/Character.ts
import type { Character as ApiCharacter, InventoryItem } from './api';

export interface ClassResource {
  id: string;
  name: string;
  current: number;
  max: number;
  recharge: 'short' | 'long' | 'both';
  icon?: string;
  customRecovery?: Array<{ restType: 'short' | 'long' | 'both'; amount: number }>;
}

export interface Character extends Omit<ApiCharacter, 'items'> {
  classResources?: ClassResource[];
  attunementSlotBonus?: number;
  items?: Array<InventoryItem & {
    is_equipped?: boolean;
    is_attuned?: boolean;
    item?: InventoryItem & { property_data?: Record<string, any> };
    property_data?: Record<string, any>;
  }>;
}