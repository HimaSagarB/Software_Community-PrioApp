import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { IssuesProvider } from './context/IssuesContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Toast  from './components/layout/Toast.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Issues    from './pages/Issues.jsx';
import Report    from './pages/Report.jsx';
import Ranking   from './pages/Ranking.jsx';
import Optimizer from './pages/Optimizer.jsx';
import Profile   from './pages/Profile.jsx';
import AuthPage  from './pages/Auth.jsx';
import './index.css';

function AppShell() {
  const { user } = useAuth();

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      <Navbar />
      <main style={{ flex:1, maxWidth:'1300px', width:'100%', margin:'0 auto', padding:'2rem 1.5rem' }}>
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/issues"    element={<Issues />} />
          <Route path="/report"    element={<Report />} />
          <Route path="/ranking"   element={<Ranking />} />
          <Route path="/optimizer" element={<Optimizer />} />
          <Route path="/profile"   element={user ? <Profile /> : <Navigate to="/auth" />} />
          <Route path="/auth"      element={user ? <Navigate to="/" /> : <AuthPage />} />
          <Route path="*"          element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <IssuesProvider>
            <AppShell />
          </IssuesProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
