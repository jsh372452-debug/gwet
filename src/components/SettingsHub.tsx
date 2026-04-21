import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Settings, Shield, User, Globe, Gamepad2, Save, Monitor, Bell, Lock, LogOut } from 'lucide-react';
import { useTranslation } from '../i18n';
import Flag from './Flag';
import { countries } from '../data/countries';

export const SettingsHub: React.FC = () => {
    const { user, updateProfile, signOut } = useAuthStore();
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
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', direction: isRTL ? 'rtl' : 'ltr' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                <div style={{ 
                    width: '64px', height: '64px', background: 'var(--bg-elevated)', 
                    borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: 'var(--brand-electric)', border: '1px solid var(--border-subtle)' 
                }}>
                    <Settings size={32} />
                </div>
                <div>
                    <h2 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Space Grotesk' }}>{t('settings')}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Configure your operator profile and storm preferences.</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* Identity Section */}
                <section>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
                        <User size={16} /> Identity_Protocol
                    </h3>
                    <div className="card" style={{ padding: '32px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>PUBLIC ALIAS</label>
                                <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Display Name" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>CHOSEN PLATFORM</label>
                                <select className="input" value={gamingPlatform} onChange={e => setGamingPlatform(e.target.value)}>
                                    {['PC', 'PlayStation', 'Xbox', 'Mobile', 'Nintendo Switch'].map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>DIRECTIVES / BIO</label>
                            <textarea className="input" value={bio} onChange={e => setBio(e.target.value)} style={{ minHeight: '100px', padding: '12px', resize: 'none' }} placeholder="Tell the world who you are..." />
                        </div>
                    </div>
                </section>

                {/* Regional Section */}
                <section>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
                        <Globe size={16} /> Localization_Settings
                    </h3>
                    <div className="card" style={{ padding: '32px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>OPERATING REGION</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                                        <Flag code={country} size={20} />
                                    </div>
                                    <select className="input" style={{ paddingLeft: '48px' }} value={country} onChange={(e) => setCountry(e.target.value)}>
                                        <option value="Global">Universal / Global</option>
                                        {countries.map((c) => (
                                            <option key={c.code} value={c.code}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>INTERFACE LANGUAGE</label>
                                <select className="input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                                    <option value="en">English (Elite Console)</option>
                                    <option value="ar">العربية (Arabic Sync)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Utility Section */}
                <section>
                     <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
                        <Lock size={16} /> Account_Security
                    </h3>
                    <div className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '15px' }}>TERMINATE SESSION</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Logout from current neural link.</div>
                        </div>
                        <button className="btn btn-ghost" onClick={signOut} style={{ color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <LogOut size={16} /> {t('logout')}
                        </button>
                    </div>
                </section>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingBottom: '40px' }}>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '0 40px', height: '48px' }}>
                        <Save size={18} /> {saving ? 'SYNCING...' : t('save')}
                    </button>
                </div>
            </div>
        </div>
    );
};
