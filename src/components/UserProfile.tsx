import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useTranslation } from '../i18n';
import { X, Flame, Shield, Award, MessageCircle, Send, Globe, PlusSquare, MessageSquare, Star, Gamepad2, Users, ExternalLink } from 'lucide-react';
import Flag from './Flag';
import { TierBadge } from './TierBadge';

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
        <div 
            style={{ 
                position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.95)', 
                backdropFilter: 'blur(20px)', zIndex: 1000, display: 'flex', 
                alignItems: 'center', justifyContent: 'center', padding: '24px' 
            }} 
            onClick={onClose}
        >
            <div 
                className="card" 
                style={{ width: '100%', maxWidth: '440px', padding: 0, overflow: 'hidden', border: '1px solid var(--border-strong)', borderRadius: '0', background: 'var(--bg-surface)' }} 
                onClick={e => e.stopPropagation()}
            >
                {/* Header/Cover */}
                <div style={{ height: '80px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 12, left: isRTL ? 'auto' : 16, right: isRTL ? 16 : 'auto' }}>
                        <TierBadge tier={profile.tier || 'BRONZE'} size={40} showLabel />
                    </div>
                    <button 
                        className="btn btn-ghost btn-icon" 
                        onClick={onClose} 
                        style={{ position: 'absolute', top: 12, right: isRTL ? 'auto' : 12, left: isRTL ? 12 : 'auto', color: 'var(--text-muted)', background: 'var(--bg-input)', borderRadius: '0' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div style={{ padding: '0 32px 32px 32px', marginTop: '-32px', textAlign: 'center' }}>
                    <div className="avatar" style={{ margin: '0 auto 16px auto', border: '4px solid var(--border-strong)', width: 80, height: 80, borderRadius: '0', background: 'var(--bg-deep)' }}>
                        {profile.avatar_url ? <img src={profile.avatar_url} /> : (profile.display_name?.[0] || profile.username?.[0] || 'G').toUpperCase()}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Flag code={profile.country || 'Global'} size={20} />
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, fontFamily: 'Space Grotesk', letterSpacing: '-0.5px' }}>{(profile.display_name || profile.username).toUpperCase()}</h2>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                        <div className="chip" style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '0' }}>{profile.gaming_platform || 'OPERATIVE'}</div>
                        <div className="chip" style={{ fontSize: '10px', fontWeight: 800, background: 'var(--text-primary)', color: 'var(--bg-deep)', borderRadius: '0' }}>LVL_{profile.level || 1}</div>
                    </div>

                    {profile.bio && (
                        <p style={{ margin: '16px 0 24px', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                            {profile.bio}
                        </p>
                    )}

                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border-subtle)', marginBottom: '32px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ background: 'var(--bg-input)', padding: '16px 8px', textAlign: 'center' }}>
                            <div style={{ color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', justifyContent: 'center' }}><Shield size={14} /></div>
                            <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'JetBrains Mono' }}>{Math.floor(profile.reputation || profile.influenceScore || 0)}</div>
                            <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>INF_SCR</div>
                        </div>
                        <div style={{ background: 'var(--bg-input)', padding: '16px 8px', textAlign: 'center' }}>
                            <div style={{ color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', justifyContent: 'center' }}><MessageSquare size={14} /></div>
                            <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'JetBrains Mono' }}>{profile.post_count || 0}</div>
                            <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>COMMS</div>
                        </div>
                        <div style={{ background: 'var(--bg-input)', padding: '16px 8px', textAlign: 'center' }}>
                            <div style={{ color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', justifyContent: 'center' }}><Users size={14} /></div>
                            <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'JetBrains Mono' }}>{profile.squad_count || 0}</div>
                            <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>CLANS</div>
                        </div>
                    </div>

                    {/* Contact / Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(profile.whatsapp || profile.telegram) ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {profile.whatsapp && (
                                    <a href={`https://wa.me/${profile.whatsapp}`} target="_blank" className="btn btn-primary" style={{ flex: 1, height: '40px', gap: '8px', fontSize: '11px', borderRadius: '0', background: 'var(--text-primary)', color: 'var(--bg-deep)', fontWeight: 800 }}>
                                        WHATSAPP
                                    </a>
                                )}
                                {profile.telegram && (
                                    <a href={`https://t.me/${profile.telegram}`} target="_blank" className="btn btn-ghost" style={{ flex: 1, height: '40px', gap: '8px', border: '1px solid var(--border-strong)', fontSize: '11px', borderRadius: '0', fontWeight: 800 }}>
                                        TELEGRAM
                                    </a>
                                )}
                            </div>
                        ) : (
                            <button className="btn btn-primary" style={{ width: '100%', height: '40px', borderRadius: '0', background: 'var(--text-primary)', color: 'var(--bg-deep)', fontSize: '11px', fontWeight: 800 }}>
                                TRANSMIT_MESSAGE_SECURELY
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
