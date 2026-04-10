export interface Item {
    id: number;
    name: string;
    desc: string;
    weight: number;
    cost: number;
    item_type: string;
    item_category: string;
    rarity: string;
    properties?: string[];
    damageDice?: string;
    damageType?: string;
    versatileDamage?: string;
    specialAbilities?: string[];
    maxCharges?: number;
    currentCharges?: number;
    chargeRecharge?: string;
    onHitEffect?: string;
    // properties = Column(JSONType)
}