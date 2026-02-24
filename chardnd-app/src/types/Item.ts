export interface Item {
    id : number; 
    name : String;
    desc: String;
    weight: number;
    cost : number;
    item_type: String;
    item_category: String;
    rarity : String;
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