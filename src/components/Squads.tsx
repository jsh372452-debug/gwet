import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { AAGCommunity } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { Users, Plus, Shield, MessageSquare, ArrowLeft, Target } from 'lucide-react';
import { ChatArea } from './ChatArea';

export const Squads: React.FC = () => {
    const { communities, loadCommunities, createCommunity, joinCommunity, leaveCommunity } = useGameStore();
    const { user } = useAuthStore();
    const { isRTL } = useTranslation();

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

    // Detail View
    if (activeCommunity) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 8rem)', direction: isRTL ? 'rtl' : 'ltr' }}>
                <div className="glass-card compact" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1rem', borderBottom: `2px solid var(--primary)` }}>
                    <button onClick={() => setActiveCommunity(null)} className="btn ghost sm"><ArrowLeft size={18} /></button>
                    <div className="avatar-premium" style={{ width: 36, height: 36, background: 'var(--primary-glow)' }}>
                        <Target size={18} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0 }}>{(activeCommunity.name || 'COMMUNITY').toUpperCase()}</h2>
                        <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700 }}>{activeCommunity.memberCount || 1} MEMBERS · {(activeCommunity.gameTag || 'GLOBAL').toUpperCase()}</span>
                    </div>
                </div>

                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <ChatArea targetId={activeCommunity.id} type="community" />
                </div>
            </div>
        );
    }

    return (
        <div className="page-container" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '2.5rem' }}>
                <div style={{ padding: '12px', background: 'var(--primary-glow)', borderRadius: '12px', color: 'var(--primary)' }}><Shield size={32} /></div>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>{isRTL ? 'المجتمعات' : 'COMMUNITIES'}</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 700 }}>COORDINATE AND CONQUER</p>
                </div>
                <div style={{ marginLeft: isRTL ? '0' : 'auto', marginRight: isRTL ? 'auto' : '0', display: 'flex', gap: '10px' }}>
                    <button className="btn primary" onClick={() => setShowCreate(!showCreate)}>
                        <Plus size={16} /> FOUND COMMUNITY
                    </button>
                </div>
            </div>

            {showCreate && (
                <div className="glass-card" style={{ marginBottom: '2.5rem', borderLeft: '4px solid var(--primary)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 900 }}>CREATE NEW COMMUNITY</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                        <div>
                            <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>COMMUNITY NAME</label>
                            <input className="gaming-input" placeholder="e.g. Apex Predators" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>GAME TARGET</label>
                            <select className="gaming-input" value={gameCategory} onChange={e => setGameCategory(e.target.value)}>
                                <option value="Global">Universal</option>
                                <option value="Valorant">Valorant</option>
                                <option value="League of Legends">League of Legends</option>
                                <option value="Counter-Strike">Counter-Strike</option>
                                <option value="Overwatch">Overwatch</option>
                                <option value="Fortnite">Fortnite</option>
                                <option value="Call of Duty">Call of Duty</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>DESCRIPTION</label>
                        <textarea className="gaming-input" placeholder="Rules of engagement..." value={desc} onChange={e => setDesc(e.target.value)} style={{ minHeight: '80px' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button className="btn primary" onClick={handleCreate} style={{ padding: '0.75rem 2.5rem' }}>INITIALIZE COMMUNITY</button>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem', paddingBottom: '4rem' }}>
                {(communities || []).length === 0 && (
                    <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
                        <Shield size={48} color="var(--text-dim)" style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <h3 style={{ opacity: 0.5 }}>NO ACTIVE COMMUNITIES FOUND</h3>
                    </div>
                )}

                {communities.map(c => {
                    return (
                        <div key={c.id} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{
                                height: '90px', background: 'linear-gradient(135deg, #001a33, #000)',
                                position: 'relative'
                            }}>
                                <div style={{
                                    position: 'absolute', bottom: '-22px', left: isRTL ? 'auto' : '20px', right: isRTL ? '20px' : 'auto',
                                    width: '60px', height: '60px', background: 'var(--bg-dark)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: '14px', border: `3px solid var(--bg-dark)`,
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                                    zIndex: 2
                                }}>
                                    <div style={{ width: '100%', height: '100%', borderRadius: '12px', background: 'var(--bg-card)', border: `1px solid var(--primary)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Target size={26} color={'var(--primary)'} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '2.5rem 1.5rem 1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>{(c.name || 'COMMUNITY').toUpperCase()}</h3>
                                    <div style={{ fontSize: '10px', background: 'rgba(0, 209, 255, 0.1)', color: 'var(--primary)', padding: '2px 10px', fontWeight: 900, borderRadius: '20px', border: '1px solid rgba(0, 209, 255, 0.2)' }}>{(c.gameTag || 'GLOBAL').toUpperCase()}</div>
                                </div>
                                <p style={{ color: 'var(--text-dim)', fontSize: '13px', lineHeight: 1.6, height: '40px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                                    {c.description || 'No operational directive defined.'}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--glass-border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Users size={16} /> {c.memberCount || 1}
                                        </div>
                                    </div>
                                    <button className="btn primary sm" onClick={() => setActiveCommunity(c)}>ACCESS COMM</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
