import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { Logo } from './Logo';
import { Shield, Lock, User as UserIcon, ChevronRight, Mail } from 'lucide-react';

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
        else {
            if (password.length < 8) {
                alert("SECURITY PROTOCOL: PASSWORD MUST BE AT LEAST 8 CHARACTERS");
                return;
            }
            await register(email, password, username);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#010409', position: 'relative', overflow: 'hidden' }}>
            <div className="energy-blob blue-blob" style={{ top: '20%', left: '20%' }} />
            <div className="energy-blob cyan-blob" style={{ bottom: '20%', right: '20%' }} />

            <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '4rem 3rem', borderRadius: '32px', position: 'relative', zIndex: 10, border: '1px solid rgba(0, 209, 255, 0.2)' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <div style={{ display: 'inline-block', marginBottom: '1.5rem', padding: '12px', background: 'rgba(0, 209, 255, 0.05)', borderRadius: '20px', border: '1px solid rgba(0, 209, 255, 0.1)' }}>
                        <Logo size={60} />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '4px', background: 'linear-gradient(to bottom, #fff, #00d1ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, textShadow: '0 0 20px rgba(0, 209, 255, 0.3)' }}>GWET</h1>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '1rem' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d1ff', boxShadow: '0 0 10px #00d1ff' }} />
                        <span style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-dim)', letterSpacing: '3px', textTransform: 'uppercase' }}>SECURE ACCESS PROTOCOL</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-dim)', marginBottom: '10px', display: 'block', letterSpacing: '1px' }}>IDENTIFICATION (EMAIL)</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.6 }} />
                            <input className="gaming-input" placeholder="OPERATOR@GWET.NETWORK" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '48px', height: '54px', borderRadius: '14px' }} />
                        </div>
                    </div>

                    {!isLogin && (
                        <div>
                            <label style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-dim)', marginBottom: '10px', display: 'block', letterSpacing: '1px' }}>OPERATOR ALIAS</label>
                            <div style={{ position: 'relative' }}>
                                <UserIcon size={16} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.6 }} />
                                <input className="gaming-input" placeholder="ALIAS_ID" required value={username} onChange={(e) => setUsername(e.target.value)}
                                    style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '48px', height: '54px', borderRadius: '14px' }} />
                            </div>
                        </div>
                    )}

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <label style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-dim)', letterSpacing: '1px' }}>ENCRYPTION KEY</label>
                            {isLogin && <span style={{ fontSize: '9px', fontWeight: 900, color: 'var(--primary)', cursor: 'pointer', opacity: 0.7 }}>FORGOT KEY?</span>}
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.6 }} />
                            <input className="gaming-input" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)}
                                style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '48px', height: '54px', borderRadius: '14px' }} />
                        </div>
                    </div>

                    {error && (
                        <div style={{ color: '#ff4d4d', fontSize: '11px', fontWeight: 800, textAlign: 'center', background: 'rgba(255, 77, 77, 0.08)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255, 77, 77, 0.2)', textTransform: 'uppercase' }}>
                            SYSTEM ERROR: {error}
                        </div>
                    )}

                    <button type="submit" className="btn primary sharp" disabled={loading}
                        style={{ width: '100%', height: '58px', fontSize: '1rem', marginTop: '1rem', borderRadius: '14px', boxShadow: '0 8px 20px rgba(0, 209, 255, 0.2)' }}>
                        {loading ? 'SYNCING...' : (isLogin ? 'AUTHORIZE ACCESS' : 'ENLIST OPERATOR')}
                        <ChevronRight size={20} />
                    </button>

                    <button type="button" onClick={() => setIsLogin(!isLogin)} className="btn ghost" 
                        style={{ width: '100%', fontSize: '10px', fontWeight: 900, letterSpacing: '1px', height: '44px', opacity: 0.7 }}>
                        {isLogin ? 'REQUEST NEW CLEARANCE (REGISTER)' : 'HAVE EXISTING CLEARANCE? (LOGIN)'}
                    </button>
                </form>
            </div>
            
            {/* Footer decoration */}
            <div style={{ position: 'absolute', bottom: '2rem', left: '0', width: '100%', textAlign: 'center', opacity: 0.2 }}>
                <div style={{ fontSize: '9px', fontWeight: 900, color: '#fff', letterSpacing: '5px' }}>GLOBAL WEAPONS & EQUIPMENT TRACKER © 2026</div>
            </div>
        </div>
    );
};
