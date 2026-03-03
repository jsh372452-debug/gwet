import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useTranslation } from '../i18n';
import { X, Flame, Shield, Award, MessageCircle, Send, Globe } from 'lucide-react';
import Flag from './Flag';

interface Props {
    userId: string;
    onClose: () => void;
}

export const UserProfile: React.FC<Props> = ({ userId, onClose }) => {
    const { t, isRTL } = useTranslation();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { profile } = await api.auth.getUserProfile(userId);
                setProfile(profile);
            } catch (err) {
                console.error('Fetch profile failed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    if (loading) return null;
    if (!profile) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)' }} onClick={onClose}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: 0, overflow: 'hidden', border: '1px solid var(--primary-soft)' }} onClick={e => e.stopPropagation()}>
                {/* Header/Cover */}
                <div style={{ height: '80px', background: 'linear-gradient(45deg, var(--primary), var(--accent))', position: 'relative' }}>
                    <button className="btn ghost icon-only" onClick={onClose} style={{ position: 'absolute', top: 10, right: isRTL ? 'auto' : 10, left: isRTL ? 10 : 'auto', color: 'white' }}>
                        <X size={18} />
                    </button>
                </div>

                <div style={{ padding: '0 2rem 2rem 2rem', marginTop: '-40px', textAlign: 'center' }}>
                    <div className="avatar lg" style={{ margin: '0 auto 1rem auto', border: '4px solid var(--bg-card)', width: 80, height: 80, fontSize: '2rem' }}>
                        {profile.displayName?.[0] || profile.username?.[0]}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Flag code={profile.country || 'Global'} size={20} />
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{profile.displayName || profile.username}</h2>
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '2px' }}>{profile.rank}</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginTop: '2rem' }}>
                        <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
                            <div style={{ color: '#ff4d00', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
                                <Flame size={16} /> <span style={{ fontWeight: 900 }}>REPUTATION</span>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{Math.floor(profile.reputation)}</div>
                        </div>
                        <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
                            <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
                                <Award size={16} /> <span style={{ fontWeight: 900 }}>LEVEL</span>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{profile.level}</div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {(profile.whatsapp || profile.telegram) ? (
                            <>
                                <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textAlign: isRTL ? 'right' : 'left', margin: '0 0 4px 0' }}>COMMUNICATION CHANNELS</h3>
                                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                                    {profile.whatsapp && (
                                        <a href={`https://wa.me/${profile.whatsapp}`} target="_blank" className="btn primary" style={{ flex: 1, gap: '8px' }}>
                                            <MessageCircle size={16} /> WhatsApp
                                        </a>
                                    )}
                                    {profile.telegram && (
                                        <a href={`https://t.me/${profile.telegram}`} target="_blank" className="btn" style={{ flex: 1, gap: '8px', border: '1px solid #0088cc' }}>
                                            <Send size={16} /> Telegram
                                        </a>
                                    )}
                                </div>
                            </>
                        ) : (
                            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontStyle: 'italic' }}>No public contact information available</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
