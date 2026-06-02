import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { Logo } from './Logo';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

type CallbackPhase = 'loading' | 'success' | 'error';

/** Shown while email verification link is processed — then store routes to /customize */
export const AuthCallback: React.FC = () => {
    const { handleEmailCallback, user, loading } = useAuthStore();
    const [phase, setPhase] = useState<CallbackPhase>('loading');
    const [message, setMessage] = useState('جاري تجهيز حسابك...');
    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;

        let cancelled = false;

        (async () => {
            try {
                await handleEmailCallback();
                if (cancelled) return;
                setPhase('success');
                setMessage('تم تفعيل الحساب — جاري فتح صفحة التخصيص...');
            } catch (err: any) {
                if (cancelled) return;
                setPhase('error');
                setMessage(err?.message || 'حدث خطأ، حاول مرة أخرى');
            }
        })();

        return () => { cancelled = true; };
    }, [handleEmailCallback]);

    useEffect(() => {
        if (!loading && user && phase === 'success') {
            setMessage('مرحباً! أكمل ملفك الآن');
        }
    }, [loading, user, phase]);

    return (
        <div className="gwet-auth-screen">
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="gwet-glass-card gwet-auth-card"
            >
                <Logo size={56} style={{ margin: '0 auto 20px' }} />

                {phase === 'loading' && (
                    <>
                        <Loader2 size={36} className="gwet-spinner" style={{ margin: '0 auto 16px', color: 'var(--brand-primary)' }} />
                        <h2 className="gwet-heading-sm">جاري تجهيز حسابك...</h2>
                        <p className="gwet-text-dim">نتأكد من تفعيل Supabase ونفتح صفحة التخصيص</p>
                    </>
                )}

                {phase === 'success' && (
                    <>
                        <div className="gwet-status-icon gwet-status-success">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="gwet-heading-sm">تم تفعيل الحساب</h2>
                        <p className="gwet-text-dim">{message}</p>
                    </>
                )}

                {phase === 'error' && (
                    <>
                        <div className="gwet-status-icon gwet-status-error">
                            <AlertCircle size={32} />
                        </div>
                        <h2 className="gwet-heading-sm">حدث خطأ، حاول مرة أخرى</h2>
                        <p className="gwet-text-dim">{message}</p>
                        <button
                            type="button"
                            className="btn-gaming"
                            style={{ width: '100%', marginTop: '24px' }}
                            onClick={() => { window.location.href = '/'; }}
                        >
                            العودة للرئيسية
                        </button>
                    </>
                )}
            </motion.div>
        </div>
    );
};
