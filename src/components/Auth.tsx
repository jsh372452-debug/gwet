import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { Logo } from './Logo';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowLeft, X } from 'lucide-react';

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
    const { isRTL } = useTranslation();

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

    return (
        <div style={{ 
            position: 'fixed', inset: 0, zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)'
        }}>
            <div className="card-professional animate-fade" style={{ 
                width: '100%', maxWidth: '440px', position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <button 
                    onClick={onBack}
                    style={{ 
                        position: 'absolute', top: '20px', right: '20px',
                        background: 'transparent', border: 'none', color: 'var(--text-dim)',
                        cursor: 'pointer', padding: '4px'
                    }}
                >
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Logo size={48} style={{ margin: '0 auto 16px' }} />
                    <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>
                        {isLogin ? 'Enter your credentials to continue' : 'Join our professional network today'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {!isLogin && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>Username</label>
                            <div style={{ position: 'relative' }}>
                                <UserIcon size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                                <input 
                                    className="input-standard" 
                                    style={{ width: '100%', paddingLeft: '40px' }}
                                    placeholder="johndoe"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                            <input 
                                className="input-standard" 
                                style={{ width: '100%', paddingLeft: '40px' }}
                                type="email"
                                placeholder="name@company.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                            <input 
                                className="input-standard" 
                                style={{ width: '100%', paddingLeft: '40px', paddingRight: '40px' }}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ 
                                    position: 'absolute', right: '12px', top: '12px',
                                    background: 'transparent', border: 'none', color: 'var(--text-muted)',
                                    cursor: 'pointer'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div style={{ 
                            padding: '12px', background: 'rgba(239, 68, 68, 0.1)', 
                            border: '1px solid rgba(239, 68, 68, 0.2)', 
                            color: '#f87171', fontSize: '13px', borderRadius: 'var(--radius-sm)'
                        }}>
                            {error}
                        </div>
                    )}

                    <button 
                        className="btn-primary" 
                        disabled={loading}
                        style={{ height: '48px', marginTop: '12px' }}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
                    <span style={{ color: 'var(--text-dim)' }}>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                    </span>
                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ 
                            background: 'transparent', border: 'none', color: 'var(--brand-primary)',
                            fontWeight: 600, marginLeft: '8px', cursor: 'pointer'
                        }}
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
};
