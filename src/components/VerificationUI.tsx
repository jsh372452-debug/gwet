import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { RefreshCw, LogOut, CheckCircle } from 'lucide-react';
import { GamingShell } from './GamingShell';
import { motion } from 'framer-motion';

export const VerificationUI: React.FC = () => {
    const { resendCode, signOut, pendingEmail } = useAuthStore();
    const [resending, setResending] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleResend = async () => {
        if (resendTimer > 0) return;
        setResending(true);
        setNotice(null);
        try {
            await resendCode();
            setResendTimer(60);
            setNotice('تم إرسال رابط التفعيل مرة أخرى');
        } catch {
            setNotice('حدث خطأ، حاول مرة أخرى');
        } finally {
            setResending(false);
        }
    };

    return (
        <GamingShell compact>
            <div className="gwet-auth-screen">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="gwet-glass-card gwet-auth-card"
                >
                    <div className="gwet-status-icon gwet-status-pending">
                        <CheckCircle size={28} />
                    </div>

                    <h2 className="gwet-heading-sm">فعّل بريدك الإلكتروني</h2>
                    <p className="gwet-text-dim">
                        أرسلنا رابط التفعيل إلى{' '}
                        <strong style={{ color: 'var(--text-main)' }}>{pendingEmail || 'بريدك'}</strong>.
                        بعد الضغط ستُوجَّه تلقائياً لإعداد ملفك ثم المنصة.
                    </p>

                    <div className="gwet-verify-flow">
                        <span>Sign Up</span>
                        <span className="active">Email Verification</span>
                        <span>Profile Setup</span>
                        <span>Feed</span>
                    </div>

                    {notice && <div className="gwet-notice">{notice}</div>}

                    <div className="gwet-auth-actions">
                        <button
                            type="button"
                            className="btn-gaming-ghost"
                            onClick={handleResend}
                            disabled={resendTimer > 0 || resending}
                        >
                            <RefreshCw size={16} className={resending ? 'gwet-spinner' : ''} />
                            {resendTimer > 0 ? `إعادة الإرسال (${resendTimer}s)` : 'إعادة إرسال الرابط'}
                        </button>

                        <button type="button" className="gwet-cancel-btn" onClick={signOut}>
                            <LogOut size={16} />
                            إلغاء التسجيل
                        </button>
                    </div>
                </motion.div>
            </div>
        </GamingShell>
    );
};
