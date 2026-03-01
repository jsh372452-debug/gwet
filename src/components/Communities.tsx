import React, { useState, useEffect } from 'react';
import { useGameStore, Community } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { Users, Plus, Shield, Sword, Target, Settings, Share2, MessageSquare, ArrowLeft } from 'lucide-react';
import { CommunityAdmin } from './CommunityAdmin';
import { ChatArea } from './ChatArea';

export const Communities: React.FC = () => {
    const { communities, groups, createCommunity, createGroup, loadCommunities, loadGroups } = useGameStore();
    const { user } = useAuthStore();
    const { t, isRTL } = useTranslation();

    const [showCreate, setShowCreate] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [adminTarget, setAdminTarget] = useState<Community | null>(null);
    const [activeSquad, setActiveSquad] = useState<Community | null>(null);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [groupName, setGroupName] = useState('');
    const [groupDesc, setGroupDesc] = useState('');

    useEffect(() => { loadCommunities(); loadGroups(); }, [loadCommunities, loadGroups]);

    const handleCreate = async () => {
        if (!name.trim()) return;
        await createCommunity(name, desc);
        setShowCreate(false); setName(''); setDesc('');
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) return;
        await createGroup(groupName, groupDesc, null, 'standalone');
        setShowCreateGroup(false); setGroupName(''); setGroupDesc('');
    };

    const copyInvite = (id: string) => {
        navigator.clipboard.writeText(`gwet://squad/invite/${id}`);
    };

    // Squad Detail View
    if (activeSquad) {
        const squadGroups = groups.filter(g => g.community_id === activeSquad.id);
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 8rem)', direction: isRTL ? 'rtl' : 'ltr' }}>
                <div className="card compact" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                    <button onClick={() => setActiveSquad(null)} className="btn ghost icon-only"><ArrowLeft size={18} /></button>
                    <div className="avatar" style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: activeSquad.theme_color || 'var(--primary-soft)' }}>
                        <Sword size={18} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: 'var(--font-md)', fontWeight: 800, margin: 0 }}>{activeSquad.name}</h2>
                        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{activeSquad.member_count || 1} {t('members')}</span>
                    </div>
                    <div className="btn-group">
                        {activeSquad.owner_id === user?.id && (
                            <button className="btn icon-only" onClick={() => setAdminTarget(activeSquad)}><Settings size={14} /></button>
                        )}
                        <button className="btn icon-only" onClick={() => copyInvite(activeSquad.id)}><Share2 size={14} /></button>
                    </div>
                </div>

                {squadGroups.length > 0 && (
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
                        {squadGroups.map(g => (
                            <span key={g.id} className="badge accent"><Target size={10} /> {g.name}</span>
                        ))}
                    </div>
                )}

                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <ChatArea targetId={activeSquad.id} type="community" />
                </div>

                {adminTarget && <CommunityAdmin community={adminTarget} onClose={() => setAdminTarget(null)} />}
            </div>
        );
    }

    return (
        <div className="page-container wide" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            {adminTarget && <CommunityAdmin community={adminTarget} onClose={() => setAdminTarget(null)} />}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="section-header">
                    <div className="icon-wrap"><Shield size={22} /></div>
                    <div>
                        <h2>{t('squads')}</h2>
                        <p className="subtitle">COORDINATE YOUR TEAM</p>
                    </div>
                </div>
                <div className="btn-group">
                    <button className="btn" onClick={() => setShowCreateGroup(!showCreateGroup)}>
                        <Target size={16} /> {t('create_group')}
                    </button>
                    <button className="btn primary" onClick={() => setShowCreate(!showCreate)}>
                        <Plus size={16} /> FOUND SQUAD
                    </button>
                </div>
            </div>

            {/* Create Squad Form */}
            {showCreate && (
                <div className="card" style={{ borderLeft: '3px solid var(--primary)' }}>
                    <h3 style={{ marginBottom: 'var(--space-xl)', fontWeight: 800 }}>New Squad</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                        <div>
                            <label className="label">SQUAD NAME</label>
                            <input className="input" placeholder="e.g. Apex Predators" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div>
                            <label className="label">DESCRIPTION</label>
                            <textarea className="input" placeholder="What are your goals?" value={desc} onChange={e => setDesc(e.target.value)} />
                        </div>
                        <button className="btn primary" style={{ alignSelf: 'flex-end' }} onClick={handleCreate}>CREATE SQUAD</button>
                    </div>
                </div>
            )}

            {/* Create Group Form */}
            {showCreateGroup && (
                <div className="card" style={{ borderLeft: '3px solid var(--accent)' }}>
                    <h3 style={{ marginBottom: 'var(--space-xl)', fontWeight: 800 }}>{t('create_group')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                        <div>
                            <label className="label">{t('group_name')}</label>
                            <input className="input" placeholder="e.g. Quick Strike" value={groupName} onChange={e => setGroupName(e.target.value)} />
                        </div>
                        <div>
                            <label className="label">{t('group_desc')}</label>
                            <textarea className="input" placeholder="Group purpose..." value={groupDesc} onChange={e => setGroupDesc(e.target.value)} />
                        </div>
                        <button className="btn primary" style={{ alignSelf: 'flex-end' }} onClick={handleCreateGroup}>CREATE GROUP</button>
                    </div>
                </div>
            )}

            {/* Standalone Groups */}
            {groups.filter(g => g.type === 'standalone').length > 0 && (
                <div>
                    <h3 style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 'var(--space-lg)', letterSpacing: '1px' }}>
                        GROUPS
                    </h3>
                    <div className="grid grid-3">
                        {groups.filter(g => g.type === 'standalone').map(g => (
                            <div key={g.id} className="card interactive compact" style={{ borderLeft: '3px solid var(--accent)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                                    <Target size={16} color="var(--accent)" />
                                    <h4 style={{ fontWeight: 700, flex: 1 }}>{g.name}</h4>
                                </div>
                                {g.description && <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', lineHeight: 1.4 }}>{g.description}</p>}
                                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Users size={12} /> {g.member_count || 1} members
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Squads Grid */}
            <div className="grid grid-2" style={{ paddingBottom: 'var(--space-3xl)' }}>
                {communities.length === 0 && (
                    <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                        <Shield size={40} className="icon" />
                        <h3>No squads yet</h3>
                        <p>Found your first squad to get started!</p>
                    </div>
                )}

                {communities.map(c => {
                    const isOwner = c.owner_id === user?.id;
                    return (
                        <div key={c.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            {/* Banner */}
                            <div style={{
                                height: '80px', background: c.theme_color || 'var(--bg-elevated)',
                                backgroundImage: c.banner_base64 ? `url(${c.banner_base64})` : 'none',
                                backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative'
                            }}>
                                <div style={{
                                    position: 'absolute', bottom: '-16px', [isRTL ? 'right' : 'left']: '16px',
                                    width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--bg-base)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '2px solid var(--border)'
                                }}>
                                    <Sword size={24} color={c.theme_color || 'white'} />
                                </div>
                                {isOwner && (
                                    <button onClick={() => setAdminTarget(c)} className="btn ghost icon-only"
                                        style={{ position: 'absolute', top: 8, [isRTL ? 'left' : 'right']: 8, background: 'rgba(0,0,0,0.4)' }}>
                                        <Settings size={14} />
                                    </button>
                                )}
                            </div>

                            <div style={{ padding: 'var(--space-2xl) var(--space-xl) var(--space-xl)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                                    <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800 }}>{c.name}</h3>
                                    <button onClick={() => copyInvite(c.id)} className="btn ghost icon-only"><Share2 size={14} /></button>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', lineHeight: 1.6, height: '2.6rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                                    {c.description || 'No description'}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-xl)' }}>
                                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Users size={14} /> {c.member_count || 1} {t('members')}
                                    </span>
                                    <button className="btn" onClick={() => setActiveSquad(c)}>
                                        <MessageSquare size={14} /> ENTER
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
