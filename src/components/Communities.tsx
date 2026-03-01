import React, { useState, useEffect } from 'react';
import { useGameStore, Community } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { Users, Plus, Shield, Zap, Sword, Target, Settings, Copy, Share2, MessageSquare, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CommunityAdmin } from './CommunityAdmin';
import { ChatArea } from './ChatArea';

export const Communities: React.FC = () => {
    const { communities, groups, createCommunity, createGroup, syncData } = useGameStore();
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

    useEffect(() => { syncData(); }, [syncData]);

    const handleCreate = async () => {
        if (!name.trim() || !user) return;
        await createCommunity(name, desc, user.id);
        setShowCreate(false); setName(''); setDesc('');
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim() || !user) return;
        await createGroup(groupName, groupDesc, user.id, null, 'standalone');
        setShowCreateGroup(false); setGroupName(''); setGroupDesc('');
    };

    const copyInvite = (id: string) => {
        navigator.clipboard.writeText(`gwet://squad/invite/${id}`);
        alert('Squad Invite Link Copied!');
    };

    // If a squad is selected, show its chat
    if (activeSquad) {
        const squadGroups = groups.filter(g => g.communityId === activeSquad.id);
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 10rem)', direction: isRTL ? 'rtl' : 'ltr' }}>
                {/* Squad Header */}
                <div className="glass-card" style={{ padding: '0.75rem 1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <button onClick={() => setActiveSquad(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><ArrowLeft size={20} /></button>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: activeSquad.themeColor || 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sword size={20} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: '900', color: 'white', margin: 0 }}>{activeSquad.name}</h2>
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: '700' }}>{activeSquad.members?.length || 1} {t('members')}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {activeSquad.ownerId === user?.id && (
                            <button className="btn-premium" style={{ padding: '6px 10px', fontSize: '0.6rem' }} onClick={() => setAdminTarget(activeSquad)}>
                                <Settings size={14} />
                            </button>
                        )}
                        <button className="btn-premium" style={{ padding: '6px 10px', fontSize: '0.6rem' }} onClick={() => copyInvite(activeSquad.id)}>
                            <Share2 size={14} />
                        </button>
                    </div>
                </div>

                {/* Squad Sub-groups bar */}
                {squadGroups.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                        {squadGroups.map(g => (
                            <div key={g.id} className="glass-card" style={{ padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '700', color: 'var(--accent)', cursor: 'pointer' }}>
                                <Target size={12} style={{ marginRight: '4px' }} /> {g.name}
                            </div>
                        ))}
                    </div>
                )}

                {/* Squad Chat */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <ChatArea targetId={activeSquad.id} type="community" />
                </div>

                {/* Admin Modal */}
                <AnimatePresence>
                    {adminTarget && <CommunityAdmin community={adminTarget} onClose={() => setAdminTarget(null)} />}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto', direction: isRTL ? 'rtl' : 'ltr' }}>

            <AnimatePresence>
                {adminTarget && <CommunityAdmin community={adminTarget} onClose={() => setAdminTarget(null)} />}
            </AnimatePresence>

            {/* Header with Create buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="avatar-premium" style={{ width: '40px', height: '40px', background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                        <Shield size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'white' }}>{t('squads')}</h2>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 'bold' }}>COORDINATE WITH YOUR TEAM</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn-premium" onClick={() => setShowCreateGroup(!showCreateGroup)}>
                        <Target size={18} /> {t('create_group')}
                    </button>
                    <button className="btn-premium" onClick={() => setShowCreate(!showCreate)}>
                        <Plus size={20} /> FOUND SQUAD
                    </button>
                </div>
            </div>

            {/* Create Squad Form */}
            {showCreate && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ borderRadius: '24px' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: '800' }}>Initialize New Squad</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>SQUAD DESIGNATION</label>
                            <input className="gaming-input" placeholder="e.g. Apex Predators" value={name} onChange={e => setName(e.target.value)} style={{ marginBottom: 0 }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>MISSION OBJECTIVE</label>
                            <textarea className="gaming-input" placeholder="What are your goals?" value={desc} onChange={e => setDesc(e.target.value)} style={{ minHeight: '80px', resize: 'none', marginBottom: 0 }} />
                        </div>
                        <button className="btn-premium" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCreate}>INITIALIZE SQUAD</button>
                    </div>
                </motion.div>
            )}

            {/* Create Standalone Group Form */}
            {showCreateGroup && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ borderRadius: '24px', borderLeft: '4px solid var(--accent)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: '800' }}>{t('create_group')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>{t('group_name')}</label>
                            <input className="gaming-input" placeholder="e.g. Quick Strike" value={groupName} onChange={e => setGroupName(e.target.value)} style={{ marginBottom: 0 }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>{t('group_desc')}</label>
                            <textarea className="gaming-input" placeholder="Group purpose..." value={groupDesc} onChange={e => setGroupDesc(e.target.value)} style={{ minHeight: '60px', resize: 'none', marginBottom: 0 }} />
                        </div>
                        <button className="btn-premium" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCreateGroup}>CREATE GROUP</button>
                    </div>
                </motion.div>
            )}

            {/* Standalone Groups */}
            {groups.filter(g => g.type === 'standalone').length > 0 && (
                <div>
                    <h3 style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '800', marginBottom: '1rem' }}>
                        <Target size={16} style={{ marginRight: '6px' }} /> STANDALONE GROUPS
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                        {groups.filter(g => g.type === 'standalone').map(g => (
                            <motion.div key={g.id} whileHover={{ y: -3 }} className="glass-card" style={{ borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', borderLeft: '3px solid var(--accent)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <Target size={20} color="var(--accent)" />
                                    <h4 style={{ fontWeight: '800', color: 'white', flex: 1 }}>{g.name}</h4>
                                </div>
                                {g.description && <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: '1.4' }}>{g.description}</p>}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                                    <Users size={14} /> {g.members?.length || 1} members
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Squads Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', paddingBottom: '3rem' }}>
                {communities.map(c => {
                    const isOwner = c.ownerId === user?.id;
                    return (
                        <motion.div
                            key={c.id}
                            whileHover={{ y: -5 }}
                            className="glass-card"
                            style={{
                                display: 'flex', flexDirection: 'column', gap: '1.25rem', borderRadius: '24px',
                                borderLeft: isOwner ? `4px solid ${c.themeColor || 'var(--primary)'}` : 'none',
                                overflow: 'hidden', padding: 0
                            }}
                        >
                            {/* Banner */}
                            <div style={{
                                height: '100px', background: c.themeColor || 'rgba(255,255,255,0.03)',
                                backgroundImage: c.bannerBase64 ? `url(${c.bannerBase64})` : 'none',
                                backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative'
                            }}>
                                <div style={{
                                    position: 'absolute', bottom: '-20px', [isRTL ? 'right' : 'left']: '20px',
                                    width: '64px', height: '64px', borderRadius: '16px', background: 'var(--bg-dark)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '3px solid var(--glass-border)', boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                                }}>
                                    <Sword size={32} color={c.themeColor || 'white'} />
                                </div>
                                {isOwner && (
                                    <button
                                        onClick={() => setAdminTarget(c)}
                                        className="btn-premium"
                                        style={{ position: 'absolute', top: '10px', [isRTL ? 'left' : 'right']: '10px', padding: '8px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)' }}
                                    >
                                        <Settings size={18} />
                                    </button>
                                )}
                            </div>

                            <div style={{ padding: '2rem 1.5rem 1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white' }}>{c.name}</h3>
                                    <button onClick={() => copyInvite(c.id)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                                        <Share2 size={16} />
                                    </button>
                                </div>
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', lineHeight: '1.6', height: '3.2rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                                    {c.description}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: '600' }}>
                                        <Users size={16} /> {c.members?.length || 1} {t('members')}
                                    </div>
                                    <button
                                        className="btn-premium"
                                        style={{
                                            padding: '0.6rem 1.25rem', fontSize: '0.8rem',
                                            background: c.themeColor ? `${c.themeColor}22` : '',
                                            color: c.themeColor || '', border: `1px solid ${c.themeColor || 'transparent'}`
                                        }}
                                        onClick={() => setActiveSquad(c)}
                                    >
                                        <MessageSquare size={16} /> ENTER HUB
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
