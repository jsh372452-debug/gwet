import React, { useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { ArrowRight, User, Camera, Gamepad2, Sparkles } from 'lucide-react';
import { GamingShell } from './GamingShell';
import { motion, AnimatePresence } from 'framer-motion';

const PLAY_STYLES = [
    'Competitive', 'Casual', 'Survival', 'Strategy',
    'Sandbox', 'Shooter', 'Racing', 'RPG',
] as const;

const INTERESTS = [
    'Streaming', 'Esports', 'Team Play', 'Tournaments', 'Content Creation',
] as const;

const stepVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
};

function buildBio(userBio: string, interests: string[]): string {
    const base = userBio.trim();
    const tag = interests.length ? `\n[GWET] ${interests.join(' · ')}` : '';
    return (base + tag).trim();
}

export const ProfileOnboarding: React.FC = () => {
    const { user, updateProfile } = useAuthStore();
    const [step, setStep] = useState(1);
    const fileRef = useRef<HTMLInputElement>(null);

    const [username, setUsername] = useState(user?.username || '');
    const [displayName, setDisplayName] = useState(user?.displayName || user?.username || '');
    const [bio, setBio] = useState(user?.bio?.split('\n[GWET]')[0]?.trim() || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [playStyle, setPlayStyle] = useState(user?.gamingPlatform || 'Competitive');
    const [interests, setInterests] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleInterest = (item: string) => {
        setInterests(prev =>
            prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
        );
    };

    const onAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setAvatarUrl(String(reader.result));
        reader.readAsDataURL(file);
    };

    const handleComplete = async () => {
        setSaving(true);
        setError(null);
        try {
            await updateProfile({
                username: username.trim() || user?.username,
                displayName: displayName.trim(),
                avatarUrl,
                bio: buildBio(bio, interests),
                gamingPlatform: playStyle,
                isOnboarded: true,
            });
        } catch (err: any) {
            setError(err.message || 'حدث خطأ، حاول مرة أخرى');
            setSaving(false);
        }
    };

    return (
        <GamingShell compact>
            <div className="gwet-onboard-wrap">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="gwet-onboard-intro"
                >
                    <h1 className="font-heading gwet-hero-title-sm">SETUP YOUR GAMER ID</h1>
                    <p className="gwet-text-dim">خطوة سريعة قبل دخول عالم GWET — مثل Discord، بدون تعقيد</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="gwet-glass-card gwet-onboard-card"
                >
                    <div className="gwet-step-bar">
                        <span className={step >= 1 ? 'active' : ''} />
                        <span className={step >= 2 ? 'active' : ''} />
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="s1"
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.25 }}
                            >
                                <div className="gwet-step-head">
                                    <User size={20} />
                                    <div>
                                        <h2>البيانات الأساسية</h2>
                                        <p>الخطوة 1 من 2</p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="gwet-avatar-picker"
                                    onClick={() => fileRef.current?.click()}
                                >
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="" />
                                    ) : (
                                        <Camera size={28} />
                                    )}
                                    <span>الصورة الشخصية</span>
                                </button>
                                <input ref={fileRef} type="file" accept="image/*" hidden onChange={onAvatarPick} />

                                <label className="gwet-label">اسم المستخدم</label>
                                <input
                                    className="input-gaming"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="xPro_Gamer"
                                />

                                <label className="gwet-label">الاسم الظاهر</label>
                                <input
                                    className="input-gaming"
                                    value={displayName}
                                    onChange={e => setDisplayName(e.target.value)}
                                    placeholder="كيف يراك اللاعبون؟"
                                />

                                <label className="gwet-label">نبذة قصيرة</label>
                                <textarea
                                    className="input-gaming"
                                    rows={3}
                                    value={bio}
                                    onChange={e => setBio(e.target.value)}
                                    placeholder="فريقك، ألعابك المفضلة، أسلوبك..."
                                />

                                <button
                                    type="button"
                                    className="btn-gaming"
                                    disabled={!displayName.trim() || !username.trim()}
                                    onClick={() => setStep(2)}
                                >
                                    التالي <ArrowRight size={16} />
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="s2"
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.25 }}
                            >
                                <div className="gwet-step-head">
                                    <Gamepad2 size={20} />
                                    <div>
                                        <h2>أسلوب اللعب والاهتمامات</h2>
                                        <p>الخطوة 2 من 2</p>
                                    </div>
                                </div>

                                <label className="gwet-label">نوع اللعب المفضل</label>
                                <div className="gwet-chip-grid">
                                    {PLAY_STYLES.map(style => (
                                        <button
                                            key={style}
                                            type="button"
                                            className={`gwet-chip ${playStyle === style ? 'active' : ''}`}
                                            onClick={() => setPlayStyle(style)}
                                        >
                                            {style}
                                        </button>
                                    ))}
                                </div>

                                <label className="gwet-label gwet-label-spaced">
                                    <Sparkles size={14} /> اهتماماتك
                                </label>
                                <div className="gwet-chip-grid">
                                    {INTERESTS.map(item => (
                                        <button
                                            key={item}
                                            type="button"
                                            className={`gwet-chip ${interests.includes(item) ? 'active' : ''}`}
                                            onClick={() => toggleInterest(item)}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>

                                {error && <div className="gwet-error-banner">{error}</div>}

                                <div className="gwet-onboard-actions">
                                    <button type="button" className="btn-gaming-ghost" onClick={() => setStep(1)} disabled={saving}>
                                        رجوع
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-gaming"
                                        onClick={handleComplete}
                                        disabled={saving}
                                    >
                                        {saving ? 'جاري تجهيز حسابك...' : 'ادخل عالم GWET'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </GamingShell>
    );
};
