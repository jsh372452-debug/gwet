import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Shield, Award, Flame, Star, TrendingUp, Users, Search, Loader2, MessageSquare, PlusSquare, Heart, Crown, Zap } from 'lucide-react';
import Flag from './Flag';
import { TierBadge } from './TierBadge';

export const ReputationHub: React.FC = () => {
    const { isRTL } = useTranslation();
    const { user } = useAuthStore();
    const [topUsers, setTopUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const { leaderboard } = await api.leaderboard.get();
            setTopUsers(leaderboard || []);
        } catch (err) {
            console.error('Fetch leaderboard failed:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const wallOfFame = topUsers.slice(0, 3);
    const standardList = topUsers.slice(3);

    return (
        <div className="page-container wide" style={{ direction: isRTL ? 'rtl' : 'ltr', paddingBottom: '5rem' }}>
            <div className="section-header" style={{ marginBottom: '3rem' }}>
                <div className="icon-wrap" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}><Shield size={22} /></div>
                <div>
                    <h2 style={{ textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 900 }}>{isRTL ? 'قائمة الشرف والسمعة' : 'WALL OF FAME & ELITE REP'}</h2>
                    <p className="subtitle" style={{ color: 'var(--primary)', fontWeight: 700 }}>{isRTL ? 'نخبة اللاعبين ونظام الثقة العالمي' : 'ELITE PLAYERS & GLOBAL TRUST NETWORK'}</p>
                </div>
            </div>

            {/* Wall of Fame - Top 3 */}
            {!loading && wallOfFame.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '4rem', alignItems: 'flex-end' }}>
                    {/* Rank 2 */}
                    {wallOfFame[1] && (
                        <div className="glass-card sharp" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', position: 'relative', borderTop: '2px solid #C0C0C0', height: 'fit-content' }}>
                            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#C0C0C0', color: 'black', padding: '2px 12px', fontSize: '10px', fontWeight: 900 }}>
                                RANK #2
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <TierBadge tier={wallOfFame[1].reputation_tier || 'DIAMOND'} size={56} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                {wallOfFame[1].username.toUpperCase()} <Flag code={wallOfFame[1].country} size={16} />
                            </h3>
                            <div style={{ color: 'var(--primary)', fontWeight: 900, fontSize: '1.25rem' }}>
                                {Math.floor(wallOfFame[1].reputation_score || 0)} <span style={{ fontSize: '10px', opacity: 0.5 }}>PT</span>
                            </div>
                        </div>
                    )}

                    {/* Rank 1 */}
                    {wallOfFame[0] && (
                        <div className="glass-card sharp neon-border" style={{ textAlign: 'center', padding: '3.5rem 2rem', position: 'relative', borderTop: '4px solid var(--gold)', transform: 'scale(1.05)', zIndex: 2 }}>
                            <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)' }}>
                                <Crown size={40} style={{ color: 'var(--gold)', filter: 'drop-shadow(0 0 10px var(--gold))' }} />
                            </div>
                            <div style={{ position: 'absolute', top: '25px', left: '50%', transform: 'translateX(-50%)', background: 'var(--gold)', color: 'black', padding: '2px 16px', fontSize: '11px', fontWeight: 900 }}>
                                SUPREME MASTER
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <TierBadge tier={wallOfFame[0].reputation_tier || 'MYTHIC'} size={84} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', letterSpacing: '1px' }}>
                                {wallOfFame[0].username.toUpperCase()} <Flag code={wallOfFame[0].country} size={20} />
                            </h3>
                            <div style={{ color: 'var(--gold)', fontWeight: 900, fontSize: '2rem', textShadow: '0 0 15px rgba(255, 215, 0, 0.3)' }}>
                                {Math.floor(wallOfFame[0].reputation_score || 0)}
                            </div>
                            <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--gold)', opacity: 0.8 }}>REPUTATION POINTS</div>
                        </div>
                    )}

                    {/* Rank 3 */}
                    {wallOfFame[2] && (
                        <div className="glass-card sharp" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', position: 'relative', borderTop: '2px solid #CD7F32', height: 'fit-content' }}>
                            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#CD7F32', color: 'black', padding: '2px 12px', fontSize: '10px', fontWeight: 900 }}>
                                RANK #3
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <TierBadge tier={wallOfFame[2].reputation_tier || 'PLATINUM'} size={56} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                {wallOfFame[2].username.toUpperCase()} <Flag code={wallOfFame[2].country} size={16} />
                            </h3>
                            <div style={{ color: 'var(--primary)', fontWeight: 900, fontSize: '1.25rem' }}>
                                {Math.floor(wallOfFame[2].reputation_score || 0)} <span style={{ fontSize: '10px', opacity: 0.5 }}>PT</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="glass-card sharp" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '1px' }}>
                                <TrendingUp size={20} color="var(--primary)" /> GLOBAL SECTOR RANKINGS
                            </h3>
                        </div>

                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 className="spinner" size={32} color="var(--primary)" /></div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {standardList.map((u, i) => (
                                    <div key={u.id} className="glass-card sharp compact" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem 1.5rem', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)' }}>
                                        <div style={{ width: '32px', fontWeight: 900, fontSize: '1.1rem', color: i < 7 ? 'var(--primary)' : 'var(--text-muted)', textAlign: 'center' }}>
                                            {i + 4}
                                        </div>
                                        <div className="avatar-premium" style={{ width: '44px', height: '44px', fontSize: '1.1rem' }}>{u.username[0].toUpperCase()}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 900, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}>
                                                {u.username.toUpperCase()} <Flag code={u.country} size={14} />
                                            </div>
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', gap: '12px', marginTop: '4px', fontWeight: 700 }}>
                                                <span>{u.post_count || 0} POSTS</span>
                                                <span style={{ opacity: 0.3 }}>|</span>
                                                <span>{u.message_count || 0} MSG</span>
                                                {u.total_helpful_ai_flags > 0 && (
                                                    <>
                                                        <span style={{ opacity: 0.3 }}>|</span>
                                                        <span style={{ color: 'var(--accent)' }}>{u.total_helpful_ai_flags} AI HELPS</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.25rem' }}>{Math.floor(u.reputation_score || 0)}</div>
                                                <div style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)' }}>PT</div>
                                            </div>
                                            <TierBadge tier={u.reputation_tier || 'BRONZE'} size={32} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass-card sharp neon-border" style={{ padding: '2rem' }}>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '2rem', letterSpacing: '2px' }}>YOUR OPERATIONAL STATUS</h4>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            <div className="avatar-premium" style={{ width: '64px', height: '64px', border: '2px solid var(--primary)', fontSize: '1.5rem' }}>{user?.username?.[0].toUpperCase()}</div>
                            <div>
                                <div style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '1px' }}>{user?.displayName.toUpperCase()}</div>
                                <div style={{ marginTop: '8px' }}><TierBadge tier={user?.reputation_tier || 'BRONZE'} size={24} showLabel /></div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                                <Award size={18} style={{ color: 'var(--gold)', marginBottom: '8px' }} />
                                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{user?.level}</div>
                                <div style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)' }}>LEVEL</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                                <Zap size={18} style={{ color: 'var(--accent)', marginBottom: '8px' }} />
                                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{user?.xp}</div>
                                <div style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)' }}>XP ENERGY</div>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                                <span style={{ color: 'var(--text-muted)' }}>TOTAL ENGAGEMENTS</span>
                                <span style={{ color: 'var(--primary)' }}>{user?.post_count || 0}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                                <span style={{ color: 'var(--text-muted)' }}>COMMS LOGS</span>
                                <span style={{ color: 'var(--primary)' }}>{user?.message_count || 0}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                                <span style={{ color: 'var(--text-muted)' }}>AI ASSIST FLAGS</span>
                                <span style={{ color: 'var(--accent)' }}>{user?.total_helpful_ai_flags || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card sharp" style={{ background: 'rgba(139, 92, 246, 0.05)', padding: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '1px' }}>ELITE PROTOCOLS</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { icon: PlusSquare, text: 'DEPLOY HELPFUL TRANSMISSIONS', color: 'var(--primary)' },
                                { icon: MessageSquare, text: 'OPERATE IN SQUAD CHANNELS', color: 'var(--accent)' },
                                { icon: Flame, text: 'ACCUMULATE FIRE REACTIONS', color: '#ff4d00' }
                            ].map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '12px', fontSize: '11px', fontWeight: 700, alignItems: 'center' }}>
                                    <div style={{ color: item.color }}><item.icon size={16} /></div>
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
