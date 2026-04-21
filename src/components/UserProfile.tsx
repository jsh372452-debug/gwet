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
                position: 'fixed', inset: 0, background: 'rgba(1, 4, 16, 0.85)', 
                backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', 
                alignItems: 'center', justifyContent: 'center', padding: '24px' 
            }} 
            onClick={onClose}
        >
            <div 
                className="card" 
                style={{ width: '100%', maxWidth: '480px', padding: 0, overflow: 'hidden', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)' }} 
                onClick={e => e.stopPropagation()}
            >
                {/* Header/Cover */}
                <div style={{ height: '120px', background: 'var(--gradient-bolt)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 16, left: isRTL ? 'auto' : 16, right: isRTL ? 16 : 'auto', filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.3))' }}>
                        <TierBadge tier={profile.tier || 'BRONZE'} size={56} showLabel />
                    </div>
                    <button 
                        className="btn btn-ghost btn-icon" 
                        onClick={onClose} 
                        style={{ position: 'absolute', top: 12, right: isRTL ? 'auto' : 12, left: isRTL ? 12 : 'auto', color: 'white', background: 'rgba(0,0,0,0.2)' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '0 32px 32px 32px', marginTop: '-48px', textAlign: 'center' }}>
                    <div className="avatar" style={{ margin: '0 auto 16px auto', border: '5px solid var(--bg-surface)', width: 96, height: 96, boxShadow: 'var(--shadow-md)' }}>
                        {profile.avatar_url ? <img src={profile.avatar_url} /> : (profile.display_name?.[0] || profile.username?.[0] || 'G').toUpperCase()}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Flag code={profile.country || 'Global'} size={24} />
                        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, fontFamily: 'Space Grotesk' }}>{profile.display_name || profile.username}</h2>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                        <div className="chip chip-info" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{profile.gaming_platform || 'OPERATIVE'}</div>
                        <div className="chip chip-gold">LVL {profile.level || 1}</div>
                    </div>

                    {profile.bio && (
                        <p style={{ margin: '16px 0 24px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                            {profile.bio}
                        </p>
                    )}

                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
                        <div style={{ background: 'var(--bg-input)', padding: '16px 8px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ color: 'var(--brand-electric)', marginBottom: '4px', display: 'flex', justifyContent: 'center' }}><Flame size={16} /></div>
                            <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'JetBrains Mono' }}>{Math.floor(profile.reputation || profile.influenceScore || 0)}</div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>REP</div>
                        </div>
                        <div style={{ background: 'var(--bg-input)', padding: '16px 8px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ color: 'var(--brand-electric)', marginBottom: '4px', display: 'flex', justifyContent: 'center' }}><MessageSquare size={16} /></div>
                            <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'JetBrains Mono' }}>{profile.post_count || 0}</div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>COMMS</div>
                        </div>
                        <div style={{ background: 'var(--bg-input)', padding: '16px 8px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ color: 'var(--brand-electric)', marginBottom: '4px', display: 'flex', justifyContent: 'center' }}><Users size={16} /></div>
                            <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'JetBrains Mono' }}>{profile.squad_count || 0}</div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>CLANS</div>
                        </div>
                    </div>

                    {/* Contact / Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(profile.whatsapp || profile.telegram) ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {profile.whatsapp && (
                                    <a href={`https://wa.me/${profile.whatsapp}`} target="_blank" className="btn btn-primary" style={{ flex: 1, height: '44px', gap: '8px', fontSize: '13px' }}>
                                        <MessageCircle size={16} /> WHATSAPP
                                    </a>
                                )}
                                {profile.telegram && (
                                    <a href={`https://t.me/${profile.telegram}`} target="_blank" className="btn btn-ghost" style={{ flex: 1, height: '44px', gap: '8px', border: '1px solid #0088cc', fontSize: '13px' }}>
                                        <Send size={16} /> TELEGRAM
                                    </a>
                                )}
                            </div>
                        ) : (
                            <button className="btn btn-ghost" style={{ width: '100%', height: '44px' }}>
                                TRANSMIT MESSAGE <ExternalLink size={14} style={{ marginLeft: '8px' }} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
