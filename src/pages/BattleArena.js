import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getPlayers, createBattle, getActiveBattles, getMyBattles } from '../utils/api';
import { Swords, Eye, Clock, Zap } from 'lucide-react';

const rankColor = { Rookie: '#5a5a7a', Genin: '#3498db', Chunin: '#27ae60', Jounin: '#9b59b6', Kage: '#e2b96f', Sage: '#4ecdc4', God: '#e74c3c' };

const battleTypeInfo = {
  official: 'Win=3pts, Draw=1pt, Loss=0pts. 10 turns.',
  sparring: 'Practice match. 5 turns. No points.',
  war: 'Village War battle. High stakes.',
  deathmatch: 'Death Match event. Special rules apply.',
  story: 'Story Mode battle. Narrative focus.'
};

export default function BattleArena() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [activeBattles, setActiveBattles] = useState([]);
  const [myBattles, setMyBattles] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [battleType, setBattleType] = useState('official');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('select'); // 'select' | 'setup'

  useEffect(() => {
    getPlayers().then(r => setPlayers(r.data.players || [])).catch(() => {});
    getActiveBattles().then(r => setActiveBattles(r.data.battles || [])).catch(() => {});
    getMyBattles().then(r => setMyBattles(r.data.battles?.filter(b => b.status === 'active') || [])).catch(() => {});
  }, []);

  const filtered = players.filter(p =>
    p._id !== user?.id &&
    (p.characterName?.toLowerCase().includes(search.toLowerCase()) ||
     p.clan?.toLowerCase().includes(search.toLowerCase()) ||
     p.village?.toLowerCase().includes(search.toLowerCase()))
  );

  const startBattle = async () => {
    if (!selectedPlayer) return toast.error('Select an opponent first');
    setLoading(true);
    try {
      const { data } = await createBattle({ opponentId: selectedPlayer._id, battleType });
      toast.success(`Battle started against ${selectedPlayer.characterName}!`);
      navigate(`/battle/${data.battle._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start battle');
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      <div>
        <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1.2rem', color: '#e2b96f' }}>Battle Arena</h1>
        <p style={{ color: '#5a5a7a', fontSize: '0.78rem', marginTop: '0.15rem' }}>Challenge a ninja to combat</p>
      </div>

      {/* My active battles */}
      {myBattles.length > 0 && (
        <div style={{ padding: '0.875rem', background: 'rgba(226,185,111,0.05)', border: '1px solid rgba(226,185,111,0.2)', borderRadius: '8px' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', color: '#e2b96f', marginBottom: '0.6rem', letterSpacing: '0.08em' }}>
            ⚔️ YOUR ACTIVE BATTLES
          </div>
          {myBattles.map(b => (
            <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0.65rem', background: '#0a0a12', borderRadius: '5px', marginBottom: '0.35rem', border: '1px solid #1e1e32' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#e8e0d0' }}>{b.player1Name} vs {b.player2Name}</div>
                <div style={{ fontSize: '0.62rem', color: '#5a5a7a', marginTop: '1px' }}>Turn {b.currentTurn}/{b.maxTurns}</div>
              </div>
              <button className="btn btn-gold btn-sm" onClick={() => navigate(`/battle/${b._id}`)}>
                <Zap size={12} /> Resume
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Step tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1e1e32' }}>
        {[['select', 'Choose Opponent'], ['setup', 'Battle Setup']].map(([id, label]) => (
          <button key={id} onClick={() => setView(id)} style={{
            flex: 1, padding: '0.55rem', border: 'none', background: 'transparent', cursor: 'pointer',
            fontFamily: 'Cinzel, serif', fontSize: '0.68rem', letterSpacing: '0.05em',
            color: view === id ? '#e2b96f' : '#5a5a7a',
            borderBottom: view === id ? '2px solid #e2b96f' : '2px solid transparent',
            marginBottom: '-1px'
          }}>{label}</button>
        ))}
      </div>

      {/* Opponent selector */}
      {view === 'select' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <input
            className="input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, clan, or village..."
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '55vh', overflowY: 'auto' }}>
            {filtered.map(p => {
              const rc = rankColor[p.rank] || '#5a5a7a';
              const isSelected = selectedPlayer?._id === p._id;
              return (
                <div
                  key={p._id}
                  onClick={() => { setSelectedPlayer(p); setView('setup'); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem', borderRadius: '6px', cursor: 'pointer',
                    background: isSelected ? 'rgba(226,185,111,0.08)' : '#12121e',
                    border: `1px solid ${isSelected ? '#e2b96f55' : '#1e1e32'}`,
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                    background: `${rc}22`, border: `2px solid ${rc}55`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.9rem', fontFamily: 'Cinzel, serif', color: rc
                  }}>
                    {p.characterName?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.88rem', color: '#e8e0d0', fontWeight: 600 }}>{p.characterName}</div>
                    <div style={{ fontSize: '0.68rem', color: '#5a5a7a', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.clan} · {p.village}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontFamily: 'Cinzel, serif', color: rc, flexShrink: 0 }}>{p.rank}</span>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', color: '#5a5a7a', padding: '2rem', fontSize: '0.82rem' }}>No ninjas found</div>
            )}
          </div>
        </div>
      )}

      {/* Battle setup */}
      {view === 'setup' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Selected opponent */}
          <div className="card card-gold" style={{ padding: '1rem' }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', color: '#e2b96f', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>SELECTED OPPONENT</div>
            {selectedPlayer ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                  background: `${rankColor[selectedPlayer.rank] || '#5a5a7a'}22`,
                  border: `2px solid ${rankColor[selectedPlayer.rank] || '#5a5a7a'}66`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', fontFamily: 'Cinzel, serif', color: rankColor[selectedPlayer.rank] || '#5a5a7a'
                }}>
                  {selectedPlayer.characterName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', color: '#e8e0d0', fontWeight: 600 }}>{selectedPlayer.characterName}</div>
                  <div style={{ fontSize: '0.7rem', color: rankColor[selectedPlayer.rank] || '#5a5a7a', fontFamily: 'Cinzel, serif' }}>{selectedPlayer.rank}</div>
                  <div style={{ fontSize: '0.68rem', color: '#5a5a7a' }}>{selectedPlayer.clan} · {selectedPlayer.village}</div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#5a5a7a', fontSize: '0.82rem', padding: '0.5rem' }}>
                No opponent selected — go back to Choose Opponent
              </div>
            )}
          </div>

          {/* Battle type */}
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', color: '#e2b96f', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>BATTLE TYPE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {Object.entries(battleTypeInfo).map(([type, info]) => (
                <div
                  key={type}
                  onClick={() => setBattleType(type)}
                  style={{
                    padding: '0.6rem 0.75rem', borderRadius: '5px', cursor: 'pointer',
                    background: battleType === type ? 'rgba(226,185,111,0.08)' : 'transparent',
                    border: `1px solid ${battleType === type ? '#e2b96f44' : '#1e1e32'}`,
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontFamily: 'Cinzel, serif', color: battleType === type ? '#e2b96f' : '#9090a8', textTransform: 'capitalize', marginBottom: '2px' }}>{type}</div>
                  <div style={{ fontSize: '0.65rem', color: '#5a5a7a' }}>{info}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="btn btn-gold btn-lg"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={startBattle}
            disabled={!selectedPlayer || loading}
          >
            <Swords size={17} />
            {loading ? 'Starting...' : 'Start Battle'}
          </button>
        </div>
      )}

      {/* Live battles */}
      {activeBattles.length > 0 && (
        <div>
          <div className="section-title" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>LIVE BATTLES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {activeBattles.map(b => (
              <div key={b._id} className="card" style={{ padding: '0.875rem', cursor: 'pointer' }} onClick={() => navigate(`/battle/${b._id}`)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="badge badge-red" style={{ fontSize: '0.58rem' }}>LIVE</span>
                  <span style={{ fontSize: '0.62rem', color: '#5a5a7a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={10} /> Turn {b.currentTurn}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#e8e0d0', textAlign: 'center', marginBottom: '0.5rem' }}>
                  {b.player1Name} <span style={{ color: '#e74c3c' }}>⚔</span> {b.player2Name}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {[{ name: 'P1', hp: b.player1HP }, { name: 'P2', hp: b.player2HP }].map(({ name, hp }) => (
                    <div key={name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#5a5a7a', marginBottom: '3px' }}>
                        <span>{name} HP</span><span>{hp}</span>
                      </div>
                      <div className="hp-bar-container">
                        <div className={`hp-bar ${hp > 60 ? 'high' : hp > 30 ? 'mid' : 'low'}`} style={{ width: `${hp}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button className="btn btn-ghost btn-sm"><Eye size={12} /> Spectate</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
