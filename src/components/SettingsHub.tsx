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
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '2.5rem' }}>
                <div style={{ padding: '12px', background: 'var(--primary-glow)', borderRadius: '12px', color: 'var(--primary)' }}><ShieldCheck size={32} /></div>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>{t('settings')}</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 700 }}>ELITE PROFILE CONFIGURATION</p>
                </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', padding: '3rem' }}>
                {/* Profile Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2.5rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <div className="avatar-premium" style={{ width: 120, height: 120, fontSize: '3rem' }}>
                            {avatarPreview ? <img src={avatarPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user?.username.charAt(0).toUpperCase()}
                        </div>
                        <label style={{ position: 'absolute', bottom: 4, right: 4, background: 'var(--primary)', padding: '10px', borderRadius: '50%', cursor: 'pointer', display: 'flex', border: '3px solid var(--bg-dark)', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                            <Camera size={20} color="white" />
                            <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                        </label>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '4px', display: 'block' }}>{t('display_name')}</label>
                        <input className="gaming-input" style={{ fontSize: '1.2rem', padding: '1rem 1.5rem' }} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="KillerGamer99" />
                    </div>
                </div>

                <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '10px', display: 'block' }}><PenTool size={12} /> {isRTL ? 'السيرة الذاتية' : 'BIO'}</label>
                    <textarea className="gaming-input" style={{ minHeight: '100px' }} value={bio} onChange={e => setBio(e.target.value)} placeholder={isRTL ? 'تحدث عن نفسك...' : 'Tell the world who you are...'} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '2.5rem' }}>
                    <div>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '10px', display: 'block' }}><Gamepad2 size={12} /> GAME ID (e.g. VALORANT)</label>
                        <input className="gaming-input" value={gameId} onChange={e => setGameId(e.target.value)} placeholder="VAL-123" />
                    </div>
                    <div>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '10px', display: 'block' }}><Gamepad2 size={12} /> GAME USERNAME</label>
                        <input className="gaming-input" value={gameUsername} onChange={e => setGameUsername(e.target.value)} placeholder="NIGHTSTALKER" />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    <div>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '10px', display: 'block' }}><Globe size={12} /> {t('country')}</label>
                        <select className="gaming-input" value={country} onChange={e => setCountry(e.target.value)}>
                            {countries.map(c => <option key={c.code} value={c.code} style={{ background: '#000' }}>{c.flag} {c.name.toUpperCase()}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '10px', display: 'block' }}><Languages size={12} /> {t('language')}</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className={`btn ${language === 'en' ? 'primary' : 'ghost'}`} style={{ flex: 1, fontWeight: 900 }} onClick={() => setLanguage('en')}>ENGLISH</button>
                            <button className={`btn ${language === 'ar' ? 'primary' : 'ghost'}`} style={{ flex: 1, fontWeight: 900 }} onClick={() => setLanguage('ar')}>العربية</button>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    <div>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '10px', display: 'block' }}><MessageCircle size={12} /> WHATSAPP (PUBLIC)</label>
                        <input className="gaming-input" placeholder="+123456789" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
                    </div>
                    <div>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '10px', display: 'block' }}><Send size={12} /> TELEGRAM (PUBLIC)</label>
                        <input className="gaming-input" placeholder="USERNAME" value={telegram} onChange={e => setTelegram(e.target.value)} />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px', marginTop: '1rem' }}>
                    {saved && <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>✓ CONFIGURATION SYNCED</span>}
                    <button className="btn primary" onClick={handleSave} style={{ padding: '1rem 3rem', fontWeight: 900 }}>
                        <Save size={20} /> {t('save')}
                    </button>
                </div>
            </div>
        </div>
    );
};
