import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { countries } from '../data/countries';
import { User, Globe, Languages, ChevronRight, Camera } from 'lucide-react';

export const ProfileOnboarding: React.FC = () => {
    const { user, updateProfile, updateIdentity } = useAuthStore();
    const { t, isRTL } = useTranslation();
    const [step, setStep] = useState(0);
    const [displayName, setDisplayName] = useState(user?.displayName || user?.username || '');
    const [avatarPreview, setAvatarPreview] = useState('');
    const [country, setCountry] = useState('Global');
    const [language, setLanguage] = useState<'en' | 'ar'>('en');

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleFinish = async () => {
        await updateProfile(displayName, avatarPreview);
        await updateIdentity(country, language);
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)', direction: isRTL ? 'rtl' : 'ltr' }}>
            <div className="card" style={{ width: '100%', maxWidth: '480px', padding: 'var(--space-3xl)', borderRadius: 'var(--radius-2xl)' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
                    <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, marginBottom: 'var(--space-sm)' }}>{t('onboarding')}</h1>
                    <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>Step {step + 1} of 2</p>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: 'var(--space-md)' }}>
                        <div style={{ width: 40, height: 3, borderRadius: 2, background: step >= 0 ? 'var(--primary)' : 'var(--border)' }} />
                        <div style={{ width: 40, height: 3, borderRadius: 2, background: step >= 1 ? 'var(--primary)' : 'var(--border)' }} />
                    </div>
                </div>

                {step === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <div className="avatar xl" style={{ margin: '0 auto', backgroundImage: avatarPreview ? `url(${avatarPreview})` : 'none' }}>
                                    {!avatarPreview && <User size={36} />}
                                </div>
                                <label style={{ position: 'absolute', bottom: 4, right: 4, background: 'var(--primary)', padding: '6px', borderRadius: 'var(--radius-full)', cursor: 'pointer', display: 'flex' }}>
                                    <Camera size={14} color="white" />
                                    <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="label">{t('display_name')}</label>
                            <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your display name" />
                        </div>
                        <button className="btn primary" style={{ width: '100%' }} onClick={() => setStep(1)} disabled={!displayName.trim()}>
                            NEXT <ChevronRight size={16} />
                        </button>
                    </div>
                )}

                {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                        <div>
                            <label className="label"><Globe size={12} style={{ marginRight: '6px' }} /> {t('country')}</label>
                            <select className="input" value={country} onChange={e => setCountry(e.target.value)}>
                                {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label"><Languages size={12} style={{ marginRight: '6px' }} /> {t('language')}</label>
                            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                                <button className={`btn ${language === 'en' ? 'primary' : ''}`} style={{ flex: 1 }} onClick={() => setLanguage('en')}>English</button>
                                <button className={`btn ${language === 'ar' ? 'primary' : ''}`} style={{ flex: 1 }} onClick={() => setLanguage('ar')}>العربية</button>
                            </div>
                        </div>
                        <button className="btn primary" style={{ width: '100%' }} onClick={handleFinish}>
                            {t('save')} <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
