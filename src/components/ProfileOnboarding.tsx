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
        31: <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)', direction: isRTL ? 'rtl' : 'ltr' }}>
            32:             <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '3rem', borderRadius: '24px' }}>
                33:                 <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    34:                     <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('onboarding')}</h1>
                    35:                     <p style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 800 }}>STEP {step + 1} / 2</p>
                    36:                     <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '1rem' }}>
                        37:                         <div style={{ width: 40, height: 4, borderRadius: 2, background: step >= 0 ? 'var(--primary)' : 'rgba(255,255,255,0.1)', boxShadow: step >= 0 ? '0 0 10px var(--primary-glow)' : 'none' }} />
                        38:                         <div style={{ width: 40, height: 4, borderRadius: 2, background: step >= 1 ? 'var(--primary)' : 'rgba(255,255,255,0.1)', boxShadow: step >= 1 ? '0 0 10px var(--primary-glow)' : 'none' }} />
                        39:                     </div>
                    40:                 </div>
                41:
                42:                 {step === 0 && (
                    43:                     <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    44:                         <div style={{ textAlign: 'center' }}>
                        45:                             <div style={{ position: 'relative', display: 'inline-block' }}>
                            46:                                 <div className="avatar-premium xl" style={{ margin: '0 auto', width: 100, height: 100, backgroundImage: avatarPreview ? `url(${avatarPreview})` : 'none', backgroundSize: 'cover', fontSize: '2rem' }}>
                                47:                                     {!avatarPreview && <User size={48} />}
                                48:                                 </div>
                            49:                                 <label style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', border: '2px solid var(--bg-dark)' }}>
                                50:                                     <Camera size={16} color="white" />
                                51:                                     <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                                52:                                 </label>
                            53:                             </div>
                        54:                         </div>
                    55:                         <div>
                        56:                             <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>{t('display_name')}</label>
                        57:                             <input className="gaming-input" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="ENTER CALLSIGN..." />
                        58:                         </div>
                    59:                         <button className="btn primary" style={{ width: '100%', padding: '1rem' }} onClick={() => setStep(1)} disabled={!displayName.trim()}>
                        60:                             INITIALIZE NEXT PHASE <ChevronRight size={18} />
                        61:                         </button>
                    62:                     </div>
63:                 )}
                64:
                65:                 {step === 1 && (
                    66:                     <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    67:                         <div>
                        68:                             <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}><Globe size={12} /> {t('country')}</label>
                        69:                             <select className="gaming-input" value={country} onChange={e => setCountry(e.target.value)}>
                            70:                                 {countries.map(c => <option key={c.code} value={c.code} style={{ background: '#0a0a0a' }}>{c.flag} {c.name.toUpperCase()}</option>)}
                            71:                             </select>
                        72:                         </div>
                    73:                         <div>
                        74:                             <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}><Languages size={12} /> {t('language')}</label>
                        75:                             <div style={{ display: 'flex', gap: '1rem' }}>
                            76:                                 <button className={`btn ${language === 'en' ? 'primary' : 'ghost'}`} style={{ flex: 1 }} onClick={() => setLanguage('en')}>ENGLISH</button>
                            77:                                 <button className={`btn ${language === 'ar' ? 'primary' : 'ghost'}`} style={{ flex: 1 }} onClick={() => setLanguage('ar')}>العربية</button>
                            78:                             </div>
                        79:                         </div>
                    80:                         <button className="btn primary" style={{ width: '100%', padding: '1rem' }} onClick={handleFinish}>
                        81:                             COMPLETE ONBOARDING <ChevronRight size={18} />
                        82:                         </button>
                    83:                     </div>
84:                 )}
                85:             </div>
        </div>
    );
};
