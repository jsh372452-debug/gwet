import React, { useState } from 'react';
import { useGameStore, Squad } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { Settings, X, Upload, Palette, Users, UserX } from 'lucide-react';

interface Props {
    squad: Squad;
    onClose: () => void;
}

export const SquadAdmin: React.FC<Props> = ({ squad, onClose }) => {
    const { updateSquad, kickMember } = useGameStore();
    const { user } = useAuthStore();
    const { t } = useTranslation();

    const [themeColor, setThemeColor] = useState(squad.theme_color || '#a855f7');
    const [bannerB64, setBannerB64] = useState(squad.banner_base64 || '');
    const [saving, setSaving] = useState(false);

    const handleBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setBannerB64(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        await updateSquad(squad.id, { theme_color: themeColor, banner_base64: bannerB64 } as any);
        setSaving(false);
        onClose();
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)' }}
            onClick={onClose}>
            <div className="glass-card compact" style={{ width: '100%', maxWidth: '500px', borderTop: `4px solid ${themeColor}` }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Settings size={20} color="var(--primary)" />
                        <h2 style={{ fontWeight: 900, fontSize: '1.2rem', textTransform: 'uppercase' }}>{t('admin')}</h2>
                    </div>
                    <button className="btn ghost icon-only" onClick={onClose}><X size={18} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                    <div>
                        <label className="label-premium"><Palette size={12} /> {t('theme')}</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)}
                                style={{ width: 60, height: 40, border: 'none', cursor: 'pointer', borderRadius: '12px', background: 'rgba(255,255,255,0.05)' }} />
                            <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-dim)' }}>{themeColor.toUpperCase()}</span>
                        </div>
                    </div>

                    <div>
                        <label className="label-premium"><Upload size={12} /> {t('banner')}</label>
                        <label className="btn ghost" style={{ width: '100%', cursor: 'pointer' }}>
                            {t('upload').toUpperCase()} BANNER
                            <input type="file" hidden accept="image/*" onChange={handleBanner} />
                        </label>
                        {bannerB64 && <img src={bannerB64} alt="Banner" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-md)' }} />}
                    </div>

                    <button className="btn primary" onClick={handleSave} disabled={saving} style={{ alignSelf: 'flex-end' }}>
                        {saving ? 'SAVING...' : 'SAVE CHANGES'}
                    </button>
                </div>
            </div>
        </div>
    );
};
