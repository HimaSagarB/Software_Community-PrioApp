import { createContext, useContext, useReducer, useCallback } from 'react';
import { SEED_USERS } from '../data/seed.js';
import { genId } from '../utils/scoring.js';

const AuthContext = createContext(null);

const stored = (() => {
  try { return JSON.parse(sessionStorage.getItem('civic_user')); } catch { return null; }
})();

const allUsers = (() => {
  try {
    const saved = JSON.parse(localStorage.getItem('civic_users'));
    return saved ?? SEED_USERS;
  } catch { return SEED_USERS; }
})();

function saveUsers(users) {
  try { localStorage.setItem('civic_users', JSON.stringify(users)); } catch {}
}

const init = { user: stored, users: allUsers, error: null };

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
    case 'SET_ERROR':
      return { ...state, error: action.msg };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default: return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, init);

  const login = useCallback((email, password) => {
    const found = state.users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (found) {
      dispatch({ type: 'LOGIN_OK', user: found });
      return { ok: true };
    }
    dispatch({ type: 'SET_ERROR', msg: 'Invalid email or password.' });
    return { ok: false };
  }, [state.users]);

  const register = useCallback((name, email, password) => {
    if (state.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      dispatch({ type: 'SET_ERROR', msg: 'An account with this email already exists.' });
      return { ok: false };
    }
    const newUser = {
      id: genId(), name, email, password,
      role: 'member',
      avatar: name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(),
      joined: new Date().toISOString().split('T')[0],
    };
    dispatch({ type: 'REGISTER_OK', newUser });
    return { ok: true };
  }, [state.users]);

  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);
  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

  return (
    <AuthContext.Provider value={{ user: state.user, users: state.users, error: state.error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
}
