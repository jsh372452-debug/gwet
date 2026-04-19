import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { ShieldCheck, ArrowRight, RefreshCw, LogOut, Lock } from 'lucide-react';
import { Logo } from './Logo';

export const VerificationUI: React.FC = () => {
    const { user, verifyCode, resendCode, signOut, loading, error } = useAuthStore();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [resending, setResending] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const inputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Auto-focus next
        if (value && index < 5) {
            inputRefs[index + 1].current?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) return;
        
        try {
            await verifyCode(code);
        } catch (err) {
            // Error is handled in store
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;
        setResending(true);
        try {
            await resendCode();
            setResendTimer(60);
        } catch (err) {
            console.error('Resend failed');
        } finally {
            setResending(false);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#010409', position: 'relative', overflow: 'hidden' }}>
            <div className="energy-blob blue-blob" style={{ top: '20%', left: '20%' }} />
            <div className="energy-blob purple-blob" style={{ bottom: '20%', right: '20%' }} />

            <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '4rem 3rem', borderRadius: '32px', position: 'relative', zIndex: 10, textAlign: 'center' }}>
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'inline-block', marginBottom: '1rem', padding: '15px', background: 'rgba(0, 209, 255, 0.1)', borderRadius: '24px', border: '1px solid rgba(0, 209, 255, 0.2)' }}>
                        <ShieldCheck size={48} color="var(--primary)" />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>Identity Verification</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '13px', fontWeight: 700, marginTop: '10px' }}>
                        OPERATIONAL DIRECTIVE: A verification code has been dispatched to <span style={{ color: 'var(--primary)' }}>{user?.username}</span> via encrypted channel.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '2.5rem' }}>
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                ref={inputRefs[i]}
                                type="text"
                                inputMode="numeric"
                                value={digit}
                                onChange={e => handleChange(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                style={{
                                    width: '50px',
                                    height: '64px',
                                    fontSize: '1.8rem',
                                    fontWeight: 900,
                                    textAlign: 'center',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '2px solid var(--glass-border)',
                                    borderRadius: '12px',
                                    color: 'var(--primary)',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                                className="otp-input"
                                autoComplete="off"
                            />
                        ))}
                    </div>

                    {error && (
                        <div style={{ color: '#ff4d4d', fontSize: '12px', fontWeight: 700, marginBottom: '2rem', background: 'rgba(255, 77, 77, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255, 77, 77, 0.2)' }}>
                            ACCESS DENIED: {error === 'INVALID_CODE' ? 'INVALID ENCRYPTION KEY' : error}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button type="submit" className="btn primary sharp" disabled={loading || otp.join('').length !== 6} style={{ height: '54px', fontSize: '1rem' }}>
                            {loading ? 'SYNCING...' : 'AUTHORIZE CONNECTION'}
                            <ArrowRight size={20} />
                        </button>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                type="button" 
                                onClick={handleResend} 
                                disabled={resendTimer > 0 || resending}
                                className="btn ghost sm" 
                                style={{ flex: 1, fontSize: '10px', height: '44px' }}
                            >
                                <RefreshCw size={14} className={resending ? 'spinner' : ''} />
                                {resendTimer > 0 ? `RETRY IN ${resendTimer}s` : 'RESEND CODE'}
                            </button>
                            <button 
                                type="button" 
                                onClick={signOut}
                                className="btn ghost sm" 
                                style={{ flex: 1, fontSize: '10px', height: '44px', color: '#ff4d4d' }}
                            >
                                <LogOut size={14} />
                                ABORT SESSION
                            </button>
                        </div>
                    </div>
                </form>

                <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                    <Logo size={24} />
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-dim)', letterSpacing: '2px' }}>CORE TEAM DIRECTIVE</div>
                        <div style={{ fontSize: '10px', fontWeight: 800 }}>GWET SECURITY DIVISION</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
