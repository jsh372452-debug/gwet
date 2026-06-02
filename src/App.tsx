import React, { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { AuthUI } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { ProfileOnboarding } from './components/ProfileOnboarding';
import { useTranslation } from './i18n';
import { VerificationUI } from './components/VerificationUI';
import { Landing } from './components/Landing';
import { GooglePasswordSetup } from './components/GooglePasswordSetup';
import { AuthCallback } from './components/AuthCallback';
import { motion, AnimatePresence } from 'framer-motion';
import {
  shouldRunAuthCallback,
  isCustomizePath,
  isFeedPath,
  normalizePath,
  navigateTo,
  hasPendingAuthCallback,
  CUSTOMIZE_PATH,
  FEED_PATH,
} from './lib/authRoutes';

function App() {
  const { user, checkSession, loading, awaitingConfirmation, requiresPasswordSetup, authReady } = useAuthStore();
  const { isRTL } = useTranslation();
  const [showAuth, setShowAuth] = React.useState(false);
  const [routePath, setRoutePath] = React.useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    const onPop = () => setRoutePath(normalizePath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (loading || !authReady) return;

    const current = normalizePath(window.location.pathname);

    // Never kick user to landing while email link tokens are still in the URL
    if (hasPendingAuthCallback()) return;

    if (!user) {
      if (isFeedPath(current) || isCustomizePath(current)) {
        navigateTo('/');
        setRoutePath('/');
      }
      return;
    }

    if (shouldRunAuthCallback(current)) return;

    if (!user.isOnboarded && !isCustomizePath(current)) {
      navigateTo(CUSTOMIZE_PATH);
      setRoutePath(CUSTOMIZE_PATH);
    } else if (user.isOnboarded && isCustomizePath(current)) {
      navigateTo(FEED_PATH);
      setRoutePath(FEED_PATH);
    }
  }, [user, loading, authReady]);

  const [progress, setProgress] = React.useState(0);
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 10 : prev));
      }, 200);
      return () => clearInterval(interval);
    }
    setProgress(100);
    const timeout = setTimeout(() => setProgress(0), 400);
    return () => clearTimeout(timeout);
  }, [loading]);

  const path = routePath;
  const authCallbackMode = shouldRunAuthCallback(path) || hasPendingAuthCallback();

  const renderMain = () => {
    if (authCallbackMode) {
      return <AuthCallback key="callback" />;
    }

    if (awaitingConfirmation) {
      return <VerificationUI key="verify" />;
    }

    if (!user) {
      return (
        <>
          <Landing onLaunch={() => setShowAuth(true)} />
          {showAuth && <AuthUI onBack={() => setShowAuth(false)} />}
        </>
      );
    }

    if (requiresPasswordSetup) {
      return <GooglePasswordSetup onComplete={() => checkSession()} />;
    }

    if (!user.isOnboarded || isCustomizePath(path)) {
      return <ProfileOnboarding key="onboard" />;
    }

    return <Dashboard key="dashboard" initialTab="feed" />;
  };

  const showLoading = loading || (authCallbackMode && !authReady);

  return (
    <div className={`app-container ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {progress > 0 && <div className="top-progress" style={{ width: `${progress}%` }} />}

      <AnimatePresence mode="wait">
        {showLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="gwet-loading-screen"
          >
            <div className="gwet-loading-inner">
              <div className="gwet-spinner-ring" />
              <p>جاري تجهيز حسابك...</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={path + (user?.id || 'guest') + String(authCallbackMode)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {renderMain()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
