import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { RefreshCw, LogOut, Mail, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { Logo } from './Logo';

export const VerificationUI: React.FC = () => {
    const { resendCode, signOut, loading, error, isVerifySuccess } = useAuthStore();
    const [resending, setResending] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

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

    if (isVerifySuccess) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'var(--bg-deep)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'fixed', inset: 0, opacity: 0.1, zIndex: 0, backgroundImage: 'radial-gradient(circle at 50% 50%, var(--brand-electric) 0%, transparent 70%)' }} />
                
                <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '64px 48px', borderRadius: '24px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
                    <div style={{ 
                        width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                        border: '1px solid var(--success)', boxShadow: '0 0 30px rgba(34, 197, 94, 0.2)'
                    }}>
                        <CheckCircle size={40} color="var(--success)" />
                    </div>

                    <h2 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Space Grotesk', marginBottom: '16px' }}>IDENTITY CONFIRMED</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, marginBottom: '32px' }}>
                        Your neural link has been established. You can now close this window and return to your original session, or click below to launch the hub here.
                    </p>

                    <button 
                        className="btn btn-primary" 
                        style={{ width: '100%', height: '52px', fontSize: '16px' }}
                        onClick={() => window.location.href = '/'}
                    >
                        LAUNCH GWET HUB <Zap size={18} fill="white" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'var(--bg-deep)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'fixed', inset: 0, opacity: 0.1, zIndex: 0, backgroundImage: 'radial-gradient(circle at 20% 20%, var(--brand-electric) 0%, transparent 40%)' }} />

            <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '64px 48px', borderRadius: '24px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'inline-flex', marginBottom: '20px', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                        <Mail size={40} color="var(--brand-electric)" />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Space Grotesk', marginBottom: '12px' }}>VERIFY YOUR IDENTITY</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                        We've dispatched a secure confirmation link to your email.<br/>
                        Click the <span style={{ color: 'var(--brand-electric)', fontWeight: 700 }}>VERIFY</span> button in that message to authorize your access.
                    </p>
                </div>

                <div style={{ margin: '24px 0', padding: '16px', background: 'var(--bg-input)', borderRadius: '12px', border: '1px dashed var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-electric)', animation: 'pulse 2s infinite', boxShadow: '0 0 10px var(--brand-electric)' }} />
                        <span className="mono-font" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-electric)', letterSpacing: '1px' }}>AWAITING_AUTH_RESPONSE</span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button 
                        type="button" 
                        onClick={handleResend} 
                        disabled={resendTimer > 0 || resending}
                        className="btn btn-ghost" 
                        style={{ width: '100%', height: '48px' }}
                    >
                        <RefreshCw size={16} className={resending ? 'spinner' : ''} />
                        {resendTimer > 0 ? `RETRY IN ${resendTimer}s` : 'RESEND ENCRYPTION LINK'}
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={signOut}
                        className="btn btn-ghost" 
                        style={{ width: '100%', height: '48px', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                    >
                        <LogOut size={16} />
                        TERMINATE REGISTRATION
                    </button>
                </div>

                <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <Logo size={24} />
                    <div style={{ textAlign: 'left' }}>
                        <div className="mono-font" style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '2px' }}>CORE COMMAND</div>
                        <div style={{ fontSize: '11px', fontWeight: 800 }}>GWET SECURITY DIVISION</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
