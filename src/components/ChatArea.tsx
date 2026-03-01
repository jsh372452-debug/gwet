import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { getDB } from '../db/schema';
import { getGunApp } from '../db/gun';
import { useTranslation } from '../i18n';
import { getFlag } from '../data/countries';
import Flag from './Flag';
import { Send, Lock, Terminal, User as UserIcon, ArrowLeft, Target, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    targetId: string;
    type: 'global' | 'community' | 'group' | 'private';
    onBack?: () => void;
}

const formatSafeTime = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
};

export const ChatArea: React.FC<Props> = ({ targetId, type, onBack }) => {
    const user = useAuthStore(s => s.user);
    const { t, isRTL } = useTranslation();
    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState('');
    const [error, setError] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const chatPath = `messages-${type}-${targetId}`;

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const db = await getDB();
                const allMessages = await db.getAll('messages');
                const filtered = allMessages.filter((m: any) => m.targetId === targetId && m.type === type);
                if (!cancelled) {
                    setMessages(filtered.sort((a: any, b: any) => {
                        const ta = new Date(a.created_at || 0).getTime();
                        const tb = new Date(b.created_at || 0).getTime();
                        return (isNaN(ta) ? 0 : ta) - (isNaN(tb) ? 0 : tb);
                    }));
                }
            } catch (err) { console.error('Load messages failed:', err); }
        };
        load();

        let gunSub: any = null;
        try {
            gunSub = (getGunApp().get(chatPath).map() as any).on((data: any, id: string) => {
                if (!data || !id || cancelled) return;
                setMessages(prev => {
                    if (prev.find((m: any) => m.id === id)) return prev;
                    return [...prev, { ...data, id, targetId, type, image: null }].sort((a: any, b: any) =>
                        (new Date(a.created_at || 0).getTime() || 0) - (new Date(b.created_at || 0).getTime() || 0)
                    );
                });
            });
        } catch (err) { console.error('Gun sub failed:', err); }

        return () => { cancelled = true; };
    }, [targetId, type, chatPath]);

    useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || !user) return;
        const msg = {
            id: crypto.randomUUID(), content: text, created_at: new Date().toISOString(),
            userId: user.id, displayName: user.displayName || user.username,
            avatarUrl: user.avatarUrl || '', country: user.country || 'Global',
            targetId, type, image: null
        };
        setMessages(prev => [...prev, msg]);
        setText('');
        try {
            const db = await getDB();
            await db.add('messages', { id: msg.id, content: msg.content, image: null, created_at: msg.created_at, userId: msg.userId, targetId, type });
        } catch (e) { console.error(e); }
        try {
            getGunApp().get(chatPath).get(msg.id).put({
                content: msg.content, created_at: msg.created_at, userId: msg.userId,
                displayName: msg.displayName, avatarUrl: msg.avatarUrl, country: msg.country, targetId, type
            });
        } catch (e) { console.error(e); }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', direction: isRTL ? 'rtl' : 'ltr', position: 'relative' }}>
            {/* Header */}
            <div className="glass-card" style={{ padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '16px', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {onBack && <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}><ArrowLeft size={20} /></button>}
                    <div className="avatar-premium" style={{ width: '32px', height: '32px', background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                        {type === 'private' ? <UserIcon size={18} /> : (type === 'group' ? <Target size={18} /> : <Terminal size={18} />)}
                    </div>
                    <div>
                        <h1 style={{ fontSize: '0.85rem', fontWeight: '900', color: 'white', margin: 0 }}>
                            {type === 'global' ? t('comms') : (type === 'community' ? t('squads') : (type === 'group' ? t('groups') : t('private_chat')))}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.55rem', color: 'var(--accent)', fontWeight: 'bold' }}>
                            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }}></div> {t('online')} • <Lock size={9} /> SECURE
                        </div>
                    </div>
                </div>
                {type === 'community' && (
                    <button className="btn-premium" style={{ fontSize: '0.6rem', padding: '5px 10px' }} onClick={() => {
                        const name = prompt('Group Name:');
                        if (name && user) useGameStore.getState().createGroup(name, '', user.id, targetId, 'community_sub');
                    }}><Plus size={14} /> NEW GROUP</button>
                )}
            </div>

            {/* Messages */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0 0.5rem', zIndex: 2 }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '3rem', fontSize: '0.8rem' }}>No messages yet. Be the first to transmit!</div>
                )}
                <AnimatePresence>
                    {messages.map((msg) => {
                        const isMe = msg.userId === user?.id;
                        return (
                            <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', padding: '0 6px', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                                    <Flag code={msg.country || 'Global'} size={18} />
                                    {!isMe && <span style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--accent)' }}>{msg.displayName || msg.userId?.slice(0, 8)}</span>}
                                    <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)', fontWeight: '700' }}>{formatSafeTime(msg.created_at)}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                                    <div className="avatar-premium" style={{ width: '30px', height: '30px', flexShrink: 0, backgroundImage: msg.avatarUrl ? `url(${msg.avatarUrl})` : 'none', backgroundSize: 'cover', border: isMe ? '2px solid var(--primary)' : '2px solid var(--glass-border)', fontSize: '0.65rem' }}>
                                        {!msg.avatarUrl && (msg.displayName?.[0] || 'A').toUpperCase()}
                                    </div>
                                    <div className="glass-card" style={{ padding: '0.6rem 1rem', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: isMe ? 'var(--primary-glow)' : 'rgba(255,255,255,0.03)', border: isMe ? '1px solid var(--primary)' : '1px solid var(--glass-border)', boxShadow: isMe ? '0 4px 12px rgba(168,85,247,0.2)' : 'none' }}>
                                        <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'white', margin: 0 }}>{msg.content}</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="glass-card" style={{ padding: '0.6rem', borderRadius: '20px', display: 'flex', gap: '0.75rem', alignItems: 'flex-end', zIndex: 2 }}>
                <textarea className="gaming-input" placeholder="Transmit intel..." value={text} onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
                    style={{ marginBottom: 0, minHeight: '48px', maxHeight: '120px', resize: 'none', background: 'rgba(0,0,0,0.2)', flex: 1 }} />
                <button type="submit" className="btn-premium" style={{ height: '48px', width: '48px', padding: 0, borderRadius: '14px', background: 'var(--primary)', color: 'white', flexShrink: 0 }}><Send size={18} /></button>
            </form>
        </div>
    );
};
