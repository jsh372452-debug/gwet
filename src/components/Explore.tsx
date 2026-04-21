import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { AAGCommunity } from '../lib/api';
import { Search, Compass, Users, Globe, ExternalLink } from 'lucide-react';
import { useTranslation } from '../i18n';

export const Explore: React.FC = () => {
    const { communities, loadCommunities, joinCommunity } = useGameStore();
    const { t, isRTL } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCommunities();
    }, [loadCommunities]);

    const filteredCommunities = (communities || []).filter(c => 
        (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (c.gameTag || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', direction: isRTL ? 'rtl' : 'ltr' }}>
            
            {/* Header Area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                <div style={{ 
                    width: '64px', height: '64px', background: 'var(--gradient-bolt)', 
                    borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: 'white', boxShadow: 'var(--glow-electric)' 
                }}>
                    <Compass size={32} />
                </div>
                <div>
                    <h2 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Space Grotesk' }}>{t('explore')}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Discover clans, squads, and elite gaming communities.</p>
                </div>
            </div>

            {/* Search Bar */}
            <div style={{ position: 'relative', marginBottom: '48px' }}>
                <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                    className="input" 
                    placeholder="Search by community name, game, or tag..." 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '52px', height: '56px', fontSize: '16px', background: 'var(--bg-input)' }} 
                />
            </div>

            {/* Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>FEATURED_HUBS</h3>
                        <span style={{ fontSize: '13px', color: 'var(--brand-electric)', fontWeight: 700, cursor: 'pointer' }}>View All →</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {filteredCommunities.map(c => (
                            <div key={c.id} className="card interactive" style={{ padding: '24px', display: 'flex', flexDirection: 'column', minHeight: '240px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div className="avatar" style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                                        <span style={{ fontSize: '24px', fontWeight: 800 }}>{c.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div className="chip chip-info" style={{ gap: '6px' }}>
                                        <Users size={12} /> {c.memberCount || 0}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>{c.name}</h4>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-electric)', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                                            #{c.gameTag?.toUpperCase() || 'GLOBAL'}
                                        </span>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Globe size={10} /> Public
                                        </span>
                                    </div>
                                </div>

                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, marginBottom: '24px' }}>
                                    {c.description || 'Join this elite squad to coordinate, compete, and climb the ranks together.'}
                                </p>

                                <button 
                                    className="btn btn-primary" 
                                    style={{ width: '100%', height: '40px' }} 
                                    onClick={() => joinCommunity(c.id)}
                                >
                                    JOIN HUB <ExternalLink size={14} style={{ marginLeft: '8px' }} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {filteredCommunities.length === 0 && (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <div style={{ fontSize: '48px', opacity: 0.2, marginBottom: '16px' }}>🛰️</div>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-secondary)' }}>NO SIGNALS DETECTED</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Try searching for a different frequency or tag.</p>
                </div>
            )}
        </div>
    );
};
