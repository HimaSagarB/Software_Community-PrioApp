import { useMemo } from 'react';
import { useIssues } from '../context/IssuesContext.jsx';
import { calcPriority, getLevel, LEVEL_META, formatDate } from '../utils/scoring.js';
import { ScoreRing, PriorityBadge, StatusBadge } from '../components/IssueCard.jsx';
import { SEVERITY_LABELS } from '../data/seed.js';
import styles from './Ranking.module.css';

export default function Ranking() {
  const { issues } = useIssues();
  const ranked = useMemo(() =>
    issues.map(i=>({...i,score:calcPriority(i)})).sort((a,b)=>b.score-a.score),
    [issues]
  );

  return (
    <div className={`${styles.page} fade-in`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Priority Ranking</h1>
        <p className={styles.sub}>All {issues.length} issues ranked by computed priority score — fully transparent, no black-box logic</p>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Score</th>
              <th>Issue</th>
              <th>Level</th>
              <th>Severity</th>
              <th>Affected</th>
              <th>Votes</th>
              <th>Category</th>
              <th>Location</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((issue, idx) => (
              <tr key={issue.id} className={styles.row}>
                <td>
                  <span className={styles.rank}
                    style={{ color: idx < 3 ? 'var(--accent)' : 'var(--muted)' }}>
                    #{idx + 1}
                  </span>
                </td>
                <td><ScoreRing score={issue.score} size={44} /></td>
                <td className={styles.titleCell}>
                  <div className={styles.issueTitle}>{issue.title}</div>
                  <div className={styles.reporter}>by {issue.reporter}</div>
                </td>
                <td><PriorityBadge score={issue.score} /></td>
                <td>
                  <div className={styles.severity}>{issue.severity}/5</div>
                  <div className={styles.sevLabel}>{SEVERITY_LABELS[issue.severity]}</div>
                </td>
                <td><span className={styles.mono}>{issue.affectedPeople.toLocaleString()}</span></td>
                <td>
                  <span className={styles.votes}>▲ {issue.votes?.length ?? 0}</span>
                </td>
                <td><span className={styles.cat}>{issue.category}</span></td>
                <td><span className={styles.loc}>{issue.locationType}</span></td>
                <td><StatusBadge status={issue.status} /></td>
                <td><span className={styles.date}>{formatDate(issue.createdAt)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
