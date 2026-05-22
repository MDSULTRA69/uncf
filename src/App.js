import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import DeckBuilder from './pages/DeckBuilder';
import BattleArena from './pages/BattleArena';
import BattleView from './pages/BattleView';
import Leaderboard from './pages/Leaderboard';
import Rulebook from './pages/Rulebook';
import AdminPanel from './pages/AdminPanel';
import './index.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (!['npc', 'kage'].includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="deck" element={<DeckBuilder />} />
        <Route path="battle" element={<BattleArena />} />
        <Route path="battle/:id" element={<BattleView />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="rulebook" element={<Rulebook />} />
      </Route>
      <Route path="/admin" element={<AdminRoute><Layout /></AdminRoute>}>
        <Route index element={<AdminPanel />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#e2b96f',
              border: '1px solid #e2b96f44',
              fontFamily: 'Cinzel, serif'
            }
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
