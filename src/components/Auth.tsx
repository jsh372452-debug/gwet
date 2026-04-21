import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { Logo } from './Logo';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Github, Chrome, Gamepad2, ArrowRight } from 'lucide-react';

export const AuthUI: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, register, loading, error } = useAuthStore();
    const { t, isRTL } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) await login(email, password);
        else {
            if (password.length < 8) {
                alert("SECURITY PROTOCOL: PASSWORD MUST BE AT LEAST 8 CHARACTERS");
                return;
            }
            await register(email, password, username);
        }
    };

    return (
        <div style={{ height: '100vh', width: '100vw', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', background: 'var(--bg-deep)' }}>
            
            {/* Left Panel: Brand */}
            <div className="hide-mobile" style={{ 
                position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', 
                justifyContent: 'center', alignItems: 'center', padding: '64px',
                background: 'linear-gradient(135deg, #0B1020 0%, #1E3A8A 100%)'
            }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none' }}>
                    <div className="lightning-streak" style={{ position: 'absolute', top: '10%', left: '20%', width: '2px', height: '100px', background: 'var(--brand-electric)', boxShadow: '0 0 20px var(--brand-electric)', transform: 'rotate(20deg)' }} />
                    <div className="lightning-streak" style={{ position: 'absolute', bottom: '20%', right: '30%', width: '2px', height: '150px', background: 'var(--brand-storm)', boxShadow: '0 0 20px var(--brand-storm)', transform: 'rotate(-15deg)' }} />
                </div>
                
                <div style={{ position: 'absolute', opacity: 0.05, transform: 'scale(2) rotate(-10deg)', zIndex: 0 }}>
                    <Logo size={400} />
                </div>

                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <Logo size={96} />
                    </div>
                    <h2 style={{ fontSize: '48px', fontWeight: 800, fontFamily: 'Space Grotesk', lineHeight: 1.1, marginBottom: '16px' }}>
                        Power up.<br />Squad up.<br /><span className="gradient-text">Win.</span>
                    </h2>
                </div>

                <div style={{ position: 'absolute', bottom: '32px', left: '48px', right: '48px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
                    <span>240K GAMERS</span>
                    <span>12K CLANS</span>
                </div>
            </div>

            {/* Right Panel: Form */}
            <div style={{ 
                background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', padding: '48px' 
            }}>
                <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px', background: 'transparent', border: 'none' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
                            {isLogin ? 'Welcome back, gamer.' : 'Create your gamertag.'}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            {isLogin ? 'Enter your credentials to join the storm.' : 'Start your journey with Gwet today.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Email / Gamertag
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input 
                                    className="input" 
                                    style={{ paddingLeft: '48px' }}
                                    placeholder="Enter your email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {!isLogin && (
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Chosen Gamertag
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <UserIcon size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
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
                                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Password
                                </label>
                                {isLogin && <a href="#" style={{ fontSize: '11px', color: 'var(--brand-electric)', textDecoration: 'none', fontWeight: 700 }}>Forgot password?</a>}
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
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
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div style={{ padding: '12px', background: 'rgba(239, 44, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '8px', color: 'var(--danger)', fontSize: '12px', fontWeight: 600 }}>
                                {error}
                            </div>
                        )}

                        <button className="btn btn-primary" style={{ height: '48px', fontSize: '15px' }} disabled={loading}>
                            {loading ? 'Processing...' : (isLogin ? 'Sign In ⚡' : 'Join the Storm ⚡')}
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '8px 0' }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>OR CONTINUE WITH</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <button type="button" className="btn btn-ghost" style={{ padding: '0', height: '44px' }} title="Discord"><Gamepad2 size={20} /></button>
                            <button type="button" className="btn btn-ghost" style={{ padding: '0', height: '44px' }} title="Google"><Chrome size={20} /></button>
                            <button type="button" className="btn btn-ghost" style={{ padding: '0', height: '44px' }} title="Github"><Github size={20} /></button>
                        </div>

                        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                            {isLogin ? "New here? " : "Already part of the storm? "}
                            <button 
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                style={{ background: 'none', border: 'none', color: 'var(--brand-electric)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                            >
                                {isLogin ? "Create your gamertag →" : "Sign in to Gwet"}
                            </button>
                        </p>
                    </form>
                </div>
            </div>

            <style>{`
                .lightning-streak {
                    animation: flicker 4s infinite;
                }
                @keyframes flicker {
                    0%, 100% { opacity: 0; }
                    50% { opacity: 0.5; }
                    51% { opacity: 0.2; }
                    52% { opacity: 0.8; }
                }
                @media (max-width: 800px) {
                    .hide-mobile { display: none !important; }
                    div { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};
