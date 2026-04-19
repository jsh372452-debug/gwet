import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { ShieldCheck, RefreshCw, LogOut, Mail, CheckCircle } from 'lucide-react';
import { Logo } from './Logo';

export const VerificationUI: React.FC = () => {
    const { user, verifyCode, resendCode, signOut, loading, error } = useAuthStore();
    const [resending, setResending] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [checking, setChecking] = useState(false);

    React.useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleCheckVerification = async () => {
        setChecking(true);
        try {
            await verifyCode('supabase-confirm');
        } catch (err) {
            // Error handled in store
        } finally {
            setChecking(false);
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
                    <div style={{ display: 'inline-block', marginBottom: '1rem', padding: '18px', background: 'rgba(0, 209, 255, 0.1)', borderRadius: '24px', border: '1px solid rgba(0, 209, 255, 0.2)' }}>
                        <Mail size={48} color="var(--primary)" />
                    </div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>تحقق من بريدك الإلكتروني</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '13px', fontWeight: 700, marginTop: '12px', lineHeight: 1.8, direction: 'rtl' }}>
                        قمنا بإرسال رسالة تأكيد إلى بريدك الإلكتروني.<br/>
                        اضغط على <span style={{ color: 'var(--primary)' }}>رابط التأكيد</span> في الرسالة ثم عُد هنا واضغط الزر أدناه.
                    </p>
                </div>

                {/* Animated mail icon */}
                <div style={{ margin: '2rem 0', padding: '24px', background: 'rgba(0, 209, 255, 0.03)', borderRadius: '16px', border: '1px dashed rgba(0, 209, 255, 0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00d1ff', animation: 'pulse 2s infinite', boxShadow: '0 0 15px #00d1ff' }} />
                        <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', letterSpacing: '2px' }}>AWAITING EMAIL CONFIRMATION</span>
                    </div>
                </div>

                {error && (
                    <div style={{ color: '#ff9f43', fontSize: '12px', fontWeight: 700, marginBottom: '1.5rem', background: 'rgba(255, 159, 67, 0.1)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 159, 67, 0.2)', direction: 'rtl' }}>
                        {error === 'EMAIL_NOT_CONFIRMED' 
                            ? '⏳ لم يتم تأكيد البريد بعد! اضغط على الرابط في إيميلك أولاً ثم حاول مجدداً.' 
                            : error}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button onClick={handleCheckVerification} className="btn primary sharp" disabled={loading || checking} style={{ height: '56px', fontSize: '1rem' }}>
                        {checking ? 'CHECKING...' : (
                            <>
                                <CheckCircle size={20} />
                                لقد أكدت بريدي — تحقق الآن
                            </>
                        )}
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
                            {resendTimer > 0 ? `RETRY IN ${resendTimer}s` : 'إعادة إرسال الإيميل'}
                        </button>
                        <button 
                            type="button" 
                            onClick={signOut}
                            className="btn ghost sm" 
                            style={{ flex: 1, fontSize: '10px', height: '44px', color: '#ff4d4d' }}
                        >
                            <LogOut size={14} />
                            تسجيل خروج
                        </button>
                    </div>
                </div>

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
