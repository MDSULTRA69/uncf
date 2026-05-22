import React, { useEffect, useState } from 'react';
import { getRules } from '../utils/api';
import { BookOpen, Search } from 'lucide-react';

const BUILTIN_RULES = [
  { section: 'Overview', title: 'What is UNC?', content: 'UNC (Ultimate Ninja Championship) is a 2D chat-based role-playing game inspired by Naruto. Players choose their ninja way, grow through ranks, and battle others for supremacy. Points system: Win = 3pts, Draw = 1pt, Loss = 0pts.' },
  { section: 'Battle', title: 'Turn Structure', content: 'Battles are turn-based. P1 attacks → P2 responds (defense turn) → P2 attacks → P1 responds. If a player skips/uses traps instead, opponent goes next. Max 10 turns per official match, 5-10 for sparring.' },
  { section: 'Battle', title: 'Time Limits', content: 'Attack phase: 10 minutes. Response phase: 10 minutes. 2fa/Trap phase: 5 minutes. Counter-trap phase: 5 minutes.' },
  { section: 'Battle', title: 'Cards Per Turn', content: 'Maximum 5 active cards per turn. Cards used: Ninjutsu/Genjutsu, Skills, Weapons, KKG, and Basic Essentials all count toward this limit.' },
  { section: 'Battle', title: 'Hit Values', content: 'E Class = 10 HP | D Class = 20 HP | C Class = 30 HP | B Class = 40 HP | A Class = 50 HP | S Class = 60 HP | SS Class = 70 HP | SSS Class = 80 HP. Against Armor/Prime: S=10, SS=20, SSS=30. Moves below S have no effect on Prime/Armored beings.' },
  { section: 'Battle', title: 'Win Condition', content: 'The player who deals more total damage wins when turn limit is reached. A player can also win by reducing opponent to 0 HP (K.O.) before turn limit. If both reach 0 HP simultaneously, it is a draw.' },
  { section: 'Battle', title: 'Forfeit / Runaway', content: 'A player can attempt to run away using a coin toss. Success = escape, but -3 points. Failure = stay in battle. A full forfeit costs 3 points and gives the opponent a win.' },
  { section: 'Moves', title: 'Compatibility', content: 'Ninjutsu and Genjutsu require a compatibility test (coin toss) before use. KKG is always auto-compatible — no test needed. Basic Taijutsu is auto-compatible; Advanced Taijutsu requires a test. Kenjutsu requires a test.' },
  { section: 'Moves', title: 'Cooldowns by Rank', content: 'Rookie: E-class has no cooldown. Genin: D-class = 1 turn. Chunin: C-class = 1 turn. Jounin: B-class = 1 turn. Kage: A-class = 1 turn. Sage: S-class = 1 turn. God: SS-class = 1 turn.' },
  { section: 'Moves', title: 'Genjutsu Rules', content: 'Genjutsu takes 1 turn to activate. Opponent needs 1 turn to break out using Genjutsu Kai of equal or higher rank. Clones must also break out unless the clone owner is not under it.' },
  { section: 'Moves', title: 'Combo Attacks', content: 'Maximum 2 moves can be chained in a combo. Combos can be broken via speed test. Tag combos: multiple users chain attacks. The first attack must land for the chain to continue.' },
  { section: 'Counters', title: 'Counter Types', content: 'Attack-Counter: Same class/rank attacks clash → speed game (pick 1 of 3 numbers). Defense-Counter: Attack vs defense of same class/rank → total counter. Instinct Counter: Speed attack → opponent picks 1 of 3 numbers to react. Stalemate: Equal jutsu clash → 3 numbers, wrong picker takes 10% damage. 2fa-Counter: Discard instinct counter or trap move.' },
  { section: 'Deck', title: 'Deck Structure', content: 'Max 25 cards total: 10 Ninjutsu/Genjutsu slots, 10 Skill slots, 1 Weapon Bag (holds up to 12 weapons, counts as 1 card), 1 KKG Card, 1 Basic Essentials Card, 1 Tailed Beast Card, 1 Summoning Beast Card.' },
  { section: 'Deck', title: 'Traps', content: 'Max 3 traps active at a time. You can only change your set traps on your next turn. Traps trigger automatically when conditions are met.' },
  { section: 'Deck', title: 'Basic Essentials (B.E.)', content: 'B.E. usage limit per battle by rank: Genin=3, Chunin=4, Jounin=5, Kage=6, Sage=7, God=8. After reaching the limit, player must rest for 3 turns before using B.E. again.' },
  { section: 'Skills', title: 'Skill Types', content: 'Pure: Unlimited use. Pure-Mech: Limited use with specific trigger. Mechanical: Single-use. Bonus: Auto-on, always active. Special: Unique effects. Skills require 60 charges to unlock (earned via 50-hit farming missions).' },
  { section: 'Ranks', title: 'Rank Requirements', content: 'Rookie → Genin: 5,000 XP | Genin → Chunin: 25,000 XP | Chunin → Jounin: 100,000 XP | Jounin → Kage: 250,000 XP | Kage → Sage: 1,250,000 XP | Sage → God: 5,000,000 XP. Each rank-up requires a Rank-Up Gem.' },
  { section: 'Currency', title: 'Currency Types', content: 'XP: Used to rank up. XC (X-Coins): Used to buy moves and items. Mod Coins (MC): Earned by moderating battles. Gold: Village-level currency (1 Gold = 2,000 XC). All players earn 2 Mod Coins per battle completed.' },
  { section: 'Currency', title: 'XP & XC Rewards', content: 'Win reward XP scales with rank. Genin win = 500XP/2,500XC. Chunin = 1,000XP/5,000XC. Jounin = 2,500XP/12,500XC. Kage = 5,000XP/25,000XC. Sage = 25,000XP/125,000XC. Loss earns half values. Draw earns quarter values.' },
  { section: 'Power Levels', title: 'Power Level System', content: 'Three power tiers: Normal → Armor/Prime → Divine. Each level can use moves one level above it. Moves below S class have no effect on Armor/Prime beings. Divine beings are nearly invulnerable to low-class attacks.' },
  { section: 'Momentum', title: 'Momentum Dice', content: 'Every 3 turns, a momentum dice roll occurs. The result temporarily affects auto-on moves and KKG rank/power for that period. This adds a random element to extended battles.' },
  { section: 'Events', title: 'Event Types', content: 'Entertainment Weekend: Casual fun events. War Event: Village vs Village battles. Story Event: Narrative-driven missions. Death Match: High-stakes with special death rules. Graduation Exams: Rank-up test battles.' },
];

export default function Rulebook() {
  const [dbRules, setDbRules] = useState([]);
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState('All');
  const [expandedRule, setExpandedRule] = useState(null);

  useEffect(() => {
    getRules().then(r => setDbRules(r.data.rules || [])).catch(() => {});
  }, []);

  const allRules = [...BUILTIN_RULES, ...dbRules];
  const sections = ['All', ...new Set(allRules.map(r => r.section))];

  const filtered = allRules.filter(r => {
    const matchSection = activeSection === 'All' || r.section === activeSection;
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.content.toLowerCase().includes(search.toLowerCase());
    return matchSection && matchSearch;
  });

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1.4rem', color: '#e2b96f', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={22} /> UNC Rulebook
        </h1>
        <p style={{ color: '#5a5a7a', fontSize: '0.8rem', marginTop: '0.25rem' }}>v6.0 · Official Game Rules & Mechanics</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <Search size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#5a5a7a' }} />
        <input className="input" style={{ paddingLeft: '2.5rem' }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rules..." />
      </div>

      {/* Section tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
        {sections.map(s => (
          <button key={s} onClick={() => setActiveSection(s)} className={`btn btn-sm ${activeSection === s ? 'btn-gold' : 'btn-ghost'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Rules */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filtered.map((rule, i) => {
          const key = `${rule.section}-${rule.title}-${i}`;
          const isExpanded = expandedRule === key;
          return (
            <div key={key} className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setExpandedRule(isExpanded ? null : key)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="badge badge-gold" style={{ fontSize: '0.6rem' }}>{rule.section}</span>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.85rem', color: '#e8e0d0' }}>{rule.title}</span>
                </div>
                <span style={{ color: '#5a5a7a', fontSize: '1rem', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>▾</span>
              </div>
              {isExpanded && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #1e1e32', fontSize: '0.88rem', color: '#c0b8a8', lineHeight: '1.7' }}>
                  {rule.content}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#5a5a7a', padding: '3rem', fontSize: '0.85rem' }}>
            No rules found matching your search
          </div>
        )}
      </div>
    </div>
  );
}
