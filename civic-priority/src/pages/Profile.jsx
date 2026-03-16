import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useIssues } from '../context/IssuesContext.jsx';
import { calcPriority, formatDate } from '../utils/scoring.js';
import IssueCard, { ScoreRing, PriorityBadge, StatusBadge } from '../components/IssueCard.jsx';
import styles from './Profile.module.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const { issues } = useIssues();
  const navigate = useNavigate();

  if (!user) {
    navigate('/auth');
    return null;
  }

  const myIssues  = useMemo(() => issues.filter(i => i.reporterId === user.id), [issues, user]);
  const myVotes   = useMemo(() => issues.filter(i => i.votes?.includes(user.id)), [issues, user]);
  const votesImpact = useMemo(() =>
    myVotes.reduce((s,i) => s + Math.min(Math.round((i.votes?.length??0) * 0.5), 15), 0),
    [myVotes]
  );

  return (
    <div className={`${styles.page} fade-in`}>
      {/* Profile header */}
      <div className={styles.profileCard}>
        <div className={styles.avatarLg}>{user.avatar}</div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{user.name}</div>
          <div className={styles.userEmail}>{user.email}</div>
          <div className={styles.userMeta}>
            <span className={`${styles.rolePill} ${user.role==='admin'?styles.admin:styles.member}`}>{user.role}</span>
            <span className={styles.joinedText}>Member since {user.joined}</span>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/auth'); }}>
          Sign Out
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <div className={styles.statVal} style={{ color:'var(--accent)' }}>{myIssues.length}</div>
          <div className={styles.statLabel}>Issues Reported</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statVal} style={{ color:'var(--blue)' }}>{myVotes.length}</div>
          <div className={styles.statLabel}>Votes Cast</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statVal} style={{ color:'var(--green)' }}>{myIssues.filter(i=>i.status==='resolved').length}</div>
          <div className={styles.statLabel}>Issues Resolved</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statVal} style={{ color:'var(--gold)' }}>{votesImpact}</div>
          <div className={styles.statLabel}>Priority Points Contributed</div>
        </div>
      </div>

      <div className={styles.grid2}>
        {/* My Reports */}
        <div>
          <div className={styles.sectionHead}>Issues I've Reported ({myIssues.length})</div>
          {myIssues.length === 0 ? (
            <div className={styles.empty}>You haven't reported any issues yet.</div>
          ) : (
            <div className={styles.cardList}>
              {myIssues.map(i => <IssueCard key={i.id} issue={i} compact />)}
            </div>
          )}
        </div>

        {/* Votes cast */}
        <div>
          <div className={styles.sectionHead}>Issues I've Voted On ({myVotes.length})</div>
          {myVotes.length === 0 ? (
            <div className={styles.empty}>You haven't voted on any issues yet. Browse the issue registry to cast votes!</div>
          ) : (
            <div className={styles.cardList}>
              {myVotes.map(i => <IssueCard key={i.id} issue={i} compact />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
