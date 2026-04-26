import React, { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { AuthUI } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { ProfileOnboarding } from './components/ProfileOnboarding';
import { useTranslation } from './i18n';
import { VerificationUI } from './components/VerificationUI';
import { Landing } from './components/Landing';
import { GooglePasswordSetup } from './components/GooglePasswordSetup';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { user, checkSession, loading, awaitingConfirmation, requiresPasswordSetup } = useAuthStore();
  const { isRTL } = useTranslation();
  const [showAuth, setShowAuth] = React.useState(false);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Silent Loading Bar logic
  const [progress, setProgress] = React.useState(0);
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 10 : prev));
      }, 200);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => setProgress(0), 400);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  return (
    <div className={`app-container ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {progress > 0 && <div className="top-progress" style={{ width: `${progress}%` }} />}
      
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ height: '100vh', width: '100vw', background: 'var(--bg-app)' }}
          />
        ) : awaitingConfirmation ? (
          <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <VerificationUI />
          </motion.div>
        ) : !user ? (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <Landing onLaunch={() => setShowAuth(true)} />
            {showAuth && <AuthUI onBack={() => setShowAuth(false)} />}
          </motion.div>
        ) : requiresPasswordSetup ? (
          <motion.div key="pwd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GooglePasswordSetup onComplete={() => checkSession()} />
          </motion.div>
        ) : !user.isOnboarded ? (
          <motion.div key="onboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProfileOnboarding />
          </motion.div>
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Dashboard />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
