import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { countries } from '../data/countries';
import { User, Globe, Languages, ChevronRight, Camera } from 'lucide-react';

export const ProfileOnboarding: React.FC = () => {
    const { user, completeOnboarding } = useAuthStore();
    const { t, isRTL } = useTranslation();
    const [step, setStep] = useState(0);
    const [displayName, setDisplayName] = useState(user?.displayName || user?.username || '');
    const [avatarPreview, setAvatarPreview] = useState('');
    const [country, setCountry] = useState('Global');
    const [language, setLanguage] = useState<'en' | 'ar'>('en');

    const [loading, setLoading] = useState(false);

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleFinish = async () => {
        if (loading) return;
        setLoading(true);
        try {
            await completeOnboarding(displayName, avatarPreview, country, language);
        } catch (err) {
            console.error('Failed to complete onboarding:', err);
            alert('FAILED TO COMPLETE ONBOARDING. PLEASE TRY AGAIN.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)', direction: isRTL ? 'rtl' : 'ltr' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '3rem', borderRadius: '24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('onboarding')}</h1>
                    <p style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 800 }}>STEP {step + 1} / 2</p>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '1rem' }}>
                        <div style={{ width: 40, height: 4, borderRadius: 2, background: step >= 0 ? 'var(--primary)' : 'rgba(255,255,255,0.1)', boxShadow: step >= 0 ? '0 0 10px var(--primary-glow)' : 'none' }} />
                        <div style={{ width: 40, height: 4, borderRadius: 2, background: step >= 1 ? 'var(--primary)' : 'rgba(255,255,255,0.1)', boxShadow: step >= 1 ? '0 0 10px var(--primary-glow)' : 'none' }} />
                    </div>
                </div>

                {step === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <div className="avatar-premium xl" style={{ margin: '0 auto', width: 100, height: 100, backgroundImage: avatarPreview ? `url(${avatarPreview})` : 'none', backgroundSize: 'cover', fontSize: '2rem' }}>
                                    {!avatarPreview && <User size={48} />}
                                </div>
                                <label style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', border: '2px solid var(--bg-dark)' }}>
                                    <Camera size={16} color="white" />
                                    <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                                </label>
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>{t('display_name')}</label>
                            <input className="gaming-input" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="ENTER CALLSIGN..." />
                        </div>
                        <button className="btn primary" style={{ width: '100%', padding: '1rem' }} onClick={() => setStep(1)} disabled={!displayName.trim()}>
                            INITIALIZE NEXT PHASE <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div>
                            <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}><Globe size={12} /> {t('country')}</label>
                            <select className="gaming-input" value={country} onChange={e => setCountry(e.target.value)}>
                                {countries.map(c => <option key={c.code} value={c.code} style={{ background: '#0a0a0a' }}>{c.flag} {c.name.toUpperCase()}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}><Languages size={12} /> {t('language')}</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className={`btn ${language === 'en' ? 'primary' : 'ghost'}`} style={{ flex: 1 }} onClick={() => setLanguage('en')}>ENGLISH</button>
                                <button className={`btn ${language === 'ar' ? 'primary' : 'ghost'}`} style={{ flex: 1 }} onClick={() => setLanguage('ar')}>العربية</button>
                            </div>
                        </div>
                        <button className="btn primary" style={{ width: '100%', padding: '1rem' }} onClick={handleFinish} disabled={loading}>
                            {loading ? (isRTL ? 'جاري التحميل...' : 'INITIALIZING...') : (isRTL ? 'إكمال التسجيل' : 'COMPLETE ONBOARDING')}
                            {!loading && <ChevronRight size={18} />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
