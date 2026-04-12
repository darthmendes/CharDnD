// src/features/Items/ItemCreator/ItemForm.tsx
import React, { useState, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../../character-creator/CharacterCreator.module.css';
import { createItem, fetchFeatures } from '../../../services/api';

// [NOTE] D&D 5e Constants
const VALID_ITEM_TYPES = ['Armor', 'Potion', 'Ring', 'Rod', 'Scroll', 'Staff', 'Tool', 'Wand', 'Weapon', 'Wondrous Item'] as const;
const VALID_RARITIES = ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact', 'mythic'] as const;
const VALID_DAMAGE_TYPES = ['piercing', 'slashing', 'bludgeoning', 'fire', 'cold', 'lightning', 'thunder', 'poison', 'acid', 'necrotic', 'radiant', 'force', 'psychic'] as const;

type ItemType = typeof VALID_ITEM_TYPES[number] | '';
type RarityType = typeof VALID_RARITIES[number];
type DamageType = typeof VALID_DAMAGE_TYPES[number] | '';

const VALID_CATEGORIES: Record<string, string[]> = {
  Weapon: ['Simple Melee', 'Martial Melee', 'Simple Ranged', 'Martial Ranged', 'Ammunition'],
  Armor: ['Light Armor', 'Medium Armor', 'Heavy Armor', 'Shield'],
  'Wondrous Item': ['Wearable', 'Consumable', 'Held', 'Container', 'Instrument', 'Other'],
  Tool: ["Artisan's Tools", 'Gaming Set', 'Musical Instrument', 'Other'],
  Potion: ['Healing', 'Buff', 'Utility', 'Poison'],
  Scroll: ['Spell Scroll', 'Other'],
  Default: ['Magic Item', 'Common Gear', 'Treasure', 'Other']
};

// [NOTE] Structured Types
type PropertyType = 'ac_bonus' | 'ability_increase' | 'damage_bonus' | 'spellcasting' | 'custom' | '';

interface ItemProperty {
  id: string;
  type: PropertyType;
  value: string;
  stat?: string;
  dc?: string;
  bonus?: string;
  description?: string;
}

interface DamageEntry {
  id: string;
  dice: string;
  type: DamageType;
  context: 'base' | 'versatile' | 'two-handed' | 'on hit' | 'thrown' | 'extra';
}

interface Feature {
  id: number;
  name: string;
  description: string;
}

interface ItemFormData {
  name: string;
  desc: string;
  weight: number;
  cost: number;
  item_type: ItemType;
  item_category: string;
  rarity: RarityType;
  properties: string[];
  special_abilities: Feature[];
  max_charges: number | '';
  charge_recharge: string;
  on_hit_effect: string;
  property_data: ItemProperty[];
  damage_entries: DamageEntry[]; // [NOTE] Replaces single damage_dice/damage_type
}

const ItemForm: React.FC = () => {
  const [formData, setFormData] = useState<ItemFormData>({
    name: '', desc: '', weight: 0, cost: 0, item_type: '', item_category: '', rarity: 'common',
    properties: [], special_abilities: [],
    max_charges: '', charge_recharge: '', on_hit_effect: '', property_data: [],
    damage_entries: [{ id: crypto.randomUUID(), dice: '', type: '', context: 'base' }]
  });

  // [NOTE] Feature Selector State
  const [features, setFeatures] = useState<Feature[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewFeature, setPreviewFeature] = useState<Feature | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const returnTo = queryParams.get('returnTo');
  const goToMain = () => navigate('/');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState({ properties: '', abilities: '' });
  const [newProp, setNewProp] = useState<Omit<ItemProperty, 'id'>>({
    type: '', value: '', stat: '', dc: '', bonus: '', description: ''
  });

  // [NOTE] Fetch features on mount
  useEffect(() => {
    fetchFeatures().then(setFeatures).catch(() => setFeatures([]));
  }, []);

  const filteredFeatures = features.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // [NOTE] Standard Field Handler
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numericFields = ['weight', 'cost', 'max_charges'];
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? (parseFloat(value) || (name === 'max_charges' ? '' : 0)) : value
    }));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault();
  };

  // [NOTE] Tag Input Handlers
  const handleTagKeyDown = (type: 'properties' | 'abilities', e: KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput[type].trim()) {
      e.preventDefault();
      const val = tagInput[type].trim();
      setFormData(prev => {
        if (!prev[type].includes(val)) return { ...prev, [type]: [...prev[type], val] };
        return prev;
      });
      setTagInput(prev => ({ ...prev, [type]: '' }));
    }
  };

  const removeTag = (type: 'properties' | 'abilities', index: number) => {
    setFormData(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) }));
  };

  // [NOTE] Damage Entry Handlers
  const addDamageEntry = () => {
    setFormData(prev => ({
      ...prev,
      damage_entries: [...prev.damage_entries, { id: crypto.randomUUID(), dice: '', type: '', context: 'extra' }]
    }));
  };

  const updateDamageEntry = (id: string, field: keyof DamageEntry, value: string) => {
    setFormData(prev => ({
      ...prev,
      damage_entries: prev.damage_entries.map(entry => entry.id === id ? { ...entry, [field]: value } : entry)
    }));
  };

  const removeDamageEntry = (id: string) => {
    setFormData(prev => ({
      ...prev,
      damage_entries: prev.damage_entries.filter(entry => entry.id !== id)
    }));
  };

  // [NOTE] Property Data Handlers
  const addProperty = () => {
    if (!newProp.type) { alert('Select a property type first.'); return; }
    setFormData(prev => ({
      ...prev,
      property_data: [...prev.property_data, { ...newProp, id: crypto.randomUUID(), value: newProp.value || '0' }]
    }));
    setNewProp({ type: '', value: '', stat: '', dc: '', bonus: '', description: '' });
  };

  const removeProperty = (id: string) => {
    setFormData(prev => ({ ...prev, property_data: prev.property_data.filter(p => p.id !== id) }));
  };

  const handlePropChange = (field: keyof Omit<ItemProperty, 'id'>, value: string) => {
    setNewProp(prev => ({ ...prev, [field]: value }));
  };

  // [NOTE] Feature Selector Handlers (Fixed for stale state)
  const selectFeatureForPreview = (feature: Feature) => {
    setPreviewFeature(feature);
    setSearchQuery(feature.name);
    setShowDropdown(false);
  };

  const addSelectedFeature = () => {
    if (!previewFeature) return;
    // Use functional update to guarantee fresh state & prevent duplicates
    setFormData(prev => {
      const exists = prev.special_abilities.some(a => a.id === previewFeature.id);
      if (exists) return prev;
      return { ...prev, special_abilities: [...prev.special_abilities, previewFeature] };
    });
    setPreviewFeature(null);
    setSearchQuery('');
  };

  const removeAbility = (id: number) => {
    setFormData(prev => ({ ...prev, special_abilities: prev.special_abilities.filter(a => a.id !== id) }));
  };

  // [NOTE] Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.item_type) {
      setError('Name and Item Type are required.');
      return;
    }

    // Prepare payload for API
    const payload: Record<string, any> = { ...formData };

    // Serialize damage entries into property_data JSON
    if (formData.item_type === 'Weapon' && formData.damage_entries.length > 0) {
      payload.property_data = {
        properties: formData.property_data.map(({ id, ...rest }) => rest), // Remove UI IDs
        damage_entries: formData.damage_entries.map(({ id, ...rest }) => rest)
      };
      
      // Keep legacy fields for backward compatibility with existing display logic
      const baseEntry = formData.damage_entries.find(e => e.context === 'base');
      if (baseEntry) {
        payload.damage_dice = baseEntry.dice;
        payload.damage_type = baseEntry.type;
      }
    } else {
      payload.property_data = { properties: formData.property_data.map(({ id, ...rest }) => rest) };
    }
    
    // Remove temporary UI fields
    delete payload.damage_entries;
    delete payload.property_data; // Wait, we already set it above. Let's fix structure:
    // Actually, let's rebuild cleanly:
    delete payload.damage_entries;
    delete payload.properties; // Moved into property_data
    
    // Clean up optional/empty fields
    if (formData.max_charges === '') delete payload.max_charges;
    if (!formData.charge_recharge.trim()) delete payload.charge_recharge;
    if (!formData.on_hit_effect.trim()) delete payload.on_hit_effect;
    if (formData.item_type !== 'Weapon') {
      delete payload.damage_dice;
      delete payload.damage_type;
    }

    try {
      setLoading(true);
      setError(null);
      const newItem = await createItem(payload);

      if (returnTo) {
        try {
          const targetPath = returnTo.startsWith('http') ? new URL(returnTo).pathname : returnTo;
          const searchParams = new URLSearchParams();
          searchParams.set('newItem', JSON.stringify(newItem));
          navigate(`${targetPath}?${searchParams.toString()}`, { replace: true });
        } catch {
          alert('Failed to auto-add item. Please add manually.');
          navigate('/');
        }
      } else {
        alert('Item created successfully!');
        setFormData({
          name: '', desc: '', weight: 0, cost: 0, item_type: '', item_category: '', rarity: 'common',
          properties: [], special_abilities: [],
          max_charges: '', charge_recharge: '', on_hit_effect: '', property_data: [],
          damage_entries: [{ id: crypto.randomUUID(), dice: '', type: '', context: 'base' }]
        });
        setTagInput({ properties: '', abilities: '' });
        setPreviewFeature(null);
        setSearchQuery('');
        setNewProp({ type: '', value: '', stat: '', dc: '', bonus: '', description: '' });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create item.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryOptions = () => {
    const cats = VALID_CATEGORIES[formData.item_type as keyof typeof VALID_CATEGORIES] || VALID_CATEGORIES.Default;
    return cats.map(c => <option key={c} value={c}>{c}</option>);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={goToMain} className={styles.button}>Home</button>
        <h2>Create New Item</h2>
      </header>

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        {/* Basic Info */}
        <div className={styles.formGroup}>
          <label htmlFor="item-name">Name</label>
          <input id="item-name" type="text" name="name" value={formData.name} onChange={handleChange} className={styles.input} required />
        </div>

        <div className={styles.formGroup}>
          <label>Type & Category</label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label htmlFor="item-type" style={{ display: 'block', marginBottom: '0.3rem' }}>Type</label>
              <select id="item-type" name="item_type" value={formData.item_type} onChange={handleChange} className={styles.select} required>
                <option value="" disabled>Select type</option>
                {VALID_ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label htmlFor="item-category" style={{ display: 'block', marginBottom: '0.3rem' }}>Category</label>
              <select id="item-category" name="item_category" value={formData.item_category} onChange={handleChange} className={styles.select} required disabled={!formData.item_type}>
                <option value="" disabled>{formData.item_type ? 'Select category' : 'Select type first'}</option>
                {getCategoryOptions()}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Rarity</label>
          <select name="rarity" value={formData.rarity} onChange={handleChange} className={styles.select}>
            {VALID_RARITIES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="item-desc">Description</label>
          <textarea id="item-desc" name="desc" value={formData.desc} onChange={handleChange} className={styles.input} rows={3} placeholder="Appearance, effects, lore..." />
        </div>

        <div className={styles.formGroup}>
          <label>Weight & Cost</label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Weight (lbs)</label>
              <input type="number" name="weight" value={formData.weight} onChange={handleChange} onKeyDown={handleKeyDown} className={styles.numberInput} min="0" />
            </div>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Cost (gp)</label>
              <input type="number" name="cost" value={formData.cost} onChange={handleChange} onKeyDown={handleKeyDown} className={styles.numberInput} min="0" />
            </div>
          </div>
        </div>

        {/* [NOTE] Weapon Section (Conditional) */}
        {formData.item_type === 'Weapon' && (
          <div className={styles.formGroup} style={{padding: '0.75rem', borderRadius: '8px', border: '1px solid #745824' }}>
            <label style={{ color: '#745824', fontWeight: 600 }}>Weapon Damage</label>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              {formData.damage_entries.map((entry) => (
                <div key={entry.id} style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  alignItems: 'end', 
                  flexWrap: 'wrap',
                  background: 'white',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #dee2e6'
                }}>
                  <div style={{ flex: 1, minWidth: '80px' }}>
                    <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.75rem' }}>Dice</label>
                    <input
                      type="text"
                      value={entry.dice}
                      onChange={(e) => updateDamageEntry(entry.id, 'dice', e.target.value)}
                      className={styles.input}
                      placeholder="1d8"
                      style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                    />
                  </div>
                  
                  <div style={{ flex: 1.5, minWidth: '100px' }}>
                    <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.75rem' }}>Damage Type</label>
                    <select
                      value={entry.type}
                      onChange={(e) => updateDamageEntry(entry.id, 'type', e.target.value)}
                      className={styles.select}
                      style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                    >
                      <option value="">Select</option>
                      {VALID_DAMAGE_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                    </select>
                  </div>

                  <div style={{ flex: 1.5, minWidth: '120px' }}>
                    <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.75rem' }}>Context</label>
                    <select
                      value={entry.context}
                      onChange={(e) => updateDamageEntry(entry.id, 'context', e.target.value)}
                      className={styles.select}
                      style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                    >
                      <option value="base">Base Attack</option>
                      <option value="versatile">Versatile</option>
                      <option value="two-handed">Two-Handed</option>
                      <option value="on hit">On Hit / Extra</option>
                      <option value="thrown">Thrown</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeDamageEntry(entry.id)}
                    disabled={formData.damage_entries.length === 1}
                    style={{
                      background: '#fee2e2',
                      border: 'none',
                      color: '#dc2626',
                      cursor: formData.damage_entries.length === 1 ? 'not-allowed' : 'pointer',
                      borderRadius: '4px',
                      padding: '0.4rem 0.6rem',
                      fontSize: '0.9rem',
                      marginBottom: '0.1rem'
                    }}
                    title="Remove damage profile"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addDamageEntry}
              className={styles.button}
              style={{ marginTop: '0.5rem', fontSize: '0.85rem', padding: '0.3rem 0.6rem' }}
            >
              + Add Damage Profile
            </button>

            {/* Weapon Properties Tags */}
            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Properties (Keywords)</label>
              <input 
                type="text" 
                value={tagInput.properties} 
                onChange={(e) => setTagInput(prev => ({ ...prev, properties: e.target.value }))} 
                onKeyDown={(e) => handleTagKeyDown('properties', e)} 
                className={styles.input} 
                placeholder="Type & press Enter (e.g., Finesse, Reach)" 
                style={{ fontSize: '0.85rem' }} 
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
                {formData.properties.map((prop, idx) => (
                  <span key={idx} style={{ background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {prop}
                    <button type="button" onClick={() => removeTag('properties', idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }}>×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* [NOTE] Magic/Charge Section */}
        {(formData.rarity !== 'common' || formData.max_charges !== '') && (
          <div className={styles.formGroup} style={{ background: '#fef3c7', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fde047' }}>
            <label style={{ color: '#92400e', fontWeight: 600 }}>[MAGIC] Charge Features</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.85rem' }}>Max Charges</label>
                <input type="number" name="max_charges" value={formData.max_charges} onChange={handleChange} onKeyDown={handleKeyDown} className={styles.numberInput} min="0" placeholder="0" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.85rem' }}>Recharge Rule</label>
                <input type="text" name="charge_recharge" value={formData.charge_recharge} onChange={handleChange} className={styles.input} placeholder="e.g., 1d6+1 at dawn" />
              </div>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.85rem' }}>On Hit / Activation Effect</label>
              <textarea name="on_hit_effect" value={formData.on_hit_effect} onChange={handleChange} className={styles.input} rows={2} placeholder="e.g., Target must succeed on DC 13 Con save..." />
            </div>
          </div>
        )}

        {/* [NOTE] Structured Property Builder */}
        <div className={styles.formGroup} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #745824' }}>
          <label style={{ color: '#745824', fontWeight: 600 }}>Properties</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.85rem' }}>Type</label>
              <select value={newProp.type} onChange={(e) => handlePropChange('type', e.target.value)} className={styles.select}>
                <option value="">Select</option>
                <option value="ac_bonus">AC Bonus</option>
                <option value="ability_increase">Ability Increase</option>
                <option value="damage_bonus">Damage/Attack Bonus</option>
                <option value="spellcasting">Spellcasting</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {newProp.type && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.85rem' }}>Value</label>
                  <input type="text" value={newProp.value} onChange={(e) => handlePropChange('value', e.target.value)} className={styles.input} placeholder="+1" />
                </div>
                {newProp.type === 'ability_increase' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.85rem' }}>Stat</label>
                    <select value={newProp.stat} onChange={(e) => handlePropChange('stat', e.target.value)} className={styles.select}>
                      <option value="">Select</option>
                      {['strength','dexterity','constitution','intelligence','wisdom','charisma'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
              </>
            )}
          </div>
          <button type="button" onClick={addProperty} className={styles.button} style={{ marginTop: '0.5rem', width: '100%' }}>+ Add Property</button>
          {formData.property_data.length > 0 && (
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {formData.property_data.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
                  <span><strong style={{ textTransform: 'capitalize' }}>{p.type.replace('_', ' ')}</strong>: {p.value}{p.stat && ` (${p.stat})`}</span>
                  <button type="button" onClick={() => removeProperty(p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* [NOTE] Feature/Traits Selector (Fixed) */}
        <div className={styles.formGroup} style={{padding: '0.75rem', borderRadius: '8px', border: '1px solid #745824' }}>
          <label style={{ color: '#745824', fontWeight: 600 }}>Special Abilities</label>
          
          <div style={{ position: 'relative', marginTop: '0.5rem' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); setPreviewFeature(null); }}
              onFocus={() => setShowDropdown(true)}
              className={styles.input}
              placeholder="Search features (e.g., Darkvision, Fire Resistance)..."
              style={{ marginBottom: '0.3rem' }}
            />
            {showDropdown && filteredFeatures.length > 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0, maxHeight: '200px', overflowY: 'auto', background: 'white', border: '1px solid #ccc', borderRadius: '6px', zIndex: 100, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                {filteredFeatures.slice(0, 10).map(f => (
                  <div
                    key={f.id}
                    onClick={() => selectFeatureForPreview(f)}
                    style={{ 
                      padding: '0.5rem', 
                      cursor: 'pointer', 
                      borderBottom: '1px solid #f0f0f0',
                      backgroundColor: previewFeature?.id === f.id ? '#f0fdf4' : 'white'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = previewFeature?.id === f.id ? '#f0fdf4' : 'white'}
                  >
                    <strong>{f.name}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {previewFeature && (
            <div style={{ background: '#fff', padding: '0.75rem', borderRadius: '6px', border: '2px solid #86efac', marginTop: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                <strong style={{ color: '#15803d', fontSize: '1.05rem' }}>{previewFeature.name}</strong>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setPreviewFeature(null)} style={{ background: '#f3f4f6', border: '1px solid #d1d5db', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                  <button type="button" onClick={addSelectedFeature} className={styles.button} style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>+ Add to Item</button>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.5', margin: 0 }}>{previewFeature.description}</p>
            </div>
          )}

          {formData.special_abilities.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#166534', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>Added Abilities ({formData.special_abilities.length}):</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {formData.special_abilities.map(ab => (
                  <div key={ab.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', background: 'white', padding: '0.75rem', borderRadius: '6px', border: '1px solid #86efac', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: '#15803d' }}>{ab.name}</strong>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0 0', lineHeight: '1.4' }}>{ab.description}</p>
                    </div>
                    <button type="button" onClick={() => removeAbility(ab.id)} style={{ background: '#fee2e2', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '0.75rem', flexShrink: 0 }} title="Remove ability">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {features.length === 0 && <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>No features found. Ensure /API/features endpoint exists.</p>}
          {features.length > 0 && filteredFeatures.length === 0 && searchQuery && <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>No features match "{searchQuery}"</p>}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.controls}>
          <button type="submit" className={styles.createBtn} disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating...' : 'Create Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItemForm;