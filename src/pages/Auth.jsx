import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import s from './Auth.module.css';

const DEMOS = [
  { role:'System Admin',  email:'sysadmin@civic.gov', pass:'sysadmin123', desc:'Full access · users · audit' },
  { role:'Admin Auth.',   email:'admin@civic.gov',    pass:'admin123',    desc:'Override · optimizer · audit' },
  { role:'Member',        email:'priya@email.com',    pass:'priya123',    desc:'Report issues · vote' },
  { role:'Member',        email:'rahul@email.com',    pass:'rahul123',    desc:'Report issues · vote' },
];

export default function AuthPage() {
  const [mode,     setMode]     = useState('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const { login, register, error, clearError } = useAuth();
  const { show } = useToast();
  const navigate  = useNavigate();

  const switchMode = m => { setMode(m); clearError(); setEmail(''); setPassword(''); setName(''); };

  const handleSubmit = e => {
    e.preventDefault(); setLoading(true);
    if (mode === 'login') {
      const res = login(email, password);
      if (res.ok) { show('Welcome back!'); navigate('/'); }
    } else {
      const res = register(name, email, password);
      if (res.ok) { show('Account created! Welcome to CivicPriority.'); navigate('/'); }
    }
    setLoading(false);
  };

  return (
    <div className={s.page}>
      <div className={s.left}>
        <div className={s.brand}>Civic<span>Priority</span></div>
        <h1 className={s.headline}>Your voice shapes your community</h1>
        <p className={s.sub}>Transparent, rule-based issue prioritization with community voting and constraint-aware resource allocation.</p>

        <div className={s.rolesBox}>
          <div className={s.rolesTitle}>Three User Roles</div>
          <div className={s.rolesList}>
            {[
              { r:'Community Member', d:'Submit issues, cast one vote per issue, track status', c:s.rBlue },
              { r:'Admin Authority',  d:'Input resources, run optimizer, override status with audit', c:s.rGold },
              { r:'System Admin',     d:'Monitor system, manage users, view all audit logs', c:s.rRed  },
            ].map(({ r, d, c }) => (
              <div key={r} className={s.roleItem}>
                <span className={`${s.roleDot} ${c}`}/>
                <div><div className={s.roleName}>{r}</div><div className={s.roleDesc}>{d}</div></div>
              </div>
            ))}
          </div>
        </div>

        <div className={s.demoBox}>
          <div className={s.demoTitle}>Demo Accounts — click to fill</div>
          <div className={s.demoGrid}>
            {DEMOS.map(d => (
              <button key={d.email} className={s.demoBtn}
                onClick={() => { setMode('login'); setEmail(d.email); setPassword(d.pass); }}>
                <span className={s.demoRole}>{d.role}</span>
                <span className={s.demoEmail}>{d.email}</span>
                <span className={s.demoDesc}>{d.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={s.right}>
        <div className={s.card}>
          <div className={s.tabs}>
            <button className={`${s.tab} ${mode==='login'?s.tabActive:''}`} onClick={() => switchMode('login')}>Sign In</button>
            <button className={`${s.tab} ${mode==='register'?s.tabActive:''}`} onClick={() => switchMode('register')}>Register</button>
          </div>

          <form onSubmit={handleSubmit} className={s.form}>
            {mode === 'register' && (
              <div className={s.field}>
                <label className={s.label}>Full Name</label>
                <input className={s.input} type="text" placeholder="Your full name" value={name}
                  onChange={e=>setName(e.target.value)} required />
              </div>
            )}
            <div className={s.field}>
              <label className={s.label}>Email Address</label>
              <input className={s.input} type="email" placeholder="you@email.com" value={email}
                onChange={e=>setEmail(e.target.value)} required autoComplete="email"/>
            </div>
            <div className={s.field}>
              <label className={s.label}>Password</label>
              <input className={s.input} type="password" placeholder="••••••••" value={password}
                onChange={e=>setPassword(e.target.value)} required autoComplete={mode==='login'?'current-password':'new-password'}/>
            </div>
            {error && <div className={s.error}>⚠ {error}</div>}
            <button type="submit" className={s.submitBtn} disabled={loading}>
              {loading ? 'Please wait…' : mode==='login' ? 'Sign In →' : 'Create Account →'}
            </button>
            <p className={s.hint}>
              {mode==='login' ? <>New here? <button type="button" className={s.link} onClick={()=>switchMode('register')}>Create account</button></> : <>Have an account? <button type="button" className={s.link} onClick={()=>switchMode('login')}>Sign in</button></>}
            </p>
          </form>

          {mode==='register' && (
            <div className={s.noteBox}>
              <div className={s.noteTitle}>Note</div>
              New registrations are assigned the <strong>Community Member</strong> role by default. Contact your system administrator to request elevated access.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
