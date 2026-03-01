import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { countries } from '../data/countries';
import { User, Globe, Languages, Save, Camera, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const SettingsHub: React.FC = () => {
    const { user, updateIdentity, updateProfile } = useAuthStore();
    const { t, isRTL } = useTranslation();

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [country, setCountry] = useState(user?.country || 'Global');
    const [language, setLanguage] = useState(user?.language || 'en');
    const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        await updateProfile(displayName, avatarPreview);
        await updateIdentity(country, language as 'ar' | 'en');
        alert('Identity Updated!');
    };

    return (
        <div style={{ padding: '0 1rem', maxWidth: '800px', margin: '0 auto', direction: isRTL ? 'rtl' : 'ltr' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <div className="avatar-premium" style={{ width: '52px', height: '52px', background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                    <ShieldCheck size={32} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white' }}>{t('settings')}</h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 'bold' }}>CONTROL YOUR GLOBAL IDENTITY</p>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Profile Section */}
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                        <div className="avatar-premium" style={{ width: '120px', height: '120px', fontSize: '2rem', backgroundImage: `url(${avatarPreview})`, backgroundSize: 'cover' }}>
                            {!avatarPreview && user?.username.charAt(0).toUpperCase()}
                        </div>
                        <label style={{
                            position: 'absolute', bottom: '5px', right: '5px',
                            background: 'var(--primary)', padding: '8px', borderRadius: '50%',
                            cursor: 'pointer', boxShadow: '0 4px 15px var(--primary-glow)'
                        }}>
                            <Camera size={18} color="white" />
                            <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                        </label>
                    </div>

                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>{t('display_name')}</label>
                        <input className="gaming-input" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    {/* Country Section */}
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>
                            <Globe size={14} style={{ marginRight: '8px' }} /> {t('country')}
                        </label>
                        <select className="gaming-input" value={country} onChange={e => setCountry(e.target.value)}>
                            {countries.map(c => (
                                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Language Section */}
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>
                            <Languages size={14} style={{ marginRight: '8px' }} /> {t('language')}
                        </label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                className={`btn-premium ${language === 'en' ? 'active' : ''}`}
                                style={{ flex: 1, background: language === 'en' ? 'var(--primary-glow)' : 'rgba(255,255,255,0.03)' }}
                                onClick={() => setLanguage('en')}
                            >
                                English
                            </button>
                            <button
                                className={`btn-premium ${language === 'ar' ? 'active' : ''}`}
                                style={{ flex: 1, background: language === 'ar' ? 'var(--primary-glow)' : 'rgba(255,255,255,0.03)' }}
                                onClick={() => setLanguage('ar')}
                            >
                                العربية
                            </button>
                        </div>
                    </div>
                </div>

                <button className="btn-premium" style={{ alignSelf: 'flex-end', marginTop: '1rem' }} onClick={handleSave}>
                    <Save size={20} /> {t('save')}
                </button>
            </div>
        </div>
    );
};
