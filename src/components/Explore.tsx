import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { AAGCommunity } from '../lib/api';
import { Search, Compass, Users, Globe, ExternalLink } from 'lucide-react';
import { useTranslation } from '../i18n';

export const Explore: React.FC = () => {
    const { communities, loadCommunities, joinCommunity } = useGameStore();
    const { t } = useTranslation();

    useEffect(() => {
        loadCommunities();
    }, [loadCommunities]);

    return (
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                    className="input" 
                    placeholder="SEARCH_NETWORK_REGISTRY..." 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '52px', height: '56px', fontSize: '14px', background: 'var(--bg-input)', borderRadius: '0', letterSpacing: '1px' }} 
                />
            </div>

            {/* Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>VERIFIED_NODES</h3>
                        <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 800, cursor: 'pointer', letterSpacing: '1px' }}>VIEW_ALL_PROTOCOLS →</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {filteredCommunities.map(c => (
                            <div key={c.id} className="card interactive" style={{ padding: '24px', display: 'flex', flexDirection: 'column', minHeight: '260px', borderRadius: '0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                    <div className="avatar" style={{ width: '56px', height: '56px', borderRadius: '0px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                                        <span style={{ fontSize: '24px', fontWeight: 800 }}>{c.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div className="chip" style={{ gap: '6px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '10px' }}>
                                        <Users size={12} /> {c.memberCount || 0}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.5px' }}>{c.name.toUpperCase()}</h4>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-primary)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: '0px', border: '1px solid var(--border-subtle)' }}>
                                            #{c.gameTag?.toUpperCase() || 'GLOBAL'}
                                        </span>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
                                            <Globe size={10} /> PUBLIC_CHANNEL
                                        </span>
                                    </div>
                                </div>

                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1, marginBottom: '24px' }}>
                                    {c.description || 'Secure communication node for elite synchronization and operational coordination.'}
                                </p>

                                <button 
                                    className="btn btn-primary" 
                                    style={{ width: '100%', height: '40px', borderRadius: '0', background: 'var(--text-primary)', color: 'var(--bg-deep)' }} 
                                    onClick={() => joinCommunity(c.id)}
                                >
                                    INITIALIZE HUB <ExternalLink size={14} style={{ marginLeft: '8px' }} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {filteredCommunities.length === 0 && (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <div style={{ fontSize: '48px', opacity: 0.1, marginBottom: '16px' }}>🛰️</div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '1px' }}>NO SIGNALS DETECTED</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>RESCANNING FREQUENCIES... TRY DIFFERENT PARAMETERS.</p>
                </div>
            )}
        </div>
    );
};
