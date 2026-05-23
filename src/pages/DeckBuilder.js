// ============================================================
// src/pages/DeckBuilder.js  (UPDATED — private deck code section)
// New: "Lock & Generate Code" button below the save button.
// Shows the generated code and active codes list.
// ============================================================

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { updateDeck, generateDeckCode, getMyDeckCodes } from '../utils/api';
import { Save, Plus, Trash2, Info, Lock, Copy, CheckCircle } from 'lucide-react';

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

  // ── Deck code state ──────────────────────────────────────
  const [generating, setGenerating] = useState(false);
  const [codeLabel, setCodeLabel] = useState('');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [myCodes, setMyCodes] = useState([]);
  const [codesLoading, setCodesLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCodePanel, setShowCodePanel] = useState(false);

  const totalCards = (deck.ninjutsuGenjutsu?.length || 0) + (deck.skills?.length || 0) +
    (deck.weaponBag?.length > 0 ? 1 : 0) + (deck.kkgCard?.name ? 1 : 0) +
    (deck.basicEssentials?.class ? 1 : 0) + (deck.tailedBeast?.name ? 1 : 0) +
    (deck.summoningBeast?.name ? 1 : 0);

  useEffect(() => {
    if (showCodePanel) fetchMyCodes();
  }, [showCodePanel]);

  const fetchMyCodes = async () => {
    setCodesLoading(true);
    try {
      const { data } = await getMyDeckCodes();
      setMyCodes(data.codes || []);
    } catch { /* ignore */ }
    finally { setCodesLoading(false); }
  };

  const saveDeck = async () => {
    if (totalCards > 25) return toast.error('Deck exceeds 25 cards!');
    setLoading(true);
    try {
      await updateDeck(cleanDeck(deck));
      updateUser({ deck });
      toast.success('Deck saved!');
    } catch {
      toast.error('Failed to save deck');
    } finally { setLoading(false); }
  };

  const handleGenerateCode = async () => {
    // Must save first so the server has the latest deck
    if (totalCards > 25) return toast.error('Deck exceeds 25 cards!');
    setGenerating(true);
    try {
      // Always save first to ensure server deck is up-to-date
      await updateDeck(cleanDeck(deck));
      updateUser({ deck });

      const { data } = await generateDeckCode(codeLabel.trim());
      setGeneratedCode(data);
      setCodeLabel('');
      toast.success(`Deck locked! Code: ${data.code}`);
      fetchMyCodes();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate code');
    } finally { setGenerating(false); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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
          <p style={{ color: '#5a5a7a', fontSize: '0.7rem' }}>Max 25 cards total</p>
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

      {/* ── LOCK & GENERATE CODE PANEL ── */}
      <div style={{
        background: showCodePanel ? 'rgba(226,185,111,0.05)' : 'transparent',
        border: `1px solid ${showCodePanel ? '#e2b96f44' : '#1e1e32'}`,
        borderRadius: '8px', marginBottom: '1rem', overflow: 'hidden',
        transition: 'all 0.2s'
      }}>
        {/* Toggle header */}
        <button
          onClick={() => setShowCodePanel(!showCodePanel)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.75rem 1rem', background: 'transparent', border: 'none', cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={14} style={{ color: '#e2b96f' }} />
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: '#e2b96f', letterSpacing: '0.08em' }}>
              LOCK & GENERATE CODE
            </span>
          </div>
          <span style={{ color: '#5a5a7a', fontSize: '0.7rem' }}>{showCodePanel ? '▲' : '▼'}</span>
        </button>

        {showCodePanel && (
          <div style={{ padding: '0 1rem 1rem' }}>
            {/* Explanation */}
            <div style={{ background: 'rgba(78,205,196,0.05)', border: '1px solid #4ecdc422', borderRadius: '5px', padding: '0.6rem 0.75rem', marginBottom: '0.875rem', display: 'flex', gap: '0.4rem' }}>
              <Info size={13} style={{ color: '#4ecdc4', marginTop: '2px', flexShrink: 0 }} />
              <div style={{ fontSize: '0.7rem', color: '#9090a8' }}>
                Lock your current deck and receive a short code (e.g. <strong style={{ color: '#e2b96f' }}>UNC-A3F9K2</strong>). Post the code in the battle channel — your opponent sees only the code, never your cards. The AI MOD decodes it server-side and will call out any card you use that wasn't in your locked deck.
              </div>
            </div>

            {/* Label input */}
            <div className="form-group" style={{ marginBottom: '0.6rem' }}>
              <label>Label (optional)</label>
              <input
                className="input"
                value={codeLabel}
                onChange={e => setCodeLabel(e.target.value)}
                placeholder='e.g. "Kage tournament deck"'
                maxLength={80}
              />
            </div>

            {/* Generate button */}
            <button
              className="btn btn-gold"
              onClick={handleGenerateCode}
              disabled={generating || totalCards === 0}
              style={{ width: '100%', justifyContent: 'center', marginBottom: '0.875rem' }}
            >
              <Lock size={14} />
              {generating ? 'Locking deck...' : 'Lock & Generate Code'}
            </button>

            {/* Show the generated code */}
            {generatedCode && (
              <div style={{
                background: '#0a0a12', border: '2px solid #e2b96f55', borderRadius: '8px',
                padding: '1rem', marginBottom: '0.875rem', textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.65rem', color: '#5a5a7a', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
                  YOUR DECK CODE
                </div>
                <div style={{
                  fontFamily: 'Cinzel Decorative, serif', fontSize: '1.5rem',
                  color: '#e2b96f', letterSpacing: '0.15em', marginBottom: '0.5rem',
                  textShadow: '0 0 20px rgba(226,185,111,0.4)'
                }}>
                  {generatedCode.code}
                </div>
                {generatedCode.label && (
                  <div style={{ fontSize: '0.7rem', color: '#9090a8', marginBottom: '0.4rem' }}>
                    "{generatedCode.label}"
                  </div>
                )}
                <div style={{ fontSize: '0.65rem', color: '#5a5a7a', marginBottom: '0.75rem' }}>
                  Expires {new Date(generatedCode.expiresAt).toLocaleDateString()}
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => copyCode(generatedCode.code)}
                  style={{ justifyContent: 'center', width: '100%' }}
                >
                  {copied ? <CheckCircle size={13} style={{ color: '#27ae60' }} /> : <Copy size={13} />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            )}

            {/* Active codes list */}
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', color: '#5a5a7a', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              MY ACTIVE CODES
            </div>
            {codesLoading ? (
              <div style={{ textAlign: 'center', color: '#5a5a7a', fontSize: '0.75rem', padding: '0.75rem' }}>Loading...</div>
            ) : myCodes.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#3a3a5e', fontSize: '0.75rem', padding: '0.75rem' }}>No active codes</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {myCodes.map(c => (
                  <div key={c.code} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: '#0a0a12', border: '1px solid #1e1e32', borderRadius: '5px',
                    padding: '0.5rem 0.65rem'
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.82rem', color: '#e2b96f', letterSpacing: '0.08em' }}>
                        {c.code}
                      </div>
                      {c.label && (
                        <div style={{ fontSize: '0.62rem', color: '#9090a8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          "{c.label}"
                        </div>
                      )}
                      <div style={{ fontSize: '0.58rem', color: '#3a3a5e', marginTop: '2px' }}>
                        {c.usedInBattle
                          ? `Used in battle vs ${c.usedInBattle.vs}`
                          : `Expires ${new Date(c.expiresAt).toLocaleDateString()}`}
                      </div>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => copyCode(c.code)}
                      style={{ padding: '0.25rem 0.5rem', flexShrink: 0 }}
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
            <div style={{ textAlign: 'center', color: '#5a5a7a', padding: '1.5rem', fontSize: '0.8rem' }}>
              No jutsu added yet.
            </div>
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
            <span style={{ fontSize: '0.7rem', color: '#9090a8' }}>Pure, Pure-Mech, Mechanical, Bonus, Special. Need 60 charges to unlock.</span>
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
            <div style={{ textAlign: 'center', color: '#5a5a7a', padding: '1.5rem', fontSize: '0.8rem' }}>No weapons yet.</div>
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
                    <option value="weapon">Standard</option>
                    <option value="kenjutsu">Kenjutsu</option>
                    <option value="throwing">Throwing</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Cards Tab */}
      {activeTab === 'specials' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* KKG Card */}
          <div className="card card-gold" style={{ padding: '1rem' }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: '#e2b96f', marginBottom: '0.75rem' }}>KKG CARD (Auto-Compatible)</div>
            <div className="form-group">
              <label>KKG Name</label>
              <input className="input" value={deck.kkgCard?.name || ''} onChange={e => setDeck({ ...deck, kkgCard: { ...deck.kkgCard, name: e.target.value } })} placeholder={`${user?.clan} KKG`} />
            </div>
            <div className="form-group">
              <label>Element</label>
              <input className="input" value={deck.kkgCard?.element || ''} onChange={e => setDeck({ ...deck, kkgCard: { ...deck.kkgCard, element: e.target.value } })} placeholder="e.g. Sharingan" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Description</label>
              <input className="input" value={deck.kkgCard?.description || ''} onChange={e => setDeck({ ...deck, kkgCard: { ...deck.kkgCard, description: e.target.value } })} placeholder="KKG ability" />
            </div>
          </div>

          {/* Basic Essentials */}
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: '#e2b96f', marginBottom: '0.5rem' }}>BASIC ESSENTIALS (B.E.)</div>
            <div style={{ fontSize: '0.72rem', color: '#9090a8', marginBottom: '0.75rem' }}>
              Genin(3) Chunin(4) Jounin(5) Kage(6) Sage(7) God(8) uses. Rest 3 turns after limit.
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Class</label>
                <select className="input" value={deck.basicEssentials?.class || 'E'} onChange={e => setDeck({ ...deck, basicEssentials: { ...deck.basicEssentials, class: e.target.value } })}>
                  {MOVE_CLASSES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Rank</label>
                <select className="input" value={deck.basicEssentials?.rank || 1} onChange={e => setDeck({ ...deck, basicEssentials: { ...deck.basicEssentials, rank: parseInt(e.target.value) } })}>
                  {[1,2,3,4,5].map(r => <option key={r} value={r}>Rank {r}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Tailed Beast */}
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: '#e2b96f', marginBottom: '0.75rem' }}>TAILED BEAST</div>
            <div className="form-group">
              <label>Beast Name</label>
              <input className="input" value={deck.tailedBeast?.name || ''} onChange={e => setDeck({ ...deck, tailedBeast: { ...deck.tailedBeast, name: e.target.value } })} placeholder="e.g. Nine-Tails" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Class</label>
              <select className="input" value={deck.tailedBeast?.class || ''} onChange={e => setDeck({ ...deck, tailedBeast: { ...deck.tailedBeast, class: e.target.value } })}>
                <option value="">None</option>
                {MOVE_CLASSES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Summoning Beast */}
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: '#e2b96f', marginBottom: '0.75rem' }}>SUMMONING BEAST</div>
            <div className="form-group">
              <label>Beast Name</label>
              <input className="input" value={deck.summoningBeast?.name || ''} onChange={e => setDeck({ ...deck, summoningBeast: { ...deck.summoningBeast, name: e.target.value } })} placeholder="e.g. Gamabunta" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Element</label>
              <input className="input" value={deck.summoningBeast?.element || ''} onChange={e => setDeck({ ...deck, summoningBeast: { ...deck.summoningBeast, element: e.target.value } })} placeholder="e.g. Fire" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
