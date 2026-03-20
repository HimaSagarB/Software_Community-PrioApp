import { createContext, useContext, useReducer, useCallback } from 'react';
import { SEED_USERS } from '../data/seed.js';
import { genId } from '../utils/scoring.js';

// Roles:
//   community_member  – submit issues, vote (1/issue), view status
//   admin_authority   – all member perms + resource input, run optimizer, override status, view audit
//   system_admin      – all admin perms + user management, full audit log, system monitoring

const AuthContext = createContext(null);

const loadUser  = () => { try { return JSON.parse(sessionStorage.getItem('civic_user')); } catch { return null; } };
const loadUsers = () => { try { return JSON.parse(localStorage.getItem('civic_users')) ?? SEED_USERS; } catch { return SEED_USERS; } };
const saveUsers = u  => { try { localStorage.setItem('civic_users', JSON.stringify(u)); } catch {} };

const init = { user: loadUser(), users: loadUsers(), error: null };

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN_OK':
      try { sessionStorage.setItem('civic_user', JSON.stringify(action.user)); } catch {}
      return { ...state, user: action.user, error: null };
    case 'LOGOUT':
      try { sessionStorage.removeItem('civic_user'); } catch {}
      return { ...state, user: null, error: null };
    case 'REGISTER_OK': {
      const users = [...state.users, action.newUser];
      saveUsers(users);
      try { sessionStorage.setItem('civic_user', JSON.stringify(action.newUser)); } catch {}
      return { ...state, users, user: action.newUser, error: null };
    }
    case 'SET_ERROR':   return { ...state, error: action.msg };
    case 'CLEAR_ERROR': return { ...state, error: null };
    default: return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, init);

  const login = useCallback((email, password) => {
    const found = state.users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (found) { dispatch({ type:'LOGIN_OK', user: found }); return { ok: true }; }
    dispatch({ type:'SET_ERROR', msg:'Invalid email or password.' });
    return { ok: false };
  }, [state.users]);

  const register = useCallback((name, email, password) => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      dispatch({ type:'SET_ERROR', msg:'All fields are required.' });
      return { ok: false };
    }
    if (state.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      dispatch({ type:'SET_ERROR', msg:'An account with this email already exists.' });
      return { ok: false };
    }
    const newUser = {
      id: genId(), name: name.trim(), email: email.trim().toLowerCase(),
      password, role: 'community_member',
      avatar: name.trim().split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(),
      joined: new Date().toISOString().split('T')[0],
      description: 'Community member — can report issues and vote.',
    };
    dispatch({ type:'REGISTER_OK', newUser });
    return { ok: true };
  }, [state.users]);

  const logout     = useCallback(() => dispatch({ type:'LOGOUT' }), []);
  const clearError = useCallback(() => dispatch({ type:'CLEAR_ERROR' }), []);

  // Role helpers
  const isMember   = state.user?.role === 'community_member';
  const isAdmin    = state.user?.role === 'admin_authority';
  const isSysAdmin = state.user?.role === 'system_admin';
  const canVote    = !!state.user; // any logged in user can vote
  const canReport  = !!state.user; // any logged in user can report
  const canOverride       = isAdmin || isSysAdmin;
  const canRunOptimizer   = isAdmin || isSysAdmin;
  const canViewAuditLog   = isAdmin || isSysAdmin;
  const canManageUsers    = isSysAdmin;

  return (
    <AuthContext.Provider value={{
      user: state.user, users: state.users, error: state.error,
      login, register, logout, clearError,
      isMember, isAdmin, isSysAdmin,
      canVote, canReport, canOverride, canRunOptimizer, canViewAuditLog, canManageUsers,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
}
