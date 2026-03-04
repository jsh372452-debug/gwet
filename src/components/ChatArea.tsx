import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { useTranslation } from '../i18n';
import Flag from './Flag';
import { Send, Lock, Terminal, User as UserIcon, ArrowLeft, Target } from 'lucide-react';

interface Props {
    targetId: string;
    type: 'global' | 'squad' | 'group' | 'private';
    onBack?: () => void;
}

const formatTime = (dateStr: string | undefined) => {
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
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<any>(null);
    const lastTimestampRef = useRef<string>('');

    const loadMessages = useCallback(async (initial = false) => {
        try {
            const after = initial ? undefined : lastTimestampRef.current;
            const { messages: newMsgs } = await api.messages.list(targetId, type, after || undefined);

            if (initial) {
                setMessages(newMsgs);
                setLoading(false);
            } else if (newMsgs.length > 0) {
                setMessages(prev => {
                    const ids = new Set(prev.map(m => m.id));
                    const unique = newMsgs.filter(m => !ids.has(m.id));
                    return unique.length > 0 ? [...prev, ...unique] : prev;
                });
            }

            if (newMsgs.length > 0) {
                lastTimestampRef.current = newMsgs[newMsgs.length - 1].created_at;
            }
        } catch (err) {
            console.error('Load messages failed:', err);
            if (initial) setLoading(false);
        }
    }, [targetId, type]);

    useEffect(() => {
        lastTimestampRef.current = '';
        setMessages([]);
        setLoading(true);
        loadMessages(true);

        // Poll every 4 seconds for new messages
        pollRef.current = setInterval(() => loadMessages(false), 4000);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [targetId, type, loadMessages]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || !user) return;

        const optimistic = {
            id: crypto.randomUUID(), content: text, created_at: new Date().toISOString(),
            user_id: user.id, display_name: user.displayName, avatar_url: user.avatarUrl, country: user.country || 'Global',
            target_id: targetId, type
        };
        setMessages(prev => [...prev, optimistic]);
        setText('');

        try {
            await api.messages.send(text, targetId, type);
        } catch (e) { console.error('Send failed:', e); }
    };

    const chatLabel = type === 'global' ? t('comms') : type === 'squad' ? t('squads') : type === 'group' ? t('groups') : t('private_chat');

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', direction: isRTL ? 'rtl' : 'ltr' }}>
            {/* Header */}
            <div className="card compact" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    {onBack && <button onClick={onBack} className="btn ghost icon-only"><ArrowLeft size={18} /></button>}
                    <div className="avatar" style={{ width: 32, height: 32, background: 'var(--primary-soft)', color: 'var(--primary)', borderRadius: 'var(--radius-sm)' }}>
                        {type === 'private' ? <UserIcon size={16} /> : type === 'group' ? <Target size={16} /> : <Terminal size={16} />}
                    </div>
                    <div>
                        <h1 style={{ fontSize: 'var(--font-base)', fontWeight: 800, margin: 0 }}>{chatLabel}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-xs)', color: 'var(--accent)', fontWeight: 600 }}>
                            <div className="status-dot" /> {t('online')} · <Lock size={8} /> SECURE
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="chat-bg" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
                {loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: '16px' }} />)}
                    </div>
                )}

                {!loading && messages.length === 0 && (
                    <div className="glass-card" style={{ marginTop: '2rem', textAlign: 'center', padding: '2rem' }}>
                        <Terminal size={32} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h3 style={{ fontWeight: 900, letterSpacing: '1px' }}>NO DATA STREAMS DETECTED</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Initialize communication to begin mission briefing.</p>
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = msg.user_id === user?.id;
                    return (
                        <div key={msg.id} style={{
                            alignSelf: isMe ? 'flex-start' : 'flex-end', // Request: Me on left, Others on right
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            maxWidth: '85%',
                            width: 'fit-content'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 4px', flexDirection: isMe ? 'row' : 'row-reverse' }}>
                                <Flag code={msg.country || 'Global'} size={12} />
                                {!isMe && <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--accent)' }}>{msg.display_name?.toUpperCase()}</span>}
                                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{formatTime(msg.created_at)}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexDirection: isMe ? 'row' : 'row-reverse' }}>
                                <div className="avatar sm" style={{
                                    width: 28, height: 28, borderRadius: '8px',
                                    backgroundImage: msg.avatar_url ? `url(${msg.avatar_url})` : 'none',
                                    border: `1.5px solid ${isMe ? 'var(--primary)' : 'var(--glass-border)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900
                                }}>
                                    {!msg.avatar_url && (msg.display_name?.[0] || 'A').toUpperCase()}
                                </div>
                                <div className={`bubble ${isMe ? 'me' : 'them'}`}>
                                    <p style={{ margin: 0, overflowWrap: 'anywhere' }}>{msg.content}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="card compact" style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-end' }}>
                <textarea className="input" placeholder="Type your message..." value={text} onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
                    style={{ minHeight: '44px', maxHeight: '100px', flex: 1 }} />
                <button type="submit" className="btn primary icon-only" style={{ width: 44, height: 44 }}><Send size={16} /></button>
            </form>
        </div>
    );
};
