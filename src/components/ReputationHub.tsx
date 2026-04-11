import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { api, LeaderboardEntry } from '../lib/api';
import { Shield, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import { TierBadge } from './TierBadge';

export const ReputationHub: React.FC = () => {
    const { user } = useAuthStore();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        try {
            const { leaderboard } = await api.leaderboard.get(20);
            setLeaderboard(leaderboard);
        } catch (err) {
            console.error('Failed to load leaderboard', err);
        } finally {
            setLoading(false);
        }
    };

    const getTier = (influence: number) => {
        if (influence > 5000) return 'MYTHIC';
        if (influence > 2500) return 'LEGEND';
        if (influence > 1000) return 'DIAMOND';
        if (influence > 500) return 'PLATINUM';
        if (influence > 250) return 'GOLD';
        if (influence > 100) return 'SILVER';
        return 'BRONZE';
    };

    return (
        <div className="page-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '2.5rem' }}>
                <div style={{ padding: '12px', background: 'var(--primary-glow)', borderRadius: '12px', color: 'var(--primary)' }}>
                    <Shield size={32} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>AAG LEADERBOARD</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 700 }}>INFLUENCE IS POWER</p>
                </div>
            </div>

            <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Zap size={18} color="var(--primary)" /> YOUR STANDING
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)' }}>
                        {Math.round(user?.influenceScore || 0)}
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 800 }}>AAG INFLUENCE SCORE</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <TierBadge tier={getTier(user?.influenceScore || 0)} size={18} />
                            <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-main)' }}>{getTier(user?.influenceScore || 0)} TIER</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card">
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <TrendingUp size={18} color="var(--primary)" /> TOP OPERATIVES
                </h3>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>SCORING IN PROGRESS...</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {leaderboard.map((u, i) => (
                            <div key={u.id} style={{
                                display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 15px',
                                background: i < 3 ? 'rgba(0, 209, 255, 0.05)' : 'rgba(255,255,255,0.02)',
                                borderLeft: i < 3 ? '3px solid var(--primary)' : '3px solid transparent',
                                borderRadius: '8px'
                            }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 900, width: '30px', color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : 'var(--text-muted)' }}>
                                    #{u.rank}
                                </div>
                                <div className="avatar-premium" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                                    {u.avatarUrl ? <img src={u.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : u.displayName.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 900, fontSize: '14px' }}>{u.displayName.toUpperCase()}</div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{u.gamingPlatform || 'GLOBAL'}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <TierBadge tier={getTier(u.influenceScore)} size={20} />
                                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)', width: '60px', textAlign: 'right' }}>
                                        {Math.round(u.influenceScore)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="glass-card" style={{ marginTop: '2rem', background: 'rgba(255, 0, 0, 0.05)', borderLeft: '3px solid #ff4444' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#ff4444' }}>
                    <AlertTriangle size={18} /> ANTI-SPAM GUARD ACTIVE
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.6, margin: 0 }}>
                    The AAG Influence Engine automatically throttles low-reputation accounts and penalizes spam behaviors. Daily interaction limits are enforced at 200 actions per operative. Malicious activity rapidly degrades influence score and platform visibility.
                </p>
            </div>
        </div>
    );
};
