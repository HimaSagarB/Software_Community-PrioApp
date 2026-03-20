import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useIssues } from '../context/IssuesContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { calcPriority, getLevel, LEVEL_META, WEIGHTS } from '../utils/scoring.js';
import { ScoreRing, PriorityBadge, StatusBadge } from '../components/IssueCard.jsx';
import s from './Dashboard.module.css';

const LEVELS = ['critical','high','medium','low'];
const LCOLORS = { critical:'var(--accent)', high:'var(--warn)', medium:'var(--gold)', low:'var(--green)' };

export default function Dashboard() {
  const { issues } = useIssues();
  const { user, canReport } = useAuth();

  const d = useMemo(() => {
    const scored = issues.map(i => ({ ...i, _score: calcPriority(i) }));
    const lmap = {}; LEVELS.forEach(l => lmap[l]=0);
    scored.forEach(i => lmap[getLevel(i._score)]++);
    const catMap = {};
    issues.forEach(i => { catMap[i.category] = (catMap[i.category]||0)+1; });
    return {
      total:  issues.length,
      open:   issues.filter(i=>i.status==='open').length,
      inp:    issues.filter(i=>i.status==='inprogress').length,
      res:    issues.filter(i=>i.status==='resolved').length,
      avg:    scored.length ? Math.round(scored.reduce((a,i)=>a+i._score,0)/scored.length) : 0,
      votes:  issues.reduce((a,i)=>a+(i.votes?.length??0),0),
      top:    [...scored].sort((a,b)=>b._score-a._score).slice(0,5),
      lmap, cats: Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,6),
    };
  }, [issues]);

  return (
    <div className={`${s.page} fade-in`}>
      <div className={s.hdr}>
        <div>
          <h1 className={s.title}>Community Dashboard</h1>
          <p className={s.sub}>Live overview · SRS-compliant weighted scoring · {d.total} issues tracked</p>
        </div>
        {canReport && <Link to="/report" className={s.reportBtn}>＋ Report Issue</Link>}
      </div>

      <div className={s.stats}>
        {[
          { label:'Total Issues',    val:d.total, color:'var(--ink)',    sub:`${d.open} open` },
          { label:'In Progress',     val:d.inp,   color:'var(--warn)',   sub:'being resolved' },
          { label:'Resolved',        val:d.res,   color:'var(--green)',  sub:'successfully closed' },
          { label:'Avg Priority',    val:d.avg,   color:d.avg>=60?'var(--accent)':d.avg>=40?'var(--warn)':'var(--green)', sub:'weighted score /100' },
          { label:'Community Votes', val:d.votes, color:'var(--blue)',   sub:'total cast' },
        ].map(st => (
          <div key={st.label} className={s.stat}>
            <div className={s.statL}>{st.label}</div>
            <div className={s.statV} style={{color:st.color}}>{st.val}</div>
            <div className={s.statS}>{st.sub}</div>
          </div>
        ))}
      </div>

      <div className={s.grid2}>
        <div className={s.card}>
          <div className={s.cardHd}>Priority Level Distribution</div>
          {LEVELS.map(l => {
            const cnt = d.lmap[l], pct = d.total ? (cnt/d.total)*100 : 0;
            return (
              <div key={l} className={s.lvlRow}>
                <div className={s.lvlInfo}>
                  <span className={s.lvlDot} style={{background:LCOLORS[l]}}/>
                  <span className={s.lvlName}>{LEVEL_META[l].label}</span>
                  <span className={s.lvlCnt}>{cnt}</span>
                </div>
                <div className={s.bar}><div className={s.barFill} style={{width:`${pct}%`,background:LCOLORS[l]}}/></div>
              </div>
            );
          })}
        </div>

        <div className={s.card}>
          <div className={s.cardHd}>Issues by Category</div>
          {d.cats.map(([cat,cnt]) => (
            <div key={cat} className={s.catRow}>
              <span className={s.catName}>{cat}</span>
              <div className={s.catRight}>
                <div className={s.bar} style={{width:'110px'}}><div className={s.barFill} style={{width:`${(cnt/d.total)*100}%`,background:'var(--blue)'}}/></div>
                <span className={s.catCnt}>{cnt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={s.card} style={{marginTop:'1.5rem'}}>
        <div className={s.cardHd} style={{display:'flex',justifyContent:'space-between'}}>
          <span>Top Priority Issues</span>
          <Link to="/issues" className={s.viewAll}>View all →</Link>
        </div>
        {d.top.map((issue,idx) => (
          <div key={issue.id} className={s.topRow}>
            <span className={s.rank} style={{color:idx<3?'var(--accent)':'var(--muted)'}}>#{idx+1}</span>
            <ScoreRing score={issue._score} size={42}/>
            <div className={s.topMeta}>
              <div className={s.topTitle}>{issue.title}</div>
              <div className={s.topBadges}>
                <PriorityBadge score={issue._score}/>
                <StatusBadge status={issue.status}/>
                <span className={s.topVotes}>▲ {issue.votes?.length??0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={s.formula}>
        <div className={s.fmlLabel}>SRS-Compliant Priority Formula — Normalized Weights (w1+w2+w3+w4 = 1.0)</div>
        <div className={s.fmlEq}>
          <span className={s.fVar}>BaseScore</span>
          <span className={s.fOp}> = </span>
          (<span className={s.fVar}>w1</span>={WEIGHTS.w1}×Severity_norm
          <span className={s.fOp}> + </span>
          <span className={s.fVar}>w2</span>={WEIGHTS.w2}×People_norm
          <span className={s.fOp}> + </span>
          <span className={s.fVar}>w3</span>={WEIGHTS.w3}×TimePending_norm
          <span className={s.fOp}> + </span>
          <span className={s.fVar}>w4</span>={WEIGHTS.w4}×LocationSensitivity) × 100
          <span className={s.fOp}> + </span>
          CategoryBonus
        </div>
        <div className={s.fmlEq} style={{marginTop:'0.4rem'}}>
          <span className={s.fVar}>FinalScore</span>
          <span className={s.fOp}> = </span>
          BaseScore <span className={s.fOp}>+</span> VoteScore &nbsp;·&nbsp;
          VoteScore = min(votes × 0.5, 8) &nbsp;·&nbsp; FinalScore capped at 100
        </div>
        <div className={s.fmlNote}>
          TimePending: progressive √(days)/√(365), capped at 1.0 — older unresolved issues gain urgency · Tie-breaking: Severity → PeopleAffected → TimePending
        </div>
      </div>
    </div>
  );
}
