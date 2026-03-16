import { useState } from 'react';
import { useIssues } from '../context/IssuesContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { runOptimizer, calcPriority } from '../utils/scoring.js';
import { RESOURCE_CONFIG } from '../data/seed.js';
import { ScoreRing, PriorityBadge, StatusBadge } from '../components/IssueCard.jsx';
import styles from './Optimizer.module.css';

const initResources = { workers: 20, vehicles: 8, equipment: 4, budget: 500 };

export default function Optimizer() {
  const { issues } = useIssues();
  const { user } = useAuth();
  const [resources, setResources] = useState(initResources);
  const [result, setResult] = useState(null);

  const set = (k, v) => setResources(r => ({ ...r, [k]: Math.max(0, parseInt(v) || 0) }));
  const run = () => setResult(runOptimizer(issues, resources));

  return (
    <div className={`${styles.page} fade-in`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Resource Optimizer</h1>
        <p className={styles.sub}>Configure available resources and generate a priority-based allocation plan — replacing FIFO with impact-first scheduling</p>
      </div>

      <div className={styles.layout}>
        {/* Config panel */}
        <div>
          <div className={styles.card}>
            <div className={styles.cardHead}>Available Resources</div>
            {RESOURCE_CONFIG.map(r => (
              <div key={r.id} className={styles.resItem}>
                <div className={styles.resTop}>
                  <span className={styles.resIcon}>{r.icon}</span>
                  <span className={styles.resName}>{r.name}</span>
                  <span className={styles.resVal}>{resources[r.id]} / {r.total} {r.unit}</span>
                </div>
                <input type="range" min="0" max={r.total} value={resources[r.id]}
                  onChange={e => set(r.id, e.target.value)}
                  className={styles.range} style={{ accentColor:'var(--blue)' }} />
                <div className={styles.resBar}>
                  <div className={styles.resBarFill} style={{ width:`${(resources[r.id]/r.total)*100}%` }} />
                </div>
              </div>
            ))}
            <button className={styles.runBtn} onClick={run}>
              ⚡ Run Optimizer
            </button>
          </div>

          <div className={styles.card} style={{ marginTop:'1rem' }}>
            <div className={styles.cardHead}>Algorithm</div>
            <div className={styles.algo}>
              <div className={styles.algoTitle}>Priority-Based Greedy Algorithm</div>
              <ol className={styles.algoSteps}>
                <li>Filter: open + in-progress issues only</li>
                <li>Sort descending by priority score</li>
                <li>For each issue (highest → lowest):
                  <ul>
                    <li>Check if required resources fit in budget</li>
                    <li>If yes → allocate, add to plan</li>
                    <li>If no → defer with reason</li>
                  </ul>
                </li>
                <li>Output: ranked resolution plan</li>
              </ol>
              <div className={styles.algoNote}>Replaces FIFO — critical issues served first regardless of submission order.</div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          {!result ? (
            <div className={styles.emptyResult}>
              <div className={styles.emptyIcon}>⚡</div>
              <div className={styles.emptyText}>Configure resources above and click <strong>Run Optimizer</strong> to generate an allocation plan.</div>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className={styles.summary}>
                <div className={styles.summStat}>
                  <div className={styles.summVal} style={{ color:'var(--green)' }}>{result.scheduled.length}</div>
                  <div className={styles.summLabel}>Scheduled</div>
                </div>
                <div className={styles.summStat}>
                  <div className={styles.summVal} style={{ color:'var(--accent)' }}>{result.deferred.length}</div>
                  <div className={styles.summLabel}>Deferred</div>
                </div>
                <div className={styles.summStat}>
                  <div className={styles.summVal}>{result.remaining.workers}</div>
                  <div className={styles.summLabel}>Workers Left</div>
                </div>
                <div className={styles.summStat}>
                  <div className={styles.summVal}>₹{result.remaining.budget}K</div>
                  <div className={styles.summLabel}>Budget Left</div>
                </div>
              </div>

              {/* Scheduled */}
              {result.scheduled.length > 0 && (
                <div className={styles.sectionLabel}>✓ Scheduled ({result.scheduled.length})</div>
              )}
              {result.scheduled.map(({ issue, need, rank }) => (
                <div key={issue.id} className={`${styles.allocCard} ${styles.scheduled} fade-in`}>
                  <div className={styles.allocTop}>
                    <span className={styles.allocRank}>#{rank}</span>
                    <ScoreRing score={issue.score ?? calcPriority(issue)} size={42} />
                    <div className={styles.allocInfo}>
                      <div className={styles.allocTitle}>{issue.title}</div>
                      <div className={styles.allocBadges}>
                        <PriorityBadge score={issue.score ?? calcPriority(issue)} />
                        <StatusBadge status={issue.status} />
                      </div>
                    </div>
                    <span className={styles.scheduledTag}>✓ Scheduled</span>
                  </div>
                  <div className={styles.allocResources}>
                    {[['👷',need.workers,'workers'],['🚛',need.vehicles,'vehicles'],['🏗️',need.equipment,'equip'],['💰',`₹${need.budget}K`,'budget']].map(([ic,v,l])=>(
                      <span key={l} className={styles.allocPill}>{ic} {v} {l}</span>
                    ))}
                  </div>
                </div>
              ))}

              {/* Deferred */}
              {result.deferred.length > 0 && (
                <>
                  <div className={styles.sectionLabel} style={{ marginTop:'1rem' }}>✗ Deferred ({result.deferred.length})</div>
                  {result.deferred.map(({ issue, reason }) => (
                    <div key={issue.id} className={`${styles.allocCard} ${styles.deferred} fade-in`}>
                      <div className={styles.allocTop}>
                        <ScoreRing score={issue.score ?? calcPriority(issue)} size={42} />
                        <div className={styles.allocInfo}>
                          <div className={styles.allocTitle}>{issue.title}</div>
                          <div className={styles.deferReason}>⚠ {reason}</div>
                        </div>
                        <span className={styles.deferredTag}>✗ Deferred</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
