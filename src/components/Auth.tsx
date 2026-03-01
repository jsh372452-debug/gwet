import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { Shield, Lock, User as UserIcon, ChevronRight } from 'lucide-react';

export const AuthUI: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, register, loading, error } = useAuthStore();
    const { t, isRTL } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) await login(username, password);
        else await register(username, password);
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: 'var(--space-3xl)', borderRadius: 'var(--radius-2xl)' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
                    <div style={{
                        display: 'inline-flex', padding: '14px', borderRadius: 'var(--radius-lg)',
                        background: 'var(--primary-soft)', marginBottom: 'var(--space-xl)',
                        border: '1px solid var(--border-active)'
                    }}>
                        <Shield size={36} color="var(--primary)" />
                    </div>
                    <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, letterSpacing: '2px' }}>GWET</h1>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: 'var(--space-sm)' }}>
                        <div className="status-dot" />
                        <span style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '1px' }}>GAMING NETWORK</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                    <div>
                        <label className="label">{t('identity')}</label>
                        <div style={{ position: 'relative' }}>
                            <UserIcon size={16} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input className="input" placeholder="USERNAME" value={username} onChange={(e) => setUsername(e.target.value)}
                                style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '36px' }} />
                        </div>
                    </div>

                    <div>
                        <label className="label">{t('security')}</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                                style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '36px' }} />
                        </div>
                    </div>

                    {error && (
                        <div style={{ color: 'var(--danger)', fontSize: 'var(--font-sm)', fontWeight: 600, textAlign: 'center', background: 'var(--danger-soft)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn primary" disabled={loading}
                        style={{ width: '100%', height: '48px', fontSize: 'var(--font-base)', marginTop: 'var(--space-sm)' }}>
                        {loading ? 'LOADING...' : (isLogin ? t('login') : t('register'))}
                        <ChevronRight size={18} />
                    </button>

                    <button type="button" onClick={() => setIsLogin(!isLogin)} className="btn ghost" style={{ width: '100%' }}>
                        {isLogin ? 'CREATE NEW ACCOUNT' : 'ALREADY HAVE AN ACCOUNT?'}
                    </button>
                </form>
            </div>
        </div>
    );
};
