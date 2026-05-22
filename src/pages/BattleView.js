import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getBattle, submitAction, askMod, spinWheel, forfeitBattle } from '../utils/api';
import { Send, RefreshCw, HelpCircle, Flag, Coins, Shuffle } from 'lucide-react';

const classColor = { E: '#5a5a7a', D: '#3498db', C: '#27ae60', B: '#9b59b6', A: '#e2b96f', S: '#e74c3c', SS: '#f39c12', SSS: '#ff6b6b' };

export default function BattleView() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [battle, setBattle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedCards, setSelectedCards] = useState([]);
  const [modQuestion, setModQuestion] = useState('');
  const [spinResult, setSpinResult] = useState('');
  const [showModAsk, setShowModAsk] = useState(false);
  const [showForfeitConfirm, setShowForfeitConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const chatEndRef = useRef(null);

  const fetchBattle = async () => {
    try {
      const { data } = await getBattle(id);
      setBattle(data.battle);
    } catch {
      toast.error('Battle not found');
      navigate('/battle');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchBattle(); }, [id]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [battle?.chatLog]);

  // Auto-refresh every 8 seconds for live updates
  useEffect(() => {
    if (battle?.status !== 'active') return;
    const interval = setInterval(fetchBattle, 8000);
    return () => clearInterval(interval);
  }, [battle?.status]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!battle) return null;

  const isPlayer1 = battle.player1?._id === user?.id || battle.player1?._id?.toString() === user?.id;
  const isPlayer2 = battle.player2?._id === user?.id || battle.player2?._id?.toString() === user?.id;
  const isParticipant = isPlayer1 || isPlayer2;
  const myPlayer = isPlayer1 ? battle.player1 : battle.player2;
  const oppPlayer = isPlayer1 ? battle.player2 : battle.player1;
  const myHP = isPlayer1 ? battle.player1HP : battle.player2HP;
  const oppHP = isPlayer1 ? battle.player2HP : battle.player1HP;
  const isMyTurn = battle.whoseTurn === user?.id || battle.whoseTurn?._id === user?.id || battle.whoseTurn?.toString() === user?.id;
  const myDeck = isPlayer1 ? battle.player1Deck : battle.player2Deck;

  const toggleCard = (card) => {
    if (selectedCards.find(c => c.name === card.name)) {
      setSelectedCards(selectedCards.filter(c => c.name !== card.name));
    } else {
      if (selectedCards.length >= 5) return toast.error('Max 5 active cards per turn');
      setSelectedCards([...selectedCards, card]);
    }
  };

  const sendAction = async () => {
    if (!message.trim() && selectedCards.length === 0) return toast.error('Describe your action or select cards');
    const fullAction = selectedCards.length > 0
      ? `${message}\n[Cards Used: ${selectedCards.map(c => `${c.name}(${c.class || '?'})`).join(', ')}]`
      : message;
    setSending(true);
    try {
      const { data } = await submitAction(id, { action: fullAction, cardsUsed: selectedCards, phase: battle.phase });
      setBattle(data.battle);
      setMessage('');
      setSelectedCards([]);
      toast.success('Action submitted!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit');
    } finally { setSending(false); }
  };

  const handleAskMod = async () => {
    if (!modQuestion.trim()) return;
    try {
      const { data } = await askMod(id, modQuestion);
      toast.success('MOD answered!', { duration: 8000 });
      setSpinResult(data.answer);
      setModQuestion('');
      setShowModAsk(false);
    } catch { toast.error('Failed to ask MOD'); }
  };

  const handleSpin = async (type) => {
    try {
      const { data } = await spinWheel(id, type);
      setSpinResult(data.result);
      toast.success(`${type} result ready!`);
    } catch { toast.error('Spin failed'); }
  };

  const handleForfeit = async () => {
    try {
      await forfeitBattle(id);
      toast.success('Battle forfeited');
      navigate('/battle');
    } catch { toast.error('Failed to forfeit'); }
  };

  const allMyCards = [
    ...(myDeck?.ninjutsuGenjutsu || []),
    ...(myDeck?.weaponBag || []),
    ...(myDeck?.skills || []),
    ...(myDeck?.kkgCard?.name ? [{ ...myDeck.kkgCard, type: 'kkg' }] : []),
    ...(myDeck?.basicEssentials?.class ? [{ name: 'Basic Essentials', ...myDeck.basicEssentials, type: 'be' }] : []),
  ];

  const phaseColor = { attack: '#e74c3c', response: '#3498db', trap: '#9b59b6', counter: '#f39c12' };

  return (
    <div className="fade-in" style={{ height: 'calc(100vh - 56px - 4rem)', display: 'flex', flexDirection: 'column' }}>
      {/* Battle header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '1rem', background: '#12121e', borderRadius: '8px', border: '1px solid #1e1e32' }}>
        {/* Player 1 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(226,185,111,0.1)', border: '2px solid #e2b96f44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cinzel, serif', color: '#e2b96f' }}>
            {battle.player1Name?.[0]}
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#e8e0d0', fontWeight: 600 }}>{battle.player1Name}</div>
            <div style={{ fontSize: '0.65rem', color: '#5a5a7a', marginBottom: '4px' }}>HP {battle.player1HP}/100</div>
            <div className="hp-bar-container" style={{ width: '120px' }}>
              <div className={`hp-bar ${battle.player1HP > 60 ? 'high' : battle.player1HP > 30 ? 'mid' : 'low'}`} style={{ width: `${battle.player1HP}%` }} />
            </div>
          </div>
        </div>

        {/* Center info */}
        <div style={{ textAlign: 'center', padding: '0 1rem' }}>
          <div style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '0.9rem', color: '#e74c3c' }}>⚔</div>
          <div style={{ fontSize: '0.7rem', color: '#5a5a7a', fontFamily: 'Cinzel, serif' }}>
            Turn {battle.currentTurn}/{battle.maxTurns}
          </div>
          <div style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '3px', marginTop: '0.25rem', background: `${phaseColor[battle.phase] || '#5a5a7a'}22`, color: phaseColor[battle.phase] || '#5a5a7a', fontFamily: 'Cinzel, serif', border: `1px solid ${phaseColor[battle.phase] || '#5a5a7a'}44` }}>
            {battle.phase?.toUpperCase()}
          </div>
          <div style={{ fontSize: '0.6rem', color: battle.status === 'active' ? '#27ae60' : '#5a5a7a', marginTop: '0.2rem', fontFamily: 'Cinzel, serif' }}>
            {battle.status?.toUpperCase()}
          </div>
        </div>

        {/* Player 2 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, flexDirection: 'row-reverse' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(231,76,60,0.1)', border: '2px solid #e74c3c44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cinzel, serif', color: '#e74c3c' }}>
            {battle.player2Name?.[0]}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.9rem', color: '#e8e0d0', fontWeight: 600 }}>{battle.player2Name}</div>
            <div style={{ fontSize: '0.65rem', color: '#5a5a7a', marginBottom: '4px' }}>HP {battle.player2HP}/100</div>
            <div className="hp-bar-container" style={{ width: '120px' }}>
              <div className={`hp-bar ${battle.player2HP > 60 ? 'high' : battle.player2HP > 30 ? 'mid' : 'low'}`} style={{ width: `${battle.player2HP}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem', minHeight: 0 }}>

        {/* Chat log */}
        <div style={{ display: 'flex', flexDirection: 'column', background: '#12121e', border: '1px solid #1e1e32', borderRadius: '8px', overflow: 'hidden' }}>
          {/* Chat header */}
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #1e1e32', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: '#e2b96f', letterSpacing: '0.1em' }}>BATTLE LOG</span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="btn btn-ghost btn-sm" onClick={fetchBattle}><RefreshCw size={12} /></button>
              {isParticipant && battle.status === 'active' && (
                <>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowModAsk(!showModAsk)} title="Ask AI MOD a rules question">
                    <HelpCircle size={12} /> Ask MOD
                  </button>
                  <button className="btn btn-red btn-sm" onClick={() => setShowForfeitConfirm(true)}>
                    <Flag size={12} /> Forfeit
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Ask MOD panel */}
          {showModAsk && (
            <div style={{ padding: '0.75rem', background: 'rgba(226,185,111,0.05)', borderBottom: '1px solid #2a2a3e' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input className="input" style={{ flex: 1, padding: '0.4rem 0.75rem', fontSize: '0.82rem' }} value={modQuestion} onChange={e => setModQuestion(e.target.value)} placeholder="Ask AI MOD a rules question..." onKeyDown={e => e.key === 'Enter' && handleAskMod()} />
                <button className="btn btn-gold btn-sm" onClick={handleAskMod}>Ask</button>
              </div>
            </div>
          )}

          {/* Forfeit confirm */}
          {showForfeitConfirm && (
            <div style={{ padding: '0.75rem', background: 'rgba(192,57,43,0.1)', borderBottom: '1px solid #e74c3c44', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#e8e0d0', flex: 1 }}>Forfeit this battle? You lose 3 points.</span>
              <button className="btn btn-red btn-sm" onClick={handleForfeit}>Yes, Forfeit</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForfeitConfirm(false)}>Cancel</button>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {battle.chatLog?.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.68rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.06em',
                    color: msg.type === 'ai-mod' ? '#e2b96f' : msg.type === 'system' ? '#5a5a7a' : '#9090a8'
                  }}>
                    {msg.type === 'ai-mod' ? '⚖ AI-MOD' : msg.senderName}
                  </span>
                  <span style={{ fontSize: '0.6rem', color: '#3a3a5e' }}>
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                  </span>
                </div>
                <div className={msg.type === 'ai-mod' ? 'ai-mod-message' : 'player-message'}>
                  {msg.message}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Spin result display */}
          {spinResult && (
            <div style={{ padding: '0.75rem', background: 'rgba(78,205,196,0.05)', borderTop: '1px solid #2a2a3e' }}>
              <div style={{ fontSize: '0.7rem', color: '#4ecdc4', fontFamily: 'Cinzel, serif', marginBottom: '0.3rem' }}>MOD RESULT</div>
              <div style={{ fontSize: '0.82rem', color: '#e8e0d0', whiteSpace: 'pre-wrap' }}>{spinResult}</div>
              <button onClick={() => setSpinResult('')} style={{ marginTop: '0.3rem', fontSize: '0.65rem', color: '#5a5a7a', background: 'none', border: 'none', cursor: 'pointer' }}>Dismiss</button>
            </div>
          )}

          {/* Input */}
          {isParticipant && battle.status === 'active' && (
            <div style={{ padding: '0.75rem', borderTop: '1px solid #1e1e32' }}>
              {!isMyTurn && (
                <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#5a5a7a', padding: '0.5rem', fontFamily: 'Cinzel, serif' }}>
                  Waiting for {isPlayer1 ? battle.player2Name : battle.player1Name}...
                </div>
              )}
              {isMyTurn && (
                <>
                  {selectedCards.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
                      {selectedCards.map((c, i) => (
                        <span key={i} onClick={() => toggleCard(c)} style={{
                          padding: '0.2rem 0.5rem', borderRadius: '3px', fontSize: '0.7rem',
                          background: 'rgba(226,185,111,0.1)', border: '1px solid #e2b96f44',
                          color: '#e2b96f', cursor: 'pointer', fontFamily: 'Cinzel, serif'
                        }}>
                          {c.name} ✕
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <textarea
                      className="input"
                      style={{ flex: 1, resize: 'none', height: '60px', fontSize: '0.85rem', fontFamily: 'Lato, sans-serif' }}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder={`Describe your ${battle.phase} action... (${5 - selectedCards.length} card slots left)`}
                      onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) sendAction(); }}
                    />
                    <button className="btn btn-gold" onClick={sendAction} disabled={sending} style={{ alignSelf: 'stretch', padding: '0 1rem' }}>
                      {sending ? <RefreshCw size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Send size={16} />}
                    </button>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#3a3a5e', marginTop: '0.3rem' }}>Ctrl+Enter to send</div>
                </>
              )}
            </div>
          )}

          {/* Battle completed */}
          {battle.status === 'completed' && (
            <div style={{ padding: '1rem', borderTop: '1px solid #1e1e32', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1rem', color: '#e2b96f', marginBottom: '0.5rem' }}>
                {battle.isDraw ? '⚖ DRAW!' : battle.winner?.characterName ? `🏆 ${battle.winner.characterName} WINS!` : 'BATTLE COMPLETE'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#5a5a7a', marginBottom: '0.75rem' }}>{battle.endReason}</div>
              <button className="btn btn-gold" onClick={() => navigate('/battle')}>Return to Arena</button>
            </div>
          )}
        </div>

        {/* Right panel - deck + tools */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: '#12121e', borderRadius: '6px', border: '1px solid #1e1e32', padding: '4px', gap: '4px' }}>
            {['deck', 'tools'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: '0.4rem', borderRadius: '4px', border: 'none', cursor: 'pointer',
                fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.06em',
                background: activeTab === tab ? 'rgba(226,185,111,0.1)' : 'transparent',
                color: activeTab === tab ? '#e2b96f' : '#5a5a7a', transition: 'all 0.2s'
              }}>
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Deck panel */}
          {activeTab === 'deck' && isParticipant && (
            <div style={{ flex: 1, background: '#12121e', border: '1px solid #1e1e32', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '0.75rem', borderBottom: '1px solid #1e1e32' }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', color: '#e2b96f', letterSpacing: '0.1em' }}>MY DECK</span>
                {isMyTurn && <span style={{ fontSize: '0.65rem', color: '#27ae60', marginLeft: '0.5rem' }}>● Your Turn</span>}
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {allMyCards.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#5a5a7a', padding: '1.5rem', fontSize: '0.78rem' }}>
                    No cards in deck. <br />Build your deck first!
                  </div>
                ) : (
                  allMyCards.map((card, i) => {
                    const isSelected = selectedCards.find(c => c.name === card.name);
                    return (
                      <div
                        key={i}
                        onClick={() => isMyTurn && battle.status === 'active' && toggleCard(card)}
                        style={{
                          padding: '0.5rem 0.75rem', borderRadius: '5px', cursor: isMyTurn ? 'pointer' : 'default',
                          background: isSelected ? 'rgba(226,185,111,0.1)' : '#0a0a12',
                          border: `1px solid ${isSelected ? '#e2b96f66' : '#1e1e32'}`,
                          transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                      >
                        {card.class && (
                          <span style={{ fontSize: '0.6rem', fontFamily: 'Cinzel, serif', color: classColor[card.class] || '#5a5a7a', flexShrink: 0 }}>
                            [{card.class}]
                          </span>
                        )}
                        <span style={{ fontSize: '0.78rem', color: isSelected ? '#e2b96f' : '#e8e0d0', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {card.name || 'Unnamed'}
                        </span>
                        <span style={{ fontSize: '0.6rem', color: '#3a3a5e', flexShrink: 0 }}>
                          {card.type}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
              <div style={{ padding: '0.5rem 0.75rem', borderTop: '1px solid #1e1e32', fontSize: '0.65rem', color: '#5a5a7a', textAlign: 'center' }}>
                {selectedCards.length}/5 cards selected · Click to toggle
              </div>
            </div>
          )}

          {/* Tools panel */}
          {activeTab === 'tools' && (
            <div style={{ background: '#12121e', border: '1px solid #1e1e32', borderRadius: '8px', padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', color: '#e2b96f', letterSpacing: '0.1em' }}>MOD TOOLS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {[
                  { type: 'compatibility', label: 'Compatibility Test', icon: Coins, desc: 'Coin toss for move compat' },
                  { type: 'momentum', label: 'Momentum Dice', icon: Shuffle, desc: 'Roll momentum every 3 turns' },
                  { type: 'stalemate', label: 'Stalemate Game', icon: Shuffle, desc: 'Equal jutsu clash' },
                  { type: 'speedGame', label: 'Speed Game', icon: Shuffle, desc: 'Attack-counter clash' },
                ].map(({ type, label, icon: Icon, desc }) => (
                  <button
                    key={type}
                    className="btn btn-ghost btn-sm"
                    style={{ justifyContent: 'flex-start', width: '100%', flexDirection: 'column', alignItems: 'flex-start', height: 'auto', padding: '0.6rem 0.875rem' }}
                    onClick={() => handleSpin(type)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Icon size={13} />{label}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#3a3a5e', marginTop: '0.15rem' }}>{desc}</div>
                  </button>
                ))}
              </div>

              <div className="gold-divider" />

              {/* Active traps */}
              <div>
                <div style={{ fontSize: '0.68rem', color: '#5a5a7a', fontFamily: 'Cinzel, serif', marginBottom: '0.4rem' }}>ACTIVE TRAPS</div>
                {battle.activeTraps?.length > 0 ? (
                  battle.activeTraps.map((t, i) => (
                    <div key={i} style={{ fontSize: '0.75rem', color: '#9b59b6', padding: '0.25rem 0' }}>⚠ {t.trapName}</div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.72rem', color: '#3a3a5e' }}>No active traps</div>
                )}
              </div>

              {/* Active cooldowns */}
              <div>
                <div style={{ fontSize: '0.68rem', color: '#5a5a7a', fontFamily: 'Cinzel, serif', marginBottom: '0.4rem' }}>COOLDOWNS</div>
                {battle.activeCooldowns?.length > 0 ? (
                  battle.activeCooldowns.map((c, i) => (
                    <div key={i} style={{ fontSize: '0.72rem', color: '#e74c3c', padding: '0.25rem 0' }}>
                      🕐 {c.moveName} (until turn {c.resumesOnTurn})
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.72rem', color: '#3a3a5e' }}>No cooldowns active</div>
                )}
              </div>

              <div className="gold-divider" />

              {/* Hit value reference */}
              <div>
                <div style={{ fontSize: '0.68rem', color: '#5a5a7a', fontFamily: 'Cinzel, serif', marginBottom: '0.5rem' }}>HIT VALUES</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                  {[['E','10'],['D','20'],['C','30'],['B','40'],['A','50'],['S','60'],['SS','70'],['SSS','80']].map(([cls, val]) => (
                    <div key={cls} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', padding: '0.2rem 0.4rem', background: '#0a0a12', borderRadius: '3px' }}>
                      <span style={{ color: classColor[cls], fontFamily: 'Cinzel, serif' }}>{cls}</span>
                      <span style={{ color: '#9090a8' }}>{val} dmg</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
