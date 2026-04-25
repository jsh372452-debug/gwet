import React, { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { AuthUI } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { ProfileOnboarding } from './components/ProfileOnboarding';
import { useTranslation } from './i18n';
import { VerificationUI } from './components/VerificationUI';
import { Landing } from './components/Landing';
import { GooglePasswordSetup } from './components/GooglePasswordSetup';

function App() {
  const { user, checkSession, loading, awaitingConfirmation, requiresPasswordSetup } = useAuthStore();
  const { isRTL } = useTranslation();
  const [showAuth, setShowAuth] = React.useState(false);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', width: '100vw', background: 'var(--bg-app)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '20px'
      }}>
        <div style={{
          width: '32px', height: '32px', border: '2px solid var(--border-light)',
          borderTopColor: 'var(--brand-primary)', borderRadius: '50%',
          animation: 'spin 0.6s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Landing onShowAuth={() => setShowAuth(true)} />
        {showAuth && <AuthUI onClose={() => setShowAuth(false)} />}
      </>
    );
  }

  if (requiresPasswordSetup) return <GooglePasswordSetup />;
  if (awaitingConfirmation) return <VerificationUI />;
  if (!user.isOnboarded) return <ProfileOnboarding />;

  return (
    <div className={`app-container ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Dashboard />
    </div>
  );
}

export default App;
