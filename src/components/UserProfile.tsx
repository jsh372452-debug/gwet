import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useTranslation } from '../i18n';
import { X, Flame, Shield, Award, MessageCircle, Send, Globe, PlusSquare, MessageSquare, Star, Gamepad2 } from 'lucide-react';
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
                // Modified auth.getUserProfile to return the expanded schema
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)' }} onClick={onClose}>
            <div className="glass-card neon-border" style={{ width: '100%', maxWidth: '440px', padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                {/* Header/Cover */}
                <div style={{ height: '100px', background: 'linear-gradient(135deg, var(--primary), #1e1e2e)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 12, left: isRTL ? 'auto' : 12, right: isRTL ? 12 : 'auto' }}>
                        <TierBadge tier={profile.tier || 'BRONZE'} size={48} showLabel />
                    </div>
                    <button className="btn ghost icon-only" onClick={onClose} style={{ position: 'absolute', top: 10, right: isRTL ? 'auto' : 10, left: isRTL ? 10 : 'auto', color: 'white', background: 'rgba(0,0,0,0.3)' }}>
                        <X size={18} />
                    </button>
                </div>

                <div style={{ padding: '0 2rem 2rem 2rem', marginTop: '-40px', textAlign: 'center' }}>
                    <div className="avatar-premium" style={{ margin: '0 auto 1rem auto', border: '4px solid var(--bg-dark)', width: 90, height: 90, fontSize: '2.5rem' }}>
                        {profile.display_name?.[0] || profile.username?.[0]}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Flag code={profile.country || 'Global'} size={24} />
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>{profile.display_name || profile.username}</h2>
                    </div>

                    {profile.bio && (
                        <p style={{ margin: '0.5rem 0', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.4', opacity: 0.9 }}>
                            {profile.bio}
                        </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                        <div className="badge primary">{profile.rank}</div>
                        {profile.game_id && <div className="badge accent" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Gamepad2 size={12} /> {profile.game_id}</div>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-sm)', marginBottom: '2rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem 0.5rem', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                            <div style={{ color: 'var(--primary)', marginBottom: '4px' }}><Flame size={14} /></div>
                            <div style={{ fontSize: '1rem', fontWeight: 900 }}>{Math.floor(profile.reputation || 0)}</div>
                            <div style={{ fontSize: '8px', fontWeight: 800, color: 'var(--text-muted)' }}>REP</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem 0.5rem', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                            <div style={{ color: 'var(--accent)', marginBottom: '4px' }}><Award size={14} /></div>
                            <div style={{ fontSize: '1rem', fontWeight: 900 }}>{profile.level}</div>
                            <div style={{ fontSize: '8px', fontWeight: 800, color: 'var(--text-muted)' }}>LVL</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem 0.5rem', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                            <div style={{ color: 'var(--gold)', marginBottom: '4px' }}><Star size={14} /></div>
                            <div style={{ fontSize: '1rem', fontWeight: 900 }}>{profile.total_helpful_ai_flags || 0}</div>
                            <div style={{ fontSize: '8px', fontWeight: 800, color: 'var(--text-muted)' }}>HELPFUL</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>{profile.post_count || 0}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800 }}>POSTS</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>{profile.message_count || 0}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800 }}>MESSAGES</div>
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {(profile.whatsapp || profile.telegram) ? (
                            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                {profile.whatsapp && (
                                    <a href={`https://wa.me/${profile.whatsapp}`} target="_blank" className="btn primary sm" style={{ flex: 1, gap: '6px', fontSize: '11px', fontWeight: 900 }}>
                                        <MessageCircle size={14} /> WHATSAPP
                                    </a>
                                )}
                                {profile.telegram && (
                                    <a href={`https://t.me/${profile.telegram}`} target="_blank" className="btn sm" style={{ flex: 1, gap: '6px', border: '1px solid #0088cc', fontSize: '11px', fontWeight: 900 }}>
                                        <Send size={14} /> TELEGRAM
                                    </a>
                                )}
                            </div>
                        ) : (
                            <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic', letterSpacing: '0.5px' }}>NO PUBLIC CONTACT LINKED</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
