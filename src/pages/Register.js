import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { register, getClans, getVillages } from '../utils/api';
import { Plus, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';

const RANKS = ['Rookie', 'Genin', 'Chunin', 'Jounin', 'Kage', 'Sage', 'God'];
const MOVE_CLASSES = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
const ELEMENTS = ['Fire', 'Water', 'Wind', 'Earth', 'Lightning', 'Ice', 'Wood', 'Sand', 'Magnet', 'Lava', 'Storm', 'Boil'];

const emptyDeck = {
  ninjutsuGenjutsu: [],
  skills: [],
  weaponBag: [],
  kkgCard: {},
  basicEssentials: { class: 'E', rank: 1 },
  tailedBeast: {},
  summoningBeast: {}
};

export default function Register() {
  const [step, setStep] = useState(1);
  const [isExisting, setIsExisting] = useState(false); // whether they have a pre-existing character
  const [form, setForm] = useState({
    username: '', password: '', confirmPassword: '',
    characterName: '', nickname: '', clan: '', village: '',
    gender: '', characterDOB: '', phoneNumber: ''
  });

  // Step 3 state — existing character info
  const [rank, setRank] = useState('Rookie');
  const [elements, setElements] = useState({ compatible: [], incompatible: [] });
  const [compatibleMoves, setCompatibleMoves] = useState([]);
  const [deck, setDeck] = useState(emptyDeck);
  const [deckTab, setDeckTab] = useState('moves');
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0, xp: 0, xc: 0, points: 0 });

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

  const toggleElement = (el, type) => {
    setElements(prev => {
      const current = prev[type];
      return {
        ...prev,
        [type]: current.includes(el) ? current.filter(e => e !== el) : [...current, el]
      };
    });
  };

  const addMove = () => {
    if (compatibleMoves.length >= 20) return toast.error('Max 20 compatible moves');
    setCompatibleMoves([...compatibleMoves, { name: '', class: 'D', type: 'ninjutsu', description: '' }]);
  };
  const updateMove = (i, field, val) => {
    const updated = [...compatibleMoves];
    updated[i] = { ...updated[i], [field]: val };
    setCompatibleMoves(updated);
  };
  const removeMove = (i) => setCompatibleMoves(compatibleMoves.filter((_, idx) => idx !== i));

  const addDeckMove = () => {
    if (deck.ninjutsuGenjutsu.length >= 10) return toast.error('Max 10 jutsu slots');
    setDeck({ ...deck, ninjutsuGenjutsu: [...deck.ninjutsuGenjutsu, { name: '', class: 'E', type: 'ninjutsu', rank: 1 }] });
  };
  const updateDeckMove = (i, field, val) => {
    const updated = [...deck.ninjutsuGenjutsu];
    updated[i] = { ...updated[i], [field]: val };
    setDeck({ ...deck, ninjutsuGenjutsu: updated });
  };
  const removeDeckMove = (i) => setDeck({ ...deck, ninjutsuGenjutsu: deck.ninjutsuGenjutsu.filter((_, idx) => idx !== i) });

  const addWeapon = () => {
    if (deck.weaponBag.length >= 12) return toast.error('Max 12 weapons');
    setDeck({ ...deck, weaponBag: [...deck.weaponBag, { name: '', type: 'weapon', class: 'E' }] });
  };
  const updateWeapon = (i, field, val) => {
    const updated = [...deck.weaponBag];
    updated[i] = { ...updated[i], [field]: val };
    setDeck({ ...deck, weaponBag: updated });
  };
  const removeWeapon = (i) => setDeck({ ...deck, weaponBag: deck.weaponBag.filter((_, idx) => idx !== i) });

  const addSkill = () => {
    if (deck.skills.length >= 10) return toast.error('Max 10 skills');
    setDeck({ ...deck, skills: [...deck.skills, { name: '', type: 'pure', description: '' }] });
  };
  const updateSkill = (i, field, val) => {
    const updated = [...deck.skills];
    updated[i] = { ...updated[i], [field]: val };
    setDeck({ ...deck, skills: updated });
  };
  const removeSkill = (i) => setDeck({ ...deck, skills: deck.skills.filter((_, idx) => idx !== i) });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = { ...form };

      if (isExisting) {
        payload.rank = rank;
        payload.compatibleMoves = compatibleMoves
  .filter(m => m.name.trim())
  .map(m => ({
    name: m.name.trim(),
    class: m.class,
    type: m.type,
    description: m.description || ''
  }));
        payload.elements = elements;
        payload.deck = deck;
        payload.stats = stats;
      }

      const { data } = await register(payload);
      loginUser(data.token, data.user);
      toast.success(`Welcome to UNC, ${data.user.characterName}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { padding: '0.4rem 0.5rem', fontSize: '0.82rem', width: '100%' };
  const sectionLabel = (label) => (
    <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.68rem', color: '#e2b96f', letterSpacing: '0.1em', marginBottom: '0.5rem', marginTop: '0.25rem' }}>
      {label}
    </div>
  );

  const totalSteps = isExisting ? 3 : 2;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a12, #0d0d1a)', padding: '2rem 1rem'
    }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: '520px' }}>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '2rem', color: '#e2b96f', textShadow: '0 0 30px rgba(226,185,111,0.4)' }}>UNC</div>
          <div style={{ fontSize: '0.6rem', letterSpacing: '0.3em', color: '#5a5a7a', fontFamily: 'Cinzel, serif' }}>CREATE YOUR NINJA</div>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} style={{
              flex: 1, height: '3px', borderRadius: '2px',
              background: step > i ? '#e2b96f' : step === i + 1 ? '#e2b96f88' : '#1e1e32',
              transition: 'background 0.3s'
            }} />
          ))}
        </div>

        <div style={{ background: '#12121e', border: '1px solid #2a2a3e', borderRadius: '8px', padding: '1.5rem' }}>

          {/* ── STEP 1: Credentials ── */}
          {step === 1 && (
            <>
              <div style={{ fontFamily: 'Cinzel, serif', color: '#e2b96f', fontSize: '0.85rem', marginBottom: '1.25rem', letterSpacing: '0.1em' }}>
                ACCOUNT CREDENTIALS
              </div>
              <div className="form-group">
                <label>Username</label>
                <input className="input" value={form.username} onChange={e => set('username', e.target.value)} placeholder="Choose a username" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input className="input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 6 characters" />
              </div>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>Confirm Password</label>
                <input className="input" type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Repeat password" />
              </div>
              <button
                className="btn btn-gold btn-lg"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  if (!form.username || !form.password) return toast.error('Fill all fields');
                  if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
                  if (form.password.length < 6) return toast.error('Password too short');
                  setStep(2);
                }}
              >
                Next: Character Info <ChevronRight size={15} />
              </button>
            </>
          )}

          {/* ── STEP 2: Character Info ── */}
          {step === 2 && (
            <>
              <div style={{ fontFamily: 'Cinzel, serif', color: '#e2b96f', fontSize: '0.85rem', marginBottom: '1.25rem', letterSpacing: '0.1em' }}>
                CHARACTER INFO
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 0.75rem' }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label>Character Name *</label>
                  <input className="input" value={form.characterName} onChange={e => set('characterName', e.target.value)} placeholder="Your ninja's name" />
                </div>
                <div className="form-group">
                  <label>Nickname</label>
                  <input className="input" value={form.nickname} onChange={e => set('nickname', e.target.value)} placeholder="Alias" />
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
                      : ['Uchiha','Hyuga','Nara','Aburame','Yamanaka','Yotsuki','Chinoike','Hozuki','Karatachi','Hoshigaki','Kazekage (Wind)','Kazekage (Gold Dust)','Kazekage (Iron Dust)','Shirogane'].map(c => <option key={c} value={c}>{c}</option>)
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

              {/* Existing character toggle */}
              <div style={{
                background: isExisting ? 'rgba(226,185,111,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isExisting ? '#e2b96f44' : '#2a2a3e'}`,
                borderRadius: '6px', padding: '0.85rem', marginTop: '0.25rem', marginBottom: '1rem',
                cursor: 'pointer', transition: 'all 0.2s'
              }} onClick={() => setIsExisting(!isExisting)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                    border: `2px solid ${isExisting ? '#e2b96f' : '#3a3a5e'}`,
                    background: isExisting ? '#e2b96f22' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {isExisting && <span style={{ color: '#e2b96f', fontSize: '0.75rem', lineHeight: 1 }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', color: '#e8e0d0', fontFamily: 'Cinzel, serif' }}>I have an existing character</div>
                    <div style={{ fontSize: '0.68rem', color: '#5a5a7a', marginTop: '2px' }}>Add your rank, deck & moves so your record is accurate from day one</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>
                  <ChevronLeft size={14} /> Back
                </button>
                {isExisting ? (
                  <button
                    className="btn btn-gold btn-lg"
                    style={{ flex: 2, justifyContent: 'center' }}
                    onClick={() => {
                      if (!form.characterName || !form.clan || !form.village) return toast.error('Fill required fields');
                      setStep(3);
                    }}
                  >
                    Next: Character Record <ChevronRight size={15} />
                  </button>
                ) : (
                  <button
                    className="btn btn-gold btn-lg"
                    style={{ flex: 2, justifyContent: 'center' }}
                    disabled={loading}
                    onClick={() => {
                      if (!form.characterName || !form.clan || !form.village) return toast.error('Fill required fields');
                      handleSubmit();
                    }}
                  >
                    {loading ? 'Creating...' : '⚡ Enter UNC'}
                  </button>
                )}
              </div>
            </>
          )}

          {/* ── STEP 3: Existing Character Record ── */}
          {step === 3 && (
            <>
              <div style={{ fontFamily: 'Cinzel, serif', color: '#e2b96f', fontSize: '0.85rem', marginBottom: '0.25rem', letterSpacing: '0.1em' }}>
                CHARACTER RECORD
              </div>
              <div style={{ fontSize: '0.7rem', color: '#5a5a7a', marginBottom: '1.25rem' }}>
                Enter your existing ninja's data. Admins can adjust this after you join.
              </div>

              {/* Rank */}
              {sectionLabel('CURRENT RANK')}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {RANKS.map(r => (
                  <button key={r} onClick={() => setRank(r)} style={{
                    padding: '0.3rem 0.65rem', fontSize: '0.72rem', fontFamily: 'Cinzel, serif',
                    cursor: 'pointer', borderRadius: '4px', border: 'none',
                    background: rank === r ? 'rgba(226,185,111,0.15)' : '#0a0a12',
                    color: rank === r ? '#e2b96f' : '#5a5a7a',
                    outline: rank === r ? '1px solid #e2b96f55' : '1px solid #1e1e32',
                    transition: 'all 0.15s'
                  }}>{r}</button>
                ))}
              </div>

              {/* Stats */}
              {sectionLabel('BATTLE RECORD (optional)')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                {[['wins','W'],['losses','L'],['draws','D']].map(([key, label]) => (
                  <div key={key}>
                    <label style={{ fontSize: '0.65rem', color: '#9090a8', display: 'block', marginBottom: '3px' }}>{label}</label>
                    <input className="input" type="number" min="0" style={inputStyle}
                      value={stats[key]} onChange={e => setStats(s => ({ ...s, [key]: parseInt(e.target.value) || 0 }))} />
                  </div>
                ))}
              </div>

              {/* Elements */}
              {sectionLabel('COMPATIBLE ELEMENTS')}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
                {ELEMENTS.map(el => (
                  <button key={el} onClick={() => toggleElement(el, 'compatible')} style={{
                    padding: '0.25rem 0.55rem', fontSize: '0.68rem', cursor: 'pointer', borderRadius: '3px',
                    border: 'none', fontFamily: 'Cinzel, serif',
                    background: elements.compatible.includes(el) ? 'rgba(78,205,196,0.15)' : '#0a0a12',
                    color: elements.compatible.includes(el) ? '#4ecdc4' : '#5a5a7a',
                    outline: elements.compatible.includes(el) ? '1px solid #4ecdc455' : '1px solid #1e1e32',
                  }}>{el}</button>
                ))}
              </div>
              {sectionLabel('INCOMPATIBLE ELEMENTS')}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '1rem' }}>
                {ELEMENTS.map(el => (
                  <button key={el} onClick={() => toggleElement(el, 'incompatible')} style={{
                    padding: '0.25rem 0.55rem', fontSize: '0.68rem', cursor: 'pointer', borderRadius: '3px',
                    border: 'none', fontFamily: 'Cinzel, serif',
                    background: elements.incompatible.includes(el) ? 'rgba(231,76,60,0.12)' : '#0a0a12',
                    color: elements.incompatible.includes(el) ? '#e74c3c' : '#5a5a7a',
                    outline: elements.incompatible.includes(el) ? '1px solid #e74c3c44' : '1px solid #1e1e32',
                  }}>{el}</button>
                ))}
              </div>

              {/* Compatible Moves */}
              {sectionLabel('COMPATIBLE MOVES (unlocked/approved)')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {compatibleMoves.map((m, i) => (
                  <div key={i} style={{ background: '#0a0a12', borderRadius: '5px', padding: '0.6rem', border: '1px solid #1e1e32' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.35rem' }}>
                      <input className="input" style={{ ...inputStyle, flex: 2 }} value={m.name}
                        onChange={e => updateMove(i, 'name', e.target.value)} placeholder="Move name" />
                      <button onClick={() => removeMove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <select className="input" style={{ ...inputStyle, flex: 1 }} value={m.class} onChange={e => updateMove(i, 'class', e.target.value)}>
                        {MOVE_CLASSES.map(c => <option key={c}>{c}</option>)}
                      </select>
                      <select className="input" style={{ ...inputStyle, flex: 1 }} value={m.type} onChange={e => updateMove(i, 'type', e.target.value)}>
                        <option value="ninjutsu">Ninjutsu</option>
                        <option value="genjutsu">Genjutsu</option>
                        <option value="taijutsu">Taijutsu</option>
                        <option value="kkg">KKG</option>
                        <option value="weapon">Weapon</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={addMove} style={{ marginBottom: '1rem', width: '100%' }}>
                <Plus size={13} /> Add Compatible Move
              </button>

              {/* Deck */}
              {sectionLabel('BATTLE DECK')}
              <div style={{ display: 'flex', borderBottom: '1px solid #1e1e32', marginBottom: '0.75rem' }}>
                {[['moves','Jutsu'],['weapons','Weapons'],['skills','Skills'],['specials','Special']].map(([id, label]) => (
                  <button key={id} onClick={() => setDeckTab(id)} style={{
                    flex: 1, padding: '0.4rem 0.2rem', border: 'none', cursor: 'pointer', fontSize: '0.65rem',
                    fontFamily: 'Cinzel, serif', background: 'transparent',
                    color: deckTab === id ? '#e2b96f' : '#5a5a7a',
                    borderBottom: deckTab === id ? '2px solid #e2b96f' : '2px solid transparent',
                    marginBottom: '-1px'
                  }}>{label}</button>
                ))}
              </div>

              {deckTab === 'moves' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {deck.ninjutsuGenjutsu.map((m, i) => (
                    <div key={i} style={{ background: '#0a0a12', padding: '0.6rem', borderRadius: '5px', border: '1px solid #1e1e32' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.35rem' }}>
                        <input className="input" style={{ ...inputStyle, flex: 2 }} value={m.name}
                          onChange={e => updateDeckMove(i, 'name', e.target.value)} placeholder="Jutsu name" />
                        <button onClick={() => removeDeckMove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <select className="input" style={{ ...inputStyle, flex: 1 }} value={m.class} onChange={e => updateDeckMove(i, 'class', e.target.value)}>
                          {MOVE_CLASSES.map(c => <option key={c}>{c}</option>)}
                        </select>
                        <select className="input" style={{ ...inputStyle, flex: 1 }} value={m.type} onChange={e => updateDeckMove(i, 'type', e.target.value)}>
                          <option value="ninjutsu">Ninjutsu</option>
                          <option value="genjutsu">Genjutsu</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-ghost btn-sm" onClick={addDeckMove} style={{ width: '100%' }}>
                    <Plus size={13} /> Add Jutsu
                  </button>
                </div>
              )}

              {deckTab === 'weapons' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {deck.weaponBag.map((w, i) => (
                    <div key={i} style={{ background: '#0a0a12', padding: '0.6rem', borderRadius: '5px', border: '1px solid #1e1e32' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.35rem' }}>
                        <input className="input" style={{ ...inputStyle, flex: 2 }} value={w.name}
                          onChange={e => updateWeapon(i, 'name', e.target.value)} placeholder="Weapon name" />
                        <button onClick={() => removeWeapon(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <select className="input" style={inputStyle} value={w.class} onChange={e => updateWeapon(i, 'class', e.target.value)}>
                        {MOVE_CLASSES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  ))}
                  <button className="btn btn-ghost btn-sm" onClick={addWeapon} style={{ width: '100%' }}>
                    <Plus size={13} /> Add Weapon
                  </button>
                </div>
              )}

              {deckTab === 'skills' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {deck.skills.map((s, i) => (
                    <div key={i} style={{ background: '#0a0a12', padding: '0.6rem', borderRadius: '5px', border: '1px solid #1e1e32' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.35rem' }}>
                        <input className="input" style={{ ...inputStyle, flex: 2 }} value={s.name}
                          onChange={e => updateSkill(i, 'name', e.target.value)} placeholder="Skill name" />
                        <button onClick={() => removeSkill(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <input className="input" style={inputStyle} value={s.description}
                        onChange={e => updateSkill(i, 'description', e.target.value)} placeholder="Description" />
                    </div>
                  ))}
                  <button className="btn btn-ghost btn-sm" onClick={addSkill} style={{ width: '100%' }}>
                    <Plus size={13} /> Add Skill
                  </button>
                </div>
              )}

              {deckTab === 'specials' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  {/* KKG */}
                  <div style={{ background: '#0a0a12', padding: '0.75rem', borderRadius: '5px', border: '1px solid #e2b96f22' }}>
                    <div style={{ fontSize: '0.65rem', color: '#e2b96f', fontFamily: 'Cinzel, serif', marginBottom: '0.5rem' }}>KKG CARD</div>
                    <input className="input" style={{ ...inputStyle, marginBottom: '0.35rem' }}
                      value={deck.kkgCard?.name || ''} onChange={e => setDeck({ ...deck, kkgCard: { ...deck.kkgCard, name: e.target.value } })}
                      placeholder="KKG name" />
                    <input className="input" style={inputStyle}
                      value={deck.kkgCard?.description || ''} onChange={e => setDeck({ ...deck, kkgCard: { ...deck.kkgCard, description: e.target.value } })}
                      placeholder="KKG ability description" />
                  </div>
                  {/* Tailed Beast */}
                  <div style={{ background: '#0a0a12', padding: '0.75rem', borderRadius: '5px', border: '1px solid #1e1e32' }}>
                    <div style={{ fontSize: '0.65rem', color: '#e2b96f', fontFamily: 'Cinzel, serif', marginBottom: '0.5rem' }}>TAILED BEAST</div>
                    <input className="input" style={inputStyle}
                      value={deck.tailedBeast?.name || ''} onChange={e => setDeck({ ...deck, tailedBeast: { ...deck.tailedBeast, name: e.target.value } })}
                      placeholder="Beast name (if any)" />
                  </div>
                  {/* Summoning Beast */}
                  <div style={{ background: '#0a0a12', padding: '0.75rem', borderRadius: '5px', border: '1px solid #1e1e32' }}>
                    <div style={{ fontSize: '0.65rem', color: '#e2b96f', fontFamily: 'Cinzel, serif', marginBottom: '0.5rem' }}>SUMMONING BEAST</div>
                    <input className="input" style={inputStyle}
                      value={deck.summoningBeast?.name || ''} onChange={e => setDeck({ ...deck, summoningBeast: { ...deck.summoningBeast, name: e.target.value } })}
                      placeholder="Summon name (if any)" />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(2)}>
                  <ChevronLeft size={14} /> Back
                </button>
                <button
                  className="btn btn-gold btn-lg"
                  style={{ flex: 2, justifyContent: 'center' }}
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {loading ? 'Creating...' : '⚡ Enter UNC'}
                </button>
              </div>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#5a5a7a' }}>
          Already a ninja? <Link to="/login" style={{ color: '#e2b96f' }}>Log in</Link>
        </div>
      </div>
    </div>
  );
}
