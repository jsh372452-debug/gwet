import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { RefreshCw, LogOut, Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { Logo } from './Logo';
import { motion } from 'framer-motion';

export const VerificationUI: React.FC = () => {
    const { resendCode, signOut, isVerifySuccess } = useAuthStore();
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
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'var(--bg-app)' }}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card-professional" 
                    style={{ width: '100%', maxWidth: '440px', padding: '48px', textAlign: 'center' }}
                >
                    <div style={{ 
                        width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                        color: '#22c55e'
                    }}>
                        <CheckCircle size={32} />
                    </div>

                    <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Email Verified</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '15px', lineHeight: 1.6, marginBottom: '32px' }}>
                        Your account has been successfully verified. You can now access the platform.
                    </p>

                    <button 
                        className="btn-primary" 
                        style={{ width: '100%', height: '48px', fontSize: '15px' }}
                        onClick={() => window.location.href = '/'}
                    >
                        Continue to Dashboard <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'var(--bg-app)' }}>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-professional" 
                style={{ width: '100%', maxWidth: '440px', padding: '48px', textAlign: 'center' }}
            >
                <Logo size={48} style={{ margin: '0 auto 24px' }} />
                
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Verify your email</h2>
                <p style={{ color: 'var(--text-dim)', fontSize: '15px', lineHeight: 1.6, marginBottom: '32px' }}>
                    We've sent a verification link to your email address. Please click the link to verify your account and continue.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button 
                        type="button" 
                        onClick={handleResend} 
                        disabled={resendTimer > 0 || resending}
                        style={{ 
                            width: '100%', height: '48px', background: 'var(--bg-elevated)', 
                            border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                    >
                        <RefreshCw size={16} className={resending ? 'spinner' : ''} />
                        {resendTimer > 0 ? `Resend email in ${resendTimer}s` : 'Resend verification email'}
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={signOut}
                        style={{ 
                            width: '100%', height: '48px', background: 'transparent', 
                            border: 'none', color: '#f87171', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                    >
                        <LogOut size={16} />
                        Cancel registration
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
