import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { AAGCommunity } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { Users, Plus, Shield, MessageSquare, ArrowLeft, Target, Trash2, Settings, ExternalLink, ArrowRight } from 'lucide-react';
import { ChatArea } from './ChatArea';

export const Squads: React.FC = () => {
    const { communities, loadCommunities, createCommunity, joinCommunity, leaveCommunity } = useGameStore();
    const { user } = useAuthStore();
    const { isRTL, t } = useTranslation();

    const [showCreate, setShowCreate] = useState(false);
    const [activeCommunity, setActiveCommunity] = useState<AAGCommunity | null>(null);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [gameCategory, setGameCategory] = useState('Global');

    useEffect(() => { loadCommunities(); }, [loadCommunities]);

    const handleCreate = async () => {
        if (!name.trim()) return;
        await createCommunity(name, desc, gameCategory);
        setShowCreate(false); setName(''); setDesc(''); setGameCategory('Global');
    };

    if (activeCommunity) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', direction: isRTL ? 'rtl' : 'ltr' }}>
                <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <button onClick={() => setActiveCommunity(null)} className="btn btn-ghost btn-icon" style={{ width: '36px', height: '36px' }}>
                        <ArrowLeft size={18} />
                    </button>
                    <div className="avatar" style={{ width: '40px', height: '40px', background: 'var(--gradient-bolt)' }}>
                        <span style={{ fontSize: '18px', fontWeight: 800 }}>{activeCommunity.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>{activeCommunity.name}</h2>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                           <span>{activeCommunity.memberCount || 1} {t('members')}</span>
                           <span>•</span>
                           <span style={{ color: 'var(--brand-electric)', fontWeight: 700 }}>#{activeCommunity.gameTag?.toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <ChatArea targetId={activeCommunity.id} type="community" onBack={() => setActiveCommunity(null)} />
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', direction: isRTL ? 'rtl' : 'ltr' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                <div style={{ 
                    width: '64px', height: '64px', background: 'var(--bg-elevated)', 
                    borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: 'var(--brand-electric)', border: '1px solid var(--border-subtle)' 
                }}>
                    <Shield size={32} />
                </div>
                <div>
                    <h2 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Space Grotesk' }}>{t('squads')}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Manage your clans and coordinate operations.</p>
                </div>
                <button 
                    className="btn btn-primary" 
                    style={{ marginLeft: isRTL ? '0' : 'auto', marginRight: isRTL ? 'auto' : '0', height: '44px' }}
                    onClick={() => setShowCreate(!showCreate)}
                >
                    <Plus size={18} /> FOUND CLAN
                </button>
            </div>

            {showCreate && (
                <div className="card" style={{ marginBottom: '40px', padding: '32px', border: '1.5px solid var(--brand-electric)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 800 }}>ESTABLISH NEW HUB</h3>
                        <button className="btn btn-ghost btn-icon" onClick={() => setShowCreate(false)}><ArrowLeft size={18} /></button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Clash Name</label>
                            <input className="input" placeholder="e.g. Apex Predators" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Operational Tag</label>
                            <select className="input" value={gameCategory} onChange={e => setGameCategory(e.target.value)}>
                                <option value="Global">Universal</option>
                                <option value="Valorant">Valorant</option>
                                <option value="LoL">League of Legends</option>
                                <option value="CS2">Counter-Strike</option>
                                <option value="Overwatch">Overwatch</option>
                                <option value="Fortnite">Fortnite</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Directives / Intro</label>
                        <textarea className="input" placeholder="What is this clan about?" value={desc} onChange={e => setDesc(e.target.value)} style={{ minHeight: '100px', padding: '12px', resize: 'none' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>CANCEL</button>
                        <button className="btn btn-primary" onClick={handleCreate} style={{ padding: '0 32px' }}>INITIALIZE HUB</button>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
                {(communities || []).length === 0 && (
                    <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 24px', background: 'var(--bg-input)' }}>
                        <div style={{ fontSize: '48px', opacity: 0.1, marginBottom: '24px' }}>🛡️</div>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-secondary)' }}>NO ACTIVE HUBS</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>You haven't joined or founded any clans yet.</p>
                        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create your first hub</button>
                    </div>
                )}

                {(communities || []).map(c => (
                    <div key={c.id} className="card interactive" style={{ padding: 0, overflow: 'hidden' }}>
                        {/* Card Banner */}
                        <div style={{ 
                            height: '80px', background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), var(--gradient-bolt)',
                            position: 'relative'
                        }}>
                             <div className="chip chip-gold" style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '10px' }}>
                                OWNER
                            </div>
                        </div>

                        <div style={{ padding: '0 24px 24px', marginTop: '-32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
                                <div className="avatar" style={{ width: '64px', height: '64px', borderRadius: '16px', border: '4px solid var(--bg-surface)', boxShadow: 'var(--shadow-md)' }}>
                                    <span style={{ fontSize: '28px', fontWeight: 800 }}>{c.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-ghost btn-icon" style={{ width: '36px', height: '36px' }}><Settings size={18} /></button>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>{c.name}</h3>
                            <div className="chip chip-info" style={{ marginBottom: '16px' }}>#{c.gameTag?.toUpperCase()}</div>

                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, height: '42px', overflow: 'hidden', marginBottom: '20px' }}>
                                {c.description || 'Welcome to our elite gaming circle. Coordinate comms and secure victory.'}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
                                    <Users size={16} /> {c.memberCount || 1} Operatives
                                </div>
                                <button className="btn btn-primary sm" onClick={() => setActiveCommunity(c)}>
                                    ENTER HUB <ArrowRight size={14} style={{ marginLeft: '6px' }} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
