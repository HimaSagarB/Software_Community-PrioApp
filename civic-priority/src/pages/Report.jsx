import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIssues } from '../context/IssuesContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { calcPriority, getScoreBreakdown, LEVEL_META, getLevel } from '../utils/scoring.js';
import { CATEGORIES, LOCATION_TYPES, SEVERITY_LABELS, CATEGORY_BONUS, LOCATION_BONUS } from '../data/seed.js';
import { ScoreRing } from '../components/IssueCard.jsx';
import styles from './Report.module.css';

const init = { title:'', category:'Infrastructure', description:'', severity:3, affectedPeople:100, locationType:'Residential', };

export default function Report() {
  const { user } = useAuth();
  const { addIssue } = useIssues();
  const { show } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(init);
  const [submitted, setSubmitted] = useState(false);

  if (!user) {
    return (
      <div className={styles.guestWrap}>
        <div className={styles.guestBox}>
          <div className={styles.guestIcon}>🔒</div>
          <h2 className={styles.guestTitle}>Sign in to Report an Issue</h2>
          <p className={styles.guestSub}>Only registered community members can submit issue reports.</p>
          <button className={styles.signInBtn} onClick={()=>navigate('/auth')}>Go to Sign In →</button>
        </div>
      </div>
    );
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const preview = calcPriority({ ...form, votes: [] });
  const bd = getScoreBreakdown({ ...form, votes: [] });
  const level = getLevel(preview);
  const meta  = LEVEL_META[level];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addIssue(form, user);
    setSubmitted(true);
    show('Issue submitted! Thank you for your report.');
  };

  if (submitted) {
    return (
      <div className={styles.successWrap}>
        <div className={styles.successBox}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.successTitle}>Issue Submitted!</h2>
          <p className={styles.successSub}>Your report has been added to the registry with a priority score of <strong>{preview}</strong>.</p>
          <div className={styles.successBtns}>
            <button className={styles.btn} onClick={()=>navigate('/issues')}>View All Issues</button>
            <button className={styles.btnSecondary} onClick={()=>{ setForm(init); setSubmitted(false); }}>Report Another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} fade-in`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Report a Community Issue</h1>
        <p className={styles.sub}>Fill in structured details — your submission feeds the transparent priority scoring system.</p>
      </div>

      <div className={styles.layout}>
        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.card}>
            <div className={styles.cardHead}>Issue Information</div>

            <div className={styles.field}>
              <label className={styles.label}>Issue Title *</label>
              <input className={styles.input} placeholder="Brief, descriptive title…" value={form.title}
                onChange={e=>set('title',e.target.value)} required />
            </div>

            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label}>Category</label>
                <select className={styles.select} value={form.category} onChange={e=>set('category',e.target.value)}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Location Type</label>
                <select className={styles.select} value={form.locationType} onChange={e=>set('locationType',e.target.value)}>
                  {LOCATION_TYPES.map(l=><option key={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Description</label>
              <textarea className={styles.textarea} placeholder="Describe the issue clearly — what, where, how long, who is affected…"
                value={form.description} onChange={e=>set('description',e.target.value)} rows={4} />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Severity Level — <strong>{SEVERITY_LABELS[form.severity]}</strong> ({form.severity}/5)
              </label>
              <input type="range" min="1" max="5" value={form.severity}
                onChange={e=>set('severity',parseInt(e.target.value))}
                className={styles.range} style={{ accentColor: meta.color }} />
              <div className={styles.rangeLabels}>
                <span>Minor</span><span>Moderate</span><span>Serious</span><span>Severe</span><span>Critical</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Estimated People Affected — <strong>{form.affectedPeople.toLocaleString()}</strong>
              </label>
              <input type="range" min="1" max="5000" value={form.affectedPeople}
                onChange={e=>set('affectedPeople',parseInt(e.target.value))}
                className={styles.range} style={{ accentColor:'var(--blue)' }} />
              <div className={styles.rangeLabels}><span>1</span><span style={{marginLeft:'auto'}}>5,000+</span></div>
            </div>

            <div className={styles.reporterInfo}>
              <span className={styles.reporterLabel}>Submitting as:</span>
              <span className={styles.reporterName}>{user.name}</span>
              <span className={styles.reporterEmail}>{user.email}</span>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={!form.title.trim()}>
              Submit Issue Report →
            </button>
          </div>
        </form>

        {/* Live preview */}
        <div className={styles.sidebar}>
          <div className={styles.card}>
            <div className={styles.cardHead}>Live Priority Preview</div>
            <div className={styles.previewTop}>
              <ScoreRing score={preview} size={64} />
              <div>
                <div className={styles.previewScore}>Score: {preview} / 100</div>
                <span className={styles.previewBadge} style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}>
                  {meta.label} Priority
                </span>
              </div>
            </div>
            <div className={styles.breakdown}>
              {[
                ['Severity', `${form.severity} × 20`, bd.severity],
                ['Affected', `min(${form.affectedPeople}÷10, 30)`, bd.affected],
                ['Location', form.locationType, bd.location],
                ['Category', form.category, bd.category],
                ['Votes', 'min(0×0.5, 15)', 0],
              ].map(([lbl,formula,val]) => (
                <div key={lbl} className={styles.bdRow}>
                  <span className={styles.bdLabel}>{lbl}</span>
                  <span className={styles.bdFormula}>{formula}</span>
                  <span className={styles.bdVal}>+{val}</span>
                </div>
              ))}
              <div className={styles.bdTotal}>
                <span>Total (cap 100)</span>
                <span style={{ color:'#fbbf24', fontSize:'1rem', fontWeight:900 }}>{preview}</span>
              </div>
            </div>
          </div>

          <div className={styles.card} style={{ marginTop:'1rem' }}>
            <div className={styles.cardHead}>Priority Level Guide</div>
            {[['critical','80–100','Immediate action'],['high','60–79','Urgent, 48h'],['medium','40–59','Scheduled'],['low','0–39','Queued']].map(([l,r,d]) => (
              <div key={l} className={styles.guideRow}>
                <span className={styles.guideBadge} style={{ color:LEVEL_META[l].color, background:LEVEL_META[l].bg, borderColor:LEVEL_META[l].border }}>
                  {LEVEL_META[l].label}
                </span>
                <span className={styles.guideRange}>{r}</span>
                <span className={styles.guideDesc}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
