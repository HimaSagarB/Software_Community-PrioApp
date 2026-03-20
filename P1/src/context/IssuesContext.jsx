import { createContext, useContext, useReducer, useCallback } from 'react';
import { SEED_ISSUES } from '../data/seed.js';
import { genId } from '../utils/scoring.js';

const IssuesContext = createContext(null);

const loadIssues   = () => { try { return JSON.parse(localStorage.getItem('civic_issues')) ?? SEED_ISSUES; } catch { return SEED_ISSUES; } };
const loadAuditLog = () => { try { return JSON.parse(localStorage.getItem('civic_audit'))  ?? []; } catch { return []; } };
const save = (issues, audit) => {
  try { localStorage.setItem('civic_issues', JSON.stringify(issues)); } catch {}
  try { localStorage.setItem('civic_audit',  JSON.stringify(audit));  } catch {}
};

function reducer(state, action) {
  let issues, audit;
  switch (action.type) {

    case 'ADD_ISSUE':
      issues = [action.issue, ...state.issues];
      save(issues, state.audit);
      return { ...state, issues };

    case 'TOGGLE_VOTE':
      issues = state.issues.map(i => {
        if (i.id !== action.issueId) return i;
        const votes   = i.votes ?? [];
        const already = votes.includes(action.userId);
        return { ...i, votes: already ? votes.filter(v => v !== action.userId) : [...votes, action.userId] };
      });
      save(issues, state.audit);
      return { ...state, issues };

    case 'UPDATE_STATUS': {
      // Regular status update (non-override)
      issues = state.issues.map(i => i.id === action.id ? { ...i, status: action.status } : i);
      save(issues, state.audit);
      return { ...state, issues };
    }

    case 'OVERRIDE_STATUS': {
      // Admin override — updates status AND writes to audit log (SRS Sprint 4)
      issues = state.issues.map(i =>
        i.id === action.id
          ? { ...i, status: action.status, overriddenBy: action.adminId, overriddenAt: action.timestamp }
          : i
      );
      audit = [
        {
          id: genId(),
          type: 'STATUS_OVERRIDE',
          issueId: action.id,
          issueTitle: action.issueTitle,
          oldStatus: action.oldStatus,
          newStatus: action.status,
          adminId: action.adminId,
          adminName: action.adminName,
          timestamp: action.timestamp,
          note: action.note ?? '',
        },
        ...state.audit,
      ];
      save(issues, audit);
      return { ...state, issues, audit };
    }

    case 'ADD_COMMENT':
      issues = state.issues.map(i => {
        if (i.id !== action.issueId) return i;
        return { ...i, comments: [...(i.comments ?? []), action.comment] };
      });
      save(issues, state.audit);
      return { ...state, issues };

    default: return state;
  }
}

export function IssuesProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    issues: loadIssues(),
    audit:  loadAuditLog(),
  });

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
      overriddenBy: null,
    };
    dispatch({ type:'ADD_ISSUE', issue });
  }, []);

  const toggleVote = useCallback((issueId, userId) => {
    dispatch({ type:'TOGGLE_VOTE', issueId, userId });
  }, []);

  // Normal status update (for resolved flow etc.)
  const updateStatus = useCallback((id, status) => {
    dispatch({ type:'UPDATE_STATUS', id, status });
  }, []);

  // Admin override with audit trail (SRS Sprint 4 requirement)
  const overrideStatus = useCallback((issue, newStatus, admin, note = '') => {
    dispatch({
      type: 'OVERRIDE_STATUS',
      id: issue.id,
      issueTitle: issue.title,
      oldStatus: issue.status,
      status: newStatus,
      adminId: admin.id,
      adminName: admin.name,
      timestamp: new Date().toISOString(),
      note,
    });
  }, []);

  const addComment = useCallback((issueId, user, text) => {
    const comment = {
      id: genId(),
      authorId: user.id,
      author: user.name,
      text,
      date: new Date().toISOString().split('T')[0],
    };
    dispatch({ type:'ADD_COMMENT', issueId, comment });
  }, []);

  return (
    <IssuesContext.Provider value={{
      issues: state.issues,
      auditLog: state.audit,
      addIssue, toggleVote, updateStatus, overrideStatus, addComment,
    }}>
      {children}
    </IssuesContext.Provider>
  );
}

export function useIssues() {
  const ctx = useContext(IssuesContext);
  if (!ctx) throw new Error('useIssues outside IssuesProvider');
  return ctx;
}
