import React, { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';
import { setToken, clearToken } from './lib/api';
import { AuthUI } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { ProfileOnboarding } from './components/ProfileOnboarding';
import { useTranslation } from './i18n';
import { VerificationUI } from './components/VerificationUI';
import { Loader2 } from 'lucide-react';

function App() {
  const { user, checkSession, loading } = useAuthStore();
  const { isRTL, lang } = useTranslation();

  useEffect(() => {
    checkSession();

    // Set up a listener for auth changes (like email confirmation or token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      if (session) {
        setToken(session.access_token);
        // We only fetch the profile if the user isn't already loaded or on sign-in
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          checkSession();
        }
      } else if (event === 'SIGNED_OUT') {
        clearToken();
        // Since we are using zustand, the store state should be cleared
      }
    });

    return () => subscription.unsubscribe();
  }, [checkSession]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.body.style.direction = isRTL ? 'rtl' : 'ltr';
  }, [lang, isRTL]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#010410' }}>
        <div className="glass-card" style={{ padding: '3rem 4rem', textAlign: 'center', borderRadius: '30px' }}>
          <Loader2 className="spinner" size={48} color="var(--primary)" style={{ marginBottom: '2rem' }} />
          <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--primary)', letterSpacing: '4px', textTransform: 'uppercase' }}>INITIALIZING NEURAL LINK</div>
          <div style={{ marginTop: '1.5rem', height: '4px', width: '200px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '60%', background: 'var(--primary)', boxShadow: '0 0 15px var(--primary)', borderRadius: '2px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#010410', position: 'relative', overflow: 'hidden' }}>
      <div className="energy-blob blue-blob" style={{ top: '-10%', right: '-10%' }} />
      <div className="energy-blob cyan-blob" style={{ bottom: '-10%', left: '-10%' }} />
      <AuthUI />
    </div>
  );

  if (user && !user.isVerified) return (
    <div style={{ minHeight: '100vh', background: '#010410' }}>
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
    <div style={{ minHeight: '100vh', background: '#010410' }}>
      <Dashboard />
    </div>
  );
}

export default App;
