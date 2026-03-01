import React, { useState } from 'react';
import { useGameStore, Community } from '../store/gameStore';
import { useTranslation } from '../i18n';
import { Shield, Settings, Users, Palette, Trash2, Camera, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    community: Community;
    onClose: () => void;
}

const themeColors = [
    'var(--primary)', // Purple
    '#f43f5e', // Rose
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#f59e0b', // Amber
    '#6366f1', // Indigo
    '#ec4899', // Pink
];

export const CommunityAdmin: React.FC<Props> = ({ community, onClose }) => {
    const { updateCommunityElite, kickMember } = useGameStore();
    const { t, isRTL } = useTranslation();

    const [name, setName] = useState(community.name);
    const [desc, setDesc] = useState(community.description);
    const [themeColor, setThemeColor] = useState(community.themeColor || 'var(--primary)');
    const [bgStyle, setBgStyle] = useState(community.bgStyle || 'default');
    const [bannerPreview, setBannerPreview] = useState(community.bannerBase64 || '');

    const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setBannerPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        await updateCommunityElite(community.id, {
            name,
            description: desc,
            themeColor,
            bgStyle,
            bannerBase64: bannerPreview
        });
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card"
            style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%', maxWidth: '900px',
                height: '80vh', zIndex: 100,
                display: 'flex', flexDirection: 'column',
                direction: isRTL ? 'rtl' : 'ltr'
            }}
        >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Shield size={24} color={themeColor} />
                    <h2 style={{ fontWeight: '800' }}>{community.name} - {t('admin')}</h2>
                </div>
                <button onClick={onClose} className="btn-premium" style={{ border: 'none', background: 'none', padding: '0.5rem' }}>✕</button>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Visual Settings */}
                <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    <section>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '1.5rem', fontWeight: '800' }}>
                            <Palette size={16} /> VISUAL BRANDING
                        </h3>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            {themeColors.map(color => (
                                <button
                                    key={color}
                                    onClick={() => setThemeColor(color)}
                                    style={{
                                        width: '40px', height: '40px',
                                        borderRadius: '12px', background: color,
                                        border: '4px solid ' + (themeColor === color ? 'white' : 'transparent'),
                                        cursor: 'pointer'
                                    }}
                                />
                            ))}
                        </div>

                        <div style={{ position: 'relative', width: '100%', height: '150px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', overflow: 'hidden', backgroundImage: `url(${bannerPreview})`, backgroundSize: 'cover' }}>
                            <label style={{
                                position: 'absolute', bottom: '10px', right: '10px',
                                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)',
                                padding: '8px 12px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer'
                            }}>
                                <Camera size={14} style={{ marginRight: '6px' }} /> {t('banner')}
                                <input type="file" hidden accept="image/*" onChange={handleBannerUpload} />
                            </label>
                        </div>
                    </section>

                    <section>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '1.5rem', fontWeight: '800' }}>
                            <Settings size={16} /> SQUAD CONFIG
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input className="gaming-input" value={name} onChange={e => setName(e.target.value)} placeholder="Hub Name" />
                            <textarea className="gaming-input" value={desc} onChange={e => setDesc(e.target.value)} style={{ minHeight: '80px' }} placeholder="Mission Objective" />
                        </div>
                    </section>

                    <button className="btn-premium" style={{ marginTop: 'auto', width: '100%' }} onClick={handleSave}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={20} /> SYNC CHANGES</div>
                    </button>
                </div>

                {/* Member Management */}
                <div style={{ width: '300px', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: '800' }}>
                        <Users size={16} /> {t('members')}
                    </h3>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {community.members?.map(mid => (
                            <div key={mid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div className="avatar-premium" style={{ width: '32px', height: '32px', fontSize: '0.7rem' }}>{mid.slice(0, 2).toUpperCase()}</div>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>AGENT_{mid.slice(0, 6)}</span>
                                </div>
                                {mid !== community.ownerId && (
                                    <button
                                        onClick={() => kickMember(community.id, mid)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
