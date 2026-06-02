import React from 'react';
import { GamingShell } from './GamingShell';
import { motion } from 'framer-motion';

interface LandingProps {
    onLaunch: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onLaunch }) => {
    return (
        <GamingShell>
            <div className="gwet-landing-grid">
                <motion.div
                    className="gwet-landing-copy"
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h5 className="font-nav gwet-tagline">GAMERS CONNECT. PLAY. WIN.</h5>
                    <h1 className="font-heading gwet-hero-title">GWET</h1>
                    <p className="gwet-landing-desc">
                        منصة اجتماعية للجيمرز — منشورات، شات، مجتمعات، و Play With Pro.
                        تجربة سريعة قريبة من <span className="gwet-highlight">Discord</span> و{' '}
                        <span className="gwet-highlight">Twitch</span> بدون احتكاك.
                    </p>
                    <p className="gwet-landing-sub">
                        ONE PLATFORM. <strong>MILLIONS OF GAMERS.</strong>
                    </p>
                </motion.div>

                <motion.div
                    className="gwet-landing-cta"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.55, delay: 0.15 }}
                >
                    <div className="gwet-enter-ring group">
                        <div className="gwet-enter-glow" />
                        <div className="gwet-enter-border" />
                        <button type="button" className="gwet-enter-btn font-heading" onClick={onLaunch}>
                            ENTER
                        </button>
                    </div>
                    <button type="button" className="gwet-signin-link" onClick={onLaunch}>
                        لديك حساب؟ تسجيل الدخول
                    </button>
                </motion.div>
            </div>
        </GamingShell>
    );
};
