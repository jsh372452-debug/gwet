import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { countries } from '../data/countries';
import { User, Globe, Languages, Save, Camera, ShieldCheck, MessageCircle, Send } from 'lucide-react';

export const SettingsHub: React.FC = () => {
    const { user, updateProfile, updateIdentity } = useAuthStore();
    const { t, isRTL } = useTranslation();

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [country, setCountry] = useState(user?.country || 'Global');
    const [language, setLanguage] = useState(user?.language || 'en');
    const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');
    const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');
    const [telegram, setTelegram] = useState(user?.telegram || '');
    const [saved, setSaved] = useState(false);

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        await updateProfile(displayName, avatarPreview, whatsapp, telegram);
        await updateIdentity(country, language as 'ar' | 'en');
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="page-container" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            <div className="section-header">
                <div className="icon-wrap"><ShieldCheck size={22} /></div>
                <div>
                    <h2>{t('settings')}</h2>
                    <p className="subtitle">YOUR IDENTITY</p>
                </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
                {/* Profile */}
                <div style={{ display: 'flex', gap: 'var(--space-2xl)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                        <div className="avatar xl" style={{ backgroundImage: avatarPreview ? `url(${avatarPreview})` : 'none' }}>
                            {!avatarPreview && user?.username.charAt(0).toUpperCase()}
                        </div>
                        <label style={{ position: 'absolute', bottom: 4, right: 4, background: 'var(--primary)', padding: '6px', borderRadius: 'var(--radius-full)', cursor: 'pointer', display: 'flex' }}>
                            <Camera size={14} color="white" />
                            <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                        </label>
                    </div>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <label className="label">{t('display_name')}</label>
                        <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-2xl)' }}>
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
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-2xl)' }}>
                    <div>
                        <label className="label"><MessageCircle size={12} style={{ marginRight: '6px' }} /> WhatsApp</label>
                        <input className="input" placeholder="+123456789" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
                    </div>
                    <div>
                        <label className="label"><Send size={12} style={{ marginRight: '6px' }} /> Telegram Username</label>
                        <input className="input" placeholder="username" value={telegram} onChange={e => setTelegram(e.target.value)} />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--space-md)' }}>
                    {saved && <span style={{ fontSize: 'var(--font-sm)', color: 'var(--success)', fontWeight: 600 }}>✓ Saved</span>}
                    <button className="btn primary" onClick={handleSave}><Save size={16} /> {t('save')}</button>
                </div>
            </div>
        </div>
    );
};
