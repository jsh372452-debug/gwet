import React, { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';
import { setToken, clearToken } from './lib/api';
import { AuthUI } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { ProfileOnboarding } from './components/ProfileOnboarding';
import { useTranslation } from './i18n';
import { VerificationUI } from './components/VerificationUI';
import { Landing } from './components/Landing';
import { GooglePasswordSetup } from './components/GooglePasswordSetup';
import { Loader2 } from 'lucide-react';

function App() {
  const { user, checkSession, loading, awaitingConfirmation, requiresPasswordSetup } = useAuthStore();
  const { isRTL, lang } = useTranslation();
  const [showAuth, setShowAuth] = React.useState(false);

  useEffect(() => {
    checkSession();

    // Listen for auth state changes (including from other tabs)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      
      if (session && session.user.app_metadata?.provider === 'google' && !session.user.user_metadata?.google_password_set) {
        useAuthStore.getState().setRequiresPasswordSetup(true);
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          setToken(session.access_token);
          await checkSession();
        }
      } else if (event === 'SIGNED_OUT') {
        clearToken();
      }
    });

    // Check for success hash from email redirect
    if (window.location.hash.includes('access_token')) {
      useAuthStore.getState().setVerificationSuccess(true);
      checkSession(); // Trigger immediate sync
      // Clean up hash after a delay
      setTimeout(() => {
          window.history.replaceState(null, '', window.location.pathname);
      }, 5000);
    }

    return () => subscription.unsubscribe();
  }, [checkSession]);

  useEffect(() => {
    supabase.auth.getSession().then(({data}) => {
        if (data.session && data.session.user.app_metadata?.provider === 'google' && !data.session.user.user_metadata?.google_password_set) {
            useAuthStore.getState().setRequiresPasswordSetup(true);
        }
    });

    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.body.style.direction = isRTL ? 'rtl' : 'ltr';
  }, [lang, isRTL]);

  const [initTimeout, setInitTimeout] = React.useState(false);
  const [initStage, setInitStage] = React.useState('ESTABLISHING_LINK');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setInitTimeout(true);
    }, 10000); // 10 seconds timeout

    const stages = ['ESTABLISHING_LINK', 'DECRYPTING_CREDENTIALS', 'SYNCING_SQUAD_DATA', 'FINALIZING_NODE'];
    let stageIdx = 0;
    const stageInterval = setInterval(() => {
        if (loading) {
            setInitStage(stages[stageIdx % stages.length]);
            stageIdx++;
        }
    }, 2000);

    return () => {
        clearTimeout(timer);
        clearInterval(stageInterval);
    };
  }, [loading]);

  if (loading) {
    return (
    <div className="glow-mesh" />
    <div className="scan-line" />
    <div style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        height: '100vh', background: 'var(--bg-deep)', 
        fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' 
    }}>
        <div style={{ textAlign: 'center', width: '320px', position: 'relative' }}>
          {!initTimeout ? (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '40px', position: 'relative', display: 'inline-block' }}>
                <div style={{ 
                    width: '80px', height: '80px', border: '2px solid var(--border-subtle)', 
                    borderTopColor: 'var(--brand-electric)', borderRadius: '50%',
                    animation: 'spin 1s linear infinite', boxShadow: '0 0 20px var(--brand-glow)'
                }} />
                <div style={{ 
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center'
                }}>
                    <Logo size={32} />
                </div>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '6px', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--brand-electric)' }}>
                {initStage}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '24px' }}>
                SYSTEM_STABILIZATION_IN_PROGRESS
              </div>
              <div style={{ height: '1px', width: '100%', background: 'var(--border-subtle)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ 
                    position: 'absolute', height: '100%', width: '40%', 
                    background: 'var(--brand-electric)', boxShadow: '0 0 10px var(--brand-electric)',
                    animation: 'scan 2s infinite ease-in-out' 
                }} />
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '32px', background: 'var(--bg-elevated)', borderRadius: '0' }}>
              <div style={{ color: 'var(--brand-orange)', fontSize: '14px', fontWeight: 900, marginBottom: '12px', letterSpacing: '2px' }}>LINK_TIMEOUT</div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>
                CRITICAL: The neural link failed to stabilize within the safety window. Manual reboot required.
              </p>
              <button 
                className="btn btn-primary" 
                onClick={() => window.location.reload()}
                style={{ width: '100%' }}
              >
                REBOOT_SYSTEM_NODE
              </button>
            </div>
          )}
        </div>
        <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes scan {
                0% { left: -40%; }
                100% { left: 100%; }
            }
            .animate-fade-in { animation: fadeIn 0.5s ease-out; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    );
  }

  if (requiresPasswordSetup) {
      return <GooglePasswordSetup onComplete={() => useAuthStore.getState().setRequiresPasswordSetup(false)} />;
  }

  // Awaiting email confirmation — BLOCK access
  if (awaitingConfirmation) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <div className="glow-mesh" />
      <VerificationUI />
    </div>
  );

  if (!user) {
    if (!showAuth) return <Landing onLaunch={() => setShowAuth(true)} />;
    
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', position: 'relative', overflow: 'hidden' }}>
        <div className="glow-mesh" />
        <div className="scan-line" />
        <AuthUI onBack={() => setShowAuth(false)} />
      </div>
    );
  }

  if (user && !user.isVerified) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <div className="glow-mesh" />
      <VerificationUI />
    </div>
  );

  if (!user.isOnboarded) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', position: 'relative', overflow: 'hidden' }}>
      <div className="glow-mesh" />
      <ProfileOnboarding />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <div className="glow-mesh" />
      <div className="scan-line" />
      <Dashboard />
    </div>
  );
}

export default App;
