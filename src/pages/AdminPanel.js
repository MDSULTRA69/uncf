import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  getAdminDashboard, getAdminPlayers, adminUpdatePlayer,
  createMove, createClan, createRule, createGem, createVillage
} from '../utils/api';
import { Users, Swords, BookOpen, Gem, Map, LayoutDashboard, Save, Edit2, Shield } from 'lucide-react';
const MOVE_CLASSES = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
const RANKS = ['Rookie', 'Genin', 'Chunin', 'Jounin', 'Kage', 'Sage', 'God'];

export default function AdminPanel() {
  const { user } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [playerUpdates, setPlayerUpdates] = useState({});

  const [moveForm, setMoveForm] = useState({ name: '', type: 'ninjutsu', class: 'E', description: '', element: '', unlockPrice: 2500, cooldownTurns: 0, cardType: 'attack' });
  const [clanForm, setClanForm] = useState({ name: '', kkg: '', kkgDescription: '', village: '', description: '' });
  const [ruleForm, setRuleForm] = useState({ section: '', title: '', content: '' });
  const [gemForm, setGemForm] = useState({ name: '', description: '', priceXC: 0, effect: '', category: 'utility' });
  const [villageForm, setVillageForm] = useState({ name: '', description: '' });

  useEffect(() => {
    if (tab === 'dashboard') getAdminDashboard().then(r => setStats(r.data)).catch(() => {});
    if (tab === 'players') getAdminPlayers().then(r => setPlayers(r.data.players || [])).catch(() => {});
  }, [tab]);

  const savePlayerUpdate = async (playerId) => {
    setLoading(true);
    try {
      await adminUpdatePlayer(playerId, playerUpdates);
      toast.success('Player updated!');
      setEditingPlayer(null);
      getAdminPlayers().then(r => setPlayers(r.data.players || []));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally { setLoading(false); }
  };

  const handleCreateMove = async () => {
    if (!moveForm.name) return toast.error('Move name required');
    setLoading(true);
    try {
      await createMove(moveForm);
      toast.success(`Move "${moveForm.name}" created!`);
      setMoveForm({ name: '', type: 'ninjutsu', class: 'E', description: '', element: '', unlockPrice: 2500, cooldownTurns: 0, cardType: 'attack' });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleCreateClan = async () => {
    if (!clanForm.name) return toast.error('Clan name required');
    setLoading(true);
    try {
      await createClan(clanForm);
      toast.success(`Clan "${clanForm.name}" created!`);
      setClanForm({ name: '', kkg: '', kkgDescription: '', village: '', description: '' });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleCreateRule = async () => {
    if (!ruleForm.section || !ruleForm.title || !ruleForm.content) return toast.error('All fields required');
    setLoading(true);
    try {
      await createRule(ruleForm);
      toast.success('Rule added to Rulebook!');
      setRuleForm({ section: '', title: '', content: '' });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleCreateGem = async () => {
    if (!gemForm.name) return toast.error('Gem name required');
    setLoading(true);
    try {
      await createGem(gemForm);
      toast.success(`Gem "${gemForm.name}" added!`);
      setGemForm({ name: '', description: '', priceXC: 0, effect: '', category: 'utility' });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleCreateVillage = async () => {
    if (!villageForm.name) return toast.error('Village name required');
    setLoading(true);
    try {
      await createVillage(villageForm);
      toast.success(`Village "${villageForm.name}" created!`);
      setVillageForm({ name: '', description: '' });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  const tabs = [
    { id: 'dashboard', label: 'Stats', icon: LayoutDashboard },
    { id: 'players', label: 'Players', icon: Users },
    { id: 'moves', label: 'Move', icon: Swords },
    { id: 'clans', label: 'Clan', icon: Shield },
    { id: 'rules', label: 'Rule', icon: BookOpen },
    { id: 'gems', label: 'Gem', icon: Gem },
    ...(user?.role === 'npc' ? [{ id: 'villages', label: 'Village', icon: Map }] : []),
  ];

  // Reusable form card
  const FormCard = ({ title, children, onSubmit, buttonLabel = 'Create' }) => (
    <div className="card" style={{ padding: '1rem' }}>
      <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', color: '#e2b96f', marginBottom: '1rem', letterSpacing: '0.08em' }}>{title}</div>
      {children}
      <button className="btn btn-gold" onClick={onSubmit} disabled={loading} style={{ marginTop: '0.75rem', width: '100%', justifyContent: 'center' }}>
        <Save size={14} /> {loading ? 'Saving...' : buttonLabel}
      </button>
    </div>
  );

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      <div>
        <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1.2rem', color: '#e74c3c' }}>Admin Panel</h1>
        <p style={{ color: '#5a5a7a', fontSize: '0.75rem', marginTop: '0.15rem' }}>
          Role: <span style={{ color: '#9b59b6', textTransform: 'capitalize' }}>{user?.role}</span>
        </p>
      </div>

      {/* Tab nav — scrollable single row */}
      <div style={{ display: 'flex', gap: '0.3rem', overflowX: 'auto', paddingBottom: '2px' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={`btn btn-sm ${tab === id ? 'btn-red' : 'btn-ghost'}`} style={{ flexShrink: 0 }}>
            <Icon size={13} />{label}
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {tab === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
          {[
            { label: 'Total Players', value: stats.totalPlayers || 0, color: '#3498db' },
            { label: 'Active Battles', value: stats.activeBattles || 0, color: '#e74c3c' },
            { label: 'Clans', value: stats.totalClans || 0, color: '#9b59b6' },
            { label: 'Moves in DB', value: stats.totalMoves || 0, color: '#27ae60' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card" style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: '0.62rem', color: '#5a5a7a', fontFamily: 'Cinzel, serif', letterSpacing: '0.08em', marginTop: '0.2rem' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Players */}
      {tab === 'players' && (
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: '#e2b96f', marginBottom: '0.875rem' }}>
            ALL PLAYERS ({players.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {players.map(p => (
              <div key={p._id} style={{ background: '#0a0a12', border: '1px solid #1e1e32', borderRadius: '6px', padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#e8e0d0', fontSize: '0.88rem' }}>{p.characterName}</div>
                    <div style={{ fontSize: '0.65rem', color: '#5a5a7a', marginTop: '2px' }}>
                      @{p.username} · {p.clan} · {p.village}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#5a5a7a', marginTop: '2px' }}>
                      W:{p.stats?.wins || 0} L:{p.stats?.losses || 0} · {p.stats?.xp?.toLocaleString() || 0} XP
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                    <span className={`badge ${p.role === 'npc' ? 'badge-red' : p.role === 'kage' ? 'badge-gold' : 'badge-cyan'}`} style={{ fontSize: '0.58rem' }}>{p.role}</span>
                    <span className="badge badge-gold" style={{ fontSize: '0.58rem' }}>{p.rank}</span>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.65rem', padding: '0.25rem 0.5rem' }} onClick={() => {
                      setEditingPlayer(editingPlayer === p._id ? null : p._id);
                      setPlayerUpdates({ rank: p.rank, role: p.role, isActive: p.isActive });
                    }}>
                      <Edit2 size={11} /> Edit
                    </button>
                  </div>
                </div>

                {editingPlayer === p._id && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #1e1e32' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <div>
                        <label>Rank</label>
                        <select className="input" value={playerUpdates.rank} onChange={e => setPlayerUpdates({ ...playerUpdates, rank: e.target.value })}>
                          {RANKS.map(r => <option key={r}>{r}</option>)}
                        </select>
                      </div>
                      {user?.role === 'npc' && (
                        <div>
                          <label>Role</label>
                          <select className="input" value={playerUpdates.role} onChange={e => setPlayerUpdates({ ...playerUpdates, role: e.target.value })}>
                            <option value="player">Player</option>
                            <option value="kage">Kage</option>
                            <option value="npc">NPC</option>
                          </select>
                        </div>
                      )}
                      <div>
                        <label>Status</label>
                        <select className="input" value={playerUpdates.isActive ? 'active' : 'banned'} onChange={e => setPlayerUpdates({ ...playerUpdates, isActive: e.target.value === 'active' })}>
                          <option value="active">Active</option>
                          <option value="banned">Banned</option>
                        </select>
                      </div>
                    </div>
                    <button className="btn btn-gold btn-sm" onClick={() => savePlayerUpdate(p._id)} disabled={loading}>
                      <Save size={13} /> Save Changes
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Move */}
      {tab === 'moves' && (
        <FormCard title="ADD NEW MOVE TO DATABASE" onSubmit={handleCreateMove}>
          <div className="form-group">
            <label>Move Name</label>
            <input className="input" value={moveForm.name} onChange={e => setMoveForm({ ...moveForm, name: e.target.value })} placeholder="e.g. Chidori" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div className="form-group">
              <label>Type</label>
              <select className="input" value={moveForm.type} onChange={e => setMoveForm({ ...moveForm, type: e.target.value })}>
                {['ninjutsu', 'genjutsu', 'taijutsu', 'kenjutsu', 'kkg', 'weapon', 'skill'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Class</label>
              <select className="input" value={moveForm.class} onChange={e => setMoveForm({ ...moveForm, class: e.target.value })}>
                {MOVE_CLASSES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Card Type</label>
              <select className="input" value={moveForm.cardType} onChange={e => setMoveForm({ ...moveForm, cardType: e.target.value })}>
                {['attack', 'defense', 'illusion', 'trap'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Element</label>
              <input className="input" value={moveForm.element} onChange={e => setMoveForm({ ...moveForm, element: e.target.value })} placeholder="e.g. Fire" />
            </div>
            <div className="form-group">
              <label>Unlock Price (XC)</label>
              <input className="input" type="number" value={moveForm.unlockPrice} onChange={e => setMoveForm({ ...moveForm, unlockPrice: parseInt(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Cooldown (turns)</label>
              <input className="input" type="number" value={moveForm.cooldownTurns} onChange={e => setMoveForm({ ...moveForm, cooldownTurns: parseInt(e.target.value) })} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Description</label>
            <textarea className="input" style={{ height: '80px', resize: 'vertical' }} value={moveForm.description} onChange={e => setMoveForm({ ...moveForm, description: e.target.value })} placeholder="Describe what this move does..." />
          </div>
        </FormCard>
      )}

      {/* Add Clan */}
      {tab === 'clans' && (
        <FormCard title="ADD NEW CLAN" onSubmit={handleCreateClan}>
          <div className="form-group">
            <label>Clan Name</label>
            <input className="input" value={clanForm.name} onChange={e => setClanForm({ ...clanForm, name: e.target.value })} placeholder="e.g. Uchiha" />
          </div>
          <div className="form-group">
            <label>Village</label>
            <input className="input" value={clanForm.village} onChange={e => setClanForm({ ...clanForm, village: e.target.value })} placeholder="e.g. Konohagakure" />
          </div>
          <div className="form-group">
            <label>KKG Name</label>
            <input className="input" value={clanForm.kkg} onChange={e => setClanForm({ ...clanForm, kkg: e.target.value })} placeholder="e.g. Sharingan" />
          </div>
          <div className="form-group">
            <label>KKG Description</label>
            <textarea className="input" style={{ height: '70px', resize: 'vertical' }} value={clanForm.kkgDescription} onChange={e => setClanForm({ ...clanForm, kkgDescription: e.target.value })} placeholder="What does the KKG do?" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Clan Description</label>
            <textarea className="input" style={{ height: '70px', resize: 'vertical' }} value={clanForm.description} onChange={e => setClanForm({ ...clanForm, description: e.target.value })} placeholder="Clan lore and history..." />
          </div>
        </FormCard>
      )}

      {/* Add Rule */}
      {tab === 'rules' && (
        <FormCard title="ADD NEW RULE TO RULEBOOK" onSubmit={handleCreateRule}>
          <div className="form-group">
            <label>Section</label>
            <input className="input" value={ruleForm.section} onChange={e => setRuleForm({ ...ruleForm, section: e.target.value })} placeholder="e.g. Battle, Moves, Skills" />
          </div>
          <div className="form-group">
            <label>Title</label>
            <input className="input" value={ruleForm.title} onChange={e => setRuleForm({ ...ruleForm, title: e.target.value })} placeholder="Rule title" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Content</label>
            <textarea className="input" style={{ height: '120px', resize: 'vertical' }} value={ruleForm.content} onChange={e => setRuleForm({ ...ruleForm, content: e.target.value })} placeholder="Full rule explanation..." />
          </div>
        </FormCard>
      )}

      {/* Add Gem */}
      {tab === 'gems' && (
        <FormCard title="ADD NEW GEM" onSubmit={handleCreateGem}>
          <div className="form-group">
            <label>Gem Name</label>
            <input className="input" value={gemForm.name} onChange={e => setGemForm({ ...gemForm, name: e.target.value })} placeholder="e.g. Rank-Up Gem" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div className="form-group">
              <label>Category</label>
              <select className="input" value={gemForm.category} onChange={e => setGemForm({ ...gemForm, category: e.target.value })}>
                {['rankup', 'move', 'skill', 'weapon', 'beast', 'utility'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Price (XC)</label>
              <input className="input" type="number" value={gemForm.priceXC} onChange={e => setGemForm({ ...gemForm, priceXC: parseInt(e.target.value) })} />
            </div>
          </div>
          <div className="form-group">
            <label>Effect</label>
            <input className="input" value={gemForm.effect} onChange={e => setGemForm({ ...gemForm, effect: e.target.value })} placeholder="What does this gem do?" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Description</label>
            <textarea className="input" style={{ height: '70px', resize: 'vertical' }} value={gemForm.description} onChange={e => setGemForm({ ...gemForm, description: e.target.value })} placeholder="Full description..." />
          </div>
        </FormCard>
      )}

      {/* Villages */}
      {tab === 'villages' && user?.role === 'npc' && (
        <FormCard title="CREATE NEW VILLAGE" onSubmit={handleCreateVillage} buttonLabel="Create Village">
          <div className="form-group">
            <label>Village Name</label>
            <input className="input" value={villageForm.name} onChange={e => setVillageForm({ ...villageForm, name: e.target.value })} placeholder="e.g. Konohagakure" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Description</label>
            <textarea className="input" style={{ height: '80px', resize: 'vertical' }} value={villageForm.description} onChange={e => setVillageForm({ ...villageForm, description: e.target.value })} placeholder="Village lore..." />
          </div>
        </FormCard>
      )}
    </div>
  );
}
