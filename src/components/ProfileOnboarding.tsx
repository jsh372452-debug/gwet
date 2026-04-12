import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Target, Globe, Gamepad2, ArrowRight } from 'lucide-react';
import Flag from './Flag';
import { countries } from '../data/countries';
import { Logo } from './Logo';

export const ProfileOnboarding: React.FC = () => {
    const { user, updateProfile } = useAuthStore();
    const [step, setStep] = useState(1);
    
    // Form state
    const [displayName, setDisplayName] = useState(user?.username || '');
    const [gamingPlatform, setGamingPlatform] = useState('PC');
    const [country, setCountry] = useState('Global');
    const [language, setLanguage] = useState('en');
    const [saving, setSaving] = useState(false);

    const handleComplete = async () => {
        setSaving(true);
        try {
            await updateProfile({
                displayName,
                gamingPlatform,
                country,
                language,
                isOnboarded: true
            });
            // App state will automatically update and reroute to dashboard
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
            setSaving(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'var(--bg-dark)',
            color: 'var(--text-main)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div className="bg-glow purple" />
            <div className="bg-glow cyan" />

            <div style={{ textAlign: 'center', marginBottom: '3rem', zIndex: 10 }}>
                <div style={{ margin: '0 auto 1.5rem', display: 'flex', justifyContent: 'center' }}><Logo size={64} /></div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
                    WELCOME TO GWET
                </h1>
                <p style={{ color: 'var(--primary)', letterSpacing: '4px', fontWeight: 700, marginTop: '8px' }}>
                    OPERATOR REGISTRATION
                </p>
            </div>

            <div className="glass-card premium-pattern" style={{ width: '100%', maxWidth: '500px', padding: '3rem', zIndex: 10 }}>
                {step === 1 && (
                    <div className="animate-fade-in">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
                            <div style={{ background: 'var(--primary-glow)', padding: '10px', borderRadius: '12px' }}>
                                <Target size={24} color="var(--primary)" />
                            </div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>BASIC IDENTITY</h2>
                        </div>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>OPERATOR ALIAS (DISPLAY NAME)</label>
                            <input 
                                className="gaming-input" 
                                value={displayName} 
                                onChange={e => setDisplayName(e.target.value)} 
                                style={{ height: '48px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>PRIMARY PLATFORM</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {['PC', 'PlayStation', 'Xbox', 'Mobile'].map(platform => (
                                    <div 
                                        key={platform}
                                        onClick={() => setGamingPlatform(platform)}
                                        style={{
                                            border: gamingPlatform === platform ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                                            background: gamingPlatform === platform ? 'var(--primary-soft)' : 'rgba(255,255,255,0.02)',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            fontWeight: 800,
                                            fontSize: '14px',
                                            color: gamingPlatform === platform ? '#fff' : 'var(--text-muted)'
                                        }}
                                    >
                                        {platform}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="btn primary block" onClick={() => setStep(2)} disabled={!displayName.trim()}>
                            PROCEED <ArrowRight size={16} />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
                            <div style={{ background: 'var(--primary-glow)', padding: '10px', borderRadius: '12px' }}>
                                <Globe size={24} color="var(--primary)" />
                            </div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>LOCALIZATION</h2>
                        </div>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>OPERATING REGION</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }}>
                                    <Flag code={country} size={24} />
                                </div>
                                <select 
                                    className="gaming-input" 
                                    value={country} 
                                    onChange={e => setCountry(e.target.value)}
                                    style={{ height: '48px', paddingLeft: '50px' }}
                                >
                                    <option value="Global">Universal</option>
                                    {countries.map(c => (
                                        <option key={c.code} value={c.code}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>INTERFACE LANGUAGE</label>
                            <select 
                                className="gaming-input" 
                                value={language} 
                                onChange={e => setLanguage(e.target.value)}
                                style={{ height: '48px' }}
                            >
                                <option value="en">ENGLISH</option>
                                <option value="ar">ARABIC</option>
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                            <button className="btn ghost" onClick={() => setStep(1)}>BACK</button>
                            <button className="btn primary" onClick={handleComplete} disabled={saving}>
                                {saving ? "INITIALIZING..." : "FINALIZE REGISTRATION"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '2rem', zIndex: 10 }}>
                <div style={{ width: '40px', height: '4px', background: step === 1 ? 'var(--primary)' : 'var(--glass-border)', borderRadius: '2px' }} />
                <div style={{ width: '40px', height: '4px', background: step === 2 ? 'var(--primary)' : 'var(--glass-border)', borderRadius: '2px' }} />
            </div>
        </div>
    );
};
