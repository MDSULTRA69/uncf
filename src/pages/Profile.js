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
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1.2rem', color: '#e2b96f' }}>My Ninja</h1>
          <p style={{ color: '#5a5a7a', fontSize: '0.75rem', marginTop: '0.15rem' }}>Character Profile</p>
        </div>
        <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>{user?.role?.toUpperCase()}</span>
      </div>

      {/* Identity card */}
      <div className="card card-gold" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', color: '#e2b96f', letterSpacing: '0.08em' }}>CHARACTER INFO</span>
          {!editing
            ? <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}><Edit2 size={13} /> Edit</button>
            : <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button className="btn btn-gold btn-sm" onClick={saveProfile} disabled={loading}><Save size={13} /> Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}><X size={13} /></button>
              </div>
          }
        </div>

        {/* Avatar row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${rankColor}33, ${rankColor}11)`,
            border: `3px solid ${rankColor}88`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', fontFamily: 'Cinzel, serif', color: rankColor
          }}>
            {user?.characterName?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontFamily: 'Cinzel, serif', color: '#e8e0d0' }}>{user?.characterName}</div>
            {user?.nickname && <div style={{ fontSize: '0.78rem', color: '#9090a8' }}>"{user.nickname}"</div>}
            <div style={{ fontSize: '0.72rem', color: rankColor, fontFamily: 'Cinzel, serif', marginTop: '2px' }}>{user?.rank}</div>
          </div>
        </div>

        <div className="gold-divider" style={{ margin: '0.75rem 0' }} />

        {!editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              ['Clan', user?.clan], ['Village', user?.village],
              ['Gender', user?.gender], ['Birthday', user?.characterDOB],
              ['Username', user?.username],
            ].map(([k, v]) => v && (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                <span style={{ color: '#5a5a7a', fontFamily: 'Cinzel, serif', fontSize: '0.68rem', letterSpacing: '0.06em' }}>{k}</span>
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
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Character Birthday</label>
              <input className="input" type="date" value={form.characterDOB} onChange={e => setForm({ ...form, characterDOB: e.target.value })} />
            </div>
          </>
        )}
      </div>

      {/* Stats card */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', color: '#e2b96f', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>BATTLE RECORD</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
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
            <div key={label} style={{ background: '#0a0a12', borderRadius: '6px', padding: '0.65rem 0.75rem', textAlign: 'center', border: '1px solid #1e1e32' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: '0.6rem', color: '#5a5a7a', fontFamily: 'Cinzel, serif', letterSpacing: '0.08em', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>

        {(user?.missionsCompleted?.length > 0 || user?.featsAccomplished?.length > 0) && (
          <>
            <div className="gold-divider" style={{ margin: '0.875rem 0' }} />
            {user?.missionsCompleted?.length > 0 && (
              <div style={{ marginBottom: '0.6rem' }}>
                <div style={{ fontSize: '0.65rem', color: '#5a5a7a', fontFamily: 'Cinzel, serif', marginBottom: '0.35rem' }}>MISSIONS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {user.missionsCompleted.map(m => <span key={m} className="badge badge-cyan">{m}</span>)}
                </div>
              </div>
            )}
            {user?.featsAccomplished?.length > 0 && (
              <div>
                <div style={{ fontSize: '0.65rem', color: '#5a5a7a', fontFamily: 'Cinzel, serif', marginBottom: '0.35rem' }}>FEATS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {user.featsAccomplished.map(f => <span key={f} className="badge badge-gold">{f}</span>)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Compatible Moves & Elements */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', color: '#e2b96f', letterSpacing: '0.08em' }}>MOVES & ELEMENTS</span>
          {!editingMoves
            ? <button className="btn btn-ghost btn-sm" onClick={() => setEditingMoves(true)}><Edit2 size={13} /> Edit</button>
            : <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button className="btn btn-gold btn-sm" onClick={saveMoves} disabled={loading}><Save size={13} /> Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditingMoves(false)}><X size={13} /></button>
              </div>
          }
        </div>

        {/* Compatible elements */}
        <div style={{ marginBottom: '0.875rem' }}>
          <div style={{ fontSize: '0.65rem', color: '#5a5a7a', fontFamily: 'Cinzel, serif', marginBottom: '0.4rem' }}>COMPATIBLE ELEMENTS</div>
          {!editingMoves ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {(user?.elements?.compatible || []).map(el => <span key={el} className="badge badge-gold">{el}</span>)}
              {(user?.elements?.compatible || []).length === 0 && <span style={{ color: '#5a5a7a', fontSize: '0.78rem' }}>None set</span>}
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {ELEMENTS.map(el => (
                <button key={el} onClick={() => toggleElement(el, compatElements, setCompatElements)} style={{
                  padding: '0.25rem 0.55rem', borderRadius: '3px', cursor: 'pointer', fontSize: '0.68rem',
                  fontFamily: 'Cinzel, serif', border: '1px solid',
                  background: compatElements.includes(el) ? 'rgba(226,185,111,0.15)' : 'transparent',
                  borderColor: compatElements.includes(el) ? '#e2b96f' : '#2a2a3e',
                  color: compatElements.includes(el) ? '#e2b96f' : '#5a5a7a',
                }}>{el}</button>
              ))}
            </div>
          )}
        </div>

        {/* Add move form (edit mode only) */}
        {editingMoves && (
          <div style={{ background: '#0a0a12', borderRadius: '6px', padding: '0.875rem', marginBottom: '0.875rem', border: '1px solid #1e1e32' }}>
            <div style={{ fontSize: '0.65rem', color: '#5a5a7a', fontFamily: 'Cinzel, serif', marginBottom: '0.6rem' }}>ADD MOVE</div>
            <div className="form-group">
              <label>Move Name</label>
              <input className="input" value={newMove.name} onChange={e => setNewMove({ ...newMove, name: e.target.value })} placeholder="e.g. Fireball Jutsu" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', color: '#9090a8', fontFamily: 'Cinzel, serif', marginBottom: '0.3rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Class</label>
                <select className="input" value={newMove.class} onChange={e => setNewMove({ ...newMove, class: e.target.value })}>
                  {MOVE_CLASSES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', color: '#9090a8', fontFamily: 'Cinzel, serif', marginBottom: '0.3rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Type</label>
                <select className="input" value={newMove.type} onChange={e => setNewMove({ ...newMove, type: e.target.value })}>
                  {MOVE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-gold btn-sm" onClick={addMove} style={{ width: '100%', justifyContent: 'center' }}>
              <Plus size={14} /> Add Move
            </button>
          </div>
        )}

        {/* Moves list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {compatMoves.map((m, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: '#0a0a12', border: '1px solid #1e1e32',
              borderRadius: '4px', padding: '0.45rem 0.65rem'
            }}>
              <span style={{ color: classColor[m.class] || '#e2b96f', fontSize: '0.65rem', fontFamily: 'Cinzel, serif', flexShrink: 0 }}>[{m.class}]</span>
              <span style={{ color: '#e8e0d0', fontSize: '0.82rem', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
              <span style={{ color: '#5a5a7a', fontSize: '0.62rem', flexShrink: 0 }}>{m.type}</span>
              {editingMoves && (
                <button onClick={() => removeMove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', padding: '0', lineHeight: 1, flexShrink: 0 }}>
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
          {compatMoves.length === 0 && !editingMoves && (
            <span style={{ color: '#5a5a7a', fontSize: '0.8rem' }}>No moves yet. Tap Edit to add your compatible moves.</span>
          )}
        </div>
      </div>
    </div>
  );
}
