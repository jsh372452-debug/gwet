import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { api, LeaderboardEntry } from '../lib/api';
import { Shield, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
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
        <ErrorBoundary>
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
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.6, margin: 0 }}>
                    The AAG Influence Engine automatically throttles low-reputation accounts and penalizes spam behaviors. Daily interaction limits are enforced at 200 actions per operative. Malicious activity rapidly degrades influence score and platform visibility.
                </p>
            </div>
        </div>
    );
};
