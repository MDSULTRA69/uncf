import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swords, Trophy, Shield, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyBattles, getActiveBattles } from '../utils/api';

const xpForRank = { Rookie: 0, Genin: 5000, Chunin: 25000, Jounin: 100000, Kage: 250000, Sage: 1250000, God: 5000000 };
const nextRank = { Rookie: 'Genin', Genin: 'Chunin', Chunin: 'Jounin', Jounin: 'Kage', Kage: 'Sage', Sage: 'God', God: null };

export default function Dashboard() {
  const { user } = useAuth();
  const [myBattles, setMyBattles] = useState([]);
  const [activeBattles, setActiveBattles] = useState([]);

  useEffect(() => {
    getMyBattles().then(r => setMyBattles(r.data.battles || [])).catch(() => {});
    getActiveBattles().then(r => setActiveBattles(r.data.battles || [])).catch(() => {});
  }, []);

  const currentXP = user?.stats?.xp || 0;
  const rank = user?.rank || 'Rookie';
  const next = nextRank[rank];
  const currentXPReq = xpForRank[rank] || 0;
  const nextXPReq = next ? xpForRank[next] : currentXP;
  const progress = next ? Math.min(100, ((currentXP - currentXPReq) / (nextXPReq - currentXPReq)) * 100) : 100;
  const rankColor = { Rookie: '#5a5a7a', Genin: '#3498db', Chunin: '#27ae60', Jounin: '#9b59b6', Kage: '#e2b96f', Sage: '#4ecdc4', God: '#e74c3c' }[rank] || '#5a5a7a';

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Welcome */}
      <div>
        <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1.3rem', color: '#e2b96f' }}>
          Welcome, {user?.characterName}
        </h1>
        <p style={{ color: '#5a5a7a', fontSize: '0.8rem', marginTop: '0.2rem' }}>
          {user?.clan} · {user?.village} · <span style={{ color: rankColor }}>{rank}</span>
        </p>
      </div>

      {/* Stats — 2x2 grid on mobile */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
        {[
          { label: 'Battle Points', value: user?.stats?.points || 0, icon: Trophy, color: '#e2b96f' },
          { label: 'Wins', value: user?.stats?.wins || 0, icon: Swords, color: '#27ae60' },
          { label: 'X-Coins', value: user?.stats?.xc?.toLocaleString() || 0, icon: Zap, color: '#4ecdc4' },
          { label: 'Mod Coins', value: user?.stats?.modCoins || 0, icon: Shield, color: '#9b59b6' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ padding: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '7px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={17} style={{ color }} />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '0.6rem', color: '#5a5a7a', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em', marginTop: '2px' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Rank Progress */}
      <div className="card card-gold" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: '#e2b96f', letterSpacing: '0.08em' }}>RANK PROGRESS</span>
          <span className="badge badge-gold">{rank}</span>
        </div>
        <div className="hp-bar-container" style={{ height: '8px', marginBottom: '0.4rem' }}>
          <div className="hp-bar high" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${rankColor}88, ${rankColor})` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#5a5a7a', marginBottom: '0.875rem' }}>
          <span>{currentXP.toLocaleString()} XP</span>
          {next ? <span>→ {next}: {nextXPReq.toLocaleString()}</span> : <span style={{ color: '#e2b96f' }}>MAX RANK</span>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem', textAlign: 'center' }}>
          <div style={{ background: '#0a0a12', borderRadius: '5px', padding: '0.5rem' }}>
            <div style={{ fontSize: '1.1rem', color: '#27ae60', fontWeight: 700 }}>{user?.stats?.wins || 0}</div>
            <div style={{ fontSize: '0.6rem', color: '#5a5a7a' }}>WINS</div>
          </div>
          <div style={{ background: '#0a0a12', borderRadius: '5px', padding: '0.5rem' }}>
            <div style={{ fontSize: '1.1rem', color: '#9090a8', fontWeight: 700 }}>{user?.stats?.draws || 0}</div>
            <div style={{ fontSize: '0.6rem', color: '#5a5a7a' }}>DRAWS</div>
          </div>
          <div style={{ background: '#0a0a12', borderRadius: '5px', padding: '0.5rem' }}>
            <div style={{ fontSize: '1.1rem', color: '#e74c3c', fontWeight: 700 }}>{user?.stats?.losses || 0}</div>
            <div style={{ fontSize: '0.6rem', color: '#5a5a7a' }}>LOSSES</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: '#e2b96f', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>QUICK ACTIONS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link to="/battle" className="btn btn-gold" style={{ justifyContent: 'center' }}>
            <Swords size={15} /> Start a Battle
          </Link>
          <Link to="/deck" className="btn btn-ghost" style={{ justifyContent: 'center' }}>
            <Shield size={15} /> Build My Deck
          </Link>
          <Link to="/leaderboard" className="btn btn-ghost" style={{ justifyContent: 'center' }}>
            <Trophy size={15} /> View Rankings
          </Link>
        </div>
      </div>

      {/* Recent Battles */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: '#e2b96f', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
          RECENT BATTLES
        </div>
        {myBattles.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#5a5a7a', padding: '1.5rem', fontSize: '0.82rem' }}>
            No battles yet. <Link to="/battle">Start your first fight!</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {myBattles.slice(0, 5).map(battle => {
              const isP1 = battle.player1?._id === user?.id;
              const oppName = isP1 ? battle.player2Name : battle.player1Name;
              const iWon = battle.winner?._id === user?.id;
              const isDraw = battle.isDraw;
              const result = isDraw ? 'DRAW' : (battle.status === 'completed' ? (iWon ? 'WIN' : 'LOSS') : 'ACTIVE');
              const resultColor = result === 'WIN' ? '#27ae60' : result === 'LOSS' ? '#e74c3c' : result === 'DRAW' ? '#9090a8' : '#e2b96f';

              return (
                <Link key={battle._id} to={`/battle/${battle._id}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.65rem 0.75rem', background: '#0a0a12', borderRadius: '5px',
                  border: '1px solid #1e1e32', textDecoration: 'none'
                }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', color: '#e8e0d0' }}>vs {oppName}</div>
                    <div style={{ fontSize: '0.65rem', color: '#5a5a7a', marginTop: '2px' }}>{battle.battleType}</div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'Cinzel, serif', color: resultColor, fontWeight: 700 }}>{result}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
