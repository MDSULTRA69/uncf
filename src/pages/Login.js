import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { login } from '../utils/api';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(form);
      loginUser(data.token, data.user);
      toast.success(`Welcome back, ${data.user.characterName}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a12 0%, #0d0d1a 100%)',
      padding: '1rem'
    }}>
      {/* Background decorative kanji */}
      <div style={{
        position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '40vw', color: 'rgba(226,185,111,0.02)', fontFamily: 'serif',
        pointerEvents: 'none', userSelect: 'none', lineHeight: 1
      }}>忍</div>

      <div className="fade-in" style={{ width: '100%', maxWidth: '420px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            fontFamily: 'Cinzel Decorative, serif',
            fontSize: '3rem', color: '#e2b96f', lineHeight: 1,
            textShadow: '0 0 40px rgba(226,185,111,0.5)',
            marginBottom: '0.5rem'
          }}>UNC</div>
          <div style={{
            fontSize: '0.7rem', letterSpacing: '0.35em', color: '#5a5a7a',
            fontFamily: 'Cinzel, serif', textTransform: 'uppercase'
          }}>Ultimate Ninja Championship</div>
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #e2b96f44, transparent)', marginTop: '1rem' }} />
        </div>

        {/* Card */}
        <div style={{
          background: '#12121e', border: '1px solid #2a2a3e',
          borderRadius: '8px', padding: '2rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
        }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', color: '#e2b96f', fontSize: '1rem', marginBottom: '1.75rem', letterSpacing: '0.1em' }}>
            ENTER THE ARENA
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                className="input"
                type="text"
                placeholder="Your username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-gold btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Entering...' : 'Enter Arena'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#5a5a7a' }}>
            New ninja? <Link to="/register" style={{ color: '#e2b96f' }}>Register here</Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.7rem', color: '#3a3a5e', letterSpacing: '0.1em' }}>
          UNC v6.0 · Find Your Ninja Way
        </div>
      </div>
    </div>
  );
}
