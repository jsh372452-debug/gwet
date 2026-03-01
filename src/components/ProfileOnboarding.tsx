import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { countries } from '../data/countries';
import { Camera, Globe, ChevronRight, Check, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ProfileOnboarding: React.FC = () => {
    const { user, updateProfile, updateIdentity } = useAuthStore();
    const { t, isRTL } = useTranslation();
    const [step, setStep] = useState(1);

    const [displayName, setDisplayName] = useState('');
    const [avatarBase64, setAvatarBase64] = useState('');
    const [country, setCountry] = useState('Global');
    const [language, setLanguage] = useState<'ar' | 'en'>('en');

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAvatarBase64(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleComplete = async () => {
        await updateProfile(displayName || user?.username || '', avatarBase64);
        await updateIdentity(country, language);
    };

    return (
        <div style={{
            height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem', direction: isRTL ? 'rtl' : 'ltr'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card"
                style={{ width: '100%', maxWidth: '480px', borderRadius: '32px', padding: '3rem', position: 'relative', overflow: 'hidden' }}
            >
                {/* Step Progress */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '2.5rem' }}>
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: step >= s ? 'var(--primary)' : 'rgba(255,255,255,0.1)', transition: '0.3s' }}></div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>{t('onboarding')}</h2>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '2rem' }}>ESTABLISH YOUR GLOBAL CALLSIGN</p>

                            <label style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>{t('display_name')}</label>
                            <input
                                className="gaming-input"
                                placeholder="e.g. Ghost_Protocol"
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                style={{ marginBottom: '2rem' }}
                            />

                            <button className="btn-premium" style={{ width: '100%' }} onClick={() => setStep(2)}>
                                CONTINUE <ChevronRight size={18} />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>DNA Scan</h2>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '2rem' }}>UPLOAD YOUR AGENT AVATAR</p>

                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                                <div style={{ position: 'relative' }}>
                                    <div className="avatar-premium" style={{
                                        width: '140px', height: '140px', fontSize: '2.5rem',
                                        backgroundImage: `url(${avatarBase64})`, backgroundSize: 'cover'
                                    }}>
                                        {!avatarBase64 && <Shield size={48} />}
                                    </div>
                                    <label style={{
                                        position: 'absolute', bottom: '10px', right: '10px',
                                        background: 'var(--primary)', padding: '10px', borderRadius: '50%',
                                        cursor: 'pointer', boxShadow: '0 4px 15px var(--primary-glow)'
                                    }}>
                                        <Camera size={20} color="white" />
                                        <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                </div>
                            </div>

                            <button className="btn-premium" style={{ width: '100%' }} onClick={() => setStep(3)}>
                                CONFIRM BIOMETRICS <ChevronRight size={18} />
                            </button>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>Global Node</h2>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '2rem' }}>ORIGIN & LANGUAGE PROTOCOLS</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>{t('country')}</label>
                                    <select className="gaming-input" value={country} onChange={e => setCountry(e.target.value)} style={{ marginBottom: 0 }}>
                                        {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>{t('language')}</label>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button className={`btn-premium ${language === 'en' ? 'active' : ''}`} style={{ flex: 1, background: language === 'en' ? 'var(--primary-glow)' : 'rgba(255,255,255,0.03)' }} onClick={() => setLanguage('en')}>EN</button>
                                        <button className={`btn-premium ${language === 'ar' ? 'active' : ''}`} style={{ flex: 1, background: language === 'ar' ? 'var(--primary-glow)' : 'rgba(255,255,255,0.03)' }} onClick={() => setLanguage('ar')}>AR</button>
                                    </div>
                                </div>
                            </div>

                            <button className="btn-premium" style={{ width: '100%', background: 'linear-gradient(135deg, var(--primary), var(--accent))' }} onClick={handleComplete}>
                                <Check size={20} /> SYNCHRONIZE IDENTITY
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
