import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../utils/api';
import { Trophy, Crown } from 'lucide-react';

const rankColor = { Rookie: '#5a5a7a', Genin: '#3498db', Chunin: '#27ae60', Jounin: '#9b59b6', Kage: '#e2b96f', Sage: '#4ecdc4', God: '#e74c3c' };
const positionStyle = {
  1: { color: '#FFD700', icon: '👑' },
  2: { color: '#C0C0C0', icon: '🥈' },
  3: { color: '#CD7F32', icon: '🥉' },
};

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('points');

  useEffect(() => {
    getLeaderboard()
      .then(r => setPlayers(r.data.players || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...players].sort((a, b) => {
    if (filter === 'points') return (b.stats?.points || 0) - (a.stats?.points || 0);
    if (filter === 'wins') return (b.stats?.wins || 0) - (a.stats?.wins || 0);
    if (filter === 'xp') return (b.stats?.xp || 0) - (a.stats?.xp || 0);
    return 0;
  });

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const topThree = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1.4rem', color: '#e2b96f', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={24} /> Leaderboard
          </h1>
          <p style={{ color: '#5a5a7a', fontSize: '0.8rem', marginTop: '0.25rem' }}>Top ninjas of UNC</p>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['points', 'wins', 'xp'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-gold' : 'btn-ghost'}`} style={{ textTransform: 'capitalize' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Podium */}
      {topThree.length >= 3 && (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '1.5rem', marginBottom: '2.5rem', padding: '1rem 0' }}>
          {/* 2nd */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🥈</div>
            <div style={{
              background: 'linear-gradient(180deg, #2a2a3e, #1e1e32)', border: '1px solid #C0C0C0',
              borderRadius: '8px 8px 0 0', padding: '1.5rem 1rem 1rem', height: '100px',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#e8e0d0', fontWeight: 600 }}>{sorted[1]?.characterName}</div>
              <div style={{ fontSize: '0.7rem', color: rankColor[sorted[1]?.rank] || '#5a5a7a', fontFamily: 'Cinzel, serif' }}>{sorted[1]?.rank}</div>
              <div style={{ fontSize: '0.75rem', color: '#C0C0C0', marginTop: '0.3rem' }}>{sorted[1]?.stats?.[filter] || 0} {filter}</div>
            </div>
          </div>
          {/* 1st */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <Crown size={28} style={{ color: '#FFD700', marginBottom: '0.4rem' }} />
            <div style={{
              background: 'linear-gradient(180deg, rgba(226,185,111,0.1), #1e1e32)', border: '1px solid #FFD700',
              borderRadius: '8px 8px 0 0', padding: '1.5rem 1rem 1rem', height: '140px',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              boxShadow: '0 0 20px rgba(255,215,0,0.1)'
            }}>
              <div style={{ fontSize: '1rem', color: '#e8e0d0', fontWeight: 700 }}>{sorted[0]?.characterName}</div>
              <div style={{ fontSize: '0.72rem', color: rankColor[sorted[0]?.rank] || '#5a5a7a', fontFamily: 'Cinzel, serif' }}>{sorted[0]?.rank}</div>
              <div style={{ fontSize: '0.8rem', color: '#FFD700', marginTop: '0.3rem', fontWeight: 700 }}>{sorted[0]?.stats?.[filter] || 0} {filter}</div>
            </div>
          </div>
          {/* 3rd */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🥉</div>
            <div style={{
              background: 'linear-gradient(180deg, #2a2a3e, #1e1e32)', border: '1px solid #CD7F32',
              borderRadius: '8px 8px 0 0', padding: '1.5rem 1rem 1rem', height: '80px',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#e8e0d0', fontWeight: 600 }}>{sorted[2]?.characterName}</div>
              <div style={{ fontSize: '0.7rem', color: rankColor[sorted[2]?.rank] || '#5a5a7a', fontFamily: 'Cinzel, serif' }}>{sorted[2]?.rank}</div>
              <div style={{ fontSize: '0.75rem', color: '#CD7F32', marginTop: '0.3rem' }}>{sorted[2]?.stats?.[filter] || 0} {filter}</div>
            </div>
          </div>
        </div>
      )}

      {/* Full list */}
      <div className="card">
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', color: '#e2b96f', letterSpacing: '0.1em', marginBottom: '1rem' }}>
          ALL RANKINGS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 80px 80px 80px 80px', gap: '0.5rem', padding: '0.4rem 0.75rem', fontSize: '0.65rem', color: '#5a5a7a', fontFamily: 'Cinzel, serif', letterSpacing: '0.08em' }}>
            <span>#</span><span>NINJA</span><span style={{ textAlign: 'center' }}>RANK</span><span style={{ textAlign: 'right' }}>PTS</span><span style={{ textAlign: 'right' }}>WINS</span><span style={{ textAlign: 'right' }}>XP</span>
          </div>
          {sorted.map((player, i) => {
            const pos = positionStyle[i + 1];
            const rc = rankColor[player.rank] || '#5a5a7a';
            return (
              <div key={player._id || i} style={{
                display: 'grid', gridTemplateColumns: '40px 1fr 80px 80px 80px 80px', gap: '0.5rem',
                padding: '0.75rem', borderRadius: '5px', alignItems: 'center',
                background: i < 3 ? `${pos?.color}08` : '#0a0a12',
                border: `1px solid ${i < 3 ? `${pos?.color}22` : '#1e1e32'}`
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: pos?.color || '#5a5a7a', textAlign: 'center', fontFamily: 'Cinzel, serif' }}>
                  {pos?.icon || i + 1}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `${rc}22`, border: `1px solid ${rc}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: rc, fontFamily: 'Cinzel, serif', flexShrink: 0 }}>
                    {player.characterName?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#e8e0d0', fontWeight: 600 }}>{player.characterName}</div>
                    <div style={{ fontSize: '0.68rem', color: '#5a5a7a' }}>{player.clan} · {player.village}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.72rem', fontFamily: 'Cinzel, serif', color: rc }}>{player.rank}</div>
                <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#9b59b6', fontWeight: filter === 'points' ? 700 : 400 }}>{player.stats?.points || 0}</div>
                <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#27ae60', fontWeight: filter === 'wins' ? 700 : 400 }}>{player.stats?.wins || 0}</div>
                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#e2b96f', fontWeight: filter === 'xp' ? 700 : 400 }}>{(player.stats?.xp || 0).toLocaleString()}</div>
              </div>
            );
          })}
          {sorted.length === 0 && (
            <div style={{ textAlign: 'center', color: '#5a5a7a', padding: '2rem' }}>No players yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
