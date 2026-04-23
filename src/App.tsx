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
      <div style={{ 
          display: 'flex', justifyContent: 'center', alignItems: 'center', 
          height: '100vh', background: 'var(--bg-deep)', 
          fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' 
      }}>
        <div style={{ textAlign: 'center', width: '300px' }}>
          {!initTimeout ? (
            <>
              <div style={{ marginBottom: '32px', position: 'relative', display: 'inline-block' }}>
                <div className="spinner" style={{ width: '64px', height: '64px', border: '1px solid var(--border-subtle)', borderTopColor: 'var(--text-primary)' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate( -50%, -50%)', fontSize: '10px', fontWeight: 900 }}>GWET</div>
              </div>
              <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '16px' }}>{initStage}</div>
              <div style={{ height: '1px', width: '100%', background: 'var(--border-subtle)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ 
                    position: 'absolute', height: '100%', width: '30%', 
                    background: 'var(--text-primary)', 
                    animation: 'scan 1.5s infinite linear' 
                }} />
              </div>
            </>
          ) : (
            <div className="animate-fade-in">
              <div style={{ color: 'var(--danger)', fontSize: '12px', fontWeight: 900, marginBottom: '8px', letterSpacing: '2px' }}>LINK_FAILURE // TIMEOUT</div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '32px' }}>Connection to GWET_CENTRAL failed to stabilize.</p>
              <button 
                className="btn btn-primary" 
                onClick={() => window.location.reload()}
                style={{ width: '100%', background: 'var(--text-primary)', color: 'var(--bg-deep)' }}
              >
                REBOOT_NODE
              </button>
            </div>
          )}
        </div>
        <style>{`
            @keyframes scan {
                0% { left: -30%; }
                100% { left: 100%; }
            }
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
      <VerificationUI />
    </div>
  );

  if (!user) {
    if (!showAuth) return <Landing onLaunch={() => setShowAuth(true)} />;
    
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', position: 'relative', overflow: 'hidden' }}>
        <AuthUI onBack={() => setShowAuth(false)} />
      </div>
    );
  }

  if (user && !user.isVerified) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <VerificationUI />
    </div>
  );

  if (!user.isOnboarded) return (
    <div style={{ minHeight: '100vh', background: '#010410', position: 'relative', overflow: 'hidden' }}>
      <div className="energy-blob blue-blob" style={{ top: '-20%', left: '-10%' }} />
      <ProfileOnboarding />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <Dashboard />
    </div>
  );
}

export default App;
