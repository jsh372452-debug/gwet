import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { Logo } from './Logo';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Github, Chrome, Gamepad2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthUIProps {
    onBack?: () => void;
}

export const AuthUI: React.FC<AuthUIProps> = ({ onBack }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, register, loading, error } = useAuthStore();
    const { t, isRTL } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        useAuthStore.setState({ error: null });
        
        if (isLogin) {
            await login(email, password);
        } else {
            if (password.length < 8) {
                alert("Password must be at least 8 characters.");
                return;
            }
            await register(email, password, username);
        }
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) console.error("Google Auth Error:", error);
    };

    return (
        <div style={{ height: '100vh', width: '100vw', display: 'flex', background: 'var(--bg-deep)' }}>
            
            {/* Left Panel: Brand / Stealth */}
            <div className="hide-mobile" style={{ 
                flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', 
                justifyContent: 'space-between', padding: '64px',
                background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)'
            }}>
                {onBack && (
                    <button onClick={onBack} className="btn btn-ghost" style={{ alignSelf: 'flex-start' }}>
                        <ArrowLeft size={16} /> Back to Entry
                    </button>
                )}
                
                <div style={{ position: 'absolute', opacity: 0.02, transform: 'scale(3) rotate(-5deg)', zIndex: 0, left: '-20%', top: '20%' }}>
                    <Logo size={800} />
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <Logo size={64} style={{ marginBottom: '32px' }} />
                    <h2 style={{ fontSize: '40px', fontWeight: 800, fontFamily: 'Space Grotesk', lineHeight: 1.1, marginBottom: '16px', letterSpacing: '-1px' }}>
                        SYSTEM_AUTH<br />REQ_CLEARANCE
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '300px' }}>
                        Secure access gateway. Your digital identity protocol starts here. Ensure transmission is encrypted.
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, letterSpacing: '1px' }}>
                    <span>SECURE CONNECTION</span>
                    <span>NODE V1.0</span>
                </div>
            </div>

            {/* Right Panel: Form */}
            <div style={{ 
                flex: 1, display: 'flex', alignItems: 'center', 
                justifyContent: 'center', padding: '48px', position: 'relative'
            }}>
                {/* Mobile back button */}
                {onBack && (
                    <button onClick={onBack} className="btn btn-ghost" style={{ position: 'absolute', top: '24px', left: '24px', display: 'none' }} id="mobile-back">
                        <ArrowLeft size={16} />
                    </button>
                )}

                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <div style={{ marginBottom: '40px' }}>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px' }}>
                            {isLogin ? 'Authenticate.' : 'Initialize Profile.'}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            {isLogin ? 'Provide your standard credentials.' : 'Establish your new digital identity.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Email Designation
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input 
                                    className="input" 
                                    style={{ paddingLeft: '48px' }}
                                    placeholder="Enter secure email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {!isLogin && (
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Identity Alias (Gamertag)
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <UserIcon size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input 
                                        className="input" 
                                        style={{ paddingLeft: '48px' }}
                                        placeholder="GAMER_ID"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Passkey
                                </label>
                                {isLogin && <a href="#" style={{ fontSize: '11px', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 700 }}>Reset?</a>}
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input 
                                    className="input" 
                                    style={{ paddingLeft: '48px', paddingRight: '48px' }}
                                    placeholder="••••••••"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div style={{ padding: '12px', background: 'rgba(239, 44, 68, 0.05)', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: '12px', fontWeight: 600 }}>
                                {error}
                            </div>
                        )}

                        <button className="btn btn-primary" type="submit" style={{ height: '48px', fontSize: '14px', marginTop: '8px', background: 'var(--text-primary)', color: 'var(--bg-deep)' }} disabled={loading}>
                            {loading ? 'Processing...' : (isLogin ? 'AUTHORIZE' : 'INITIALIZE')}
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '16px 0' }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px' }}>EXTERNAL OAUTH</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <button type="button" className="btn btn-ghost" style={{ padding: '0', height: '44px', borderRadius: '0' }} title="Discord"><Gamepad2 size={18} color="var(--text-secondary)" /></button>
                            <button type="button" onClick={handleGoogleLogin} className="btn btn-ghost" style={{ padding: '0', height: '44px', borderRadius: '0' }} title="Google"><Chrome size={18} color="var(--text-secondary)" /></button>
                            <button type="button" className="btn btn-ghost" style={{ padding: '0', height: '44px', borderRadius: '0' }} title="Github"><Github size={18} color="var(--text-secondary)" /></button>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                            {isLogin ? "Require an alias? " : "Already authenticated? "}
                            <button 
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                            >
                                {isLogin ? "Initialize here" : "Authorize here"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                @media (max-width: 800px) {
                    .hide-mobile { display: none !important; }
                    #mobile-back { display: flex !important; }
                }
            `}</style>
        </div>
    );
};
