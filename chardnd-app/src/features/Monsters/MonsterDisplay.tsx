// src/features/Monsters/MonsterDisplay.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from "../character-creator/CharacterCreator.module.css"
import { fetchMonster } from '../../services/api';

interface MonsterData {
  id: number;
  name: string;
  size: string;
  type: string;
  alignment: string;
  armor_class: number;
  hit_points: number;
  speed: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  challenge_rating: string;
  description: string;
}

const MonsterDisplay: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [monster, setMonster] = useState<MonsterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMonster = async () => {
      if (!id) { setError('No monster ID provided.'); setLoading(false); return; }
      try {
        const data = await fetchMonster(parseInt(id, 10));
        setMonster(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch monster.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadMonster();
  }, [id]);

  const goHome = () => navigate('/');

  if (loading) return <div className={styles.container}><p>Loading monster...</p></div>;
  if (error) return (
    <div className={styles.container}>
      <div className={styles.error}>{error}</div>
      <button onClick={goHome} className={styles.button}>Go Home</button>
    </div>
  );
  if (!monster) return <div className={styles.container}>Monster not found.</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={goHome} className={styles.button}>Home</button>
        <h2>{monster.name}</h2>
      </header>

      <div style={{ padding: '1rem', display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <span><strong>Size:</strong> {monster.size}</span>
          <span><strong>Type:</strong> {monster.type}</span>
          <span><strong>Alignment:</strong> {monster.alignment}</span>
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div><strong>AC:</strong> {monster.armor_class}</div>
          <div><strong>HP:</strong> {monster.hit_points}</div>
          <div><strong>Speed:</strong> {monster.speed}</div>
          <div><strong>CR:</strong> {monster.challenge_rating}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem', textAlign: 'center', background: '#f4f4f4', padding: '0.5rem', borderRadius: '8px' }}>
          {(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const).map(stat => (
            <div key={stat}>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>{stat.slice(0,3)}</div>
              <div>{monster[stat]}</div>
            </div>
          ))}
        </div>

        {monster.description && (
          <div>
            <h3>Description / Lore</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{monster.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonsterDisplay;