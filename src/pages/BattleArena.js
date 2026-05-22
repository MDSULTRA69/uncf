import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getPlayers, createBattle, getActiveBattles, getMyBattles } from '../utils/api';
import { Swords, Eye, Clock, Users, Zap } from 'lucide-react';

const rankColor = { Rookie: '#5a5a7a', Genin: '#3498db', Chunin: '#27ae60', Jounin: '#9b59b6', Kage: '#e2b96f', Sage: '#4ecdc4', God: '#e74c3c' };

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

  const battleTypeInfo = {
    official: 'Win=3pts, Draw=1pt, Loss=0pts. 10 turns.',
    sparring: 'Practice match. 5 turns. No points.',
    war: 'Village War battle. High stakes.',
    deathmatch: 'Death Match event. Special rules apply.',
    story: 'Story Mode battle. Narrative focus.'
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1.4rem', color: '#e2b96f' }}>Battle Arena</h1>
        <p style={{ color: '#5a5a7a', fontSize: '0.8rem', marginTop: '0.25rem' }}>Challenge a ninja to combat</p>
      </div>

      {/* Active personal battles */}
      {myBattles.length > 0 && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(226,185,111,0.05)', border: '1px solid rgba(226,185,111,0.2)', borderRadius: '8px' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: '#e2b96f', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>
            ⚔️ YOUR ACTIVE BATTLES
          </div>
          {myBattles.map(b => (
            <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: '#0a0a12', borderRadius: '5px', marginBottom: '0.4rem', border: '1px solid #1e1e32' }}>
              <span style={{ fontSize: '0.85rem', color: '#e8e0d0' }}>{b.player1Name} vs {b.player2Name}</span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#5a5a7a' }}>Turn {b.currentTurn}/{b.maxTurns}</span>
                <button className="btn btn-gold btn-sm" onClick={() => navigate(`/battle/${b._id}`)}>
                  <Zap size={12} /> Resume
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
        {/* Player list */}
        <div className="card">
          <div style={{ marginBottom: '1rem' }}>
            <input
              className="input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, clan, or village..."
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Users size={14} style={{ color: '#5a5a7a' }} />
            <span style={{ fontSize: '0.72rem', color: '#5a5a7a', fontFamily: 'Cinzel, serif', letterSpacing: '0.08em' }}>
              {filtered.length} NINJA AVAILABLE
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '480px', overflowY: 'auto' }}>
            {filtered.map(p => {
              const rc = rankColor[p.rank] || '#5a5a7a';
              const isSelected = selectedPlayer?._id === p._id;
              return (
                <div
                  key={p._id}
                  onClick={() => setSelectedPlayer(isSelected ? null : p)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.75rem 1rem', borderRadius: '5px', cursor: 'pointer',
                    background: isSelected ? 'rgba(226,185,111,0.08)' : '#0a0a12',
                    border: `1px solid ${isSelected ? '#e2b96f44' : '#1e1e32'}`,
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                    background: `${rc}22`, border: `2px solid ${rc}66`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontFamily: 'Cinzel, serif', color: rc
                  }}>
                    {p.characterName?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', color: '#e8e0d0', fontWeight: 600 }}>{p.characterName}</div>
                    <div style={{ fontSize: '0.72rem', color: '#5a5a7a' }}>{p.clan} · {p.village}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'Cinzel, serif', color: rc }}>{p.rank}</div>
                    {p.role !== 'player' && (
                      <span style={{ fontSize: '0.6rem', color: '#9b59b6', fontFamily: 'Cinzel, serif' }}>{p.role.toUpperCase()}</span>
                    )}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', color: '#5a5a7a', padding: '2rem', fontSize: '0.85rem' }}>
                No ninja found
              </div>
            )}
          </div>
        </div>

        {/* Battle setup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Selected opponent */}
          <div className="card card-gold">
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', color: '#e2b96f', letterSpacing: '0.1em', marginBottom: '1rem' }}>SELECTED OPPONENT</div>
            {selectedPlayer ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: `${rankColor[selectedPlayer.rank] || '#5a5a7a'}22`,
                    border: `2px solid ${rankColor[selectedPlayer.rank] || '#5a5a7a'}66`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', fontFamily: 'Cinzel, serif',
                    color: rankColor[selectedPlayer.rank] || '#5a5a7a'
                  }}>
                    {selectedPlayer.characterName?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', color: '#e8e0d0', fontWeight: 600 }}>{selectedPlayer.characterName}</div>
                    <div style={{ fontSize: '0.75rem', color: rankColor[selectedPlayer.rank] || '#5a5a7a', fontFamily: 'Cinzel, serif' }}>{selectedPlayer.rank}</div>
                    <div style={{ fontSize: '0.72rem', color: '#5a5a7a' }}>{selectedPlayer.clan} · {selectedPlayer.village}</div>
                  </div>
                </div>
                <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #e2b96f33, transparent)', marginBottom: '1rem' }} />
                <div style={{ fontSize: '0.8rem', color: '#9090a8', textAlign: 'center', fontFamily: 'Cinzel, serif' }}>
                  {user?.characterName} <span style={{ color: '#e74c3c' }}>⚔</span> {selectedPlayer.characterName}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#5a5a7a', padding: '1.5rem', fontSize: '0.82rem' }}>
                Select a ninja from the list
              </div>
            )}
          </div>

          {/* Battle type */}
          <div className="card">
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', color: '#e2b96f', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>BATTLE TYPE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {Object.entries(battleTypeInfo).map(([type, info]) => (
                <div
                  key={type}
                  onClick={() => setBattleType(type)}
                  style={{
                    padding: '0.65rem 0.875rem', borderRadius: '5px', cursor: 'pointer',
                    background: battleType === type ? 'rgba(226,185,111,0.08)' : 'transparent',
                    border: `1px solid ${battleType === type ? '#e2b96f44' : '#1e1e32'}`,
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '0.78rem', fontFamily: 'Cinzel, serif', color: battleType === type ? '#e2b96f' : '#9090a8', textTransform: 'capitalize', marginBottom: '0.2rem' }}>{type}</div>
                  <div style={{ fontSize: '0.68rem', color: '#5a5a7a' }}>{info}</div>
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
            <Swords size={18} />
            {loading ? 'Starting...' : 'Start Battle'}
          </button>
        </div>
      </div>

      {/* Live battles */}
      {activeBattles.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div className="section-title" style={{ marginBottom: '1rem' }}>LIVE BATTLES</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {activeBattles.map(b => (
              <div key={b._id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/battle/${b._id}`)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="badge badge-red" style={{ fontSize: '0.6rem' }}>LIVE</span>
                  <span style={{ fontSize: '0.65rem', color: '#5a5a7a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={10} /> Turn {b.currentTurn}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#e8e0d0', textAlign: 'center', margin: '0.5rem 0' }}>
                  {b.player1Name} <span style={{ color: '#e74c3c' }}>⚔</span> {b.player2Name}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#5a5a7a', marginBottom: '3px' }}>
                      <span>P1 HP</span><span>{b.player1HP}</span>
                    </div>
                    <div className="hp-bar-container">
                      <div className={`hp-bar ${b.player1HP > 60 ? 'high' : b.player1HP > 30 ? 'mid' : 'low'}`} style={{ width: `${b.player1HP}%` }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#5a5a7a', marginBottom: '3px' }}>
                      <span>P2 HP</span><span>{b.player2HP}</span>
                    </div>
                    <div className="hp-bar-container">
                      <div className={`hp-bar ${b.player2HP > 60 ? 'high' : b.player2HP > 30 ? 'mid' : 'low'}`} style={{ width: `${b.player2HP}%` }} />
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center' }}>
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
