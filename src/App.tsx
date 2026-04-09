import { useState } from 'react';
import { useAuth as useAuthHook } from './hooks/useAuth';
import { Dashboard } from './pages/Dashboard';
import { Login, Signup } from './pages/AuthPage';
import './index.css';

function App() {
  const { isAuthenticated, loading } = useAuthHook();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-violet-950/60 pulse-glow">
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {authMode === 'login' ? (
          <Login onSwitchToSignup={() => setAuthMode('signup')} />
        ) : (
          <Signup onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </>
    );
  }

  return <Dashboard />;
}

export default App;
