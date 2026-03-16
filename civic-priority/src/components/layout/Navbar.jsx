import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useIssues } from '../../context/IssuesContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import styles from './Navbar.module.css';

const LINKS = [
  { to:'/',           label:'Dashboard'  },
  { to:'/issues',     label:'Issues'     },
  { to:'/report',     label:'Report'     },
  { to:'/ranking',    label:'Ranking'    },
  { to:'/optimizer',  label:'Optimizer'  },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { issues } = useIssues();
  const { show } = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const openCount = issues.filter(i=>i.status==='open').length;

  const handleLogout = () => {
    logout();
    show('Signed out successfully.');
    navigate('/auth');
    setMenuOpen(false);
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>Civic<span>Priority</span></div>

      <div className={styles.links}>
        {LINKS.map(({ to, label }) => (
          <NavLink key={to} to={to} end={to==='/'} className={({isActive}) => `${styles.link} ${isActive ? styles.active : ''}`}>
            {label}
          </NavLink>
        ))}
      </div>

      <div className={styles.right}>
        <div className={styles.issueCount}>
          <span className={styles.dot} />
          {openCount} open
        </div>

        {user ? (
          <div className={styles.userWrap}>
            <button className={styles.avatarBtn} onClick={() => setMenuOpen(o => !o)}>
              <span className={styles.avatar}>{user.avatar}</span>
              <span className={styles.userName}>{user.name.split(' ')[0]}</span>
              {user.role === 'admin' && <span className={styles.adminBadge}>admin</span>}
              <span className={styles.chevron}>{menuOpen ? '▲' : '▼'}</span>
            </button>
            {menuOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropUser}>
                  <div className={styles.dropName}>{user.name}</div>
                  <div className={styles.dropEmail}>{user.email}</div>
                  <div className={styles.dropJoined}>Member since {user.joined}</div>
                </div>
                <div className={styles.dropDivider} />
                <button className={styles.dropItem} onClick={() => { navigate('/profile'); setMenuOpen(false); }}>
                  👤 My Profile & Votes
                </button>
                <button className={styles.dropItem} onClick={handleLogout}>
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className={styles.loginBtn} onClick={() => navigate('/auth')}>
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
