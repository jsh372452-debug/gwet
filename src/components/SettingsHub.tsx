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
                    borderRadius: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' 
                }}>
                    <Settings size={32} />
                </div>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Space Grotesk', letterSpacing: '-0.5px' }}>SYSTEM_SETTINGS</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Configure your operator parameters and node preferences.</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* Identity Section */}
                <section>
                    <h3 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                        <User size={14} /> IDENTITY_PROTOCOL
                    </h3>
                    <div className="card" style={{ padding: '32px', borderRadius: '0' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>PUBLIC_ALIAS</label>
                                <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Display Name" style={{ borderRadius: '0', fontSize: '13px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>CHOSEN_PLATFORM</label>
                                <select className="input" value={gamingPlatform} onChange={e => setGamingPlatform(e.target.value)} style={{ borderRadius: '0', fontSize: '13px', fontWeight: 700 }}>
                                    {['PC', 'PlayStation', 'Xbox', 'Mobile', 'Nintendo Switch'].map((p) => (
                                        <option key={p} value={p}>{p.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>CORE_DIRECTIVES</label>
                            <textarea className="input" value={bio} onChange={e => setBio(e.target.value)} style={{ minHeight: '100px', padding: '12px', resize: 'none', borderRadius: '0', fontSize: '13px' }} placeholder="Enter operator bio..." />
                        </div>
                    </div>
                </section>

                {/* Regional Section */}
                <section>
                    <h3 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                        <Globe size={14} /> LOCALIZATION_PARAMS
                    </h3>
                    <div className="card" style={{ padding: '32px', borderRadius: '0' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>NODE_REGION</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                                        <Flag code={country} size={18} />
                                    </div>
                                    <select className="input" style={{ paddingLeft: '48px', borderRadius: '0', fontSize: '13px', fontWeight: 700 }} value={country} onChange={(e) => setCountry(e.target.value)}>
                                        <option value="Global">UNIVERSAL_NODE</option>
                                        {countries.map((c) => (
                                            <option key={c.code} value={c.code}>{c.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>INTERFACE_LANGUAGE</label>
                                <select className="input" value={language} onChange={(e) => setLanguage(e.target.value)} style={{ borderRadius: '0', fontSize: '13px', fontWeight: 700 }}>
                                    <option value="en">ENGLISH_ENCRYPTED</option>
                                    <option value="ar">ARABIC_SYNC</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Utility Section */}
                <section>
                     <h3 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                        <Lock size={14} /> SECURITY_ENFORCEMENT
                    </h3>
                    <div className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '0' }}>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '0.5px' }}>TERMINATE_SESSION</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Logout and disconnect from current node.</div>
                        </div>
                        <button className="btn btn-ghost" onClick={signOut} style={{ color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: '0', fontSize: '12px', fontWeight: 800, padding: '8px 16px' }}>
                            <LogOut size={16} /> DISCONNECT_NODE
                        </button>
                    </div>
                </section>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingBottom: '40px' }}>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '0 40px', height: '48px', borderRadius: '0', background: 'var(--text-primary)', color: 'var(--bg-deep)', fontSize: '13px', fontWeight: 800 }}>
                        <Save size={18} /> {saving ? 'SYNCHRONIZING...' : 'SAVE_PARAMETERS'}
                    </button>
                </div>
            </div>
        </div>
    );
};
