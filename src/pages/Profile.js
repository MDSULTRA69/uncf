import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { updateMe, updateMoves } from '../utils/api';
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react';

const MOVE_CLASSES = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
const MOVE_TYPES = ['ninjutsu', 'genjutsu', 'taijutsu', 'kenjutsu', 'kkg'];
const ELEMENTS = ['Fire', 'Water', 'Earth', 'Wind', 'Lightning', 'Ice', 'Wood', 'Sand', 'Lava', 'Storm', 'Magnet', 'Boil', 'Explosion', 'Dust', 'Dark', 'Light'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nickname: user?.nickname || '', gender: user?.gender || '', characterDOB: user?.characterDOB || '' });
  const [loading, setLoading] = useState(false);

  // Moves editing
  const [editingMoves, setEditingMoves] = useState(false);
  const [compatMoves, setCompatMoves] = useState(user?.compatibleMoves || []);
  const [compatElements, setCompatElements] = useState(user?.elements?.compatible || []);
  const [incompatElements, setIncompatElements] = useState(user?.elements?.incompatible || []);
  const [newMove, setNewMove] = useState({ name: '', class: 'E', type: 'ninjutsu', description: '' });

  const saveProfile = async () => {
    setLoading(true);
    try {
      const { data } = await updateMe(form);
      updateUser(data.user);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally { setLoading(false); }
  };

  const saveMoves = async () => {
    setLoading(true);
    try {
      const { data } = await updateMoves({ compatibleMoves: compatMoves, elements: { compatible: compatElements, incompatible: incompatElements } });
      updateUser(data.user);
      setEditingMoves(false);
      toast.success('Moves updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally { setLoading(false); }
  };

  const addMove = () => {
    if (!newMove.name.trim()) return toast.error('Enter move name');
    setCompatMoves([...compatMoves, { ...newMove }]);
    setNewMove({ name: '', class: 'E', type: 'ninjutsu', description: '' });
  };

  const removeMove = (idx) => setCompatMoves(compatMoves.filter((_, i) => i !== idx));
  const toggleElement = (el, arr, setArr) => {
    if (arr.includes(el)) setArr(arr.filter(e => e !== el));
    else setArr([...arr, el]);
  };

  const rankColor = { Rookie: '#5a5a7a', Genin: '#3498db', Chunin: '#27ae60', Jounin: '#9b59b6', Kage: '#e2b96f', Sage: '#4ecdc4', God: '#e74c3c' }[user?.rank] || '#5a5a7a';
  const classColor = { E: '#5a5a7a', D: '#3498db', C: '#27ae60', B: '#9b59b6', A: '#e2b96f', S: '#e74c3c', SS: '#f39c12', SSS: '#ff6b6b' };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1.4rem', color: '#e2b96f' }}>My Ninja</h1>
          <p style={{ color: '#5a5a7a', fontSize: '0.8rem', marginTop: '0.25rem' }}>Character Profile Card</p>
        </div>
        <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>{user?.role?.toUpperCase()}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Identity */}
        <div className="card card-gold">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color: '#e2b96f', letterSpacing: '0.1em' }}>CHARACTER INFO</span>
            {!editing
              ? <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}><Edit2 size={13} /> Edit</button>
              : <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-gold btn-sm" onClick={saveProfile} disabled={loading}><Save size={13} /> Save</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}><X size={13} /></button>
                </div>
            }
          </div>

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: `linear-gradient(135deg, ${rankColor}33, ${rankColor}11)`,
              border: `3px solid ${rankColor}88`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontFamily: 'Cinzel, serif', color: rankColor
            }}>
              {user?.characterName?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontFamily: 'Cinzel, serif', color: '#e8e0d0' }}>{user?.characterName}</div>
              {user?.nickname && <div style={{ fontSize: '0.8rem', color: '#9090a8' }}>"{user.nickname}"</div>}
              <div style={{ fontSize: '0.75rem', color: rankColor, fontFamily: 'Cinzel, serif', marginTop: '0.2rem' }}>{user?.rank}</div>
            </div>
          </div>

          <div className="gold-divider" />

          {!editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                ['Clan', user?.clan],
                ['Village', user?.village],
                ['Gender', user?.gender],
                ['Birthday', user?.characterDOB],
                ['Username', user?.username],
              ].map(([k, v]) => v && (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#5a5a7a', fontFamily: 'Cinzel, serif', fontSize: '0.72rem', letterSpacing: '0.08em' }}>{k}</span>
                  <span style={{ color: '#e8e0d0' }}>{v}</span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>Nickname</label>
                <input className="input" value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select className="input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Character Birthday</label>
                <input className="input" type="date" value={form.characterDOB} onChange={e => setForm({ ...form, characterDOB: e.target.value })} />
              </div>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="card">
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color: '#e2b96f', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>BATTLE RECORD</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'XP', value: user?.stats?.xp?.toLocaleString() || 0, color: '#e2b96f' },
              { label: 'X-Coins', value: user?.stats?.xc?.toLocaleString() || 0, color: '#4ecdc4' },
              { label: 'Points', value: user?.stats?.points || 0, color: '#9b59b6' },
              { label: 'Mod Coins', value: user?.stats?.modCoins || 0, color: '#27ae60' },
              { label: 'Wins', value: user?.stats?.wins || 0, color: '#27ae60' },
              { label: 'Losses', value: user?.stats?.losses || 0, color: '#e74c3c' },
              { label: 'Draws', value: user?.stats?.draws || 0, color: '#9090a8' },
              { label: 'Gold', value: user?.stats?.gold || 0, color: '#f39c12' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: '#0a0a12', borderRadius: '6px', padding: '0.875rem', textAlign: 'center', border: '1px solid #1e1e32' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color }}>{value}</div>
                <div style={{ fontSize: '0.65rem', color: '#5a5a7a', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', marginTop: '0.2rem' }}>{label}</div>
              </div>
            ))}
          </div>

          {(user?.missionsCompleted?.length > 0 || user?.featsAccomplished?.length > 0) && (
            <>
              <div className="gold-divider" />
              {user?.missionsCompleted?.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.7rem', color: '#5a5a7a', fontFamily: 'Cinzel, serif', marginBottom: '0.4rem' }}>MISSIONS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {user.missionsCompleted.map(m => <span key={m} className="badge badge-cyan">{m}</span>)}
                  </div>
                </div>
              )}
              {user?.featsAccomplished?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#5a5a7a', fontFamily: 'Cinzel, serif', marginBottom: '0.4rem' }}>FEATS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {user.featsAccomplished.map(f => <span key={f} className="badge badge-gold">{f}</span>)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Compatible Moves */}
        <div className="card" style={{ gridColumn: '1/-1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color: '#e2b96f', letterSpacing: '0.1em' }}>COMPATIBLE MOVES & ELEMENTS</span>
            {!editingMoves
              ? <button className="btn btn-ghost btn-sm" onClick={() => setEditingMoves(true)}><Edit2 size={13} /> Edit Moves</button>
              : <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-gold btn-sm" onClick={saveMoves} disabled={loading}><Save size={13} /> Save</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditingMoves(false)}><X size={13} /></button>
                </div>
            }
          </div>

          {/* Elements */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#5a5a7a', fontFamily: 'Cinzel, serif', marginBottom: '0.5rem' }}>COMPATIBLE ELEMENTS</div>
            {!editingMoves ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {(user?.elements?.compatible || []).map(el => <span key={el} className="badge badge-gold">{el}</span>)}
                {(user?.elements?.compatible || []).length === 0 && <span style={{ color: '#5a5a7a', fontSize: '0.8rem' }}>None set</span>}
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {ELEMENTS.map(el => (
                  <button key={el} onClick={() => toggleElement(el, compatElements, setCompatElements)} style={{
                    padding: '0.25rem 0.6rem', borderRadius: '3px', cursor: 'pointer', fontSize: '0.72rem',
                    fontFamily: 'Cinzel, serif', border: '1px solid',
                    background: compatElements.includes(el) ? 'rgba(226,185,111,0.15)' : 'transparent',
                    borderColor: compatElements.includes(el) ? '#e2b96f' : '#2a2a3e',
                    color: compatElements.includes(el) ? '#e2b96f' : '#5a5a7a',
                    transition: 'all 0.15s'
                  }}>{el}</button>
                ))}
              </div>
            )}
          </div>

          {/* Moves list */}
          {editingMoves && (
            <div style={{ background: '#0a0a12', borderRadius: '6px', padding: '1rem', marginBottom: '1rem', border: '1px solid #1e1e32' }}>
              <div style={{ fontSize: '0.7rem', color: '#5a5a7a', fontFamily: 'Cinzel, serif', marginBottom: '0.75rem' }}>ADD MOVE</div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
                <div>
                  <label>Move Name</label>
                  <input className="input" value={newMove.name} onChange={e => setNewMove({ ...newMove, name: e.target.value })} placeholder="e.g. Fireball Jutsu" />
                </div>
                <div>
                  <label>Class</label>
                  <select className="input" value={newMove.class} onChange={e => setNewMove({ ...newMove, class: e.target.value })}>
                    {MOVE_CLASSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label>Type</label>
                  <select className="input" value={newMove.type} onChange={e => setNewMove({ ...newMove, type: e.target.value })}>
                    {MOVE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <button className="btn btn-gold btn-sm" onClick={addMove} style={{ marginBottom: '0' }}><Plus size={14} /></button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {compatMoves.map((m, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: '#0a0a12', border: '1px solid #1e1e32',
                borderRadius: '4px', padding: '0.35rem 0.7rem', fontSize: '0.8rem'
              }}>
                <span style={{ color: classColor[m.class] || '#e2b96f', fontSize: '0.65rem', fontFamily: 'Cinzel, serif' }}>[{m.class}]</span>
                <span style={{ color: '#e8e0d0' }}>{m.name}</span>
                <span style={{ color: '#5a5a7a', fontSize: '0.65rem' }}>{m.type}</span>
                {editingMoves && (
                  <button onClick={() => removeMove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', padding: '0', lineHeight: 1 }}>
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
            {compatMoves.length === 0 && !editingMoves && (
              <span style={{ color: '#5a5a7a', fontSize: '0.85rem' }}>No moves added yet. Click Edit Moves to add your compatible moves.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
