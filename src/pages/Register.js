import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { register, getClans, getVillages } from '../utils/api';

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    username: '', password: '', confirmPassword: '',
    characterName: '', nickname: '', clan: '', village: '',
    gender: '', characterDOB: '', phoneNumber: ''
  });
  const [clans, setClans] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getClans().then(r => setClans(r.data.clans)).catch(() => {});
    getVillages().then(r => setVillages(r.data.villages)).catch(() => {});
  }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const { data } = await register(form);
      loginUser(data.token, data.user);
      toast.success(`Welcome to UNC, ${data.user.characterName}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a12, #0d0d1a)', padding: '2rem 1rem'
    }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '2.5rem', color: '#e2b96f', textShadow: '0 0 30px rgba(226,185,111,0.4)' }}>UNC</div>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.3em', color: '#5a5a7a', fontFamily: 'Cinzel, serif' }}>CREATE YOUR NINJA</div>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              flex: 1, height: '3px', borderRadius: '2px',
              background: step >= s ? '#e2b96f' : '#1e1e32',
              transition: 'background 0.3s'
            }} />
          ))}
        </div>

        <div style={{ background: '#12121e', border: '1px solid #2a2a3e', borderRadius: '8px', padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <>
                <h3 style={{ fontFamily: 'Cinzel, serif', color: '#e2b96f', fontSize: '0.9rem', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>
                  ACCOUNT CREDENTIALS
                </h3>
                <div className="form-group">
                  <label>Username</label>
                  <input className="input" value={form.username} onChange={e => set('username', e.target.value)} placeholder="Choose a username" required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input className="input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 6 characters" required minLength={6} />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input className="input" type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Repeat password" required />
                </div>
                <button
                  type="button"
                  className="btn btn-gold btn-lg"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => {
                    if (!form.username || !form.password) return toast.error('Fill all fields');
                    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
                    if (form.password.length < 6) return toast.error('Password too short');
                    setStep(2);
                  }}
                >
                  Next: Create Character →
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h3 style={{ fontFamily: 'Cinzel, serif', color: '#e2b96f', fontSize: '0.9rem', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>
                  CHARACTER CREATION
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label>Character Name *</label>
                    <input className="input" value={form.characterName} onChange={e => set('characterName', e.target.value)} placeholder="Your ninja's name" required />
                  </div>
                  <div className="form-group">
                    <label>Nickname</label>
                    <input className="input" value={form.nickname} onChange={e => set('nickname', e.target.value)} placeholder="Optional alias" />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select className="input" value={form.gender} onChange={e => set('gender', e.target.value)}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Clan *</label>
                    <select className="input" value={form.clan} onChange={e => set('clan', e.target.value)} required>
                      <option value="">Choose clan</option>
                      {clans.length > 0
                        ? clans.map(c => <option key={c._id} value={c.name}>{c.name}</option>)
                        : ['Uchiha', 'Hyuga', 'Uzumaki', 'Senju', 'Nara', 'Aburame', 'Akimichi', 'Inuzuka', 'Yamanaka', 'Custom'].map(c => <option key={c} value={c}>{c}</option>)
                      }
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Village *</label>
                    <select className="input" value={form.village} onChange={e => set('village', e.target.value)} required>
                      <option value="">Choose village</option>
                      {villages.length > 0
                        ? villages.map(v => <option key={v._id} value={v.name}>{v.name}</option>)
                        : ['Konohagakure', 'Kirigakure', 'Sunagakure', 'Kumogakure', 'Iwagakure'].map(v => <option key={v} value={v}>{v}</option>)
                      }
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Character Birthday</label>
                    <input className="input" type="date" value={form.characterDOB} onChange={e => set('characterDOB', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Phone (optional)</label>
                    <input className="input" value={form.phoneNumber} onChange={e => set('phoneNumber', e.target.value)} placeholder="For rewards" />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="btn btn-gold btn-lg" style={{ flex: 2, justifyContent: 'center' }} disabled={loading}>
                    {loading ? 'Creating...' : '⚡ Enter UNC'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#5a5a7a' }}>
          Already a ninja? <Link to="/login" style={{ color: '#e2b96f' }}>Log in</Link>
        </div>
      </div>
    </div>
  );
}
