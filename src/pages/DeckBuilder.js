import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { updateDeck } from '../utils/api';
import { Save, Plus, Trash2, Info } from 'lucide-react';

const MOVE_CLASSES = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
const classColor = { E: '#5a5a7a', D: '#3498db', C: '#27ae60', B: '#9b59b6', A: '#e2b96f', S: '#e74c3c', SS: '#f39c12', SSS: '#ff6b6b' };

const emptyDeck = {
  ninjutsuGenjutsu: [],
  skills: [],
  weaponBag: [],
  kkgCard: { name: '', description: '', element: '' },
  basicEssentials: { class: 'E', rank: 1 },
  tailedBeast: { name: '', class: '' },
  summoningBeast: { name: '', element: '' }
};

export default function DeckBuilder() {
  const { user, updateUser } = useAuth();
  const [deck, setDeck] = useState(user?.deck || emptyDeck);
  const [activeTab, setActiveTab] = useState('moves');
  const [loading, setLoading] = useState(false);

  const totalCards = (deck.ninjutsuGenjutsu?.length || 0) + (deck.skills?.length || 0) +
    (deck.weaponBag?.length > 0 ? 1 : 0) + (deck.kkgCard?.name ? 1 : 0) +
    (deck.basicEssentials?.class ? 1 : 0) + (deck.tailedBeast?.name ? 1 : 0) +
    (deck.summoningBeast?.name ? 1 : 0);
const cleanDeck = (d) => {
  const cleaned = { ...d };
  if (!cleaned.kkgCard?.name) cleaned.kkgCard = {};
  if (!cleaned.tailedBeast?.name) cleaned.tailedBeast = {};
  if (!cleaned.summoningBeast?.name) cleaned.summoningBeast = {};
  return cleaned;
};

const saveDeck = async () => {
  if (totalCards > 25) return toast.error('Deck exceeds 25 cards!');
  setLoading(true);
  try {
    await updateDeck(cleanDeck(deck));
    updateUser({ deck });
    toast.success('Deck saved!');
  } catch (err) {
    toast.error('Failed to save deck');
  } finally { setLoading(false); }
};
  
  const addMove = () => {
    if (deck.ninjutsuGenjutsu.length >= 10) return toast.error('Max 10 Ninjutsu/Genjutsu slots');
    setDeck({ ...deck, ninjutsuGenjutsu: [...deck.ninjutsuGenjutsu, { name: '', class: 'E', type: 'ninjutsu', rank: 1 }] });
  };
  const updateMove = (i, field, val) => {
    const updated = [...deck.ninjutsuGenjutsu];
    updated[i] = { ...updated[i], [field]: val };
    setDeck({ ...deck, ninjutsuGenjutsu: updated });
  };
  const removeMove = (i) => setDeck({ ...deck, ninjutsuGenjutsu: deck.ninjutsuGenjutsu.filter((_, idx) => idx !== i) });

  const addSkill = () => {
    if (deck.skills.length >= 10) return toast.error('Max 10 skill slots');
    setDeck({ ...deck, skills: [...deck.skills, { name: '', type: 'pure', description: '' }] });
  };
  const updateSkill = (i, field, val) => {
    const updated = [...deck.skills];
    updated[i] = { ...updated[i], [field]: val };
    setDeck({ ...deck, skills: updated });
  };
  const removeSkill = (i) => setDeck({ ...deck, skills: deck.skills.filter((_, idx) => idx !== i) });

  const addWeapon = () => {
    if (deck.weaponBag.length >= 12) return toast.error('Max 12 weapons in bag');
    setDeck({ ...deck, weaponBag: [...deck.weaponBag, { name: '', type: 'weapon', class: 'E' }] });
  };
  const updateWeapon = (i, field, val) => {
    const updated = [...deck.weaponBag];
    updated[i] = { ...updated[i], [field]: val };
    setDeck({ ...deck, weaponBag: updated });
  };
  const removeWeapon = (i) => setDeck({ ...deck, weaponBag: deck.weaponBag.filter((_, idx) => idx !== i) });

  const tabs = [
    { id: 'moves', label: 'Jutsu', count: deck.ninjutsuGenjutsu?.length || 0, max: 10 },
    { id: 'skills', label: 'Skills', count: deck.skills?.length || 0, max: 10 },
    { id: 'weapons', label: 'Weapon Bag', count: deck.weaponBag?.length || 0, max: 12 },
    { id: 'specials', label: 'Special Cards', count: 0, max: 4 },
  ];

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1.4rem', color: '#e2b96f' }}>Deck Builder</h1>
          <p style={{ color: '#5a5a7a', fontSize: '0.8rem', marginTop: '0.25rem' }}>Max 25 cards total per deck</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            padding: '0.5rem 1rem', background: totalCards > 25 ? 'rgba(231,76,60,0.1)' : 'rgba(226,185,111,0.1)',
            border: `1px solid ${totalCards > 25 ? '#e74c3c' : '#e2b96f44'}`,
            borderRadius: '5px', fontSize: '0.85rem', fontFamily: 'Cinzel, serif',
            color: totalCards > 25 ? '#e74c3c' : '#e2b96f'
          }}>
            {totalCards} / 25 Cards
          </div>
          <button className="btn btn-gold" onClick={saveDeck} disabled={loading}>
            <Save size={16} /> {loading ? 'Saving...' : 'Save Deck'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid #1e1e32', paddingBottom: '0' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '0.65rem 1.25rem', fontFamily: 'Cinzel, serif', fontSize: '0.78rem',
            letterSpacing: '0.08em', cursor: 'pointer', border: 'none',
            borderBottom: activeTab === tab.id ? '2px solid #e2b96f' : '2px solid transparent',
            background: 'transparent',
            color: activeTab === tab.id ? '#e2b96f' : '#5a5a7a',
            transition: 'all 0.2s', marginBottom: '-1px'
          }}>
            {tab.label} <span style={{ fontSize: '0.65rem', color: tab.count >= tab.max ? '#e74c3c' : '#9090a8' }}>({tab.count}/{tab.max})</span>
          </button>
        ))}
      </div>

      {/* Moves/Jutsu Tab */}
      {activeTab === 'moves' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color: '#e2b96f' }}>NINJUTSU / GENJUTSU SLOTS (max 10)</span>
            <button className="btn btn-ghost btn-sm" onClick={addMove}><Plus size={14} /> Add</button>
          </div>
          {deck.ninjutsuGenjutsu.length === 0 && (
            <div style={{ textAlign: 'center', color: '#5a5a7a', padding: '2rem', fontSize: '0.85rem' }}>
              No jutsu added. Click Add to build your arsenal.
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {deck.ninjutsuGenjutsu.map((m, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'center', background: '#0a0a12', padding: '0.75rem', borderRadius: '5px', border: '1px solid #1e1e32' }}>
                <input className="input" style={{ padding: '0.4rem 0.7rem' }} value={m.name} onChange={e => updateMove(i, 'name', e.target.value)} placeholder="Move name" />
                <select className="input" style={{ padding: '0.4rem' }} value={m.class} onChange={e => updateMove(i, 'class', e.target.value)}>
                  {MOVE_CLASSES.map(c => <option key={c}>{c}</option>)}
                </select>
                <select className="input" style={{ padding: '0.4rem' }} value={m.type} onChange={e => updateMove(i, 'type', e.target.value)}>
                  <option value="ninjutsu">Ninjutsu</option>
                  <option value="genjutsu">Genjutsu</option>
                </select>
                <select className="input" style={{ padding: '0.4rem' }} value={m.rank || 1} onChange={e => updateMove(i, 'rank', parseInt(e.target.value))}>
                  {[1,2,3,4,5].map(r => <option key={r} value={r}>Rank {r}</option>)}
                </select>
                <button onClick={() => removeMove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c' }}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color: '#e2b96f' }}>SKILL SLOTS (max 10)</span>
            <button className="btn btn-ghost btn-sm" onClick={addSkill}><Plus size={14} /> Add</button>
          </div>
          <div style={{ background: 'rgba(226,185,111,0.05)', border: '1px solid #2a2a3e', borderRadius: '5px', padding: '0.75rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <Info size={14} style={{ color: '#e2b96f', marginTop: '2px', flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: '#9090a8' }}>Skills: Pure (unlimited use), Pure-Mech (limited), Mechanical (1-time), Bonus (auto-on), Special (unique effects). Need 60 charges to unlock.</span>
          </div>
          {deck.skills.length === 0 && (
            <div style={{ textAlign: 'center', color: '#5a5a7a', padding: '2rem', fontSize: '0.85rem' }}>No skills added yet.</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {deck.skills.map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr auto', gap: '0.5rem', alignItems: 'center', background: '#0a0a12', padding: '0.75rem', borderRadius: '5px', border: '1px solid #1e1e32' }}>
                <input className="input" style={{ padding: '0.4rem 0.7rem' }} value={s.name} onChange={e => updateSkill(i, 'name', e.target.value)} placeholder="Skill name" />
                <select className="input" style={{ padding: '0.4rem' }} value={s.type} onChange={e => updateSkill(i, 'type', e.target.value)}>
                  <option value="pure">Pure</option>
                  <option value="pure-mech">Pure-Mech</option>
                  <option value="mech">Mechanical</option>
                  <option value="bonus">Bonus</option>
                  <option value="special">Special</option>
                </select>
                <input className="input" style={{ padding: '0.4rem 0.7rem' }} value={s.description} onChange={e => updateSkill(i, 'description', e.target.value)} placeholder="Description" />
                <button onClick={() => removeSkill(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c' }}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weapons Tab */}
      {activeTab === 'weapons' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color: '#e2b96f' }}>WEAPON BAG (max 12, counts as 1 card)</span>
            <button className="btn btn-ghost btn-sm" onClick={addWeapon}><Plus size={14} /> Add Weapon</button>
          </div>
          {deck.weaponBag.length === 0 && (
            <div style={{ textAlign: 'center', color: '#5a5a7a', padding: '2rem', fontSize: '0.85rem' }}>No weapons in bag yet.</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {deck.weaponBag.map((w, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'center', background: '#0a0a12', padding: '0.75rem', borderRadius: '5px', border: '1px solid #1e1e32' }}>
                <input className="input" style={{ padding: '0.4rem 0.7rem' }} value={w.name} onChange={e => updateWeapon(i, 'name', e.target.value)} placeholder="Weapon name" />
                <select className="input" style={{ padding: '0.4rem' }} value={w.class} onChange={e => updateWeapon(i, 'class', e.target.value)}>
                  {MOVE_CLASSES.map(c => <option key={c}>{c}</option>)}
                </select>
                <select className="input" style={{ padding: '0.4rem' }} value={w.type} onChange={e => updateWeapon(i, 'type', e.target.value)}>
                  <option value="weapon">Standard</option>
                  <option value="kenjutsu">Kenjutsu</option>
                  <option value="throwing">Throwing</option>
                </select>
                <button onClick={() => removeWeapon(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c' }}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Cards Tab */}
      {activeTab === 'specials' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* KKG Card */}
          <div className="card card-gold">
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color: '#e2b96f', marginBottom: '1rem' }}>KKG CARD (Auto-Compatible)</div>
            <div className="form-group">
              <label>KKG Name</label>
              <input className="input" value={deck.kkgCard?.name || ''} onChange={e => setDeck({ ...deck, kkgCard: { ...deck.kkgCard, name: e.target.value } })} placeholder={`${user?.clan} KKG`} />
            </div>
            <div className="form-group">
              <label>Element</label>
              <input className="input" value={deck.kkgCard?.element || ''} onChange={e => setDeck({ ...deck, kkgCard: { ...deck.kkgCard, element: e.target.value } })} placeholder="e.g. Sharingan, Byakugan" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input className="input" value={deck.kkgCard?.description || ''} onChange={e => setDeck({ ...deck, kkgCard: { ...deck.kkgCard, description: e.target.value } })} placeholder="KKG ability description" />
            </div>
          </div>

          {/* Basic Essentials */}
          <div className="card">
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color: '#e2b96f', marginBottom: '1rem' }}>BASIC ESSENTIALS (B.E.)</div>
            <div style={{ fontSize: '0.8rem', color: '#9090a8', marginBottom: '1rem' }}>
              Your B.E. usage per battle is limited by rank: Genin(3), Chunin(4), Jounin(5), Kage(6), Sage(7), God(8). Rest 3 turns after limit.
            </div>
            <div className="form-group">
              <label>Class</label>
              <select className="input" value={deck.basicEssentials?.class || 'E'} onChange={e => setDeck({ ...deck, basicEssentials: { ...deck.basicEssentials, class: e.target.value } })}>
                {MOVE_CLASSES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Rank</label>
              <select className="input" value={deck.basicEssentials?.rank || 1} onChange={e => setDeck({ ...deck, basicEssentials: { ...deck.basicEssentials, rank: parseInt(e.target.value) } })}>
                {[1,2,3,4,5].map(r => <option key={r} value={r}>Rank {r}</option>)}
              </select>
            </div>
          </div>

          {/* Tailed Beast */}
          <div className="card">
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color: '#e2b96f', marginBottom: '1rem' }}>TAILED BEAST</div>
            <div className="form-group">
              <label>Beast Name</label>
              <input className="input" value={deck.tailedBeast?.name || ''} onChange={e => setDeck({ ...deck, tailedBeast: { ...deck.tailedBeast, name: e.target.value } })} placeholder="e.g. Nine-Tails" />
            </div>
            <div className="form-group">
              <label>Class</label>
              <select className="input" value={deck.tailedBeast?.class || ''} onChange={e => setDeck({ ...deck, tailedBeast: { ...deck.tailedBeast, class: e.target.value } })}>
                <option value="">None</option>
                {MOVE_CLASSES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Summoning Beast */}
          <div className="card">
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color: '#e2b96f', marginBottom: '1rem' }}>SUMMONING BEAST</div>
            <div className="form-group">
              <label>Beast Name</label>
              <input className="input" value={deck.summoningBeast?.name || ''} onChange={e => setDeck({ ...deck, summoningBeast: { ...deck.summoningBeast, name: e.target.value } })} placeholder="e.g. Gamabunta" />
            </div>
            <div className="form-group">
              <label>Element</label>
              <input className="input" value={deck.summoningBeast?.element || ''} onChange={e => setDeck({ ...deck, summoningBeast: { ...deck.summoningBeast, element: e.target.value } })} placeholder="e.g. Fire" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
