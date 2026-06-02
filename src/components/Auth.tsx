import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, X } from 'lucide-react';
import { motion } from 'framer-motion';

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        useAuthStore.setState({ error: null });

        if (isLogin) {
            await login(email, password);
        } else {
            if (password.length < 8) {
                useAuthStore.setState({ error: 'كلمة المرور 8 أحرف على الأقل' });
                return;
            }
            if (!username.trim()) {
                useAuthStore.setState({ error: 'اسم المستخدم مطلوب' });
                return;
            }
            await register(email, password, username.trim());
        }
    };

    return (
        <div className="gwet-auth-overlay">
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="gwet-glass-card gwet-auth-form-card"
            >
                <button type="button" className="gwet-auth-close" onClick={onBack} aria-label="Close">
                    <X size={20} />
                </button>

                <h2 className="font-heading gwet-heading-sm">
                    {isLogin ? 'مرحباً بعودتك' : 'انضم لعالم GWET'}
                </h2>
                <p className="gwet-text-dim" style={{ marginBottom: '24px' }}>
                    {isLogin ? 'سجّل دخولك وتابع من حيث توقفت' : 'حساب جديد في ثوانٍ — بدون تعقيد'}
                </p>

                <form onSubmit={handleSubmit} className="gwet-form-stack">
                    {!isLogin && (
                        <div>
                            <label className="gwet-label">اسم المستخدم</label>
                            <div className="gwet-input-wrap">
                                <UserIcon size={18} />
                                <input
                                    className="input-gaming"
                                    placeholder="GamerTag"
                                    required
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="gwet-label">البريد الإلكتروني</label>
                        <div className="gwet-input-wrap">
                            <Mail size={18} />
                            <input
                                className="input-gaming"
                                type="email"
                                placeholder="you@email.com"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="gwet-label">كلمة المرور</label>
                        <div className="gwet-input-wrap">
                            <Lock size={18} />
                            <input
                                className="input-gaming"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="gwet-eye-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && <div className="gwet-error-banner">{error}</div>}

                    <button type="submit" className="btn-gaming" disabled={loading}>
                        {loading ? 'جاري تجهيز حسابك...' : (isLogin ? 'تسجيل الدخول' : 'إنشاء حساب')}
                    </button>
                </form>

                <p className="gwet-auth-switch">
                    {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
                    <button type="button" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'إنشاء حساب' : 'تسجيل الدخول'}
                    </button>
                </p>
            </motion.div>
        </div>
    );
};
