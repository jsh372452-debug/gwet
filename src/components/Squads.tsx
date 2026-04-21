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
                <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                    <button onClick={() => setActiveCommunity(null)} className="btn btn-ghost btn-icon" style={{ width: '36px', height: '36px', borderRadius: '0' }}>
                        <ArrowLeft size={18} />
                    </button>
                    <div className="avatar" style={{ width: '40px', height: '40px', background: 'var(--bg-elevated)', borderRadius: '0', border: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: '18px', fontWeight: 800 }}>{activeCommunity.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '14px', fontWeight: 800, margin: 0, letterSpacing: '0.5px' }}>{activeCommunity.name.toUpperCase()}</h2>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                           <span>{activeCommunity.memberCount || 1} OPERATIVES</span>
                           <span>•</span>
                           <span style={{ color: 'var(--text-primary)' }}>#{activeCommunity.gameTag?.toUpperCase()}</span>
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
                    borderRadius: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' 
                }}>
                    <Shield size={32} />
                </div>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Space Grotesk', letterSpacing: '-0.5px' }}>{t('squads').toUpperCase()}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Manage secure hubs and coordinate tactical units.</p>
                </div>
                <button 
                    className="btn btn-primary" 
                    style={{ marginLeft: isRTL ? '0' : 'auto', marginRight: isRTL ? 'auto' : '0', height: '44px', borderRadius: '0', background: 'var(--text-primary)', color: 'var(--bg-deep)' }}
                    onClick={() => setShowCreate(!showCreate)}
                >
                    <Plus size={18} /> ESTABLISH_OPERATIONAL_HUB
                </button>
            </div>

            {showCreate && (
                <div className="card" style={{ marginBottom: '40px', padding: '32px', borderRadius: '0', border: '1px solid var(--text-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '1px' }}>HUB_INITIATION_PROTOCOL</h3>
                        <button className="btn btn-ghost btn-icon" style={{ borderRadius: '0' }} onClick={() => setShowCreate(false)}><ArrowLeft size={18} /></button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>HUB_DESIGNATION</label>
                            <input className="input" placeholder="e.g. ALPHA_SQUAD" value={name} onChange={e => setName(e.target.value)} style={{ borderRadius: '0' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>OPERATIONAL_DOMAIN</label>
                            <select className="input" value={gameCategory} onChange={e => setGameCategory(e.target.value)} style={{ borderRadius: '0', fontSize: '12px', fontWeight: 700 }}>
                                <option value="Global">UNIVERSAL</option>
                                <option value="Valorant">VALORANT</option>
                                <option value="LoL">LEAGUE_OF_LEGENDS</option>
                                <option value="CS2">COUNTER_STRIKE</option>
                                <option value="Overwatch">OVERWATCH</option>
                                <option value="Fortnite">FORTNITE</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>CORE_DIRECTIVES</label>
                        <textarea className="input" placeholder="Enter hub operational goal..." value={desc} onChange={e => setDesc(e.target.value)} style={{ minHeight: '100px', padding: '12px', resize: 'none', borderRadius: '0' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button className="btn btn-ghost" style={{ borderRadius: '0' }} onClick={() => setShowCreate(false)}>ABORT</button>
                        <button className="btn btn-primary" onClick={handleCreate} style={{ padding: '0 32px', borderRadius: '0', background: 'var(--text-primary)', color: 'var(--bg-deep)' }}>CONFIRM_ESTABLISHMENT</button>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
                {(communities || []).length === 0 && (
                    <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 24px', background: 'var(--bg-input)', borderRadius: '0' }}>
                        <div style={{ fontSize: '48px', opacity: 0.05, marginBottom: '24px' }}>🛡️</div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '1px' }}>NO_ACTIVE_HUBS_DETECTED</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '12px' }}>RESCANNING_NETWORK... JOIN OR FOUND A HUB TO PROCEED.</p>
                        <button className="btn btn-primary" onClick={() => setShowCreate(true)} style={{ borderRadius: '0', background: 'var(--text-primary)', color: 'var(--bg-deep)' }}>FOUND_FIRST_HUB</button>
                    </div>
                )}

                {(communities || []).map(c => (
                    <div key={c.id} className="card interactive" style={{ padding: 0, overflow: 'hidden', borderRadius: '0' }}>
                        {/* Card Banner */}
                        <div style={{ 
                            height: '60px', background: 'var(--bg-elevated)',
                            borderBottom: '1px solid var(--border-subtle)',
                            position: 'relative'
                        }}>
                             <div className="chip" style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '10px', background: 'var(--text-primary)', color: 'var(--bg-deep)', borderRadius: '0' }}>
                                OWNER
                            </div>
                        </div>

                        <div style={{ padding: '0 24px 24px', marginTop: '-24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
                                <div className="avatar" style={{ width: '64px', height: '64px', borderRadius: '0px', border: '1px solid var(--border-strong)', background: 'var(--bg-surface)' }}>
                                    <span style={{ fontSize: '28px', fontWeight: 800 }}>{c.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-ghost btn-icon" style={{ width: '36px', height: '36px', borderRadius: '0' }}><Settings size={18} /></button>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.5px' }}>{c.name.toUpperCase()}</h3>
                            <div className="chip" style={{ marginBottom: '16px', fontSize: '9px', fontWeight: 800, background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>#{c.gameTag?.toUpperCase()}</div>

                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, height: '42px', overflow: 'hidden', marginBottom: '20px' }}>
                                {c.description || 'Secure communication node for elite operatives. Protocol established.'}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                                    <Users size={14} /> {c.memberCount || 1} OPERATIVES
                                </div>
                                <button className="btn btn-primary" style={{ height: '32px', padding: '0 16px', borderRadius: '0', background: 'var(--text-primary)', color: 'var(--bg-deep)', fontSize: '11px', fontWeight: 800 }} onClick={() => setActiveCommunity(c)}>
                                    ENTER_HUB <ArrowRight size={12} style={{ marginLeft: '6px' }} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
