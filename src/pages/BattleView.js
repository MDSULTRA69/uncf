import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getBattle, submitAction, askMod, spinWheel, forfeitBattle, submitPrivateDeck, submitPrivateTraps, getMe } from '../utils/api';
import { Send, RefreshCw, HelpCircle, Flag, Coins, Shuffle, Lock, CheckCircle } from 'lucide-react';

const classColor = { E: '#5a5a7a', D: '#3498db', C: '#27ae60', B: '#9b59b6', A: '#e2b96f', S: '#e74c3c', SS: '#f39c12', SSS: '#ff6b6b' };
const phaseColor = { attack: '#e74c3c', response: '#3498db', trap: '#9b59b6', counter: '#f39c12' };

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
  const [activeTab, setActiveTab] = useState('log');
  const [submittingDeck, setSubmittingDeck] = useState(false);
  const [deckSubmitted, setDeckSubmitted] = useState(false);
  const [trapSlots, setTrapSlots] = useState([{ name: '', class: 'D' }, { name: '', class: 'D' }, { name: '', class: 'D' }]);
  const [submittingTraps, setSubmittingTraps] = useState(false);
  const [trapsSubmitted, setTrapsSubmitted] = useState(false);
  const chatEndRef = useRef(null);

  const fetchBattle = useCallback(async () => {
    try {
      const { data } = await getBattle(id);
      setBattle(data.battle);
    } catch {
      toast.error('Battle not found');
      navigate('/battle');
    } finally { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => { fetchBattle(); }, [fetchBattle]);
  useEffect(() => {
    if (activeTab === 'log') chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battle?.chatLog, activeTab]);
  useEffect(() => {
    if (battle?.status !== 'active') return;
    const interval = setInterval(fetchBattle, 8000);
    return () => clearInterval(interval);
  }, [battle?.status, fetchBattle]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!battle) return null;

  const isPlayer1 = battle.player1?._id === user?.id || battle.player1?._id?.toString() === user?.id;
  const isPlayer2 = battle.player2?._id === user?.id || battle.player2?._id?.toString() === user?.id;
  const isParticipant = isPlayer1 || isPlayer2;
  const isMyTurn = battle.whoseTurn === user?.id || battle.whoseTurn?._id === user?.id || battle.whoseTurn?.toString() === user?.id;
  const myDeck = isPlayer1 ? battle.player1Deck : battle.player2Deck;
  const myDeckSubmitted = isPlayer1 ? battle.player1DeckSubmitted : battle.player2DeckSubmitted;
  const oppDeckSubmitted = isPlayer1 ? battle.player2DeckSubmitted : battle.player1DeckSubmitted;

  const toggleCard = (card) => {
    if (selectedCards.find(c => c.name === card.name)) {
      setSelectedCards(selectedCards.filter(c => c.name !== card.name));
    } else {
      if (selectedCards.length >= 5) return toast.error('Max 5 cards per turn');
      setSelectedCards([...selectedCards, card]);
    }
  };

  const sendAction = async () => {
    if (!message.trim() && selectedCards.length === 0) return toast.error('Describe your action or select cards');
    const fullAction = selectedCards.length > 0
      ? `${message}\n[Cards: ${selectedCards.map(c => `${c.name}(${c.class || '?'})`).join(', ')}]`
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
const handleSubmitDeck = async () => {
  setSubmittingDeck(true);
  try {
    const { data } = await getMe();
    const freshDeck = data.user?.deck;

    if (!freshDeck || (
      !freshDeck.ninjutsuGenjutsu?.length &&
      !freshDeck.skills?.length &&
      !freshDeck.weaponBag?.length
    )) {
      toast.error('Your deck is empty. Build and save your deck first.');
      return;
    }

    await submitPrivateDeck(id, freshDeck);
    setDeckSubmitted(true);
    toast.success('Deck submitted privately!');
    fetchBattle();
  } catch (err) {
    toast.error(err.response?.data?.error || 'Failed to submit deck');
  } finally {
    setSubmittingDeck(false);
  }
};

  const handleSubmitTraps = async () => {
    const filledTraps = trapSlots.filter(t => t.name.trim());
    setSubmittingTraps(true);
    try {
      await submitPrivateTraps(id, filledTraps);
      setTrapsSubmitted(true);
      toast.success(`${filledTraps.length} trap(s) submitted privately!`);
      fetchBattle();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit traps');
    } finally {
      setSubmittingTraps(false);
    }
  };
    
  const handleAskMod = async () => {
    if (!modQuestion.trim()) return;
    try {
      const { data } = await askMod(id, modQuestion);
      setSpinResult(data.answer);
      setModQuestion('');
      setShowModAsk(false);
      setActiveTab('log');
    } catch { toast.error('Failed to ask MOD'); }
  };

  const handleSpin = async (type) => {
    try {
      const { data } = await spinWheel(id, type);
      setSpinResult(data.result);
      setActiveTab('log');
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

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

      {/* HP Bar Header */}
      <div style={{ background: '#12121e', border: '1px solid #1e1e32', borderRadius: '8px', padding: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.72rem', color: '#e2b96f', fontFamily: 'Cinzel, serif', marginBottom: '2px' }}>{battle.player1Name}</div>
            <div className="hp-bar-container">
              <div className={`hp-bar ${battle.player1HP > 60 ? 'high' : battle.player1HP > 30 ? 'mid' : 'low'}`} style={{ width: `${battle.player1HP}%` }} />
            </div>
            <div style={{ fontSize: '0.6rem', color: '#5a5a7a', marginTop: '2px' }}>{battle.player1HP}/100</div>
          </div>
          <div style={{ textAlign: 'center', minWidth: '60px' }}>
            <div style={{ fontSize: '0.65rem', fontFamily: 'Cinzel, serif', color: '#5a5a7a' }}>T{battle.currentTurn}/{battle.maxTurns}</div>
            <div style={{
              fontSize: '0.6rem', padding: '0.15rem 0.4rem', borderRadius: '3px', marginTop: '2px',
              background: `${phaseColor[battle.phase] || '#5a5a7a'}22`,
              color: phaseColor[battle.phase] || '#5a5a7a',
              border: `1px solid ${phaseColor[battle.phase] || '#5a5a7a'}44`,
              fontFamily: 'Cinzel, serif'
            }}>
              {battle.phase?.toUpperCase()}
            </div>
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: '#e74c3c', fontFamily: 'Cinzel, serif', marginBottom: '2px' }}>{battle.player2Name}</div>
            <div className="hp-bar-container">
              <div className={`hp-bar ${battle.player2HP > 60 ? 'high' : battle.player2HP > 30 ? 'mid' : 'low'}`} style={{ width: `${battle.player2HP}%` }} />
            </div>
            <div style={{ fontSize: '0.6rem', color: '#5a5a7a', marginTop: '2px' }}>{battle.player2HP}/100</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: '0.65rem', fontFamily: 'Cinzel, serif', color: isMyTurn ? '#27ae60' : '#5a5a7a' }}>
          {isMyTurn ? '● YOUR TURN' : `● Waiting for ${isPlayer1 ? battle.player2Name : battle.player1Name}...`}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#12121e', borderRadius: '6px', border: '1px solid #1e1e32', padding: '3px', gap: '3px' }}>
        {['log', 'deck', 'traps', 'tools'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '0.4rem', borderRadius: '4px', border: 'none', cursor: 'pointer',
            fontFamily: 'Cinzel, serif', fontSize: '0.68rem', letterSpacing: '0.05em',
            background: activeTab === tab ? 'rgba(226,185,111,0.1)' : 'transparent',
            color: activeTab === tab ? '#e2b96f' : '#5a5a7a'
          }}>
            {tab === 'log' ? 'BATTLE LOG' : tab === 'deck' ? 'DECK' : tab === 'traps' ? 'TRAPS' : 'TOOLS'}
          </button>
        ))}
      </div>

      {/* BATTLE LOG TAB */}
      {activeTab === 'log' && (
        <div style={{ display: 'flex', flexDirection: 'column', background: '#12121e', border: '1px solid #1e1e32', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid #1e1e32', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', color: '#e2b96f' }}>BATTLE LOG</span>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button className="btn btn-ghost btn-sm" onClick={fetchBattle}><RefreshCw size={12} /></button>
              {isParticipant && battle.status === 'active' && (
                <>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowModAsk(!showModAsk)}>
                    <HelpCircle size={12} /> MOD
                  </button>
                  <button className="btn btn-red btn-sm" onClick={() => setShowForfeitConfirm(true)}>
                    <Flag size={12} />
                  </button>
                </>
              )}
            </div>
          </div>

          {showModAsk && (
            <div style={{ padding: '0.6rem', background: 'rgba(226,185,111,0.05)', borderBottom: '1px solid #2a2a3e', display: 'flex', gap: '0.4rem' }}>
              <input className="input" style={{ flex: 1, padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                value={modQuestion} onChange={e => setModQuestion(e.target.value)}
                placeholder="Ask MOD a rules question..."
                onKeyDown={e => e.key === 'Enter' && handleAskMod()} />
              <button className="btn btn-gold btn-sm" onClick={handleAskMod}>Ask</button>
            </div>
          )}

          {showForfeitConfirm && (
            <div style={{ padding: '0.6rem', background: 'rgba(192,57,43,0.1)', borderBottom: '1px solid #e74c3c44', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: '#e8e0d0', flex: 1 }}>Forfeit? You lose 3 points.</span>
              <button className="btn btn-red btn-sm" onClick={handleForfeit}>Forfeit</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForfeitConfirm(false)}>Cancel</button>
            </div>
          )}

          {spinResult && (
            <div style={{ padding: '0.6rem 0.75rem', background: 'rgba(78,205,196,0.05)', borderBottom: '1px solid #2a2a3e' }}>
              <div style={{ fontSize: '0.65rem', color: '#4ecdc4', fontFamily: 'Cinzel, serif', marginBottom: '0.25rem' }}>MOD RESULT</div>
              <div style={{ fontSize: '0.8rem', color: '#e8e0d0', whiteSpace: 'pre-wrap' }}>{spinResult}</div>
              <button onClick={() => setSpinResult('')} style={{ marginTop: '0.25rem', fontSize: '0.62rem', color: '#5a5a7a', background: 'none', border: 'none', cursor: 'pointer' }}>Dismiss</button>
            </div>
          )}

          <div style={{ overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '40vh' }}>
            {battle.chatLog?.map((msg, i) => (
              <div key={i}>
                <div style={{ fontSize: '0.62rem', fontFamily: 'Cinzel, serif', marginBottom: '3px',
                  color: msg.type === 'ai-mod' ? '#e2b96f' : '#9090a8' }}>
                  {msg.type === 'ai-mod' ? '⚖ MOD' : msg.senderName}
                  {msg.timestamp && <span style={{ color: '#3a3a5e', marginLeft: '0.4rem' }}>{new Date(msg.timestamp).toLocaleTimeString()}</span>}
                </div>
                <div className={msg.type === 'ai-mod' ? 'ai-mod-message' : 'player-message'} style={{ fontSize: '0.82rem' }}>
                  {msg.message}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {isParticipant && battle.status === 'active' && isMyTurn && (
            <div style={{ padding: '0.6rem', borderTop: '1px solid #1e1e32' }}>
              {selectedCards.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.4rem' }}>
                  {selectedCards.map((c, i) => (
                    <span key={i} onClick={() => toggleCard(c)} style={{
                      padding: '0.15rem 0.4rem', borderRadius: '3px', fontSize: '0.65rem',
                      background: 'rgba(226,185,111,0.1)', border: '1px solid #e2b96f44',
                      color: '#e2b96f', cursor: 'pointer'
                    }}>{c.name} ✕</span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <textarea className="input" style={{ flex: 1, resize: 'none', height: '56px', fontSize: '0.82rem', fontFamily: 'Lato, sans-serif' }}
                  value={message} onChange={e => setMessage(e.target.value)}
                  placeholder={`${battle.phase?.toUpperCase()} — describe your action...`}
                  onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) sendAction(); }} />
                <button className="btn btn-gold" onClick={sendAction} disabled={sending} style={{ alignSelf: 'stretch', padding: '0 0.75rem' }}>
                  {sending ? <RefreshCw size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Send size={15} />}
                </button>
              </div>
            </div>
          )}

          {battle.status === 'completed' && (
            <div style={{ padding: '1rem', borderTop: '1px solid #1e1e32', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1rem', color: '#e2b96f', marginBottom: '0.4rem' }}>
                {battle.isDraw ? '⚖ DRAW!' : `🏆 ${battle.winner?.characterName || 'Winner'} WINS!`}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#5a5a7a', marginBottom: '0.75rem' }}>{battle.endReason}</div>
              <button className="btn btn-gold" onClick={() => navigate('/battle')}>Return to Arena</button>
            </div>
          )}
        </div>
      )}

      {/* DECK TAB */}
      {activeTab === 'deck' && isParticipant && (
        <div style={{ background: '#12121e', border: '1px solid #1e1e32', borderRadius: '8px', overflow: 'hidden' }}>

          {/* Private deck submission */}
          <div style={{ padding: '0.75rem', borderBottom: '1px solid #1e1e32', background: 'rgba(226,185,111,0.03)' }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', color: '#e2b96f', marginBottom: '0.5rem' }}>
              🔒 PRIVATE DECK SUBMISSION
            </div>

            {/* Submission status */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <div style={{ flex: 1, padding: '0.35rem 0.6rem', borderRadius: '4px', fontSize: '0.65rem', fontFamily: 'Cinzel, serif', textAlign: 'center',
                background: (myDeckSubmitted || deckSubmitted) ? 'rgba(39,174,96,0.1)' : 'rgba(90,90,122,0.1)',
                border: `1px solid ${(myDeckSubmitted || deckSubmitted) ? '#27ae6044' : '#1e1e32'}`,
                color: (myDeckSubmitted || deckSubmitted) ? '#27ae60' : '#5a5a7a'
              }}>
                You: {(myDeckSubmitted || deckSubmitted) ? '✓ Submitted' : 'Not submitted'}
              </div>
              <div style={{ flex: 1, padding: '0.35rem 0.6rem', borderRadius: '4px', fontSize: '0.65rem', fontFamily: 'Cinzel, serif', textAlign: 'center',
                background: oppDeckSubmitted ? 'rgba(39,174,96,0.1)' : 'rgba(90,90,122,0.1)',
                border: `1px solid ${oppDeckSubmitted ? '#27ae6044' : '#1e1e32'}`,
                color: oppDeckSubmitted ? '#27ae60' : '#5a5a7a'
              }}>
                Opponent: {oppDeckSubmitted ? '✓ Submitted' : 'Not yet'}
              </div>
            </div>

            {!(myDeckSubmitted || deckSubmitted) ? (
              <button
                className="btn btn-gold"
                onClick={handleSubmitDeck}
                disabled={submittingDeck}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Lock size={13} />
                {submittingDeck ? 'Submitting...' : 'Submit My Deck Privately'}
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', fontSize: '0.72rem', color: '#27ae60' }}>
                <CheckCircle size={13} />
                Deck submitted. Opponent cannot see your cards.
              </div>
            )}
          </div>

          {/* Card list */}
          <div style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid #1e1e32', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', color: '#e2b96f' }}>MY CARDS</span>
            {isMyTurn && <span style={{ fontSize: '0.65rem', color: '#27ae60' }}>● Your Turn — tap to select</span>}
          </div>
          <div style={{ padding: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '40vh', overflowY: 'auto' }}>
            {allMyCards.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#5a5a7a', padding: '2rem', fontSize: '0.8rem' }}>
                No cards. Build your deck first in the Deck Builder!
              </div>
            ) : allMyCards.map((card, i) => {
              const isSelected = selectedCards.find(c => c.name === card.name);
              return (
                <div key={i} onClick={() => isMyTurn && battle.status === 'active' && toggleCard(card)} style={{
                  padding: '0.5rem 0.65rem', borderRadius: '5px', cursor: isMyTurn ? 'pointer' : 'default',
                  background: isSelected ? 'rgba(226,185,111,0.1)' : '#0a0a12',
                  border: `1px solid ${isSelected ? '#e2b96f66' : '#1e1e32'}`,
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                  {card.class && (
                    <span style={{ fontSize: '0.6rem', fontFamily: 'Cinzel, serif', color: classColor[card.class] || '#5a5a7a', flexShrink: 0 }}>
                      [{card.class}]
                    </span>
                  )}
                  <span style={{ fontSize: '0.8rem', color: isSelected ? '#e2b96f' : '#e8e0d0', flex: 1 }}>
                    {card.name || 'Unnamed'}
                  </span>
                  <span style={{ fontSize: '0.6rem', color: '#3a3a5e' }}>{card.type}</span>
                </div>
              );
            })}
          </div>
          <div style={{ padding: '0.4rem 0.75rem', borderTop: '1px solid #1e1e32', fontSize: '0.62rem', color: '#5a5a7a', textAlign: 'center' }}>
            {selectedCards.length}/5 selected · go to LOG tab to submit action
          </div>
        </div>
      )}

      {/* TRAPS TAB */}
      {activeTab === 'traps' && isParticipant && (
        <div style={{ background: '#12121e', border: '1px solid #1e1e32', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', color: '#9b59b6' }}>🪤 PRIVATE TRAPS (max 3)</div>
          <div style={{ fontSize: '0.68rem', color: '#5a5a7a' }}>Submit before your first action. Opponent cannot see your traps.</div>
          {trapSlots.map((trap, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: '#5a5a7a', minWidth: '20px' }}>#{i + 1}</span>
              <input className="input" style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.78rem' }}
                placeholder={`Trap name...`}
                value={trap.name}
                onChange={e => {
                  const updated = [...trapSlots];
                  updated[i] = { ...updated[i], name: e.target.value };
                  setTrapSlots(updated);
                }}
              />
              <select className="input" style={{ width: '70px', padding: '0.35rem', fontSize: '0.75rem' }}
                value={trap.class}
                onChange={e => {
                  const updated = [...trapSlots];
                  updated[i] = { ...updated[i], class: e.target.value };
                  setTrapSlots(updated);
                }}>
                {['E','D','C','B','A','S','SS','SSS'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          ))}
          {trapsSubmitted ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', fontSize: '0.72rem', color: '#27ae60' }}>
              <CheckCircle size={13} /> Traps submitted. Update anytime before acting.
            </div>
          ) : null}
          <button className="btn btn-gold" onClick={handleSubmitTraps} disabled={submittingTraps || battle?.status !== 'active'}
            style={{ width: '100%', justifyContent: 'center' }}>
            <Lock size={13} />
            {submittingTraps ? 'Submitting...' : trapsSubmitted ? 'Update Traps' : 'Submit Traps Privately'}
          </button>
        </div>
      )}

      {/* TOOLS TAB */}
      {activeTab === 'tools' && (
        <div style={{ background: '#12121e', border: '1px solid #1e1e32', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', color: '#e2b96f' }}>MOD TOOLS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {[
              { type: 'compatibility', label: 'Compatibility Test', icon: Coins, desc: 'Coin toss for move compat' },
              { type: 'momentum', label: 'Momentum Dice', icon: Shuffle, desc: 'Roll every 3 turns' },
              { type: 'stalemate', label: 'Stalemate Numbers', icon: Shuffle, desc: 'Equal jutsu clash' },
              { type: 'speedGame', label: 'Speed Game', icon: Shuffle, desc: 'Attack-counter clash' },
            ].map(({ type, label, icon: Icon, desc }) => (
              <button key={type} className="btn btn-ghost btn-sm" onClick={() => handleSpin(type)}
                style={{ justifyContent: 'flex-start', width: '100%', flexDirection: 'column', alignItems: 'flex-start', height: 'auto', padding: '0.5rem 0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Icon size={13} />{label}</div>
                <div style={{ fontSize: '0.6rem', color: '#3a3a5e', marginTop: '2px' }}>{desc}</div>
              </button>
            ))}
          </div>
          <div className="gold-divider" />
          <div>
            <div style={{ fontSize: '0.65rem', color: '#5a5a7a', fontFamily: 'Cinzel, serif', marginBottom: '0.4rem' }}>HIT VALUES</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.2rem' }}>
              {[['E','10'],['D','20'],['C','30'],['B','40'],['A','50'],['S','60'],['SS','70'],['SSS','80']].map(([cls, val]) => (
                <div key={cls} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', padding: '0.2rem 0.4rem', background: '#0a0a12', borderRadius: '3px' }}>
                  <span style={{ color: classColor[cls], fontFamily: 'Cinzel, serif' }}>{cls}</span>
                  <span style={{ color: '#9090a8' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="gold-divider" />
          <div>
            <div style={{ fontSize: '0.65rem', color: '#5a5a7a', fontFamily: 'Cinzel, serif', marginBottom: '0.3rem' }}>ACTIVE TRAPS</div>
            {battle.activeTraps?.length > 0
              ? battle.activeTraps.map((t, i) => <div key={i} style={{ fontSize: '0.72rem', color: '#9b59b6' }}>⚠ {t.trapName}</div>)
              : <div style={{ fontSize: '0.7rem', color: '#3a3a5e' }}>None</div>
            }
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#5a5a7a', fontFamily: 'Cinzel, serif', marginBottom: '0.3rem' }}>COOLDOWNS</div>
            {battle.activeCooldowns?.length > 0
              ? battle.activeCooldowns.map((c, i) => <div key={i} style={{ fontSize: '0.7rem', color: '#e74c3c' }}>🕐 {c.moveName} until T{c.resumesOnTurn}</div>)
              : <div style={{ fontSize: '0.7rem', color: '#3a3a5e' }}>None</div>
            }
          </div>
        </div>
      )}
    </div>
  );
}
