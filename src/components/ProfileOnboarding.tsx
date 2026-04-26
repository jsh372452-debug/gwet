import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Globe, ArrowRight, User, Gamepad2 } from 'lucide-react';
import Flag from './Flag';
import { countries } from '../data/countries';
import { Logo } from './Logo';
import { motion, AnimatePresence } from 'framer-motion';

const stepVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 }
};

export const ProfileOnboarding: React.FC = () => {
    const { user, updateProfile } = useAuthStore();
    const [step, setStep] = useState(1);
    
    const [displayName, setDisplayName] = useState(user?.username || '');
    const [gamingPlatform, setGamingPlatform] = useState('PC');
    const [country, setCountry] = useState('Global');
    const [language, setLanguage] = useState('en');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleComplete = async () => {
        setSaving(true);
        setError(null);
        try {
            await updateProfile({
                displayName,
                gamingPlatform,
                country,
                language,
                isOnboarded: true
            });
        } catch (err: any) {
            console.error('Failed to complete onboarding:', err);
            setError(err.message || 'Something went wrong. Please try again.');
            setSaving(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'var(--bg-app)',
            color: 'var(--text-main)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
        }}>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ textAlign: 'center', marginBottom: '40px' }}
            >
                <Logo size={56} style={{ margin: '0 auto 20px' }} />
                <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.5px' }}>
                    Complete Your Profile
                </h1>
                <p style={{ color: 'var(--text-dim)', fontSize: '15px' }}>
                    Tell us a bit about yourself to get started
                </p>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="card-professional" 
                style={{ width: '100%', maxWidth: '480px', position: 'relative', overflow: 'hidden' }}
            >
                {/* Step Indicator */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
                    <div style={{ 
                        flex: 1, height: '3px', borderRadius: '2px', 
                        background: 'var(--brand-primary)',
                        transition: 'all 0.4s ease'
                    }} />
                    <div style={{ 
                        flex: 1, height: '3px', borderRadius: '2px', 
                        background: step === 2 ? 'var(--brand-primary)' : 'rgba(255,255,255,0.06)',
                        transition: 'all 0.4s ease'
                    }} />
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            variants={stepVariants}
                            initial="enter" animate="center" exit="exit"
                            transition={{ duration: 0.3 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                                <div style={{ 
                                    padding: '10px', background: 'rgba(56, 189, 248, 0.08)', 
                                    borderRadius: 'var(--radius-sm)', color: 'var(--brand-primary)' 
                                }}>
                                    <User size={20} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Personal Info</h2>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Step 1 of 2</p>
                                </div>
                            </div>
                            
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>Display Name</label>
                                <input 
                                    className="input-standard" 
                                    placeholder="How should we call you?"
                                    value={displayName} 
                                    onChange={e => setDisplayName(e.target.value)} 
                                    style={{ height: '48px', width: '100%' }}
                                />
                            </div>

                            <div style={{ marginBottom: '28px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>Platform</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    {['PC', 'PlayStation', 'Xbox', 'Mobile'].map(platform => (
                                        <motion.button 
                                            key={platform}
                                            whileHover={{ scale: 1.02, transition: { duration: 0.6, ease: "easeOut" } }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setGamingPlatform(platform)}
                                            style={{ 
                                                height: '56px', borderRadius: 'var(--radius-sm)',
                                                background: gamingPlatform === platform ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                                                border: gamingPlatform === platform ? '1px solid var(--brand-primary)' : '1px solid var(--border-light)',
                                                color: gamingPlatform === platform ? 'var(--brand-primary)' : 'var(--text-dim)',
                                                cursor: 'pointer', fontWeight: 600, fontSize: '14px',
                                                position: 'relative', overflow: 'hidden'
                                            }}
                                        >
                                            {/* Note for User: Lottie animations go here. Replaced with motion hover for now as files were missing */}
                                            {platform}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                className="btn-primary" 
                                style={{ width: '100%', height: '48px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
                                onClick={() => setStep(2)} 
                                disabled={!displayName.trim()}
                            >
                                Continue <ArrowRight size={16} />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            variants={stepVariants}
                            initial="enter" animate="center" exit="exit"
                            transition={{ duration: 0.3 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                                <div style={{ 
                                    padding: '10px', background: 'rgba(56, 189, 248, 0.08)', 
                                    borderRadius: 'var(--radius-sm)', color: 'var(--brand-primary)' 
                                }}>
                                    <Globe size={20} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Location & Language</h2>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Step 2 of 2</p>
                                </div>
                            </div>
                            
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>Country</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                                        <Flag code={country} size={18} />
                                    </div>
                                    <select 
                                        className="input-standard" 
                                        value={country} 
                                        onChange={e => setCountry(e.target.value)}
                                        style={{ height: '48px', paddingLeft: '40px', width: '100%' }}
                                    >
                                        <option value="Global">Worldwide</option>
                                        {countries.map(c => (
                                            <option key={c.code} value={c.code}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '28px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>Language</label>
                                <select 
                                    className="input-standard" 
                                    value={language} 
                                    onChange={e => setLanguage(e.target.value)}
                                    style={{ height: '48px', width: '100%' }}
                                >
                                    <option value="en">English</option>
                                    <option value="ar">العربية</option>
                                </select>
                            </div>

                            {error && (
                                <div style={{ 
                                    padding: '12px', background: 'rgba(239, 68, 68, 0.08)', 
                                    border: '1px solid rgba(239, 68, 68, 0.15)', 
                                    color: '#f87171', fontSize: '13px', borderRadius: 'var(--radius-sm)',
                                    marginBottom: '20px'
                                }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '8px' }}>
                                <button 
                                    style={{ 
                                        height: '48px', background: 'transparent', 
                                        border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)',
                                        color: 'var(--text-dim)', cursor: 'pointer', fontWeight: 600
                                    }} 
                                    onClick={() => setStep(1)} 
                                    disabled={saving}
                                >
                                    Back
                                </button>
                                <button 
                                    className="btn-primary" 
                                    style={{ height: '48px', fontSize: '15px' }} 
                                    onClick={handleComplete} 
                                    disabled={saving}
                                >
                                    {saving ? 'Setting up...' : 'Complete Setup'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
