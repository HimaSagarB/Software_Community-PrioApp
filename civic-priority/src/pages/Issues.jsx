import { useState, useMemo } from 'react';
import { useIssues } from '../context/IssuesContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { filterIssues, sortIssues } from '../utils/scoring.js';
import { CATEGORIES } from '../data/seed.js';
import IssueCard from '../components/IssueCard.jsx';
import styles from './Issues.module.css';

export default function Issues() {
  const { issues } = useIssues();
  const { user } = useAuth();
  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('all');
  const [level,    setLevel]    = useState('all');
  const [category, setCategory] = useState('all');
  const [sortBy,   setSortBy]   = useState('score');

  const filtered = useMemo(() =>
    sortIssues(filterIssues(issues, { status, level, category, search }), sortBy),
    [issues, search, status, level, category, sortBy]
  );

  const hasF = search || status!=='all' || level!=='all' || category!=='all';

  return (
    <div className={`${styles.page} fade-in`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Issue Registry</h1>
          <p className={styles.sub}>{filtered.length} of {issues.length} issues · vote to boost priority scores</p>
        </div>
        {!user && (
          <div className={styles.loginNudge}>
            <span>🔒 Sign in to cast votes</span>
          </div>
        )}
      </div>

      <div className={styles.filterBar}>
        <input className={styles.search} placeholder="Search issues, categories, reporters…"
          value={search} onChange={e=>setSearch(e.target.value)} />
        <select className={styles.sel} value={status}   onChange={e=>setStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="inprogress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <select className={styles.sel} value={level}    onChange={e=>setLevel(e.target.value)}>
          <option value="all">All Levels</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className={styles.sel} value={category} onChange={e=>setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select className={styles.sel} value={sortBy}   onChange={e=>setSortBy(e.target.value)}>
          <option value="score">↓ Priority Score</option>
          <option value="votes">↓ Most Voted</option>
          <option value="newest">↓ Newest</option>
          <option value="oldest">↓ Oldest</option>
          <option value="affected">↓ Most Affected</option>
        </select>
        {hasF && <button className={styles.clearBtn} onClick={()=>{setSearch('');setStatus('all');setLevel('all');setCategory('all');}}>✕ Clear</button>}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🔍</div>
          <div className={styles.emptyText}>No issues match your filters.</div>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map(i=><IssueCard key={i.id} issue={i} />)}
        </div>
      )}
    </div>
  );
}
