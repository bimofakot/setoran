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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Memuat aplikasi...</p>
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
