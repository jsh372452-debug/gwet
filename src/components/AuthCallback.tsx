import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { Logo } from './Logo';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2, LogIn } from 'lucide-react';

type CallbackPhase = 'loading' | 'success' | 'error';

const STEPS = ['تفعيل Supabase', 'ربط الجلسة', 'فتح التخصيص'];

export const AuthCallback: React.FC = () => {
    const { handleEmailCallback } = useAuthStore();
    const [phase, setPhase] = useState<CallbackPhase>('loading');
    const [message, setMessage] = useState('جاري تجهيز حسابك...');
    const [step, setStep] = useState(0);
    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;

        const stepTimer = window.setInterval(() => {
            setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
        }, 1200);

        (async () => {
            try {
                setStep(0);
                await handleEmailCallback();
                setStep(2);
                setPhase('success');
                setMessage('تم التفعيل — مرحباً في GWET');
            } catch (err: any) {
                setPhase('error');
                setMessage(err?.message || 'حدث خطأ، حاول مرة أخرى');
            } finally {
                window.clearInterval(stepTimer);
            }
        })();
    }, [handleEmailCallback]);

    return (
        <div className="gwet-auth-screen">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="gwet-glass-card gwet-auth-card">
                <Logo size={56} style={{ margin: '0 auto 16px' }} />

                {phase === 'loading' && (
                    <>
                        <Loader2 size={32} className="gwet-spinner" style={{ margin: '0 auto 12px', color: 'var(--brand-cyan)' }} />
                        <h2 className="gwet-heading-sm">جاري تجهيز حسابك...</h2>
                        <ul className="gwet-callback-steps">
                            {STEPS.map((label, i) => (
                                <li key={label} className={i <= step ? 'done' : ''}>{label}</li>
                            ))}
                        </ul>
                    </>
                )}

                {phase === 'success' && (
                    <>
                        <div className="gwet-status-icon gwet-status-success"><CheckCircle size={32} /></div>
                        <h2 className="gwet-heading-sm">تم تفعيل الحساب</h2>
                        <p className="gwet-text-dim">{message}</p>
                    </>
                )}

                {phase === 'error' && (
                    <>
                        <div className="gwet-status-icon gwet-status-error"><AlertCircle size={32} /></div>
                        <h2 className="gwet-heading-sm">تعذّر الإكمال التلقائي</h2>
                        <p className="gwet-text-dim" style={{ textAlign: 'start', lineHeight: 1.7 }}>{message}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                            <button type="button" className="btn-gaming" onClick={() => { window.location.href = '/?login=1'; }}>
                                <LogIn size={16} /> تسجيل الدخول
                            </button>
                            <button type="button" className="btn-gaming-outline" style={{ width: '100%' }} onClick={() => { window.location.href = '/'; }}>
                                الرئيسية
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};
