// src/features/Monsters/MonsterCreator/MonsterForm.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../../character-creator/CharacterCreator.module.css';
import { createMonster } from '../../../services/api';

// ✅ D&D 5e Valid Options
const VALID_SIZES = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'] as const;
const VALID_TYPES = [
  'Aberration', 'Beast', 'Celestial', 'Construct', 'Dragon', 'Elemental',
  'Fey', 'Fiend', 'Giant', 'Humanoid', 'Monstrosity', 'Ooze', 'Plant', 'Undead'
] as const;
const VALID_ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil',
  'Unaligned', 'Any'
] as const;
const VALID_CR = [
  '0', '1/8', '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23',
  '24', '25', '26', '27', '28', '29', '30'
] as const;

type MonsterSize = typeof VALID_SIZES[number] | '';
type MonsterType = typeof VALID_TYPES[number] | '';
type MonsterAlignment = typeof VALID_ALIGNMENTS[number] | '';

// ✅ Action Types
interface MonsterAction {
  name: string;
  description: string;
  attack_bonus: string;
  damage: string;
}

interface MonsterActions {
  actions: MonsterAction[];
  bonus_actions: MonsterAction[];
  legendary_actions: MonsterAction[];
  reactions: MonsterAction[];
}

// ✅ Speed sub-structure for JSON storage
interface MonsterSpeeds {
  walk?: number;
  swim?: number;
  climb?: number;
  fly?: number;
  burrow?: number;
  hover?: boolean;
}

interface MonsterFormData {
  name: string;
  size: MonsterSize;
  type: MonsterType;
  alignment: MonsterAlignment;
  armor_class: number;
  hit_points: number;
  speeds: MonsterSpeeds;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  challenge_rating: string; // Kept as string for dropdown UI
  description: string;
  actions: MonsterActions;
}

const MonsterForm: React.FC = () => {
  const [formData, setFormData] = useState<MonsterFormData>({
    name: '', size: '', type: '', alignment: '', armor_class: 10, hit_points: 1,
    speeds: { walk: 30 },
    strength: 10, dexterity: 10, constitution: 10,
    intelligence: 10, wisdom: 10, charisma: 10, challenge_rating: '0', description: '',
    actions: { actions: [], bonus_actions: [], legendary_actions: [], reactions: [] }
  });

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const returnTo = queryParams.get('returnTo');
  const goToMain = () => navigate('/');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Helper: Format speeds object into D&D display string
  const formatSpeedDisplay = useMemo(() => {
    const s = formData.speeds;
    const parts: string[] = [];
    if (s.walk) parts.push(`${s.walk} ft.`);
    if (s.fly) parts.push(`fly ${s.fly} ft.${s.hover ? ' (hover)' : ''}`);
    if (s.swim) parts.push(`swim ${s.swim} ft.`);
    if (s.climb) parts.push(`climb ${s.climb} ft.`);
    if (s.burrow) parts.push(`burrow ${s.burrow} ft.`);
    return parts.length > 0 ? parts.join(', ') : '0 ft.';
  }, [formData.speeds]);

  // ✅ Standard Field Handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const numericFields = ['armor_class', 'hit_points', 'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? (parseFloat(value) || 0) : value,
    }));
  };

  // ✅ Speed Field Handler (structured JSON)
  const handleSpeedChange = (type: keyof MonsterSpeeds, value: string | boolean) => {
    setFormData(prev => {
      const newSpeeds = { ...prev.speeds };
      if (type === 'hover') {
        newSpeeds.hover = value as boolean;
      } else {
        const num = parseInt(value as string, 10);
        if (num > 0) newSpeeds[type] = num;
        else delete newSpeeds[type];
      }
      return { ...prev, speeds: newSpeeds };
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault();
  };

  // ✅ Action Array Handlers
  const addAction = (type: keyof MonsterActions) => {
    setFormData(prev => ({
      ...prev,
      actions: {
        ...prev.actions,
        [type]: [...prev.actions[type], { name: '', description: '', attack_bonus: '', damage: '' }]
      }
    }));
  };

  const removeAction = (type: keyof MonsterActions, index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: {
        ...prev.actions,
        [type]: prev.actions[type].filter((_, i) => i !== index)
      }
    }));
  };

  const updateAction = (type: keyof MonsterActions, index: number, field: keyof MonsterAction, value: string) => {
    setFormData(prev => {
      const updated = [...prev.actions[type]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, actions: { ...prev.actions, [type]: updated } };
    });
  };

  // ✅ Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.size || !formData.type) {
      setError('Name, Size, and Type are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // ✅ Convert CR string to float for Backend (Column(Float))
      const crMap: Record<string, number> = { '1/8': 0.125, '1/4': 0.25, '1/2': 0.5 };
      const finalCr = formData.challenge_rating.includes('/')
        ? crMap[formData.challenge_rating]
        : parseFloat(formData.challenge_rating) || 0;

      const payload = { ...formData, challenge_rating: finalCr };
      const newMonster = await createMonster(payload);

      if (returnTo) {
        try {
          const targetPath = returnTo.startsWith('http') ? new URL(returnTo).pathname : returnTo;
          const searchParams = new URLSearchParams();
          searchParams.set('newMonster', JSON.stringify(newMonster));
          navigate(`${targetPath}?${searchParams.toString()}`, { replace: true });
        } catch {
          alert('Failed to auto-add monster. Please add manually.');
          navigate('/');
        }
      } else {
        alert('✅ Monster created successfully!');
        setFormData({
          name: '', size: '', type: '', alignment: '', armor_class: 10, hit_points: 1,
          speeds: { walk: 30 },
          strength: 10, dexterity: 10, constitution: 10,
          intelligence: 10, wisdom: 10, charisma: 10, challenge_rating: '0', description: '',
          actions: { actions: [], bonus_actions: [], legendary_actions: [], reactions: [] }
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create monster.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={goToMain} className={styles.button}>Home</button>
        <h2>Create New Monster</h2>
      </header>

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        {/* Basic Info */}
        <div className={styles.formGroup}>
          <label htmlFor="monster-name">Name</label>
          <input id="monster-name" type="text" name="name" value={formData.name} onChange={handleChange} className={styles.input} required />
        </div>

        <div className={styles.formGroup}>
          <label>Size & Type</label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label htmlFor="monster-size" style={{ display: 'block', marginBottom: '0.3rem' }}>Size</label>
              <select id="monster-size" name="size" value={formData.size} onChange={handleChange} className={styles.select} required>
                <option value="" disabled>Select size</option>
                {VALID_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label htmlFor="monster-type" style={{ display: 'block', marginBottom: '0.3rem' }}>Type</label>
              <select id="monster-type" name="type" value={formData.type} onChange={handleChange} className={styles.select} required>
                <option value="" disabled>Select type</option>
                {VALID_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ✅ Alignment Dropdown */}
        <div className={styles.formGroup}>
          <label htmlFor="monster-alignment">Alignment</label>
          <select id="monster-alignment" name="alignment" value={formData.alignment} onChange={handleChange} className={styles.select}>
            <option value="" disabled>Select alignment</option>
            {VALID_ALIGNMENTS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {/* ✅ Structured Speed Inputs */}
        <div className={styles.formGroup}>
          <label>Movement Speeds</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
            {(['walk', 'swim', 'climb', 'fly', 'burrow'] as const).map((moveType) => (
              <div key={moveType}>
                <label htmlFor={`speed-${moveType}`} style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                  {moveType}
                </label>
                <input
                  id={`speed-${moveType}`}
                  type="number"
                  min="0"
                  value={formData.speeds[moveType] || ''}
                  onChange={(e) => handleSpeedChange(moveType, e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={styles.numberInput}
                  placeholder="0"
                />
              </div>
            ))}
            {formData.speeds.fly !== undefined && (
              <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem' }}>
                <input type="checkbox" id="speed-hover" checked={formData.speeds.hover || false} onChange={(e) => handleSpeedChange('hover', e.target.checked)} />
                <label htmlFor="speed-hover" style={{ fontSize: '0.85rem' }}>Has Hover</label>
              </div>
            )}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#555', fontStyle: 'italic', padding: '0.3rem 0.5rem', background: '#f5f5f5', borderRadius: '4px' }}>
            Preview: <strong>{formatSpeedDisplay}</strong>
          </div>
        </div>

        {/* Combat Stats */}
        <div className={styles.formGroup}>
          <label>Combat Stats</label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <label htmlFor="monster-ac" style={{ display: 'block', marginBottom: '0.3rem' }}>Armor Class</label>
              <input id="monster-ac" type="number" min="0" name="armor_class" value={formData.armor_class} onChange={handleChange} onKeyDown={handleKeyDown} className={styles.numberInput} />
            </div>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <label htmlFor="monster-hp" style={{ display: 'block', marginBottom: '0.3rem' }}>Hit Points</label>
              <input id="monster-hp" type="number" min="0" name="hit_points" value={formData.hit_points} onChange={handleChange} onKeyDown={handleKeyDown} className={styles.numberInput} />
            </div>
          </div>
        </div>

        {/* Ability Scores */}
        <div className={styles.formGroup}>
          <label>Ability Scores</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const).map((stat) => (
              <div key={stat}>
                <label htmlFor={`monster-${stat}`} style={{ display: 'block', marginBottom: '0.2rem', textTransform: 'capitalize', fontSize: '0.9rem' }}>{stat}</label>
                <input id={`monster-${stat}`} type="number" min="1" max="30" name={stat} value={formData[stat] as number} onChange={handleChange} onKeyDown={handleKeyDown} className={styles.numberInput} />
              </div>
            ))}
          </div>
        </div>

        {/* ✅ Challenge Rating Dropdown */}
        <div className={styles.formGroup}>
          <label htmlFor="monster-cr">Challenge Rating (CR)</label>
          <select id="monster-cr" name="challenge_rating" value={formData.challenge_rating} onChange={handleChange} className={styles.select}>
            <option value="" disabled>Select CR</option>
            {VALID_CR.map(cr => <option key={cr} value={cr}>{cr}</option>)}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="monster-desc">Description / Lore</label>
          <textarea id="monster-desc" name="description" value={formData.description} onChange={handleChange} className={styles.input} rows={4} placeholder="Appearance, behavior, lair, tactics, etc." />
        </div>

        {/* ✅ Dynamic Action Sections */}
        {(['actions', 'bonus_actions', 'legendary_actions', 'reactions'] as const).map((type) => {
          const label = type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
          const list = formData.actions[type];

          return (
            <div key={type} className={styles.formGroup}>
              <label>{label}</label>
              {list.length === 0 ? (
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>No {label.toLowerCase()} yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {list.map((action, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'start', background: '#f9f9f9', padding: '0.75rem', borderRadius: '8px', border: '1px solid #eee' }}>
                      <div style={{ flex: 1 }}>
                        <input type="text" placeholder="Action name" value={action.name} onChange={(e) => updateAction(type, idx, 'name', e.target.value)} className={styles.input} required style={{ marginBottom: '0.3rem' }} />
                        <textarea placeholder="Description" value={action.description} onChange={(e) => updateAction(type, idx, 'description', e.target.value)} className={styles.input} rows={2} style={{ marginBottom: '0.3rem', fontSize: '0.9rem' }} />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input type="text" placeholder="Attack Bonus (+7)" value={action.attack_bonus} onChange={(e) => updateAction(type, idx, 'attack_bonus', e.target.value)} className={styles.input} style={{ flex: 1, fontSize: '0.85rem' }} />
                          <input type="text" placeholder="Damage (2d6 + 4 piercing)" value={action.damage} onChange={(e) => updateAction(type, idx, 'damage', e.target.value)} className={styles.input} style={{ flex: 2, fontSize: '0.85rem' }} />
                        </div>
                      </div>
                      <button type="button" onClick={() => removeAction(type, idx)} style={{ background: '#e53e3e', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 0.6rem', cursor: 'pointer', fontSize: '0.9rem', alignSelf: 'start' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              <button type="button" onClick={() => addAction(type)} className={styles.button} style={{ fontSize: '0.85rem', padding: '0.3rem 0.6rem' }}>+ Add {label}</button>
            </div>
          );
        })}

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.controls}>
          <button type="submit" className={styles.createBtn} disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating...' : 'Create Monster'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MonsterForm;