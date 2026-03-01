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

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [lang, isRTL]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', background: 'var(--bg-dark)' }}>
        <div className="glass-card" style={{ padding: '2rem 3rem', borderRadius: '24px', border: '1px solid var(--primary)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '4px', marginBottom: '1rem' }}>INITIALIZING SYSTEM</div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
            <div className="shimmer" style={{ width: '60%', height: '100%', background: 'var(--primary)', boxShadow: '0 0 15px var(--primary-glow)' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Energy Blobs for global background depth
  const Background = () => (
    <>
      <div className="energy-blob blob-1"></div>
      <div className="energy-blob blob-2"></div>
      <div className="energy-blob" style={{ top: '60%', left: '80%', opacity: 0.03, width: '400px', height: '400px', background: 'var(--accent)' }}></div>
    </>
  );

  if (!user) return (
    <div style={{ minHeight: '100vh', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Background />
      <AuthUI />
    </div>
  );

  if (!user.isOnboarded) return (
    <div style={{ minHeight: '100vh', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Background />
      <ProfileOnboarding />
    </div>
  );

  return (
    <div className="App" style={{ minHeight: '100vh', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Background />
      <Dashboard />
    </div>
  );
}

export default App;
