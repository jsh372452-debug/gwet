import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { countries } from '../data/countries';
import { User, Globe, Languages, Save, Camera, ShieldCheck, MessageCircle, Send, Gamepad2, PenTool } from 'lucide-react';

export const SettingsHub: React.FC = () => {
    const { user, updateProfile, updateIdentity } = useAuthStore();
    const { t, isRTL } = useTranslation();

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [gameId, setGameId] = useState(user?.game_id || '');
    const [gameUsername, setGameUsername] = useState(user?.game_username || '');
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
        await updateProfile(displayName, avatarPreview, whatsapp, telegram, bio, gameId, gameUsername);
        await updateIdentity(country, language as 'ar' | 'en');
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="page-container" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            <div className="section-header">
                <div className="icon-wrap" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}><ShieldCheck size={22} /></div>
                <div>
                    <h2 style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{t('settings')}</h2>
                    <p className="subtitle">ELITE PROFILE CONFIGURATION</p>
                </div>
            </div>

            <div className="glass-card sharp" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                {/* Profile Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--space-xl)', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <div className="avatar-premium" style={{ width: 100, height: 100, fontSize: '2.5rem' }}>
                            {avatarPreview ? <img src={avatarPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user?.username.charAt(0).toUpperCase()}
                        </div>
                        <label style={{ position: 'absolute', bottom: -4, right: -4, background: 'var(--primary)', padding: '8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', border: '2px solid var(--bg-dark)' }}>
                            <Camera size={16} color="white" />
                            <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                        </label>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label className="label">{t('display_name')}</label>
                            <input className="gaming-input" style={{ marginBottom: 0 }} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="KillerGamer99" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="label"><PenTool size={12} style={{ marginRight: '6px' }} /> {isRTL ? 'السيرة الذاتية' : 'BIO'}</label>
                    <textarea className="gaming-input" style={{ marginBottom: 0, minHeight: '80px' }} value={bio} onChange={e => setBio(e.target.value)} placeholder={isRTL ? 'تحدث عن نفسك...' : 'Tell the world who you are...'} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-xl)', borderTop: '1px solid var(--glass-border)', paddingTop: 'var(--space-xl)' }}>
                    <div>
                        <label className="label"><Gamepad2 size={12} style={{ marginRight: '6px' }} /> GAME ID (e.g. Valorant)</label>
                        <input className="gaming-input" style={{ marginBottom: 0 }} value={gameId} onChange={e => setGameId(e.target.value)} placeholder="VAL-123" />
                    </div>
                    <div>
                        <label className="label"><Gamepad2 size={12} style={{ marginRight: '6px' }} /> GAME USERNAME</label>
                        <input className="gaming-input" style={{ marginBottom: 0 }} value={gameUsername} onChange={e => setGameUsername(e.target.value)} placeholder="Nightstalker" />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-xl)' }}>
                    <div>
                        <label className="label"><Globe size={12} style={{ marginRight: '6px' }} /> {t('country')}</label>
                        <select className="gaming-input" style={{ marginBottom: 0 }} value={country} onChange={e => setCountry(e.target.value)}>
                            {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="label"><Languages size={12} style={{ marginRight: '6px' }} /> {t('language')}</label>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                            <button className={`btn sharp ${language === 'en' ? 'primary' : 'ghost'}`} style={{ flex: 1, fontWeight: 900 }} onClick={() => setLanguage('en')}>ENGLISH</button>
                            <button className={`btn sharp ${language === 'ar' ? 'primary' : 'ghost'}`} style={{ flex: 1, fontWeight: 900 }} onClick={() => setLanguage('ar')}>العربية</button>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-xl)' }}>
                    <div>
                        <label className="label"><MessageCircle size={12} style={{ marginRight: '6px' }} /> WHATSAPP (PUBLIC)</label>
                        <input className="gaming-input" style={{ marginBottom: 0 }} placeholder="+123456789" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
                    </div>
                    <div>
                        <label className="label"><Send size={12} style={{ marginRight: '6px' }} /> TELEGRAM (PUBLIC)</label>
                        <input className="gaming-input" style={{ marginBottom: 0 }} placeholder="username" value={telegram} onChange={e => setTelegram(e.target.value)} />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--space-md)', marginTop: '1rem' }}>
                    {saved && <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 900, letterSpacing: '1px' }}>✓ CONFIGURATION SYNCED</span>}
                    <button className="btn primary sharp" onClick={handleSave} style={{ padding: '0.75rem 2rem', fontWeight: 900 }}><Save size={18} /> {t('save')}</button>
                </div>
            </div>
        </div>
    );
};
