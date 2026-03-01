import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { Users, Shield, ChevronRight, Zap, Target, Plus, X } from 'lucide-react';

interface Props {
    onSelect: (id: string, type: 'community' | 'group' | 'private') => void;
}

export const JoinedHub: React.FC<Props> = ({ onSelect }) => {
    const { communities, groups, createGroup, loadCommunities, loadGroups } = useGameStore();
    const { user } = useAuthStore();
    const { t, isRTL } = useTranslation();

    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupDesc, setGroupDesc] = useState('');

    useEffect(() => { loadCommunities(); loadGroups(); }, [loadCommunities, loadGroups]);

    const joinedComms = communities.filter(c => c.is_member);
    const joinedGroups = groups.filter(g => g.is_member);

    const handleCreateGroup = async () => {
        if (!groupName.trim()) return;
        await createGroup(groupName, groupDesc, null, 'standalone');
        setShowCreateGroup(false);
        setGroupName(''); setGroupDesc('');
    };

    return (
        <div className="page-container" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="section-header">
                    <div className="icon-wrap"><Zap size={22} /></div>
                    <div>
                        <h2>{t('joined')}</h2>
                        <p className="subtitle">YOUR NETWORK</p>
                    </div>
                </div>
                <button className="btn" onClick={() => setShowCreateGroup(true)}>
                    <Plus size={16} /> {t('create_group')}
                </button>
            </div>

            {/* Create Group */}
            {showCreateGroup && (
                <div className="card" style={{ border: '1px solid var(--border-active)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xl)' }}>
                        <h3 style={{ fontWeight: 800 }}>{t('create_group')}</h3>
                        <button className="btn ghost icon-only" onClick={() => setShowCreateGroup(false)}><X size={18} /></button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                        <input className="input" placeholder={t('group_name')} value={groupName} onChange={e => setGroupName(e.target.value)} />
                        <textarea className="input" placeholder={t('group_desc')} value={groupDesc} onChange={e => setGroupDesc(e.target.value)} />
                        <button className="btn primary" style={{ alignSelf: 'flex-end' }} onClick={handleCreateGroup}>CREATE</button>
                    </div>
                </div>
            )}

            {/* Squads */}
            <section>
                <h3 style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 'var(--space-lg)', letterSpacing: '1px' }}>SQUADS</h3>
                <div className="grid grid-3">
                    {joinedComms.length === 0 && (
                        <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                            <Shield size={32} className="icon" />
                            <h3>No squads joined</h3>
                            <p>Join or create a squad to get started</p>
                        </div>
                    )}
                    {joinedComms.map(c => (
                        <div key={c.id} onClick={() => onSelect(c.id, 'community')} className="card interactive compact"
                            style={{ borderLeft: `3px solid ${c.theme_color || 'var(--primary)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flex: 1 }}>
                                <div className="avatar md" style={{ borderRadius: 'var(--radius-full)', background: 'var(--bg-hover)', color: c.theme_color || 'var(--primary)' }}>
                                    {c.name.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{c.name}</div>
                                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{c.member_count || 1} {t('members')}</div>
                                    {/* Sub-groups */}
                                    <div style={{ display: 'flex', gap: 'var(--space-xs)', marginTop: 'var(--space-xs)', flexWrap: 'wrap' }}>
                                        {groups.filter(g => g.community_id === c.id).map(g => (
                                            <span key={g.id} className="badge accent" onClick={(e) => { e.stopPropagation(); onSelect(g.id, 'group'); }}
                                                style={{ cursor: 'pointer', fontSize: '0.55rem' }}>
                                                <Target size={8} /> {g.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <ChevronRight size={16} color="var(--text-muted)" />
                        </div>
                    ))}
                </div>
            </section>

            {/* Groups */}
            <section>
                <h3 style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 'var(--space-lg)', letterSpacing: '1px' }}>GROUPS</h3>
                <div className="grid grid-3">
                    {joinedGroups.length === 0 && (
                        <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                            <Target size={32} className="icon" />
                            <h3>No groups joined</h3>
                            <p>Create or join a group</p>
                        </div>
                    )}
                    {joinedGroups.map(g => (
                        <div key={g.id} onClick={() => onSelect(g.id, 'group')} className="card interactive compact">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: '4px' }}>
                                <Target size={14} color="var(--accent)" />
                                <span style={{ fontWeight: 700 }}>{g.name}</span>
                            </div>
                            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{g.type.toUpperCase()}</div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
