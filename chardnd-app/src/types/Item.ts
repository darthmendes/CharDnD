export interface Item {
    id : number; 
    name : String;
    desc: String;
    weight: number;
    cost : number;
    item_type: String;
    item_category: String;
    rarity : String;
    // properties = Column(JSONType)
}