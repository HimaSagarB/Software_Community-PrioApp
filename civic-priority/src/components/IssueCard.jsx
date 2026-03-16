import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useIssues } from '../../context/IssuesContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { calcPriority, getLevel, LEVEL_META, formatDate } from '../../utils/scoring.js';
import styles from './IssueCard.module.css';

export function ScoreRing({ score, size = 56 }) {
  const meta = LEVEL_META[getLevel(score)];
  return (
    <div className={styles.ring} style={{
      width: size, height: size,
      borderColor: meta.border,
      color: meta.color,
      background: meta.bg,
      fontSize: size < 46 ? '0.75rem' : '1rem',
    }}>{score}</div>
  );
}

export function PriorityBadge({ score }) {
  const level = getLevel(score);
  const meta = LEVEL_META[level];
  return (
    <span className={styles.badge} style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}>
      {meta.label}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    open:       { label:'Open',        cls: styles.sOpen       },
    inprogress: { label:'In Progress', cls: styles.sInprogress },
    resolved:   { label:'Resolved',    cls: styles.sResolved   },
  };
  const m = map[status] ?? map.open;
  return <span className={`${styles.statusBadge} ${m.cls}`}>{m.label}</span>;
}

export default function IssueCard({ issue, showStatus = true, compact = false }) {
  const { user } = useAuth();
  const { toggleVote, updateStatus } = useIssues();
  const { show } = useToast();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const score    = calcPriority(issue);
  const votes    = issue.votes ?? [];
  const hasVoted = user ? votes.includes(user.id) : false;

  const handleVote = () => {
    if (!user) { show('Please sign in to vote on issues.', 'error'); navigate('/auth'); return; }
    toggleVote(issue.id, user.id);
    show(hasVoted ? 'Vote removed.' : '▲ Your vote has been counted!');
  };

  const truncDesc = issue.description.length > 110 && !expanded
    ? issue.description.slice(0, 110) + '…'
    : issue.description;

  return (
    <div className={`${styles.card} ${compact ? styles.compact : ''} fade-in`}>
      <div className={styles.top}>
        <ScoreRing score={score} size={compact ? 44 : 54} />
        <div className={styles.meta}>
          <div className={styles.title}>{issue.title}</div>
          {!compact && (
            <div className={styles.desc}>
              {truncDesc}
              {issue.description.length > 110 && (
                <button className={styles.expandBtn} onClick={() => setExpanded(e => !e)}>
                  {expanded ? ' less' : ' more'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.pills}>
        {[
          `📁 ${issue.category}`,
          `📍 ${issue.locationType}`,
          `👥 ${issue.affectedPeople.toLocaleString()} affected`,
          `⚠️ Severity ${issue.severity}/5`,
          ...(!compact ? [`📅 ${formatDate(issue.createdAt)}`, `👤 ${issue.reporter}`] : []),
          ...(issue.comments?.length ? [`💬 ${issue.comments.length}`] : []),
        ].map(t => <span key={t} className={styles.pill}>{t}</span>)}
      </div>

      <div className={styles.footer}>
        <div className={styles.badges}>
          <PriorityBadge score={score} />
          <StatusBadge status={issue.status} />
        </div>

        <div className={styles.actions}>
          {/* Vote button */}
          <button
            className={`${styles.voteBtn} ${hasVoted ? styles.voted : ''}`}
            onClick={handleVote}
            title={!user ? 'Sign in to vote' : hasVoted ? 'Remove your vote' : 'Vote to prioritize this issue'}
          >
            <span>▲</span>
            <span className={styles.voteCount}>{votes.length}</span>
            <span className={styles.voteLabel}>
              {!user ? 'sign in' : hasVoted ? 'voted' : 'vote'}
            </span>
          </button>

          {/* Admin: status control */}
          {showStatus && user?.role === 'admin' && (
            <select
              className={styles.statusSel}
              value={issue.status}
              onChange={e => { updateStatus(issue.id, e.target.value); show('Status updated.'); }}
            >
              <option value="open">Open</option>
              <option value="inprogress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          )}
        </div>
      </div>
    </div>
  );
}
