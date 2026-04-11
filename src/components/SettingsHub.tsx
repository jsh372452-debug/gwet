import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Settings, Shield, User, Globe, Gamepad2, Save } from 'lucide-react';
import { useTranslation } from '../i18n';
import Flag from './Flag';
import { countries } from '../data/countries';

export const SettingsHub: React.FC = () => {
    const { user, updateProfile } = useAuthStore();
    const { t, isRTL } = useTranslation();
    
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [gamingPlatform, setGamingPlatform] = useState(user?.gamingPlatform || 'PC');
    const [country, setCountry] = useState(user?.country || 'Global');
    const [language, setLanguage] = useState(user?.language || 'en');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProfile({ displayName, bio, gamingPlatform, country, language });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-container" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '2.5rem' }}>
                <div style={{ padding: '12px', background: 'var(--primary-glow)', borderRadius: '12px', color: 'var(--primary)' }}>
                    <Settings size={32} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>SETTINGS & COMMS</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 700 }}>CONFIGURE YOUR OPERATOR LOADOUT</p>
                </div>
            </div>

            <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}><User size={18} color="var(--primary)" /> IDENTITY PROFILE</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 800, marginBottom: '8px', display: 'block' }}>DISPLAY NAME</label>
                        <input className="gaming-input" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                    </div>
                    <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 800, marginBottom: '8px', display: 'block' }}>GAMING PLATFORM</label>
                        <select className="gaming-input" value={gamingPlatform} onChange={e => setGamingPlatform(e.target.value)}>
                            {['PC', 'PlayStation', 'Xbox', 'Mobile', 'Nintendo Switch'].map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 800, marginBottom: '8px', display: 'block' }}>BIO / RULES OF ENGAGEMENT</label>
                        <textarea className="gaming-input" value={bio} onChange={e => setBio(e.target.value)} style={{ minHeight: '80px' }} />
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Globe size={18} color="var(--primary)" /> REGION & LOCALIZATION</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 800, marginBottom: '8px', display: 'block' }}>OPERATING REGION</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                                <Flag code={country} size={20} />
                            </div>
                            <select className="gaming-input" style={{ paddingLeft: '45px' }} value={country} onChange={(e) => setCountry(e.target.value)}>
                                <option value="Global">Global / Universal</option>
                                {countries.map((c) => (
                                    <option key={c.code} value={c.code}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 800, marginBottom: '8px', display: 'block' }}>INTERFACE LANGUAGE</label>
                        <select className="gaming-input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                            <option value="en">English (US)</option>
                            <option value="ar">العربية (Arabic)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn primary" onClick={handleSave} disabled={saving} style={{ padding: '0.75rem 2.5rem' }}>
                    <Save size={16} /> {saving ? 'UPLOADING...' : 'SAVE CONFIGURATION'}
                </button>
            </div>
        </div>
    );
};
