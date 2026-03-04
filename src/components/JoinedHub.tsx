import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { Users, Shield, ChevronRight, Zap, Target, Plus, X } from 'lucide-react';

interface Props {
    onSelect: (id: string, type: 'squad' | 'group' | 'private') => void;
}

export const JoinedHub: React.FC<Props> = ({ onSelect }) => {
    const { squads, groups, createGroup, loadSquads, loadGroups } = useGameStore();
    const { user } = useAuthStore();
    const { t, isRTL } = useTranslation();

    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupDesc, setGroupDesc] = useState('');

    useEffect(() => { loadSquads(); loadGroups(); }, [loadSquads, loadGroups]);

    const joinedSquads = squads.filter(s => s.is_member);
    const joinedGroups = groups.filter(g => g.is_member);

    const handleCreateGroup = async () => {
        if (!groupName.trim()) return;
        await createGroup(groupName, groupDesc, null, 'standalone');
        setShowCreateGroup(false);
        setGroupName(''); setGroupDesc('');
    };

    return (
        <div className="page-container" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            <div className="section-header" style={{ marginBottom: '2rem' }}>
                <div className="icon-wrap"><Zap size={22} color="var(--primary)" /></div>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{t('joined').toUpperCase()}</h2>
                    <p className="subtitle" style={{ letterSpacing: '2px' }}>OPERATIONAL NETWORK</p>
                </div>
            </div>

            {/* Hub Section: Squads */}
            <section style={{ marginBottom: '3rem' }}>
                <div className="label-premium">
                    <Shield size={12} />
                    <span>ACTIVE SQUADS</span>
                </div>

                <div className="hub-grid">
                    {joinedSquads.map(s => (
                        <div key={s.id} onClick={() => onSelect(s.id, 'squad')} className="hub-square">
                            <div className="icon-box" style={{ borderColor: s.theme_color || 'var(--primary)', color: s.theme_color || 'var(--primary)' }}>
                                <Users size={28} />
                            </div>
                            <span className="name">{s.name.toUpperCase()}</span>
                            <span className="count">{s.member_count || 1} OPERATORS</span>

                            {/* Inner groups bubble count if any */}
                            {groups.filter(g => g.squad_id === s.id).length > 0 && (
                                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '9px', fontWeight: 900 }}>
                                    {groups.filter(g => g.squad_id === s.id).length}G
                                </div>
                            )}
                        </div>
                    ))}

                    {joinedSquads.length === 0 && (
                        <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
                            <Shield size={32} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                            <p style={{ fontWeight: 800, fontSize: '0.8rem' }}>NO SQUADS REGISTERED</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Hub Section: Groups */}
            <section>
                <div className="label-premium">
                    <Target size={12} />
                    <span>COMMAND GROUPS</span>
                </div>

                <div className="hub-grid">
                    {/* Create Group Square */}
                    <div className="hub-square add-new" onClick={() => setShowCreateGroup(true)}>
                        <div className="icon-box" style={{ borderStyle: 'dashed', color: 'var(--accent)' }}>
                            <Plus size={28} />
                        </div>
                        <span className="name" style={{ color: 'var(--accent)' }}>NEW GROUP</span>
                        <span className="count">INITIALIZE STREAM</span>
                    </div>

                    {joinedGroups.map(g => (
                        <div key={g.id} onClick={() => onSelect(g.id, 'group')} className="hub-square">
                            <div className="icon-box" style={{ color: 'var(--accent)' }}>
                                <Target size={28} />
                            </div>
                            <span className="name">{g.name.toUpperCase()}</span>
                            <span className="count">{g.type.toUpperCase()}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Create Group Modal */}
            {showCreateGroup && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="glass-card premium-pattern" style={{ width: '100%', maxWidth: '400px', border: '1px solid var(--primary)', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <h3 style={{ fontWeight: 900, letterSpacing: '1px' }}>INITIALIZE GROUP</h3>
                            <button className="btn ghost icon-only" onClick={() => setShowCreateGroup(false)}><X size={18} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div className="input-wrap">
                                <label style={{ fontSize: '10px', fontWeight: 900, opacity: 0.5, marginBottom: '6px', display: 'block' }}>GROUP IDENTIFIER</label>
                                <input className="input" placeholder="e.g. ALPHA_TEAM" value={groupName} onChange={e => setGroupName(e.target.value)} />
                            </div>
                            <div className="input-wrap">
                                <label style={{ fontSize: '10px', fontWeight: 900, opacity: 0.5, marginBottom: '6px', display: 'block' }}>MISSION INTEL</label>
                                <textarea className="input" placeholder="Mission details..." value={groupDesc} onChange={e => setGroupDesc(e.target.value)} style={{ minHeight: '80px' }} />
                            </div>
                            <button className="btn accent full" style={{ marginTop: '1rem' }} onClick={handleCreateGroup}>
                                <Zap size={14} /> ESTABLISH CONNECTION
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
