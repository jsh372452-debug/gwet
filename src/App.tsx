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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-deep)' }}>
        <div className="card" style={{ padding: '3rem 4rem', textAlign: 'center', borderRadius: '30px' }}>
          <Loader2 className="spinner" size={48} color="var(--brand-electric)" style={{ marginBottom: '2rem' }} />
          <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--brand-electric)', letterSpacing: '4px', textTransform: 'uppercase' }}>INITIALIZING NEURAL LINK</div>
          <div style={{ marginTop: '1.5rem', height: '4px', width: '200px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '60%', background: 'var(--brand-electric)', boxShadow: '0 0 15px var(--brand-electric)', borderRadius: '2px' }} />
          </div>
        </div>
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
