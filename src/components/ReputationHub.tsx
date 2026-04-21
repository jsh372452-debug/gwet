import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { api, LeaderboardEntry } from '../lib/api';
import { Shield, Zap, TrendingUp, AlertTriangle, Trophy, Medal, Target } from 'lucide-react';
import { TierBadge } from './TierBadge';
import { ErrorBoundary } from './ErrorBoundary';

export const ReputationHub: React.FC = () => {
    const { user } = useAuthStore();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        try {
            const response = await api.leaderboard.get(20);
            setLeaderboard(response.leaderboard || []);
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
        <ErrorBoundary>
            <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <div style={{ 
                        width: '64px', height: '64px', background: 'var(--gradient-bolt)', 
                        borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        color: 'white', boxShadow: 'var(--glow-electric)' 
                    }}>
                        <Trophy size={32} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Space Grotesk' }}>REPUTATION HUB</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Influence is the currency of the storm.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    {/* User Standing Card */}
                    <div className="card" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}>
                            <Zap size={120} color="var(--brand-electric)" />
                        </div>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Your Operative Standing
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--brand-electric)', fontFamily: 'Space Grotesk' }}>
                                {Math.round(user?.influenceScore || 0)}
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <TierBadge tier={getTier(user?.influenceScore || 0)} size={24} />
                                    <span style={{ fontWeight: 800, fontSize: '18px' }}>{getTier(user?.influenceScore || 0)}</span>
                                </div>
                                <div className="chip chip-gold">RANKING ACTIVE</div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="card" style={{ padding: '32px' }}>
                         <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Platform Metrics
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div>
                                <div style={{ fontSize: '20px', fontWeight: 800 }}>+{Math.round((user?.influenceScore || 0) / 10)}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Today's Gains</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '20px', fontWeight: 800 }}>99%</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Comms Integrity</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leaderboard Table */}
                <div className="card" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'Space Grotesk', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <TrendingUp size={20} color="var(--brand-electric)" /> GLOBAL LEADERBOARD
                        </h3>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>UPDATED LIVE</span>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                            <Zap size={32} className="spinner" />
                            <p style={{ marginTop: '16px', fontWeight: 700 }}>RECALCULATING INFLUENCE...</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(leaderboard || []).map((u, i) => (
                                <div 
                                    key={u.id} 
                                    className="card interactive" 
                                    style={{ 
                                        display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px',
                                        background: i < 3 ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-input)',
                                        border: 'none', borderRadius: '12px'
                                    }}
                                >
                                    <div style={{ 
                                        width: '40px', fontSize: '18px', fontWeight: 800, fontFamily: 'JetBrains Mono',
                                        color: i === 0 ? 'var(--xp-gold)' : i === 1 ? '#94A3B8' : i === 2 ? '#B45309' : 'var(--text-muted)'
                                    }}>
                                        #{u.rank}
                                    </div>
                                    <div className="avatar" style={{ width: '40px', height: '40px', border: i < 3 ? '2px solid var(--brand-electric)' : 'none' }}>
                                        {u.avatarUrl ? <img src={u.avatarUrl} /> : (u.displayName || u.username || 'G').charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-primary)' }}>
                                            {(u.displayName || u.username || 'USER').toUpperCase()}
                                            {i === 0 && <Medal size={14} color="var(--xp-gold)" style={{ marginLeft: '8px' }} />}
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{u.gamingPlatform || 'OPERATIVE'}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-glow)', fontFamily: 'JetBrains Mono' }}>
                                            {Math.round(u.influenceScore)}
                                        </div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>INFLUENCE</div>
                                    </div>
                                    <div style={{ width: '32px', display: 'flex', justifyContent: 'center' }}>
                                        <TierBadge tier={getTier(u.influenceScore)} size={22} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Protocol Note */}
                <div className="card" style={{ marginTop: '32px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '24px' }}>
                    <h4 style={{ color: 'var(--danger)', fontSize: '14px', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield size={16} /> ANTI-SPAM PROTOCOL_V4 ACTIVE
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                        AAG Security enforces strict interaction limits. Malicious activity, bot-like behavior, and cross-platform manipulation results in immediate influence decay. Standard operative limit: 200 daily transmissions.
                    </p>
                </div>
            </div>
        </ErrorBoundary>
    );
};
