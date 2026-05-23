import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, User, Swords, Trophy, BookOpen,
  Shield, LogOut, Menu, X, Settings
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/profile', icon: User, label: 'Ninja' },
  { to: '/deck', icon: Shield, label: 'Deck' },
  { to: '/battle', icon: Swords, label: 'Battle' },
  { to: '/leaderboard', icon: Trophy, label: 'Ranks' },
  { to: '/rulebook', icon: BookOpen, label: 'Rules' },
];

export default function Layout() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logoutUser(); navigate('/login'); };

  const rankColors = {
    Rookie: '#5a5a7a', Genin: '#3498db', Chunin: '#27ae60',
    Jounin: '#9b59b6', Kage: '#e2b96f', Sage: '#4ecdc4', God: '#e74c3c'
  };
  const rankColor = rankColors[user?.rank] || '#5a5a7a';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* Top Header */}
      <header style={{
        height: '52px', background: '#0d0d1a',
        borderBottom: '1px solid #1e1e32',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1rem', position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${rankColor}44, ${rankColor}22)`,
            border: `2px solid ${rankColor}88`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontFamily: 'Cinzel, serif', color: rankColor
          }}>
            {user?.characterName?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e8e0d0', lineHeight: 1 }}>
              {user?.characterName}
            </div>
            <div style={{ fontSize: '0.6rem', color: rankColor, fontFamily: 'Cinzel, serif' }}>
              {user?.rank} · {user?.clan}
            </div>
          </div>
        </div>

        <div style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1.1rem', color: '#e2b96f' }}>
          UNC
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.65rem', color: '#9090a8' }}>
              XP <span style={{ color: '#e2b96f' }}>{user?.stats?.xp?.toLocaleString() || 0}</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#9090a8' }}>
              XC <span style={{ color: '#4ecdc4' }}>{user?.stats?.xc?.toLocaleString() || 0}</span>
            </div>
          </div>
          <button onClick={() => setMenuOpen(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#9090a8', padding: '4px'
          }}>
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Slide-out menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
          <div onClick={() => setMenuOpen(false)} style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)'
          }} />
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: '220px',
            background: '#0d0d1a', borderLeft: '1px solid #2a2a3e',
            display: 'flex', flexDirection: 'column', padding: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontFamily: 'Cinzel, serif', color: '#e2b96f', fontSize: '0.8rem' }}>MENU</span>
              <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9090a8' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '0.65rem', color: '#5a5a7a', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
              {user?.village?.toUpperCase()} · {user?.stats?.wins || 0}W {user?.stats?.losses || 0}L
            </div>
            <div style={{ height: '1px', background: '#1e1e32', marginBottom: '1rem' }} />

            {['npc', 'kage'].includes(user?.role) && (
              <NavLink to="/admin" onClick={() => setMenuOpen(false)} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.6rem 0.75rem', borderRadius: '5px', marginBottom: '0.5rem',
                textDecoration: 'none', fontSize: '0.8rem', fontFamily: 'Cinzel, serif',
                background: isActive ? 'rgba(192,57,43,0.1)' : 'transparent',
                color: isActive ? '#e74c3c' : '#9090a8',
              })}>
                <Settings size={15} /> Admin Panel
              </NavLink>
            )}

            <div style={{ flex: 1 }} />
            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'none', border: '1px solid #2a2a3e', borderRadius: '5px',
              padding: '0.6rem 0.75rem', cursor: 'pointer', color: '#9090a8',
              fontFamily: 'Cinzel, serif', fontSize: '0.75rem', width: '100%'
            }}>
              <LogOut size={14} /> Log Out
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main style={{ flex: 1, padding: '1rem', paddingBottom: '70px', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
        <Outlet />
      </main>

      {/* Bottom Nav Bar */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: '#0d0d1a', borderTop: '1px solid #1e1e32',
        display: 'flex', height: '58px'
      }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '2px', textDecoration: 'none',
            color: isActive ? '#e2b96f' : '#5a5a7a',
            borderTop: isActive ? '2px solid #e2b96f' : '2px solid transparent',
            fontSize: '0.55rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em',
            transition: 'all 0.2s'
          })}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
