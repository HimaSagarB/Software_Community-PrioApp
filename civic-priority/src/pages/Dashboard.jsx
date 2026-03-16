import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useIssues } from '../context/IssuesContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { calcPriority, getLevel, LEVEL_META } from '../utils/scoring.js';
import { CATEGORY_BONUS, LOCATION_BONUS } from '../data/seed.js';
import IssueCard, { ScoreRing, PriorityBadge, StatusBadge } from '../components/IssueCard.jsx';
import styles from './Dashboard.module.css';

const LEVELS = ['critical','high','medium','low'];
const LEVEL_COLORS = { critical:'var(--accent)', high:'var(--warn)', medium:'var(--gold)', low:'var(--green)' };

export default function Dashboard() {
  const { issues } = useIssues();
  const { user } = useAuth();

  const d = useMemo(() => {
    const scored = issues.map(i => ({ ...i, score: calcPriority(i) }));
    const open   = issues.filter(i=>i.status==='open').length;
    const inp    = issues.filter(i=>i.status==='inprogress').length;
    const res    = issues.filter(i=>i.status==='resolved').length;
    const avg    = scored.length ? Math.round(scored.reduce((s,i)=>s+i.score,0)/scored.length) : 0;
    const votes  = issues.reduce((s,i)=>s+(i.votes?.length??0),0);
    const top    = [...scored].sort((a,b)=>b.score-a.score).slice(0,5);
    const levelMap = {};
    LEVELS.forEach(l=>levelMap[l]=0);
    scored.forEach(i=>levelMap[getLevel(i.score)]++);
    const catMap = {};
    issues.forEach(i=>{ catMap[i.category]=(catMap[i.category]||0)+1; });
    const cats = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,6);
    return { open, inp, res, avg, votes, top, levelMap, cats, total: issues.length };
  }, [issues]);

  return (
    <div className={`${styles.page} fade-in`}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Community Dashboard</h1>
          <p className={styles.sub}>Live overview · transparent priority scoring · {d.total} issues tracked</p>
        </div>
        {user && (
          <Link to="/report" className={styles.reportBtn}>＋ Report Issue</Link>
        )}
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {[
          { label:'Total Issues',    value: d.total,  color:'var(--ink)',    sub:`${d.open} open` },
          { label:'In Progress',     value: d.inp,    color:'var(--warn)',   sub:'being resolved' },
          { label:'Resolved',        value: d.res,    color:'var(--green)',  sub:'closed issues' },
          { label:'Avg Priority',    value: d.avg,    color: d.avg>=60 ? 'var(--accent)' : d.avg>=40 ? 'var(--warn)' : 'var(--green)', sub:'rule-based score' },
          { label:'Community Votes', value: d.votes,  color:'var(--blue)',   sub:'total cast' },
        ].map(s => (
          <div key={s.label} className={styles.stat}>
            <div className={styles.statLabel}>{s.label}</div>
            <div className={styles.statVal} style={{ color: s.color }}>{s.value}</div>
            <div className={styles.statSub}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className={styles.grid2}>
        {/* Priority distribution */}
        <div className={styles.card}>
          <div className={styles.cardHead}>Issues by Priority Level</div>
          <div className={styles.levelList}>
            {LEVELS.map(l => {
              const count = d.levelMap[l];
              const pct   = d.total ? (count/d.total)*100 : 0;
              return (
                <div key={l} className={styles.levelRow}>
                  <div className={styles.levelInfo}>
                    <span className={styles.levelDot} style={{ background: LEVEL_COLORS[l] }} />
                    <span className={styles.levelName}>{LEVEL_META[l].label}</span>
                    <span className={styles.levelCount}>{count}</span>
                  </div>
                  <div className={styles.bar}><div className={styles.barFill} style={{ width:`${pct}%`, background: LEVEL_COLORS[l] }} /></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category breakdown */}
        <div className={styles.card}>
          <div className={styles.cardHead}>Issues by Category</div>
          <div className={styles.catList}>
            {d.cats.map(([cat, count]) => (
              <div key={cat} className={styles.catRow}>
                <span className={styles.catName}>{cat}</span>
                <div className={styles.catRight}>
                  <div className={styles.bar} style={{ width:'120px' }}>
                    <div className={styles.barFill} style={{ width:`${(count/d.total)*100}%`, background:'var(--blue)' }} />
                  </div>
                  <span className={styles.catCount}>{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top issues */}
      <div className={styles.card} style={{ marginTop:'1.5rem' }}>
        <div className={styles.cardHead} style={{ display:'flex', justifyContent:'space-between' }}>
          <span>Top Priority Issues</span>
          <Link to="/issues" className={styles.viewAll}>View all →</Link>
        </div>
        <div className={styles.topList}>
          {d.top.map((issue, idx) => (
            <div key={issue.id} className={styles.topRow}>
              <span className={styles.rank}>#{idx+1}</span>
              <ScoreRing score={issue.score} size={42} />
              <div className={styles.topInfo}>
                <div className={styles.topTitle}>{issue.title}</div>
                <div className={styles.topMeta}>
                  <PriorityBadge score={issue.score} />
                  <StatusBadge status={issue.status} />
                  <span className={styles.topVotes}>▲ {issue.votes?.length ?? 0} votes</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formula */}
      <div className={styles.formula}>
        <div className={styles.formulaLabel}>Transparent Rule-Based Priority Formula — No ML Black Box</div>
        <div className={styles.formulaEq}>
          <span className={styles.fVar}>Score</span>
          <span className={styles.fOp}> = </span>
          (Severity × 20)
          <span className={styles.fOp}> + </span>
          min(AffectedPeople ÷ 10, 30)
          <span className={styles.fOp}> + </span>
          LocationBonus
          <span className={styles.fOp}> + </span>
          CategoryBonus
          <span className={styles.fOp}> + </span>
          min(Votes × 0.5, 15)
        </div>
        <div className={styles.formulaNotes}>
          Location: Hospital Zone=15 · School Zone=12 · Highway=10 · Residential=6 · Commercial=5&nbsp;&nbsp;|&nbsp;&nbsp;
          Category: Public Safety=15 · Healthcare=12 · Infrastructure=10 · Utilities=8 · Environment/Sanitation=6&nbsp;&nbsp;|&nbsp;&nbsp;
          Score capped at 100
        </div>
      </div>
    </div>
  );
}
