import React, { useState, useEffect } from 'react';
import { useGameStore, Squad } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { Users, Plus, Shield, Sword, Target, Settings, Share2, MessageSquare, ArrowLeft, Bot, Mic } from 'lucide-react';
import { SquadAdmin } from './SquadAdmin';
import { ChatArea } from './ChatArea';
import { SquadAiAssistant } from './SquadAiAssistant';
import { VoiceRoom } from './VoiceRoom';

export const Squads: React.FC = () => {
    const { squads, groups, createSquad, createGroup, loadSquads, loadGroups, joinSquad } = useGameStore();
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
        await createGroup(groupName, groupName, activeSquad?.id || null, 'standalone');
        setShowCreateGroup(false); setGroupName(''); setGroupDesc('');
    };

    const copyInvite = (id: string) => {
        navigator.clipboard.writeText(`gwet://squad/invite/${id}`);
    };

    // Squad Detail View
    if (activeSquad) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 8rem)', direction: isRTL ? 'rtl' : 'ltr' }}>
                <div className="glass-card compact" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1rem', borderBottom: `2px solid ${activeSquad.theme_color || 'var(--primary)'}` }}>
                    <button onClick={() => setActiveSquad(null)} className="btn ghost sm"><ArrowLeft size={18} /></button>
                    <div className="avatar-premium" style={{ width: 36, height: 36, background: activeSquad.theme_color || 'var(--primary-glow)' }}>
                        <Sword size={18} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0 }}>{activeSquad.name.toUpperCase()}</h2>
                        <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700 }}>{activeSquad.member_count || 1} {t('members').toUpperCase()} · {activeSquad.game_category?.toUpperCase() || 'GLOBAL'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className={`btn sm ${view === 'chat' ? 'primary' : 'ghost'}`} onClick={() => setView('chat')}><MessageSquare size={14} /></button>
                        <button className={`btn sm ${view === 'ai' ? 'primary' : 'ghost'}`} onClick={() => setView('ai')}><Bot size={14} /></button>
                        <button className={`btn sm ${isVoiceActive ? 'primary' : 'ghost'}`} onClick={() => setIsVoiceActive(!isVoiceActive)}>
                            <Mic size={14} />
                        </button>
                        {activeSquad.owner_id === user?.id && (
                            <button className="btn sm ghost" onClick={() => setAdminTarget(activeSquad)}><Settings size={14} /></button>
                        )}
                    </div>
                </div>

                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {isVoiceActive && (
                        <div style={{ height: '60px', marginBottom: '1rem' }}>
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
        <div className="page-container" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            {adminTarget && <SquadAdmin squad={adminTarget} onClose={() => setAdminTarget(null)} />}

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '2.5rem' }}>
                <div style={{ padding: '12px', background: 'var(--primary-glow)', borderRadius: '12px', color: 'var(--primary)' }}><Shield size={32} /></div>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>{isRTL ? 'فرق العمليات' : 'TACTICAL SQUADS'}</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 700 }}>COORDINATE AND CONQUER</p>
                </div>
                <div style={{ marginLeft: isRTL ? '0' : 'auto', marginRight: isRTL ? 'auto' : '0', display: 'flex', gap: '10px' }}>
                    <button className="btn ghost" onClick={() => setShowCreateGroup(!showCreateGroup)}>
                        <Target size={16} /> {t('create_group')?.toUpperCase() || 'CREATE HUB'}
                    </button>
                    <button className="btn primary" onClick={() => setShowCreate(!showCreate)}>
                        <Plus size={16} /> FOUND SQUAD
                    </button>
                </div>
            </div>

            {showCreate && (
                <div className="glass-card" style={{ marginBottom: '2.5rem', borderLeft: '4px solid var(--primary)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 900 }}>FOUND NEW ELITE SQUAD</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                        <div>
                            <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>SQUAD NAME</label>
                            <input className="gaming-input" placeholder="e.g. Apex Predators" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>GAME CATEGORY</label>
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
                        <button className="btn primary" onClick={handleCreate} style={{ padding: '0.75rem 2.5rem' }}>INITIALIZE SQUAD</button>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem', paddingBottom: '4rem' }}>
                {squads.length === 0 && (
                    <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
                        <Shield size={48} color="var(--text-dim)" style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <h3 style={{ opacity: 0.5 }}>NO ACTIVE SQUADS FOUND</h3>
                    </div>
                )}

                {squads.map(s => {
                    const isOwner = s.owner_id === user?.id;
                    const isMember = s.is_member || isOwner;
                    return (
                        <div key={s.id} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{
                                height: '110px', background: s.theme_color || 'linear-gradient(135deg, #001a33, #000)',
                                backgroundImage: s.banner_base64 ? `url(${s.banner_base64})` : 'none',
                                backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative'
                            }}>
                                <div style={{
                                    position: 'absolute', bottom: '-22px', left: isRTL ? 'auto' : '20px', right: isRTL ? '20px' : 'auto',
                                    width: '60px', height: '60px', background: 'var(--bg-dark)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: '14px', border: `3px solid var(--bg-dark)`,
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                                    zIndex: 2
                                }}>
                                    <div style={{ width: '100%', height: '100%', borderRadius: '12px', background: 'var(--bg-card)', border: `1px solid ${s.theme_color || 'var(--primary)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Sword size={26} color={s.theme_color || 'var(--primary)'} />
                                    </div>
                                </div>
                                {isOwner && (
                                    <button onClick={() => setAdminTarget(s)} className="btn ghost sm"
                                        style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', borderRadius: '6px' }}>
                                        <Settings size={14} />
                                    </button>
                                )}
                            </div>

                            <div style={{ padding: '2.5rem 1.5rem 1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>{s.name.toUpperCase()}</h3>
                                    <div style={{ fontSize: '10px', background: 'rgba(0, 209, 255, 0.1)', color: 'var(--primary)', padding: '2px 10px', fontWeight: 900, borderRadius: '20px', border: '1px solid rgba(0, 209, 255, 0.2)' }}>{s.game_category?.toUpperCase() || 'GLOBAL'}</div>
                                </div>
                                <p style={{ color: 'var(--text-dim)', fontSize: '13px', lineHeight: 1.6, height: '40px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                                    {s.description || 'No operational directive defined.'}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--glass-border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Users size={16} /> {s.member_count || 1}
                                        </div>
                                        <button onClick={() => copyInvite(s.id)} className="btn ghost sm" style={{ padding: '6px' }}><Share2 size={12} /></button>
                                    </div>
                                    {isMember ? (
                                        <button className="btn primary sm" onClick={() => setActiveSquad(s)}>ACCESS HUB</button>
                                    ) : (
                                        <button className="btn primary sm" onClick={() => joinSquad(s.id)}>JOIN SQUAD</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
