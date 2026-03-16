import { createContext, useContext, useReducer, useCallback } from 'react';
import { SEED_ISSUES } from '../data/seed.js';
import { genId } from '../utils/scoring.js';

const IssuesContext = createContext(null);

const stored = (() => {
  try { return JSON.parse(localStorage.getItem('civic_issues')); } catch { return null; }
})();

function saveIssues(issues) {
  try { localStorage.setItem('civic_issues', JSON.stringify(issues)); } catch {}
}

function reducer(state, action) {
  let next;
  switch (action.type) {
    case 'ADD_ISSUE':
      next = [action.issue, ...state];
      saveIssues(next);
      return next;
    case 'UPDATE_STATUS':
      next = state.map(i => i.id === action.id ? { ...i, status: action.status } : i);
      saveIssues(next);
      return next;
    case 'TOGGLE_VOTE': {
      next = state.map(i => {
        if (i.id !== action.issueId) return i;
        const votes = i.votes ?? [];
        const already = votes.includes(action.userId);
        return { ...i, votes: already ? votes.filter(v=>v!==action.userId) : [...votes, action.userId] };
      });
      saveIssues(next);
      return next;
    }
    case 'ADD_COMMENT':
      next = state.map(i => {
        if (i.id !== action.issueId) return i;
        return { ...i, comments: [...(i.comments??[]), action.comment] };
      });
      saveIssues(next);
      return next;
    default: return state;
  }
}

export function IssuesProvider({ children }) {
  const [issues, dispatch] = useReducer(reducer, stored ?? SEED_ISSUES);

  const addIssue = useCallback((data, user) => {
    const issue = {
      ...data,
      id: genId(),
      votes: [],
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
      reporter: user.name,
      reporterId: user.id,
      comments: [],
    };
    dispatch({ type: 'ADD_ISSUE', issue });
    return issue;
  }, []);

  const updateStatus = useCallback((id, status) => {
    dispatch({ type: 'UPDATE_STATUS', id, status });
  }, []);

  // Vote toggled per userId — prevents multiple votes
  const toggleVote = useCallback((issueId, userId) => {
    dispatch({ type: 'TOGGLE_VOTE', issueId, userId });
  }, []);

  const addComment = useCallback((issueId, user, text) => {
    const comment = {
      id: genId(),
      authorId: user.id,
      author: user.name,
      text,
      date: new Date().toISOString().split('T')[0],
    };
    dispatch({ type: 'ADD_COMMENT', issueId, comment });
  }, []);

  return (
    <IssuesContext.Provider value={{ issues, addIssue, updateStatus, toggleVote, addComment }}>
      {children}
    </IssuesContext.Provider>
  );
}

export function useIssues() {
  const ctx = useContext(IssuesContext);
  if (!ctx) throw new Error('useIssues outside IssuesProvider');
  return ctx;
}
