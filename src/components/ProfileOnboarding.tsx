import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Target, Globe, Gamepad2, ArrowRight, ShieldCheck, Cpu, ChevronRight } from 'lucide-react';
import Flag from './Flag';
import { countries } from '../data/countries';
import { Logo } from './Logo';

export const ProfileOnboarding: React.FC = () => {
    const { user, updateProfile } = useAuthStore();
    const [step, setStep] = useState(1);
    
    const [displayName, setDisplayName] = useState(user?.username || '');
    const [gamingPlatform, setGamingPlatform] = useState('PC');
    const [country, setCountry] = useState('Global');
    const [language, setLanguage] = useState('en');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleComplete = async () => {
        setSaving(true);
        setError(null);
        try {
            await updateProfile({
                displayName,
                gamingPlatform,
                country,
                language,
                isOnboarded: true
            });
        } catch (err: any) {
            console.error('Failed to complete onboarding:', err);
            setError(err.message || 'Synchronization failed.');
            setSaving(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'var(--bg-deep)',
            color: 'var(--text-primary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Energy Backgrounds */}
            <div className="energy-blob blue-blob" style={{ top: '-10%', right: '-10%', opacity: 0.15 }} />
            <div className="energy-blob purple-blob" style={{ bottom: '-10%', left: '-10%', opacity: 0.15 }} />

            <div style={{ textAlign: 'center', marginBottom: '48px', zIndex: 10 }}>
                <div style={{ margin: '0 auto 24px', display: 'flex', justifyContent: 'center' }}>
                    <Logo size={80} />
                </div>
                <h1 style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'Space Grotesk', marginBottom: '8px' }}>
                    FORGE YOUR IDENTITY
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <div style={{ width: '40px', height: '1px', background: 'var(--border-subtle)' }} />
                    <p style={{ color: 'var(--brand-electric)', fontSize: '12px', fontWeight: 800, letterSpacing: '4px', textTransform: 'uppercase' }}>
                        Protocol Initialize
                    </p>
                    <div style={{ width: '40px', height: '1px', background: 'var(--border-subtle)' }} />
                </div>
            </div>

            <div className="card" style={{ width: '100%', maxWidth: '540px', padding: '48px', zIndex: 10, position: 'relative' }}>
                <div style={{ display: 'flex', gap: '8px', position: 'absolute', top: '24px', right: '24px' }}>
                    <div style={{ width: '32px', height: '4px', borderRadius: '2px', background: step === 1 ? 'var(--brand-electric)' : 'var(--bg-elevated)', transition: '0.3s' }} />
                    <div style={{ width: '32px', height: '4px', borderRadius: '2px', background: step === 2 ? 'var(--brand-electric)' : 'var(--bg-elevated)', transition: '0.3s' }} />
                </div>

                {step === 1 && (
                    <div className="animate-fade-in">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                            <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--brand-electric)' }}>
                                <Cpu size={24} />
                            </div>
                            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Step 01: Core Loadout</h2>
                        </div>
                        
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Operator Alias</label>
                            <input 
                                className="input" 
                                placeholder="How shall the world know you?"
                                value={displayName} 
                                onChange={e => setDisplayName(e.target.value)} 
                                style={{ height: '52px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Primary Platform</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {['PC', 'PlayStation', 'Xbox', 'Mobile'].map(platform => (
                                    <button 
                                        key={platform}
                                        onClick={() => setGamingPlatform(platform)}
                                        className={`btn ${gamingPlatform === platform ? 'btn-primary' : 'btn-ghost'}`}
                                        style={{ height: '48px', border: gamingPlatform === platform ? 'none' : '1px solid var(--border-subtle)' }}
                                    >
                                        {platform}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button className="btn btn-primary" style={{ width: '100%', height: '52px', fontSize: '16px' }} onClick={() => setStep(2)} disabled={!displayName.trim()}>
                            PROCEED TO SYNC <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                            <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--brand-electric)' }}>
                                <Globe size={24} />
                            </div>
                            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Step 02: Neural Sync</h2>
                        </div>
                        
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Operating Region</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                                    <Flag code={country} size={20} />
                                </div>
                                <select 
                                    className="input" 
                                    value={country} 
                                    onChange={e => setCountry(e.target.value)}
                                    style={{ height: '52px', paddingLeft: '48px' }}
                                >
                                    <option value="Global">Universal Node</option>
                                    {countries.map(c => (
                                        <option key={c.code} value={c.code}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Communication Protocol</label>
                            <select 
                                className="input" 
                                value={language} 
                                onChange={e => setLanguage(e.target.value)}
                                style={{ height: '52px' }}
                            >
                                <option value="en">ENGLISH MODULE</option>
                                <option value="ar">ARABIC SYNC</option>
                            </select>
                        </div>

                        {error && (
                            <div style={{ color: 'var(--danger)', fontSize: '13px', fontWeight: 700, textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.1)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                <ShieldCheck size={16} /> {error}
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '12px' }}>
                            <button className="btn btn-ghost" style={{ height: '52px' }} onClick={() => setStep(1)} disabled={saving}>BACK</button>
                            <button className="btn btn-primary" style={{ height: '52px', fontSize: '16px' }} onClick={handleComplete} disabled={saving}>
                                {saving ? "DEPLOYING IDENTITY..." : "INITIALIZE HUB ACCESS"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '48px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, opacity: 0.5, letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10 }}>
                <span className="mono-font">AAG_SECURE_BOOT_SEQUENCE</span>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                <span>VER_2.4.0</span>
            </div>
        </div>
    );
};
