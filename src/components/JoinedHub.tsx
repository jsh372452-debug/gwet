import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { Users, Shield, MessageSquare, User, ChevronRight, Zap, Target, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    onSelect: (id: string, type: 'community' | 'group' | 'private') => void;
}

export const JoinedHub: React.FC<Props> = ({ onSelect }) => {
    const { communities, groups, createGroup } = useGameStore();
    const { user } = useAuthStore();
    const { t, isRTL } = useTranslation();

    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupDesc, setGroupDesc] = useState('');

    const joinedComms = communities.filter(c => c.members?.includes(user?.id || ''));
    const joinedGroups = groups.filter(g => g.members?.includes(user?.id || ''));

    const handleCreateGroup = async () => {
        if (!groupName.trim() || !user) return;
        await createGroup(groupName, groupDesc, user.id, null, 'standalone');
        setShowCreateGroup(false);
        setGroupName('');
        setGroupDesc('');
    };

    return (
        <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto', direction: isRTL ? 'rtl' : 'ltr' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="avatar-premium" style={{ width: '40px', height: '40px', background: 'var(--primary-glow)', color: 'var(--primary)' }}><Zap size={24} /></div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'white' }}>{t('joined')}</h2>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 'bold' }}>UNIFIED COMMUNICATIONS</p>
                    </div>
                </div>
                <button className="btn-premium" onClick={() => setShowCreateGroup(true)}><Plus size={18} /> {t('create_group')}</button>
            </div>

            <AnimatePresence>
                {showCreateGroup && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontWeight: '800' }}>{t('create_group')}</h3>
                            <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowCreateGroup(false)} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input className="gaming-input" placeholder={t('group_name')} value={groupName} onChange={e => setGroupName(e.target.value)} style={{ marginBottom: 0 }} />
                            <textarea className="gaming-input" placeholder={t('group_desc')} value={groupDesc} onChange={e => setGroupDesc(e.target.value)} style={{ minHeight: '80px', marginBottom: 0 }} />
                            <button className="btn-premium" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCreateGroup}>INITIALIZE GROUP</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Squads */}
                <section>
                    <h3 style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '800', marginBottom: '1rem', letterSpacing: '2px' }}>SQUADS</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                        {joinedComms.map(c => (
                            <motion.div key={c.id} whileHover={{ y: -5 }} onClick={() => onSelect(c.id, 'community')} className="glass-card" style={{ padding: '1.25rem', borderRadius: '20px', cursor: 'pointer', borderLeft: `4px solid ${c.themeColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div className="avatar-premium" style={{ width: '40px', height: '40px', fontSize: '1rem', color: c.themeColor, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}>{c.name.charAt(0)}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '800', color: 'white' }}>{c.name}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{c.members.length} {t('members')}</div>

                                        {/* Sub-groups display */}
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', overflowX: 'auto' }}>
                                            {groups.filter(g => g.communityId === c.id).map(g => (
                                                <div
                                                    key={g.id}
                                                    onClick={(e) => { e.stopPropagation(); onSelect(g.id, 'group'); }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '8px', fontSize: '0.6rem', color: 'var(--accent)', border: '1px solid rgba(255,255,255,0.1)' }}
                                                >
                                                    <Target size={10} /> {g.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={18} color="var(--text-dim)" />
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Groups */}
                <section>
                    <h3 style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '800', marginBottom: '1rem', letterSpacing: '2px' }}>GROUPS</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                        {joinedGroups.map(g => (
                            <motion.div key={g.id} whileHover={{ y: -5 }} onClick={() => onSelect(g.id, 'group')} className="glass-card" style={{ padding: '1.25rem', borderRadius: '20px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                    <Target size={14} color="var(--accent)" />
                                    <div style={{ fontWeight: '800', color: 'white' }}>{g.name}</div>
                                </div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 'bold' }}>{g.type.toUpperCase()}</div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};
