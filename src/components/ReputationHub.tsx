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
                        width: '64px', height: '64px', background: 'var(--bg-elevated)', 
                        borderRadius: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' 
                    }}>
                        <Trophy size={32} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Space Grotesk', letterSpacing: '-0.5px' }}>REPUTATION_HUB</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Influence is the primary operative currency.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    {/* User Standing Card */}
                    <div className="card" style={{ padding: '32px', position: 'relative', overflow: 'hidden', borderRadius: '0' }}>
                        <h3 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                            OPERATIVE_STANDING
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Space Grotesk', letterSpacing: '-2px' }}>
                                {Math.round(user?.influenceScore || 0)}
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <TierBadge tier={getTier(user?.influenceScore || 0)} size={20} />
                                    <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '1px' }}>{getTier(user?.influenceScore || 0)}</span>
                                </div>
                                <div className="chip" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '10px', borderRadius: '0', fontWeight: 800 }}>RANKING_ACTIVE</div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="card" style={{ padding: '32px', borderRadius: '0' }}>
                         <h3 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                            NODE_METRICS
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div>
                                <div style={{ fontSize: '20px', fontWeight: 800 }}>+{Math.round((user?.influenceScore || 0) / 10)}</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>24H_INFLUENCE_GAIN</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '20px', fontWeight: 800 }}>99%</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>NODE_INTEGRITY</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leaderboard Table */}
                <div className="card" style={{ padding: '32px', borderRadius: '0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'Space Grotesk', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '1px' }}>
                            <TrendingUp size={20} color="var(--text-primary)" /> GLOBAL_LEADERBOARD
                        </h3>
                        <span style={{ fontSize: '10px', color: 'var(--success)', fontWeight: 800, letterSpacing: '1px' }}>LIVE_SYNC_ACTIVE</span>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                            <Zap size={32} className="spinner" />
                            <p style={{ marginTop: '16px', fontWeight: 800, fontSize: '10px', letterSpacing: '2px' }}>RECALCULATING_INFLUENCE_MATRICES...</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {(leaderboard || []).map((u, i) => (
                                <div 
                                    key={u.id} 
                                    className="card interactive" 
                                    style={{ 
                                        display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px',
                                        background: 'var(--bg-input)',
                                        border: '1px solid var(--border-subtle)', borderRadius: '0'
                                    }}
                                >
                                    <div style={{ 
                                        width: '40px', fontSize: '16px', fontWeight: 800, fontFamily: 'JetBrains Mono',
                                        color: i === 0 ? 'var(--text-primary)' : 'var(--text-muted)'
                                    }}>
                                        #{u.rank.toString().padStart(2, '0')}
                                    </div>
                                    <div className="avatar" style={{ width: '40px', height: '40px', borderRadius: '0', border: '1px solid var(--border-strong)' }}>
                                        {u.avatarUrl ? <img src={u.avatarUrl} /> : (u.displayName || u.username || 'G').charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
                                            {(u.displayName || u.username || 'USER').toUpperCase()}
                                            {i === 0 && <Shield size={14} color="var(--text-primary)" style={{ marginLeft: '8px' }} />}
                                        </div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{u.gamingPlatform || 'OPERATIVE'}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>
                                            {Math.round(u.influenceScore)}
                                        </div>
                                        <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 800 }}>INF_SCORE</div>
                                    </div>
                                    <div style={{ width: '32px', display: 'flex', justifyContent: 'center' }}>
                                        <TierBadge tier={getTier(u.influenceScore)} size={20} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Protocol Note */}
                <div className="card" style={{ marginTop: '32px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', padding: '24px', borderRadius: '0' }}>
                    <h4 style={{ color: 'var(--danger)', fontSize: '12px', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <Shield size={16} /> ANTI-MANIPULATION_PROTOCOL_ACTIVE
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                        SYSTEM_ENFORCEMENT: ALL INTERACTIONS SUBJECT TO VETTING. MALICIOUS ACTIVITY, AUTOMATED BEHAVIOR, AND CROSS-NODE MANIPULATION RESULTS IN IMMEDIATE INFLUENCE QUARANTINE. STANDARD OPERATIVE LIMIT: 200 TRANSMISSIONS PER CYCLE.
                    </p>
                </div>
            </div>
        </ErrorBoundary>
    );
};
