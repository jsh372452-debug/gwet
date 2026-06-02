import React from 'react';
import { GamingShell } from './GamingShell';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Trophy, Zap } from 'lucide-react';

interface LandingProps {
    onLaunch: () => void;
}

const PREVIEW = [
    { icon: <Users size={20} />, title: 'مجتمعات', desc: 'انضم لسكوادات وألعابك المفضلة', tag: 'LIVE' },
    { icon: <MessageCircle size={20} />, title: 'شات فوري', desc: 'رسائل خاصة بسرعة واتساب', tag: 'E2E' },
    { icon: <Trophy size={20} />, title: 'Play With Pro', desc: 'اعثر على محترفين حسب أسلوب لعبك', tag: 'NEW' },
    { icon: <Zap size={20} />, title: 'نشاطك', desc: 'شارات، إطارات، وتقدم Gaming CV', tag: 'XP' },
];

export const Landing: React.FC<LandingProps> = ({ onLaunch }) => {
    React.useEffect(() => {
        if (new URLSearchParams(window.location.search).get('login') === '1') {
            onLaunch();
            window.history.replaceState({}, '', '/');
        }
    }, [onLaunch]);

    return (
        <GamingShell>
            <div className="gwet-landing-layout">
                <motion.div className="gwet-landing-hero" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="gwet-eyebrow font-nav">THE GAMER&apos;S OS</p>
                    <h1 className="gwet-hero-glow font-display">GWET</h1>
                    <p className="gwet-hero-ar">النظام البيئي الرقمي للجيمر — سريع، مجتمعي، بدون احتكاك.</p>
                    <p className="gwet-hero-en">Electric speed. Neon community. One platform.</p>

                    <div className="gwet-hero-actions">
                        <button type="button" className="btn-gaming btn-gaming-lg" onClick={onLaunch}>
                            ابدأ مجاناً
                        </button>
                        <button type="button" className="btn-gaming-outline" onClick={onLaunch}>
                            تسجيل الدخول
                        </button>
                    </div>
                </motion.div>

                <motion.section
                    className="gwet-preview-grid"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                >
                    <p className="gwet-preview-label">استكشف قبل التسجيل</p>
                    {PREVIEW.map((item, i) => (
                        <div key={i} className="gwet-preview-card glass-card">
                            <div className="gwet-preview-icon">{item.icon}</div>
                            <div>
                                <div className="gwet-preview-head">
                                    <h3>{item.title}</h3>
                                    <span className="gwet-tag">{item.tag}</span>
                                </div>
                                <p>{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </motion.section>
            </div>
        </GamingShell>
    );
};
