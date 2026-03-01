import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { Layout, Shield, Terminal, Globe, Lock, User as UserIcon, LogIn, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AuthUI: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, register, loading, error } = useAuthStore();
    const { t, isRTL } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) {
            await login(username, password);
        } else {
            await register(username, password);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{
                    width: '100%', maxWidth: '420px', padding: '3rem', borderRadius: '32px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid var(--glass-border)',
                    position: 'relative', overflow: 'hidden'
                }}
            >
                {/* Visual Identity */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        display: 'inline-flex', padding: '16px', borderRadius: '20px',
                        background: 'var(--primary-glow)', marginBottom: '1.5rem',
                        boxShadow: '0 0 30px var(--primary-glow)', border: '1px solid var(--primary)'
                    }}>
                        <Shield size={40} color="white" />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '2px', color: 'white' }}>GWET</h1>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '0.5rem' }}>
                        <div className="status-online"></div>
                        <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--text-dim)', letterSpacing: '1px' }}>GLOBAL NETWORK ONLINE</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>{t('identity')}</label>
                        <div style={{ position: 'relative' }}>
                            <UserIcon size={18} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                            <input
                                className="gaming-input"
                                placeholder="USERNAME"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '45px', marginBottom: 0 }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>{t('security')}</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                            <input
                                className="gaming-input"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '45px', marginBottom: 0 }}
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{ color: '#f87171', fontSize: '0.75rem', fontWeight: 'bold', textAlign: 'center', background: 'rgba(248, 113, 113, 0.1)', padding: '10px', borderRadius: '12px' }}>
                            ERROR: {error.toUpperCase()}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-premium"
                        disabled={loading}
                        style={{ width: '100%', height: '56px', fontSize: '1rem', marginTop: '1rem' }}
                    >
                        {loading ? 'INITIALIZING...' : (isLogin ? t('login') : t('register'))}
                        <ChevronRight size={20} />
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="btn-premium"
                        style={{
                            background: 'none', boxShadow: 'none', border: 'none', color: 'var(--text-dim)',
                            fontSize: '0.8rem', fontWeight: '800', marginTop: '0.5rem'
                        }}
                    >
                        {isLogin ? 'CREATE NEW IDENTITY' : 'ALREADY HAVE AN IDENTITY?'}
                    </button>
                </form>

                {/* Secure Footer */}
                <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.5 }}>
                    <Shield size={12} color="var(--primary)" />
                    <span style={{ fontSize: '0.6rem', fontWeight: 'bold', color: 'var(--text-dim)', letterSpacing: '1px' }}>SECURED BY GWET SHA-256V2</span>
                </div>
            </motion.div>
        </div>
    );
};
