import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGameStore, AAGCommunity } from '../store/gameStore';
import { Search, Compass, Users } from 'lucide-react';
import { useTranslation } from '../i18n';

export const Explore: React.FC = () => {
    const { communities, loadCommunities, joinCommunity } = useGameStore();
    const { t, isRTL } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCommunities();
    }, [loadCommunities]);

    const filteredCommunities = communities.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.gameTag?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="page-container" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '2.5rem' }}>
                <div style={{ padding: '12px', background: 'var(--primary-glow)', borderRadius: '12px', color: 'var(--primary)' }}>
                    <Compass size={32} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>{t('explore') || 'DISCOVERY'}</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 700 }}>FIND YOUR PLATOON</p>
                </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2.5rem', padding: '10px 15px' }}>
                <Search size={16} color="var(--primary)" />
                <input 
                    className="gaming-input" 
                    placeholder="SEARCH COMMUNITIES OR GAMES..." 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ border: 'none', background: 'none', padding: 0, margin: 0, height: 'auto', flex: 1 }} 
                />
            </div>

            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 900 }}>TOP COMMUNITIES</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {filteredCommunities.map(c => (
                    <div key={c.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 900, fontSize: '1.1rem' }}>{c.name.toUpperCase()}</h4>
                                <span style={{ fontSize: '10px', background: 'rgba(0, 209, 255, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 900 }}>
                                    {c.gameTag?.toUpperCase() || 'GLOBAL'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-dim)', fontWeight: 800 }}>
                                <Users size={14} /> {c.memberCount}
                            </div>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0, flex: 1 }}>
                            {c.description || 'No description provided.'}
                        </p>
                        <button className="btn primary sm" style={{ width: '100%', marginTop: 'auto' }} onClick={() => joinCommunity(c.id)}>
                            JOIN HUB
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
