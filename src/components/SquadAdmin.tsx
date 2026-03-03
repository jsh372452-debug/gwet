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
            <div className="card" style={{ width: '100%', maxWidth: '500px', borderRadius: 'var(--radius-2xl)' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <Settings size={20} />
                        <h2 style={{ fontWeight: 800, fontSize: 'var(--font-lg)' }}>{t('admin')}</h2>
                    </div>
                    <button className="btn ghost icon-only" onClick={onClose}><X size={18} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                    <div>
                        <label className="label"><Palette size={12} style={{ marginRight: '4px' }} /> {t('theme')}</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                            <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)}
                                style={{ width: 48, height: 40, border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)', background: 'none' }} />
                            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>{themeColor}</span>
                        </div>
                    </div>

                    <div>
                        <label className="label"><Upload size={12} style={{ marginRight: '4px' }} /> {t('banner')}</label>
                        <label className="btn" style={{ width: '100%', cursor: 'pointer' }}>
                            Choose Banner Image
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
