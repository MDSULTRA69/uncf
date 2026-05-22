import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, User, Swords, Trophy, BookOpen,
  Shield, LogOut, Menu, X, Settings, ChevronRight
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: User, label: 'My Ninja' },
  { to: '/deck', icon: Shield, label: 'Deck Builder' },
  { to: '/battle', icon: Swords, label: 'Battle Arena' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/rulebook', icon: BookOpen, label: 'Rulebook' },
];

export default function Layout() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const rankColors = {
    Rookie: '#5a5a7a', Genin: '#3498db', Chunin: '#27ae60',
    Jounin: '#9b59b6', Kage: '#e2b96f', Sage: '#4ecdc4', God: '#e74c3c'
  };
  const rankColor = rankColors[user?.rank] || '#5a5a7a';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 40, display: 'none'
          }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: '240px', minHeight: '100vh',
        background: 'linear-gradient(180deg, #0d0d1a 0%, #0a0a12 100%)',
        borderRight: '1px solid #1e1e32',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.3s ease'
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid #1e1e32' }}>
          <div style={{
            fontFamily: 'Cinzel Decorative, serif',
            fontSize: '1.4rem',
            color: '#e2b96f',
            letterSpacing: '0.1em',
            textShadow: '0 0 20px rgba(226,185,111,0.4)'
          }}>UNC</div>
          <div style={{ fontSize: '0.65rem', color: '#5a5a7a', letterSpacing: '0.2em', marginTop: '2px' }}>
            ULTIMATE NINJA CHAMPIONSHIP
          </div>
        </div>

        {/* Player mini-card */}
        <div style={{
          margin: '1rem',
          padding: '0.875rem',
          background: '#12121e',
          borderRadius: '6px',
          border: `1px solid ${rankColor}44`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: `linear-gradient(135deg, ${rankColor}44, ${rankColor}22)`,
              border: `2px solid ${rankColor}88`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontFamily: 'Cinzel, serif', color: rankColor
            }}>
              {user?.characterName?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e8e0d0' }}>
                {user?.characterName}
              </div>
              <div style={{ fontSize: '0.7rem', color: rankColor, fontFamily: 'Cinzel, serif' }}>
                {user?.rank} · {user?.clan}
              </div>
            </div>
          </div>
          <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1, textAlign: 'center', fontSize: '0.65rem', color: '#9090a8' }}>
              <div style={{ color: '#e2b96f', fontWeight: 700 }}>{user?.stats?.points || 0}</div>
              PTS
            </div>
            <div style={{ flex: 1, textAlign: 'center', fontSize: '0.65rem', color: '#9090a8' }}>
              <div style={{ color: '#27ae60', fontWeight: 700 }}>{user?.stats?.wins || 0}</div>
              WINS
            </div>
            <div style={{ flex: 1, textAlign: 'center', fontSize: '0.65rem', color: '#9090a8' }}>
              <div style={{ color: '#e74c3c', fontWeight: 700 }}>{user?.stats?.losses || 0}</div>
              LOSS
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.65rem 0.875rem', borderRadius: '5px',
                fontFamily: 'Cinzel, serif', fontSize: '0.78rem', letterSpacing: '0.06em',
                transition: 'all 0.2s',
                textDecoration: 'none',
                background: isActive ? 'rgba(226,185,111,0.1)' : 'transparent',
                color: isActive ? '#e2b96f' : '#9090a8',
                borderLeft: isActive ? '2px solid #e2b96f' : '2px solid transparent',
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}

          {['npc', 'kage'].includes(user?.role) && (
            <NavLink
              to="/admin"
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.65rem 0.875rem', borderRadius: '5px',
                fontFamily: 'Cinzel, serif', fontSize: '0.78rem', letterSpacing: '0.06em',
                transition: 'all 0.2s', textDecoration: 'none', marginTop: '0.5rem',
                background: isActive ? 'rgba(192,57,43,0.1)' : 'transparent',
                color: isActive ? '#e74c3c' : '#9090a8',
                borderLeft: isActive ? '2px solid #e74c3c' : '2px solid transparent',
              })}
            >
              <Settings size={16} />
              Admin Panel
            </NavLink>
          )}
        </nav>

        {/* Village & Logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid #1e1e32' }}>
          <div style={{ fontSize: '0.65rem', color: '#5a5a7a', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>
            VILLAGE: <span style={{ color: '#9090a8' }}>{user?.village}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
            <LogOut size={14} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <header style={{
          height: '56px', background: '#0a0a12',
          borderBottom: '1px solid #1e1e32',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.5rem', position: 'sticky', top: 0, zIndex: 30
        }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn btn-ghost btn-sm" style={{ display: 'none' }}>
            <Menu size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ChevronRight size={14} style={{ color: '#5a5a7a' }} />
            <span style={{ fontSize: '0.75rem', color: '#5a5a7a', letterSpacing: '0.1em', fontFamily: 'Cinzel, serif' }}>
              {user?.village?.toUpperCase()}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#9090a8' }}>
              XP: <span style={{ color: '#e2b96f' }}>{user?.stats?.xp?.toLocaleString() || 0}</span>
            </span>
            <span style={{ fontSize: '0.75rem', color: '#9090a8', marginLeft: '0.75rem' }}>
              XC: <span style={{ color: '#4ecdc4' }}>{user?.stats?.xc?.toLocaleString() || 0}</span>
            </span>
          </div>
        </header>

        <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
