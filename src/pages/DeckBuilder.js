import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { updateDeck } from '../utils/api';
import { Save, Plus, Trash2, Info } from 'lucide-react';

const MOVE_CLASSES = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];

const emptyDeck = {
  ninjutsuGenjutsu: [],
  skills: [],
  weaponBag: [],
  kkgCard: {},
  basicEssentials: { class: 'E', rank: 1 },
  tailedBeast: {},
  summoningBeast: {}
};

const cleanDeck = (d) => {
  const cleaned = { ...d };
  cleaned.ninjutsuGenjutsu = (d.ninjutsuGenjutsu || []).map(m => ({
    name: String(m.name || ''),
    class: String(m.class || 'E'),
    type: String(m.type || 'ninjutsu'),
    rank: Number(m.rank || 1)
  }));
  cleaned.skills = (d.skills || []).map(s => ({
    name: String(s.name || ''),
    type: String(s.type || 'pure'),
    description: String(s.description || '')
  }));
  cleaned.weaponBag = (d.weaponBag || []).map(w => ({
    name: String(w.name || ''),
    type: String(w.type || 'weapon'),
    class: String(w.class || 'E')
  }));
  if (!cleaned.kkgCard?.name) cleaned.kkgCard = {};
  if (!cleaned.tailedBeast?.name) cleaned.tailedBeast = {};
  if (!cleaned.summoningBeast?.name) cleaned.summoningBeast = {};
  return cleaned;
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

  const saveDeck = async () => {
    if (totalCards > 25) return toast.error('Deck exceeds 25 cards!');
    setLoading(true);
    try {
      const cleaned = cleanDeck(deck);
      await updateDeck(cleaned);
      updateUser({ deck: cleaned });
      toast.success('Deck saved!');
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to save deck');
    } finally { setLoading(false); }
  };

  // ── Deck editing helpers ─────────────────────────────────

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
    { id: 'weapons', label: 'Weapons', count: deck.weaponBag?.length || 0, max: 12 },
    { id: 'specials', label: 'Special', count: 0, max: 4 },
  ];

  const inputStyle = { padding: '0.4rem 0.5rem', fontSize: '0.8rem', width: '100%' };

  return (
    <div className="fade-in">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1.1rem', color: '#e2b96f' }}>Deck Builder</h1>
          <p style={{ color: '#5a5a7a', fontSize: '0.7rem' }}>Max 25 cards total. Submit privately inside each battle.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            padding: '0.35rem 0.7rem', fontSize: '0.75rem', fontFamily: 'Cinzel, serif',
            background: totalCards > 25 ? 'rgba(231,76,60,0.1)' : 'rgba(226,185,111,0.1)',
            border: `1px solid ${totalCards > 25 ? '#e74c3c' : '#e2b96f44'}`,
            borderRadius: '5px', color: totalCards > 25 ? '#e74c3c' : '#e2b96f'
          }}>
            {totalCards}/25
          </div>
          <button className="btn btn-gold" onClick={saveDeck} disabled={loading} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
            <Save size={14} /> {loading ? '...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div style={{ background: 'rgba(78,205,196,0.05)', border: '1px solid #4ecdc422', borderRadius: '6px', padding: '0.6rem 0.75rem', marginBottom: '1rem', display: 'flex', gap: '0.4rem' }}>
        <Info size={13} style={{ color: '#4ecdc4', marginTop: '2px', flexShrink: 0 }} />
        <div style={{ fontSize: '0.7rem', color: '#9090a8' }}>
          Build and save your deck here. When a battle starts, go to the <strong style={{ color: '#e2b96f' }}>DECK tab</strong> inside the battle room and tap <strong style={{ color: '#e2b96f' }}>Submit Private Deck</strong>. Your opponent will never see your cards — only the AI MOD uses them to validate your moves.
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1e1e32', marginBottom: '1rem', overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: '0.5rem 0.25rem', fontFamily: 'Cinzel, serif', fontSize: '0.65rem',
            letterSpacing: '0.05em', cursor: 'pointer', border: 'none', whiteSpace: 'nowrap',
            borderBottom: activeTab === tab.id ? '2px solid #e2b96f' : '2px solid transparent',
            background: 'transparent',
            color: activeTab === tab.id ? '#e2b96f' : '#5a5a7a',
            transition: 'all 0.2s', marginBottom: '-1px'
          }}>
            {tab.label}
            <span style={{ fontSize: '0.6rem', color: tab.count >= tab.max ? '#e74c3c' : '#9090a8', display: 'block' }}>
              {tab.count}/{tab.max}
            </span>
          </button>
        ))}
      </div>

      {/* Jutsu Tab */}
      {activeTab === 'moves' && (
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: '#e2b96f' }}>NINJUTSU / GENJUTSU</span>
            <button className="btn btn-ghost btn-sm" onClick={addMove}><Plus size={13} /> Add</button>
          </div>
          {deck.ninjutsuGenjutsu.length === 0 && (
            <div style={{ textAlign: 'center', color: '#5a5a7a', padding: '1.5rem', fontSize: '0.8rem' }}>No jutsu added yet.</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {deck.ninjutsuGenjutsu.map((m, i) => (
              <div key={i} style={{ background: '#0a0a12', padding: '0.75rem', borderRadius: '5px', border: '1px solid #1e1e32' }}>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <input className="input" style={{ ...inputStyle, flex: 2 }} value={m.name} onChange={e => updateMove(i, 'name', e.target.value)} placeholder="Move name" />
                  <button onClick={() => removeMove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', flexShrink: 0 }}><Trash2 size={14} /></button>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <select className="input" style={{ ...inputStyle, flex: 1 }} value={m.class} onChange={e => updateMove(i, 'class', e.target.value)}>
                    {MOVE_CLASSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <select className="input" style={{ ...inputStyle, flex: 1 }} value={m.type} onChange={e => updateMove(i, 'type', e.target.value)}>
                    <option value="ninjutsu">Ninjutsu</option>
                    <option value="genjutsu">Genjutsu</option>
                  </select>
                  <select className="input" style={{ ...inputStyle, flex: 1 }} value={m.rank || 1} onChange={e => updateMove(i, 'rank', parseInt(e.target.value))}>
                    {[1,2,3,4,5].map(r => <option key={r} value={r}>Rank {r}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: '#e2b96f' }}>SKILLS</span>
            <button className="btn btn-ghost btn-sm" onClick={addSkill}><Plus size={13} /> Add</button>
          </div>
          <div style={{ background: 'rgba(226,185,111,0.05)', border: '1px solid #2a2a3e', borderRadius: '5px', padding: '0.6rem', marginBottom: '0.75rem', display: 'flex', gap: '0.4rem' }}>
            <Info size={13} style={{ color: '#e2b96f', marginTop: '2px', flexShrink: 0 }} />
            <span style={{ fontSize: '0.7rem', color: '#9090a8' }}>Pure, Pure-Mech, Mechanical, Bonus, Special.</span>
          </div>
          {deck.skills.length === 0 && (
            <div style={{ textAlign: 'center', color: '#5a5a7a', padding: '1.5rem', fontSize: '0.8rem' }}>No skills added yet.</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {deck.skills.map((s, i) => (
              <div key={i} style={{ background: '#0a0a12', padding: '0.75rem', borderRadius: '5px', border: '1px solid #1e1e32' }}>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <input className="input" style={{ ...inputStyle, flex: 2 }} value={s.name} onChange={e => updateSkill(i, 'name', e.target.value)} placeholder="Skill name" />
                  <select className="input" style={{ ...inputStyle, flex: 1 }} value={s.type} onChange={e => updateSkill(i, 'type', e.target.value)}>
                    <option value="pure">Pure</option>
                    <option value="pure-mech">Pure-Mech</option>
                    <option value="mech">Mechanical</option>
                    <option value="bonus">Bonus</option>
                    <option value="special">Special</option>
                  </select>
                  <button onClick={() => removeSkill(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', flexShrink: 0 }}><Trash2 size={14} /></button>
                </div>
                <input className="input" style={inputStyle} value={s.description} onChange={e => updateSkill(i, 'description', e.target.value)} placeholder="Description" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weapons Tab */}
      {activeTab === 'weapons' && (
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: '#e2b96f' }}>WEAPON BAG (counts as 1 card)</span>
            <button className="btn btn-ghost btn-sm" onClick={addWeapon}><Plus size={13} /> Add</button>
          </div>
          {deck.weaponBag.length === 0 && (
            <div style={{ textAlign: 'center', color: '#5a5a7a', padding: '1.5rem', fontSize: '0.8rem' }}>No weapons added yet.</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {deck.weaponBag.map((w, i) => (
              <div key={i} style={{ background: '#0a0a12', padding: '0.75rem', borderRadius: '5px', border: '1px solid #1e1e32' }}>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <input className="input" style={{ ...inputStyle, flex: 2 }} value={w.name} onChange={e => updateWeapon(i, 'name', e.target.value)} placeholder="Weapon name" />
                  <button onClick={() => removeWeapon(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', flexShrink: 0 }}><Trash2 size={14} /></button>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <select className="input" style={{ ...inputStyle, flex: 1 }} value={w.class} onChange={e => updateWeapon(i, 'class', e.target.value)}>
                    {MOVE_CLASSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <select className="input" style={{ ...inputStyle, flex: 1 }} value={w.type} onChange={e => updateWeapon(i, 'type', e.target.value)}>
                    <option value="weapon">Weapon</option>
                    <option value="legendary">Legendary</option>
                    <option value="tool">Tool</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specials Tab */}
      {activeTab === 'specials' && (
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: '#e2b96f', marginBottom: '0.75rem' }}>SPECIAL CARDS</div>

          {/* KKG */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#9090a8', marginBottom: '0.4rem' }}>Kekkei Genkai Card</div>
            <input className="input" style={inputStyle} value={deck.kkgCard?.name || ''} onChange={e => setDeck({ ...deck, kkgCard: { ...deck.kkgCard, name: e.target.value } })} placeholder="KKG name (e.g. Sharingan)" />
          </div>

          {/* Basic Essentials */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#9090a8', marginBottom: '0.4rem' }}>Basic Essentials</div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <select className="input" style={{ ...inputStyle, flex: 1 }} value={deck.basicEssentials?.class || 'E'} onChange={e => setDeck({ ...deck, basicEssentials: { ...deck.basicEssentials, class: e.target.value } })}>
                {MOVE_CLASSES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select className="input" style={{ ...inputStyle, flex: 1 }} value={deck.basicEssentials?.rank || 1} onChange={e => setDeck({ ...deck, basicEssentials: { ...deck.basicEssentials, rank: parseInt(e.target.value) } })}>
                {[1,2,3,4,5].map(r => <option key={r} value={r}>Rank {r}</option>)}
              </select>
            </div>
          </div>

          {/* Tailed Beast */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#9090a8', marginBottom: '0.4rem' }}>Tailed Beast</div>
            <input className="input" style={inputStyle} value={deck.tailedBeast?.name || ''} onChange={e => setDeck({ ...deck, tailedBeast: { ...deck.tailedBeast, name: e.target.value } })} placeholder="Tailed beast name" />
          </div>

          {/* Summoning */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#9090a8', marginBottom: '0.4rem' }}>Summoning Beast</div>
            <input className="input" style={inputStyle} value={deck.summoningBeast?.name || ''} onChange={e => setDeck({ ...deck, summoningBeast: { ...deck.summoningBeast, name: e.target.value } })} placeholder="Summoning name" />
          </div>
        </div>
      )}
    </div>
  );
}
