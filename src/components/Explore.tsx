import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Search, Compass, Users, Globe, ExternalLink } from 'lucide-react';
import { useTranslation } from '../i18n';

export const Explore: React.FC = () => {
    const { communities, loadCommunities, joinCommunity } = useGameStore();
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCommunities();
    }, [loadCommunities]);

    const filteredCommunities = (communities || []).filter(c => 
        (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (c.gameTag || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'JetBrains Mono, monospace' }}>
            
            {/* Sector Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '48px' }}>
                <div style={{ 
                    width: '64px', height: '64px', background: 'var(--bg-elevated)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' 
                }}>
                    <Compass size={32} />
                </div>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '4px', textTransform: 'uppercase' }}>SECTOR_DISCOVERY</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px', letterSpacing: '1px' }}>Scanning neural registry for active tactical nodes.</p>
                </div>
            </div>

            {/* Registry Query */}
            <div style={{ position: 'relative', marginBottom: '48px' }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                    className="input" 
                    placeholder="SEARCH_NETWORK_REGISTRY..." 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '52px', height: '56px', fontSize: '14px', background: 'var(--bg-input)', borderRadius: '0', letterSpacing: '1px' }} 
                />
            </div>

            {/* Grid Map */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {filteredCommunities.map(c => (
                    <div key={c.id} className="card" style={{ padding: '24px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', minHeight: '280px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div style={{ width: '56px', height: '56px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '20px', fontWeight: 900 }}>{c.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, padding: '4px 8px', border: '1px solid var(--border-subtle)', letterSpacing: '1px' }}>
                                OPS_{c.memberCount || 0}
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '1px', marginBottom: '8px' }}>{c.name.toUpperCase()}</h3>
                            <div style={{ fontSize: '10px', color: 'var(--text-primary)', marginBottom: '16px', background: 'var(--bg-elevated)', display: 'inline-block', padding: '2px 8px', border: '1px solid var(--border-subtle)' }}>
                                #{c.gameTag?.toUpperCase() || 'GLOBAL'}
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                {c.description || 'Secure communication node for elite synchronization and operational coordination.'}
                            </p>
                        </div>

                        <button 
                            className="btn" 
                            style={{ width: '100%', height: '40px', marginTop: '24px', background: 'var(--text-primary)', color: 'var(--bg-deep)', fontWeight: 900, fontSize: '11px', letterSpacing: '2px' }} 
                            onClick={() => joinCommunity(c.id)}
                        >
                            INIT_INTEGRATION <ExternalLink size={14} style={{ marginLeft: '8px' }} />
                        </button>
                    </div>
                ))}
            </div>

            {filteredCommunities.length === 0 && (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '2px' }}>NO_SIGNALS_DETECTED</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '12px' }}>RESCANNING FREQUENCIES... TRY DIFFERENT PARAMETERS.</p>
                </div>
            )}
        </div>
    );
};
