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
                    <button onClick={onBack} className="btn btn-ghost" style={{ alignSelf: 'flex-start', borderRadius: '0', border: '1px solid var(--border-subtle)', padding: '8px 16px', fontSize: '11px', fontWeight: 800 }}>
                        <ArrowLeft size={14} style={{ marginRight: '8px' }} /> ABORT_PROTOCOL
                    </button>
                )}
                
                <div style={{ position: 'absolute', opacity: 0.015, transform: 'scale(2) rotate(-10deg)', zIndex: 0, right: '-10%', bottom: '10%' }}>
                    <Logo size={600} />
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <Logo size={48} style={{ marginBottom: '32px' }} />
                    <h2 style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'Space Grotesk', lineHeight: 1, marginBottom: '24px', letterSpacing: '-1.5px' }}>
                        NODE_ACCESS<br />RESTRICTED
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '320px', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.6 }}>
                        Authorized entrance only. All connections are monitored and logged. Neural sync protocol engaged.
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '10px', fontWeight: 800, letterSpacing: '2px' }}>
                    <span>SECURE_DATA_LINK</span>
                    <span>GWET_SYSTEM_V.1.0</span>
                </div>
            </div>

            {/* Right Panel: Form */}
            <div style={{ 
                flex: 1, display: 'flex', alignItems: 'center', 
                justifyContent: 'center', padding: '48px', position: 'relative'
            }}>
                {/* Mobile back button */}
                {onBack && (
                    <button onClick={onBack} className="btn btn-ghost" style={{ position: 'absolute', top: '24px', left: '24px', display: 'none', borderRadius: '0' }} id="mobile-back">
                        <ArrowLeft size={16} />
                    </button>
                )}

                <div style={{ width: '100%', maxWidth: '360px' }}>
                    <div style={{ marginBottom: '48px' }}>
                        <h1 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px', letterSpacing: '1px' }}>
                            {isLogin ? 'IDENTITY_AUTH' : 'INIT_PROTOCOL'}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {isLogin ? 'Provide clearance credentials.' : 'Establish new operative record.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                                DESIGNATION_EMAIL
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input 
                                    className="input" 
                                    style={{ paddingLeft: '48px', borderRadius: '0', fontSize: '13px' }}
                                    placeholder="NODE_ADDRESS..."
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {!isLogin && (
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                                    OPERATIVE_ALIAS
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <UserIcon size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input 
                                        className="input" 
                                        style={{ paddingLeft: '48px', borderRadius: '0', fontSize: '13px' }}
                                        placeholder="UNIQUE_IDENTIFIER"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                                    ENCRYPTED_PASSKEY
                                </label>
                                {isLogin && <button type="button" style={{ background: 'none', border: 'none', fontSize: '10px', color: 'var(--text-primary)', fontWeight: 800, cursor: 'pointer', letterSpacing: '1px' }}>RECOVERY?</button>}
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input 
                                    className="input" 
                                    style={{ paddingLeft: '48px', paddingRight: '48px', borderRadius: '0', fontSize: '13px' }}
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
                            <div style={{ padding: '12px', background: 'var(--bg-input)', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {error}
                            </div>
                        )}

                        <button className="btn btn-primary" type="submit" style={{ height: '48px', fontSize: '13px', marginTop: '8px', background: 'var(--text-primary)', color: 'var(--bg-deep)', borderRadius: '0', fontWeight: 900, letterSpacing: '1.5px' }} disabled={loading}>
                            {loading ? 'PROCESSING...' : (isLogin ? 'AUTHORIZE_NODE' : 'INIT_RECORD')}
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '16px 0' }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '2px' }}>OAUTH_BRIDGING</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <button type="button" className="btn btn-ghost" style={{ padding: '0', height: '44px', borderRadius: '0', border: '1px solid var(--border-subtle)' }} title="Discord"><Gamepad2 size={18} color="var(--text-muted)" /></button>
                            <button type="button" onClick={handleGoogleLogin} className="btn btn-ghost" style={{ padding: '0', height: '44px', borderRadius: '0', border: '1px solid var(--border-subtle)' }} title="Google"><Chrome size={18} color="var(--text-muted)" /></button>
                            <button type="button" className="btn btn-ghost" style={{ padding: '0', height: '44px', borderRadius: '0', border: '1px solid var(--border-subtle)' }} title="Github"><Github size={18} color="var(--text-muted)" /></button>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {isLogin ? "Require an alias? " : "Record exists? "}
                            <button 
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: 900, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                            >
                                {isLogin ? "START_INIT" : "START_AUTH"}
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
