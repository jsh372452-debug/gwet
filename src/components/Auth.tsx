import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { Shield, Lock, User as UserIcon, ChevronRight } from 'lucide-react';
import { Logo } from './Logo';

export const AuthUI: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, register, loading, error } = useAuthStore();
    const { t, isRTL } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) await login(email, password);
        else await register(email, password, username);
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#010409', position: 'relative', overflow: 'hidden' }}>
            <div className="energy-blob blue-blob" style={{ top: '20%', left: '20%' }} />
            <div className="energy-blob cyan-blob" style={{ bottom: '20%', right: '20%' }} />

            <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '4rem 3rem', borderRadius: '28px', position: 'relative', zIndex: 10 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <div style={{ display: 'inline-block', marginBottom: '1.5rem' }}>
                        <Logo size={70} />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '2px', background: 'linear-gradient(to bottom, #fff, #00d1ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>GWET</h1>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '0.75rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)' }} />
                        <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '2px' }}>NEXT-GEN GAMING NETWORK</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>EMAIL ADDRESS</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                            <input className="gaming-input" placeholder="EMAIL@EXAMPLE.COM" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '46px', margin: 0 }} />
                        </div>
                    </div>

                    {!isLogin && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>{t('identity')}</label>
                            <div style={{ position: 'relative' }}>
                                <UserIcon size={18} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                                <input className="gaming-input" placeholder="USERNAME" value={username} onChange={(e) => setUsername(e.target.value)}
                                    style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '46px', margin: 0 }} />
                            </div>
                        </div>
                    )}

                    <div>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>{t('security')}</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                            <input className="gaming-input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                                style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '46px', margin: 0 }} />
                        </div>
                    </div>

                    {error && (
                        <div style={{ color: '#ff4d4d', fontSize: '12px', fontWeight: 700, textAlign: 'center', background: 'rgba(255, 77, 77, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255, 77, 77, 0.2)' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn primary" disabled={loading}
                        style={{ width: '100%', height: '54px', fontSize: '1rem', marginTop: '0.5rem' }}>
                        {loading ? 'INITIALIZING...' : (isLogin ? t('login') : t('register'))}
                        <ChevronRight size={20} />
                    </button>

                    <button type="button" onClick={() => setIsLogin(!isLogin)} className="btn ghost" style={{ width: '100%', fontSize: '11px', fontWeight: 800 }}>
                        {isLogin ? 'CREATE NEW OPERATION ACCOUNT' : 'ALREADY HAVE AN ACCOUNT?'}
                    </button>
                </form>
            </div>
        </div>
    );
};
