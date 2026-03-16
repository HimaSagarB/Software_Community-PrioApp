import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import styles from './Auth.module.css';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, error, clearError } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();

  const switchMode = (m) => { setMode(m); clearError(); setEmail(''); setPassword(''); setName(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (mode === 'login') {
      const res = login(email, password);
      if (res.ok) { show('Welcome back!'); navigate('/'); }
    } else {
      if (!name.trim()) { setLoading(false); return; }
      const res = register(name.trim(), email, password);
      if (res.ok) { show('Account created! Welcome to CivicPriority.'); navigate('/'); }
    }
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.brand}>Civic<span>Priority</span></div>
        <h1 className={styles.headline}>Your voice shapes your community</h1>
        <p className={styles.sub}>Report issues, vote on priorities, and watch transparent rule-based scoring allocate resources where they matter most.</p>

        <div className={styles.demoBox}>
          <div className={styles.demoTitle}>Demo Accounts</div>
          <div className={styles.demoGrid}>
            {[
              { email:'admin@civic.gov',  pass:'admin123',  role:'Admin'  },
              { email:'priya@email.com',  pass:'priya123',  role:'Member' },
              { email:'rahul@email.com',  pass:'rahul123',  role:'Member' },
            ].map(d => (
              <button key={d.email} className={styles.demoBtn}
                onClick={() => { setMode('login'); setEmail(d.email); setPassword(d.pass); }}>
                <span className={styles.demoRole}>{d.role}</span>
                <span className={styles.demoEmail}>{d.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.card}>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${mode==='login' ? styles.tabActive : ''}`} onClick={() => switchMode('login')}>Sign In</button>
            <button className={`${styles.tab} ${mode==='register' ? styles.tabActive : ''}`} onClick={() => switchMode('register')}>Register</button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {mode === 'register' && (
              <div className={styles.field}>
                <label className={styles.label}>Full Name</label>
                <input className={styles.input} type="text" placeholder="Your full name" value={name}
                  onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <input className={styles.input} type="email" placeholder="you@email.com" value={email}
                onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input className={styles.input} type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} required autoComplete={mode==='login'?'current-password':'new-password'} />
            </div>

            {error && <div className={styles.error}>⚠ {error}</div>}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
            </button>

            {mode === 'login' && (
              <p className={styles.hint}>
                New here?{' '}
                <button type="button" className={styles.link} onClick={() => switchMode('register')}>Create an account</button>
              </p>
            )}
            {mode === 'register' && (
              <p className={styles.hint}>
                Already have an account?{' '}
                <button type="button" className={styles.link} onClick={() => switchMode('login')}>Sign in</button>
              </p>
            )}
          </form>

          <div className={styles.features}>
            <div className={styles.feat}><span>🗳️</span> Vote on issues to boost their priority</div>
            <div className={styles.feat}><span>📋</span> Report and track community problems</div>
            <div className={styles.feat}><span>⚡</span> Transparent rule-based scoring — no black box</div>
          </div>
        </div>
      </div>
    </div>
  );
}
