import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../utils/firebase.js';
import { collection, onSnapshot, doc, setDoc, getDocs } from 'firebase/firestore';
import { SEED_USERS } from '../data/seed.js';
import { genId } from '../utils/scoring.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('civic_user')); } catch { return null; }
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  // Load from Firestore
  useEffect(() => {
    if (!db) {
      console.warn("No DB connection for AuthProvider");
      return;
    }

    const seedData = async () => {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      if (usersSnapshot.empty) {
        console.log("Seeding Firestore with initial users...");
        for (const u of SEED_USERS) {
          await setDoc(doc(db, 'users', String(u.id)), u);
        }
      }
    };
    seedData();

    // Listen to Users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    });

    return () => unsubUsers();
  }, []);

  const login = useCallback((email, password) => {
    const found = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (found) {
      try { sessionStorage.setItem('civic_user', JSON.stringify(found)); } catch {}
      setUser(found);
      setError(null);
      return { ok: true };
    }
    setError('Invalid email or password.');
    return { ok: false };
  }, [users]);

  const register = useCallback(async (name, email, password) => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return { ok: false };
    }
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError('An account with this email already exists.');
      return { ok: false };
    }
    if (!db) {
      setError('Database connection error.');
      return { ok: false };
    }

    const newUser = {
      id: genId(), 
      name: name.trim(), 
      email: email.trim().toLowerCase(),
      password, 
      role: 'community_member',
      avatar: name.trim().split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(),
      joined: new Date().toISOString().split('T')[0],
      description: 'Community member — can report issues and vote.',
    };

    // Save to Firestore
    await setDoc(doc(db, 'users', String(newUser.id)), newUser);
    
    // Save locally to session
    try { sessionStorage.setItem('civic_user', JSON.stringify(newUser)); } catch {}
    setUser(newUser);
    setError(null);
    return { ok: true };
  }, [users]);

  const logout = useCallback(() => {
    try { sessionStorage.removeItem('civic_user'); } catch {}
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // Role helpers
  const isMember = user?.role === 'community_member';
  const isAdmin = user?.role === 'admin_authority';
  const isSysAdmin = user?.role === 'system_admin';
  const canVote = !!user;
  const canReport = !!user;
  const canOverride = isAdmin || isSysAdmin;
  const canRunOptimizer = isAdmin || isSysAdmin;
  const canViewAuditLog = isAdmin || isSysAdmin;
  const canManageUsers = isSysAdmin;

  return (
    <AuthContext.Provider value={{
      user, users, error,
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
