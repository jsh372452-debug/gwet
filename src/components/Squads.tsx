import React, { useState, useEffect } from 'react';
import { useGameStore, Squad } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { Users, Plus, Shield, Sword, Target, Settings, Share2, MessageSquare, ArrowLeft, Bot, Gamepad2, Zap } from 'lucide-react';
import { SquadAdmin } from './SquadAdmin';
import { ChatArea } from './ChatArea';
import { SquadAiAssistant } from './SquadAiAssistant';
import { VoiceRoom } from './VoiceRoom';
import { Mic } from 'lucide-react';

export const Squads: React.FC = () => {
    const { squads, groups, createSquad, createGroup, loadSquads, loadGroups } = useGameStore();
    const { user } = useAuthStore();
    const { t, isRTL } = useTranslation();

    const [showCreate, setShowCreate] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [adminTarget, setAdminTarget] = useState<Squad | null>(null);
    const [activeSquad, setActiveSquad] = useState<Squad | null>(null);
    const [view, setView] = useState<'chat' | 'ai'>('chat');
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [gameCategory, setGameCategory] = useState('Global');
    const [groupName, setGroupName] = useState('');
    const [groupDesc, setGroupDesc] = useState('');

    useEffect(() => { loadSquads(); loadGroups(); }, [loadSquads, loadGroups]);

    const handleCreate = async () => {
        if (!name.trim()) return;
        await createSquad(name, desc);
        setShowCreate(false); setName(''); setDesc(''); setGameCategory('Global');
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) return;
        await createGroup(groupName, groupDesc, activeSquad?.id || null, 'standalone');
        setShowCreateGroup(false); setGroupName(''); setGroupDesc('');
    };

    const copyInvite = (id: string) => {
        navigator.clipboard.writeText(`gwet://squad/invite/${id}`);
    };

    // Squad Detail View
    if (activeSquad) {
        const squadGroups = groups.filter(g => g.squad_id === activeSquad.id);
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 8rem)', direction: isRTL ? 'rtl' : 'ltr' }}>
                <div className="glass-card sharp compact" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)', borderBottom: `2px solid ${activeSquad.theme_color || 'var(--primary)'}` }}>
                    <button onClick={() => setActiveSquad(null)} className="btn ghost icon-only"><ArrowLeft size={18} /></button>
                    <div className="avatar-premium" style={{ width: 36, height: 36, fontSize: '1rem', background: activeSquad.theme_color || 'var(--primary-glow)' }}>
                        <Sword size={18} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, letterSpacing: '0.5px' }}>{activeSquad.name.toUpperCase()}</h2>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>{activeSquad.member_count || 1} {t('members').toUpperCase()} · {activeSquad.game_category?.toUpperCase() || 'GLOBAL'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className={`btn sharp sm ${view === 'chat' ? 'primary' : 'ghost'}`} onClick={() => setView('chat')}><MessageSquare size={14} /></button>
                        <button className={`btn sharp sm ${view === 'ai' ? 'primary' : 'ghost'}`} onClick={() => setView('ai')}><Bot size={14} /></button>
                        <button className={`btn sharp sm ${isVoiceActive ? 'accent' : 'ghost'}`} onClick={() => setIsVoiceActive(!isVoiceActive)}>
                            <Mic size={14} />
                        </button>
                        {activeSquad.owner_id === user?.id && (
                            <button className="btn sharp sm ghost" onClick={() => setAdminTarget(activeSquad)}><Settings size={14} /></button>
                        )}
                    </div>
                </div>

                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {isVoiceActive && (
                        <div style={{ height: '60px', marginBottom: 'var(--space-sm)' }}>
                            <VoiceRoom squadId={activeSquad.id} onDisconnect={() => setIsVoiceActive(false)} mini={true} />
                        </div>
                    )}
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        {view === 'chat' && <ChatArea targetId={activeSquad.id} type="squad" />}
                        {view === 'ai' && <SquadAiAssistant squadId={activeSquad.id} />}
                    </div>
                </div>

                {adminTarget && <SquadAdmin squad={adminTarget} onClose={() => setAdminTarget(null)} />}
            </div>
        );
    }

    return (
        <div className="page-container wide" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            {adminTarget && <SquadAdmin squad={adminTarget} onClose={() => setAdminTarget(null)} />}

            <div className="section-header">
                <div className="icon-wrap" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}><Shield size={22} /></div>
                <div>
                    <h2 style={{ textTransform: 'uppercase', letterSpacing: '2px' }}>{isRTL ? 'فرق العمليات' : 'TACTICAL SQUADS'}</h2>
                    <p className="subtitle">COORDINATE AND CONQUER</p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                    <button className="btn sharp ghost" onClick={() => setShowCreateGroup(!showCreateGroup)}>
                        <Target size={16} /> {t('create_group').toUpperCase()}
                    </button>
                    <button className="btn sharp primary" onClick={() => setShowCreate(!showCreate)}>
                        <Plus size={16} /> FOUND SQUAD
                    </button>
                </div>
            </div>

            {showCreate && (
                <div className="glass-card sharp neon-border" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 900, letterSpacing: '1px' }}>FOUND NEW ELITE SQUAD</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div>
                            <label className="label">SQUAD NAME</label>
                            <input className="gaming-input" placeholder="e.g. Apex Predators" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div>
                            <label className="label">GAME CATEGORY</label>
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
                        <label className="label">DESCRIPTION</label>
                        <textarea className="gaming-input" placeholder="Rules of engagement..." value={desc} onChange={e => setDesc(e.target.value)} style={{ minHeight: '80px' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button className="btn sharp primary" onClick={handleCreate} style={{ padding: '0.75rem 2rem', fontWeight: 900 }}>INITIALIZE SQUAD</button>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem', paddingBottom: '4rem' }}>
                {squads.length === 0 && (
                    <div className="glass-card sharp" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
                        <Shield size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <h3 style={{ opacity: 0.5 }}>NO ACTIVE SQUADS FOUND</h3>
                    </div>
                )}

                {squads.map(s => {
                    const isOwner = s.owner_id === user?.id;
                    return (
                        <div key={s.id} className="glass-card sharp" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                            <div style={{
                                height: '100px', background: s.theme_color || 'linear-gradient(135deg, #1e1e2e, #11111b)',
                                backgroundImage: s.banner_base64 ? `url(${s.banner_base64})` : 'none',
                                backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative'
                            }}>
                                <div style={{
                                    position: 'absolute', bottom: '-20px', left: isRTL ? 'auto' : '20px', right: isRTL ? '20px' : 'auto',
                                    width: '56px', height: '56px', background: 'var(--bg-dark)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: `2px solid ${s.theme_color || 'var(--primary)'}`
                                }}>
                                    <Sword size={28} color={s.theme_color || 'var(--primary)'} />
                                </div>
                                {isOwner && (
                                    <button onClick={() => setAdminTarget(s)} className="btn ghost sharp icon-only sm"
                                        style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)' }}>
                                        <Settings size={14} />
                                    </button>
                                )}
                            </div>

                            <div style={{ padding: '2rem 1.5rem 1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>{s.name.toUpperCase()}</h3>
                                    <div style={{ fontSize: '10px', background: 'var(--primary-soft)', color: 'var(--primary)', padding: '2px 8px', fontWeight: 900 }}>{s.game_category?.toUpperCase() || 'GLOBAL'}</div>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, height: '40px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                                    {s.description || 'No operational directive defined.'}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Users size={14} /> {s.member_count || 1}
                                        </div>
                                        <button onClick={() => copyInvite(s.id)} className="btn ghost sharp icon-only sm"><Share2 size={12} /></button>
                                    </div>
                                    <button className="btn primary sharp" onClick={() => setActiveSquad(s)} style={{ fontWeight: 900, height: '36px', padding: '0 20px' }}>
                                        ACCESS HUB
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
