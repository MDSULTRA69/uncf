import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { updateDeck } from '../utils/api';
import { Save, Plus, Trash2, Info, ClipboardPaste, X, ChevronDown, ChevronUp } from 'lucide-react';

const MOVE_CLASSES = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];

const emptyDeck = {
  ninjutsuGenjutsu: [],
  skills: [],
  weaponBag: [],
  kkgCard: {},
  basicEssentials: { class: 'E', rank: 1 },
  tailedBeast: {},
  summoningBeast: {},
  sageMode: {}   // { type: 'heavenly'|'devil'|'', charges: 2-4 }
};

const cleanDeck = (d) => {
  const cleaned = { ...d };
  cleaned.ninjutsuGenjutsu = (d.ninjutsuGenjutsu || []).map(m => ({
    name: String(m.name || ''),
    class: String(m.class || 'E'),
    type: String(m.type || 'ninjutsu'),
    rank: Number(m.rank || 1),
    range: String(m.range || 'SR'),       // SR or LR — used by AI mod for NB4
    armored: Boolean(m.armored || false)  // armored = true → Armor SR/LR multiplier
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
  // Sage Mode: persist only if a type is chosen
  cleaned.sageMode = (d.sageMode?.type)
    ? { type: String(d.sageMode.type), charges: Number(d.sageMode.charges || 2) }
    : {};
  return cleaned;
};


// ── PASTE IMPORT PARSER ───────────────────────────────────────────────────────
// Accepts a flexible multi-line format. Players can paste their full card list.
// Supported line formats (case-insensitive, flexible spacing):
//
// JUTSU section:
//   Chidori | A | LR | rank 2 | armored       ← pipe-separated
//   Chidori, A, LR, rank 2, armored            ← comma-separated
//   Chidori - A class - LR - rank 2 - armored  ← dash-separated
//   Chidori (A, LR, rank 2, armored)
//   Chidori [A LR rank2 armored]
//   Just: Chidori A LR 2 armored               ← spaced, we infer what each token is
//
// SKILLS section:
//   Skill: Shadow Clone Technique | pure
//   Shadow Clone Technique - bonus
//
// WEAPONS section:
//   Weapon: Kunai | A
//   Shuriken, B, weapon
//
// SPECIALS:
//   KKG: Sharingan
//   Tailed Beast: Nine Tails
//   Summoning: Gamabunta
//   Sage Mode: Heavenly | 2 charges
//
// Section headers (optional, helps parser):
//   [Jutsu], [Skills], [Weapons], [Specials], [KKG], [Tailed Beast], [Summoning], [Sage Mode]
//   Or just: Jutsu:, Skills:, Weapons:

const CLASSES = new Set(['E','D','C','B','A','S','SS','SSS']);
const RANGES = new Set(['SR','LR','SHORT','LONG','SHORT RANGE','LONG RANGE']);
const SKILL_TYPES = new Set(['PURE','PURE-MECH','MECH','MECHANICAL','BONUS','SPECIAL']);

function inferTokens(tokens) {
  let cls = 'E', range = 'SR', rank = 1, armored = false, type = 'ninjutsu', skillType = 'pure';
  const remaining = [];
  for (const raw of tokens) {
    const t = raw.trim().toUpperCase();
    const tClean = raw.trim().toLowerCase();
    if (CLASSES.has(t)) { cls = t === 'SS' ? 'SS' : t === 'SSS' ? 'SSS' : t; continue; }
    if (t === 'LR' || t === 'LONG' || t === 'LONG RANGE') { range = 'LR'; continue; }
    if (t === 'SR' || t === 'SHORT' || t === 'SHORT RANGE') { range = 'SR'; continue; }
    if (tClean === 'armored' || tClean === 'armor') { armored = true; continue; }
    if (tClean === 'genjutsu' || tClean === 'gen') { type = 'genjutsu'; continue; }
    if (tClean === 'ninjutsu' || tClean === 'nin') { type = 'ninjutsu'; continue; }
    if (SKILL_TYPES.has(t)) { skillType = tClean.replace('mechanical','mech'); continue; }
    const rankMatch = tClean.match(/^(?:rank\s*)?(\d+)$/);
    if (rankMatch) { rank = Math.min(5, Math.max(1, parseInt(rankMatch[1]))); continue; }
    remaining.push(raw.trim());
  }
  return { cls, range, rank, armored, type, skillType, remaining };
}

function parsePastedDeck(text) {
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);
  const result = {
    ninjutsuGenjutsu: [], skills: [], weaponBag: [],
    kkgCard: {}, tailedBeast: {}, summoningBeast: {}, sageMode: {}
  };
  const warnings = [];

  let section = 'jutsu'; // default section

  for (const line of lines) {
    // Skip empty or comment lines
    if (!line || line.startsWith('//') || line.startsWith('#')) continue;

    const lower = line.toLowerCase().replace(/[:\[\]]/g, '').trim();

    // Section header detection
    if (/^jutsu|^ninjutsu|^genjutsu|^moves?/.test(lower)) { section = 'jutsu'; continue; }
    if (/^skills?/.test(lower)) { section = 'skills'; continue; }
    if (/^weapons?|^weapon bag/.test(lower)) { section = 'weapons'; continue; }
    if (/^specials?|^kkm|^kekkei/.test(lower)) { section = 'specials'; continue; }
    if (/^kkg/.test(lower) && lower.includes(':')) {
      const val = line.split(/:|>/)[1]?.trim();
      if (val) result.kkgCard = { name: val };
      continue;
    }
    if (/^tailed beast|^bijuu/.test(lower) && lower.includes(':')) {
      const val = line.split(/:|>/)[1]?.trim();
      if (val) result.tailedBeast = { name: val };
      continue;
    }
    if (/^summoning|^summon beast/.test(lower) && lower.includes(':')) {
      const val = line.split(/:|>/)[1]?.trim();
      if (val) result.summoningBeast = { name: val };
      continue;
    }
    if (/^sage mode/.test(lower)) {
      const rest = line.split(/:|>/)[1]?.trim() || line.replace(/sage mode/i,'').trim();
      const chargesMatch = rest.match(/(\d+)\s*charges?/i);
      const type = /devil/i.test(rest) ? 'devil' : /heavenly/i.test(rest) ? 'heavenly' : '';
      if (type) result.sageMode = { type, charges: chargesMatch ? parseInt(chargesMatch[1]) : 2 };
      continue;
    }

    // Inline special prefixes: "KKG: Sharingan", "Skill: ...", "Weapon: ..."
    const inlineSkill = line.match(/^skill:\s*(.+)/i);
    if (inlineSkill) { section = 'skills'; }
    const inlineWeapon = line.match(/^weapon:\s*(.+)/i);
    if (inlineWeapon) { section = 'weapons'; }

    // Split by common delimiters: |, ,, -, then by spaces
    // But preserve move name (first token before delimiter)
    const delimited = line.split(/\s*[|,]\s*/);
    const spaceSplit = line.split(/\s+/);

    // Use delimiter split if 2+ parts, else space split
    const tokens = delimited.length > 1 ? delimited : spaceSplit;
    const { cls, range, rank, armored, type, skillType, remaining } = inferTokens(tokens.slice(1));
    const name = (delimited.length > 1 ? delimited[0] : remaining.join(' ') || tokens[0])
      .replace(/^(skill|weapon|move|jutsu):\s*/i, '').trim();

    if (!name) continue;

    if (section === 'jutsu') {
      if (result.ninjutsuGenjutsu.length >= 10) {
        warnings.push(\`Skipped "\${name}" — max 10 jutsu\`);
        continue;
      }
      result.ninjutsuGenjutsu.push({ name, class: cls, type, rank, range, armored });
    } else if (section === 'skills') {
      if (result.skills.length >= 10) { warnings.push(\`Skipped "\${name}" — max 10 skills\`); continue; }
      result.skills.push({ name, type: skillType, description: '' });
    } else if (section === 'weapons') {
      if (result.weaponBag.length >= 12) { warnings.push(\`Skipped "\${name}" — max 12 weapons\`); continue; }
      result.weaponBag.push({ name, class: cls, type: 'weapon' });
    } else if (section === 'specials') {
      // In specials section, try to detect KKG / tailed beast / summoning by name hints
      if (/sharingan|byakugan|rinnegan|kekkei/i.test(name)) result.kkgCard = { name };
      else if (/tails|bijuu|jinchuuriki/i.test(name)) result.tailedBeast = { name };
      else if (/gamabunta|manda|katsuyu|summon/i.test(name)) result.summoningBeast = { name };
    }
  }

  return { parsed: result, warnings };
}

export default function DeckBuilder() {
  const { user, updateUser } = useAuth();
  const [deck, setDeck] = useState(user?.deck || emptyDeck);
  const [activeTab, setActiveTab] = useState('moves');
  const [loading, setLoading] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteWarnings, setPasteWarnings] = useState([]);

  const totalCards = (deck.ninjutsuGenjutsu?.length || 0) + (deck.skills?.length || 0) +
    (deck.weaponBag?.length > 0 ? 1 : 0) + (deck.kkgCard?.name ? 1 : 0) +
    (deck.basicEssentials?.class ? 1 : 0) + (deck.tailedBeast?.name ? 1 : 0) +
    (deck.summoningBeast?.name ? 1 : 0) + (deck.sageMode?.type ? 1 : 0);

  const saveDeck = async () => {
    if (totalCards > 25) return toast.error('Deck exceeds 25 cards!');
    setLoading(true);
    try {
      const cleaned = cleanDeck(deck);
      await updateDeck(cleaned);
      updateUser({ deck: cleaned });
      toast.success('Deck saved!');
    } catch {
      toast.error('Failed to save deck');
    } finally { setLoading(false); }
  };

  const handlePasteImport = () => {
    if (!pasteText.trim()) return toast.error('Paste something first!');
    const { parsed, warnings } = parsePastedDeck(pasteText);
    // Merge with existing deck (don't wipe specials that were already set)
    setDeck(prev => ({
      ...prev,
      ninjutsuGenjutsu: parsed.ninjutsuGenjutsu.length ? parsed.ninjutsuGenjutsu : prev.ninjutsuGenjutsu,
      skills: parsed.skills.length ? parsed.skills : prev.skills,
      weaponBag: parsed.weaponBag.length ? parsed.weaponBag : prev.weaponBag,
      kkgCard: parsed.kkgCard?.name ? parsed.kkgCard : prev.kkgCard,
      tailedBeast: parsed.tailedBeast?.name ? parsed.tailedBeast : prev.tailedBeast,
      summoningBeast: parsed.summoningBeast?.name ? parsed.summoningBeast : prev.summoningBeast,
      sageMode: parsed.sageMode?.type ? parsed.sageMode : prev.sageMode,
    }));
    setPasteWarnings(warnings);
    setPasteText('');
    setPasteOpen(false);
    const imported =
      parsed.ninjutsuGenjutsu.length + parsed.skills.length + parsed.weaponBag.length;
    toast.success(`Imported ${imported} cards!${warnings.length ? ' (some skipped — see warnings)' : ''}`);
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
    { id: 'specials', label: 'Special', count: [deck.kkgCard?.name, deck.tailedBeast?.name, deck.summoningBeast?.name, deck.sageMode?.type].filter(Boolean).length, max: 4 },
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
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
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
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <select className="input" style={{ ...inputStyle, flex: 1 }} value={m.range || 'SR'} onChange={e => updateMove(i, 'range', e.target.value)}>
                    <option value="SR">Short Range (SR)</option>
                    <option value="LR">Long Range (LR)</option>
                  </select>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: m.armored ? '#e2b96f' : '#5a5a7a', cursor: 'pointer', flexShrink: 0, padding: '0.4rem 0.5rem', background: m.armored ? 'rgba(226,185,111,0.08)' : '#0a0a12', border: `1px solid ${m.armored ? '#e2b96f44' : '#1e1e32'}`, borderRadius: '4px', whiteSpace: 'nowrap' }}>
                    <input type="checkbox" checked={m.armored || false} onChange={e => updateMove(i, 'armored', e.target.checked)} style={{ accentColor: '#e2b96f' }} />
                    Armored
                  </label>
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
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#9090a8', marginBottom: '0.4rem' }}>Summoning Beast</div>
            <input className="input" style={inputStyle} value={deck.summoningBeast?.name || ''} onChange={e => setDeck({ ...deck, summoningBeast: { ...deck.summoningBeast, name: e.target.value } })} placeholder="Summoning name" />
          </div>

          {/* Sage Mode */}
          <div style={{ background: 'rgba(226,185,111,0.04)', border: '1px solid #2a2a3e', borderRadius: '6px', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#e2b96f', fontFamily: 'Cinzel, serif', marginBottom: '0.5rem' }}>⚡ Sage Mode</div>
            <div style={{ fontSize: '0.65rem', color: '#5a5a7a', marginBottom: '0.5rem' }}>
              Z-class activation. Used by AI mod to apply Sage LR / Sage Prime LR damage multipliers (NB4).
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <select className="input" style={{ ...inputStyle, flex: 2 }}
                value={deck.sageMode?.type || ''}
                onChange={e => setDeck({ ...deck, sageMode: { ...deck.sageMode, type: e.target.value } })}>
                <option value="">— None —</option>
                <option value="heavenly">Heavenly Sage Mode</option>
                <option value="devil">Devil Sage Mode</option>
              </select>
              <select className="input" style={{ ...inputStyle, flex: 1 }}
                value={deck.sageMode?.charges || 2}
                onChange={e => setDeck({ ...deck, sageMode: { ...deck.sageMode, charges: parseInt(e.target.value) } })}>
                {[2,3,4].map(n => <option key={n} value={n}>{n} charges</option>)}
              </select>
            </div>
            {deck.sageMode?.type && (
              <div style={{ fontSize: '0.65rem', color: '#27ae60' }}>
                ✓ {deck.sageMode.type === 'heavenly' ? 'Heavenly' : 'Devil'} Sage Mode — {deck.sageMode.charges || 2} charges per match. Counts as 1 special card.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
