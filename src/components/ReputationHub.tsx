import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Shield, Award, Flame, Star, TrendingUp, Users, Search, Loader2 } from 'lucide-react';
import Flag from './Flag';

export const ReputationHub: React.FC = () => {
    const { isRTL } = useTranslation();
    const { user } = useAuthStore();
    const [topUsers, setTopUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopUsers = async () => {
            try {
                // For MVP, we use the explore endpoint to get some posts and extract unique users
                // In a full implementation, we'd have a specific leaderboard endpoint
                const { posts } = await api.explore.get('popular');
                const usersMap = new Map();
                posts.forEach((p: any) => {
                    if (!usersMap.has(p.user_id)) {
                        usersMap.set(p.user_id, {
                            id: p.user_id,
                            username: p.username,
                            reputation: (p.fire_count || 0) * 5 + 100, // Mock rep
                            country: p.country || 'Global'
                        });
                    }
                });
                setTopUsers(Array.from(usersMap.values()).sort((a, b) => b.reputation - a.reputation));
            } catch (err) {
                console.error('Fetch leaderboard failed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTopUsers();
    }, []);

    return (
        <div className="page-container wide" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            <div className="section-header">
                <div className="icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--gold)' }}><Shield size={22} /></div>
                <div>
                    <h2 style={{ textTransform: 'uppercase' }}>{isRTL ? 'مركز السمعة' : 'REPUTATION HUB'}</h2>
                    <p className="subtitle">{isRTL ? 'نظام الثقة والترتيب العالمي' : 'TRUST SYSTEM & GLOBAL RANKINGS'}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 'var(--space-xl)' }}>
                {/* Main Content: Leaderboard */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <div className="card" style={{ padding: 'var(--space-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <TrendingUp size={18} color="var(--primary)" /> {isRTL ? 'أفضل اللاعبين' : 'TOP PERFORMERS'}
                            </h3>
                            <div style={{ position: 'relative' }}>
                                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="input" placeholder={isRTL ? 'بحث عن لاعب...' : 'Search player...'} style={{ width: '180px', paddingLeft: '32px', height: '32px', fontSize: '12px' }} />
                            </div>
                        </div>

                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 className="spinner" size={24} /></div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {topUsers.map((u, i) => (
                                    <div key={u.id} className="interactive" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', background: i === 0 ? 'rgba(245, 158, 11, 0.05)' : 'transparent', border: i === 0 ? '1px solid rgba(245, 158, 11, 0.1)' : '1px solid transparent' }}>
                                        <div style={{ width: '28px', fontWeight: 900, fontSize: '1.2rem', color: i < 3 ? 'var(--gold)' : 'var(--text-muted)', textAlign: 'center' }}>
                                            {i === 0 ? '🏆' : i + 1}
                                        </div>
                                        <div className="avatar md">{u.username[0].toUpperCase()}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 800, fontSize: 'var(--font-base)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {u.username} <Flag code={u.country} size={14} />
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                {i < 3 ? (isRTL ? 'نخبة' : 'ELITE PLAYER') : (isRTL ? 'محترف' : 'PRO GAMER')}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.1rem' }}>{u.reputation}</div>
                                            <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)' }}>REP</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: Your Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                    <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-elevated), #1a1a2e)', border: '1px solid var(--primary-soft)' }}>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-lg)' }}>{isRTL ? 'إحصائياتك' : 'YOUR STANDING'}</h4>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: '1.5rem' }}>
                            <div className="avatar lg" style={{ border: '2px solid var(--primary)' }}>{user?.username?.[0].toUpperCase()}</div>
                            <div>
                                <div style={{ fontWeight: 800 }}>{user?.displayName || user?.username}</div>
                                <div className="badge" style={{ marginTop: '4px' }}>{user?.rank}</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                <div style={{ color: 'var(--gold)', marginBottom: '4px' }}><Star size={16} fill="currentColor" /></div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>{user?.level}</div>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>LEVEL</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                <div style={{ color: '#ff4d00', marginBottom: '4px' }}><Flame size={16} /></div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>{user?.xp}</div>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>XP</div>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--primary-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-low)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 700 }}>{isRTL ? 'التقدم للرتبة التالية' : 'PROGRESS TO NEXT RANK'}</span>
                                <span style={{ color: 'var(--primary)', fontWeight: 900 }}>{user?.xp}%</span>
                            </div>
                            <div style={{ height: '6px', background: 'rgba(0,0,0,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${user?.xp}%`, height: '100%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }} />
                            </div>
                        </div>
                    </div>

                    <div className="card compact">
                        <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-md)' }}>{isRTL ? 'كيف تزيد سمعتك؟' : 'HOW TO EARN REP?'}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
                                <div style={{ color: 'var(--primary)' }}><Users size={14} /></div>
                                <span>{isRTL ? 'ساعد أعضاء السكواد' : 'Help squad members'}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
                                <div style={{ color: 'var(--accent)' }}><Star size={14} /></div>
                                <span>{isRTL ? 'شارك في الفعاليات' : 'Participate in events'}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
                                <div style={{ color: '#ff4d00' }}><Flame size={14} /></div>
                                <span>{isRTL ? 'احصل على تفاعلات (Fire)' : 'Get Fire on your feed'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
