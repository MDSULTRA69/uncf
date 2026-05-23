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

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1.2rem', color: '#e2b96f', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Trophy size={20} /> Leaderboard
          </h1>
          <p style={{ color: '#5a5a7a', fontSize: '0.75rem', marginTop: '0.15rem' }}>Top ninjas of UNC</p>
        </div>
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {['points', 'wins', 'xp'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-gold' : 'btn-ghost'}`} style={{ textTransform: 'capitalize', padding: '0.35rem 0.6rem', fontSize: '0.68rem' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Podium — compact on mobile */}
      {sorted.length >= 3 && (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
          {/* 2nd */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>🥈</div>
            <div style={{
              background: 'linear-gradient(180deg, #2a2a3e, #1e1e32)', border: '1px solid #C0C0C0',
              borderRadius: '6px 6px 0 0', padding: '0.75rem 0.5rem 0.75rem', height: '80px',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
            }}>
              <div style={{ fontSize: '0.72rem', color: '#e8e0d0', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sorted[1]?.characterName}</div>
              <div style={{ fontSize: '0.58rem', color: rankColor[sorted[1]?.rank] || '#5a5a7a', fontFamily: 'Cinzel, serif' }}>{sorted[1]?.rank}</div>
              <div style={{ fontSize: '0.65rem', color: '#C0C0C0', marginTop: '2px' }}>{sorted[1]?.stats?.[filter] || 0}</div>
            </div>
          </div>

          {/* 1st */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <Crown size={22} style={{ color: '#FFD700', marginBottom: '0.3rem' }} />
            <div style={{
              background: 'linear-gradient(180deg, rgba(226,185,111,0.1), #1e1e32)', border: '1px solid #FFD700',
              borderRadius: '6px 6px 0 0', padding: '0.75rem 0.5rem 0.75rem', height: '110px',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              boxShadow: '0 0 15px rgba(255,215,0,0.1)'
            }}>
              <div style={{ fontSize: '0.82rem', color: '#e8e0d0', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sorted[0]?.characterName}</div>
              <div style={{ fontSize: '0.62rem', color: rankColor[sorted[0]?.rank] || '#5a5a7a', fontFamily: 'Cinzel, serif' }}>{sorted[0]?.rank}</div>
              <div style={{ fontSize: '0.72rem', color: '#FFD700', marginTop: '2px', fontWeight: 700 }}>{sorted[0]?.stats?.[filter] || 0}</div>
            </div>
          </div>

          {/* 3rd */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>🥉</div>
            <div style={{
              background: 'linear-gradient(180deg, #2a2a3e, #1e1e32)', border: '1px solid #CD7F32',
              borderRadius: '6px 6px 0 0', padding: '0.75rem 0.5rem 0.75rem', height: '60px',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
            }}>
              <div style={{ fontSize: '0.72rem', color: '#e8e0d0', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sorted[2]?.characterName}</div>
              <div style={{ fontSize: '0.58rem', color: rankColor[sorted[2]?.rank] || '#5a5a7a', fontFamily: 'Cinzel, serif' }}>{sorted[2]?.rank}</div>
              <div style={{ fontSize: '0.65rem', color: '#CD7F32', marginTop: '2px' }}>{sorted[2]?.stats?.[filter] || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Full list */}
      <div className="card" style={{ padding: '0.875rem' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', color: '#e2b96f', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
          ALL RANKINGS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {sorted.map((player, i) => {
            const pos = positionStyle[i + 1];
            const rc = rankColor[player.rank] || '#5a5a7a';
            return (
              <div key={player._id || i} style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.65rem 0.75rem', borderRadius: '5px',
                background: i < 3 ? `${pos?.color}08` : '#0a0a12',
                border: `1px solid ${i < 3 ? `${pos?.color}22` : '#1e1e32'}`
              }}>
                {/* Position */}
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: pos?.color || '#5a5a7a', fontFamily: 'Cinzel, serif', minWidth: '24px', textAlign: 'center' }}>
                  {pos?.icon || i + 1}
                </div>
                {/* Avatar */}
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${rc}22`, border: `1px solid ${rc}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: rc, fontFamily: 'Cinzel, serif', flexShrink: 0 }}>
                  {player.characterName?.[0]?.toUpperCase()}
                </div>
                {/* Name/info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', color: '#e8e0d0', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{player.characterName}</div>
                  <div style={{ fontSize: '0.6rem', color: rc, fontFamily: 'Cinzel, serif' }}>{player.rank}</div>
                </div>
                {/* Stats — show only the active sort column + wins */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.8rem', color: filter === 'points' ? '#9b59b6' : filter === 'wins' ? '#27ae60' : '#e2b96f', fontWeight: 700 }}>
                    {filter === 'xp' ? (player.stats?.xp || 0).toLocaleString() : (player.stats?.[filter] || 0)}
                  </div>
                  <div style={{ fontSize: '0.58rem', color: '#5a5a7a', fontFamily: 'Cinzel, serif' }}>{filter}</div>
                </div>
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
