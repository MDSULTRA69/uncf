import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swords, Trophy, Shield, Zap, Clock } from 'lucide-react';
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
    <div className="fade-in">
      {/* Welcome */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1.6rem', color: '#e2b96f', marginBottom: '0.25rem' }}>
          Welcome, {user?.characterName}
        </h1>
        <p style={{ color: '#5a5a7a', fontSize: '0.85rem' }}>
          {user?.clan} · {user?.village} · <span style={{ color: rankColor }}>{rank}</span>
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Battle Points', value: user?.stats?.points || 0, icon: Trophy, color: '#e2b96f' },
          { label: 'Wins', value: user?.stats?.wins || 0, icon: Swords, color: '#27ae60' },
          { label: 'X-Coins', value: user?.stats?.xc?.toLocaleString() || 0, icon: Zap, color: '#4ecdc4' },
          { label: 'Mod Coins', value: user?.stats?.modCoins || 0, icon: Shield, color: '#9b59b6' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: '0.7rem', color: '#5a5a7a', fontFamily: 'Cinzel, serif', letterSpacing: '0.08em' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Rank Progress */}
        <div className="card card-gold">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color: '#e2b96f', letterSpacing: '0.1em' }}>RANK PROGRESS</span>
            <span className={`badge badge-gold`}>{rank}</span>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <div className="hp-bar-container" style={{ height: '10px' }}>
              <div className="hp-bar high" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${rankColor}88, ${rankColor})` }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#5a5a7a' }}>
            <span>{currentXP.toLocaleString()} XP</span>
            {next && <span>→ {next}: {nextXPReq.toLocaleString()} XP</span>}
            {!next && <span style={{ color: '#e2b96f' }}>MAX RANK</span>}
          </div>
          <div className="gold-divider" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center', fontSize: '0.7rem' }}>
            <div><div style={{ fontSize: '1.2rem', color: '#27ae60', fontWeight: 700 }}>{user?.stats?.wins || 0}</div><div style={{ color: '#5a5a7a' }}>WINS</div></div>
            <div><div style={{ fontSize: '1.2rem', color: '#9090a8', fontWeight: 700 }}>{user?.stats?.draws || 0}</div><div style={{ color: '#5a5a7a' }}>DRAWS</div></div>
            <div><div style={{ fontSize: '1.2rem', color: '#e74c3c', fontWeight: 700 }}>{user?.stats?.losses || 0}</div><div style={{ color: '#5a5a7a' }}>LOSSES</div></div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color: '#e2b96f', letterSpacing: '0.1em', marginBottom: '1rem' }}>QUICK ACTIONS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <Link to="/battle" className="btn btn-gold" style={{ justifyContent: 'center' }}>
              <Swords size={16} /> Start a Battle
            </Link>
            <Link to="/deck" className="btn btn-ghost" style={{ justifyContent: 'center' }}>
              <Shield size={16} /> Build My Deck
            </Link>
            <Link to="/leaderboard" className="btn btn-ghost" style={{ justifyContent: 'center' }}>
              <Trophy size={16} /> View Rankings
            </Link>
          </div>
        </div>

        {/* My Recent Battles */}
        <div className="card" style={{ gridColumn: '1/-1' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color: '#e2b96f', letterSpacing: '0.1em', marginBottom: '1rem' }}>
            RECENT BATTLES
          </div>
          {myBattles.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#5a5a7a', padding: '2rem', fontSize: '0.85rem' }}>
              No battles yet. <Link to="/battle">Start your first fight!</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {myBattles.slice(0, 5).map(battle => {
                const isP1 = battle.player1?._id === user?.id;
                const myName = isP1 ? battle.player1Name : battle.player2Name;
                const oppName = isP1 ? battle.player2Name : battle.player1Name;
                const iWon = battle.winner?._id === user?.id;
                const isDraw = battle.isDraw;
                const result = isDraw ? 'DRAW' : (battle.status === 'completed' ? (iWon ? 'WIN' : 'LOSS') : 'ACTIVE');
                const resultColor = result === 'WIN' ? '#27ae60' : result === 'LOSS' ? '#e74c3c' : result === 'DRAW' ? '#9090a8' : '#e2b96f';

                return (
                  <Link key={battle._id} to={`/battle/${battle._id}`} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem 1rem', background: '#0a0a12', borderRadius: '5px',
                    border: '1px solid #1e1e32', textDecoration: 'none',
                    transition: 'border-color 0.2s'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: '#e8e0d0' }}>
                      {myName} <span style={{ color: '#5a5a7a' }}>vs</span> {oppName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.7rem', color: '#5a5a7a' }}>{battle.battleType}</span>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'Cinzel, serif', color: resultColor, fontWeight: 700 }}>{result}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
