import React, { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { AuthUI } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { ProfileOnboarding } from './components/ProfileOnboarding';
import { useTranslation } from './i18n';
import './styles/global.css';

function App() {
  const { user, checkSession, loading } = useAuthStore();
  const { isRTL, lang } = useTranslation();

  useEffect(() => { checkSession(); }, [checkSession]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [lang, isRTL]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="card" style={{ padding: '2rem 3rem', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '3px', marginBottom: 'var(--space-md)' }}>LOADING</div>
          <div style={{ height: '3px', width: '120px', borderRadius: '2px', overflow: 'hidden', background: 'var(--bg-elevated)' }}>
            <div className="skeleton" style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return (
    <div style={{ minHeight: '100vh', direction: isRTL ? 'rtl' : 'ltr' }}>
      <div className="bg-glow purple" />
      <div className="bg-glow cyan" />
      <AuthUI />
    </div>
  );

  if (!user.isOnboarded) return (
    <div style={{ minHeight: '100vh', direction: isRTL ? 'rtl' : 'ltr' }}>
      <div className="bg-glow purple" />
      <ProfileOnboarding />
    </div>
  );

  return (
    <div style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <Dashboard />
    </div>
  );
}

export default App;
