import React, { useState, useEffect, useRef } from 'react';
import { api, AAGMessage } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Send, Terminal, ShieldAlert, Hash, Volume2, PlusCircle, Smile, Gift } from 'lucide-react';
import { useTranslation } from '../i18n';

interface ChatAreaProps {
    targetId: string;
    type: 'global' | 'community' | 'private';
    onBack?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ targetId, type, onBack }) => {
    const { user } = useAuthStore();
    const { isRTL, t } = useTranslation();
    const [messages, setMessages] = useState<AAGMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const roomId = type === 'global' ? 'global' : `${type}_${targetId}`;

    useEffect(() => {
        loadMessages();
        const interval = setInterval(loadMessages, 5000); // Polling every 5s
        return () => clearInterval(interval);
    }, [roomId]);

    const loadMessages = async () => {
        try {
            const { messages } = await api.chat.room(roomId);
            setMessages(messages);
            setLoading(false);
        } catch (err) {
            console.error('Failed to load chat', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !user) return;

        const currentInput = input;
        setInput('');

        // Optimistic UI update
        const optimisticMsg: AAGMessage = {
            id: `temp-${Date.now()}`,
            content: currentInput,
            roomId,
            createdAt: new Date().toISOString(),
            ownerId: user.id,
            ownerName: user.displayName,
            ownerAvatar: user.avatarUrl,
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            await api.chat.send(currentInput, roomId);
        } catch (err: any) {
            console.error('Send failed', err);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-deep)' }}>
            
            {/* Header - Already handled by Dashboard in 3-pane mode, but keeping a subtle back button/title for sub-views */}
            {onBack && (
                <div className="glass-panel" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                     <button onClick={onBack} className="btn btn-ghost sm">Back</button>
                </div>
            )}

            {/* Message Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {loading && messages.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        SYNCING_COMMS_CHANNELS...
                    </div>
                )}
                
                {messages.length === 0 && !loading && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '40px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            <Hash size={32} color="var(--brand-electric)" />
                        </div>
                        <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Welcome to {type === 'global' ? 'Global Comms' : 'this Clan Hub'}!</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Start the transmission. Secure comms are now active.</p>
                    </div>
                )}

                {messages.map((m, i) => {
                    const prevMsg = messages[i - 1];
                    const isCompact = prevMsg && prevMsg.ownerId === m.ownerId && 
                        (new Date(m.createdAt).getTime() - new Date(prevMsg.createdAt).getTime()) < 300000; // 5 mins

                    return (
                        <div 
                            key={m.id} 
                            style={{ 
                                display: 'flex', 
                                gap: '16px', 
                                padding: isCompact ? '0 16px 2px 72px' : '16px 16px 2px 16px',
                                background: 'transparent',
                                transition: 'background 0.2s ease'
                            }}
                            className="chat-msg"
                        >
                            {!isCompact && (
                                <div className="avatar" style={{ width: '40px', height: '40px', flexShrink: 0, marginTop: '2px' }}>
                                    {m.ownerAvatar ? <img src={m.ownerAvatar} /> : (m.ownerName?.[0] || '?').toUpperCase()}
                                </div>
                            )}
                            <div style={{ flex: 1 }}>
                                {!isCompact && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--brand-electric)', cursor: 'pointer' }}>{m.ownerName}</span>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                )}
                                <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                                    {m.content}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '0 24px 24px' }}>
                <form 
                    onSubmit={handleSend} 
                    className="card" 
                    style={{ 
                        display: 'flex', gap: '12px', padding: '12px 16px', 
                        background: 'var(--bg-input)', alignItems: 'center',
                        border: 'none', borderRadius: '10px'
                    }}
                >
                    <button type="button" className="btn btn-ghost btn-icon" style={{ width: '32px', height: '32px', color: 'var(--text-muted)' }}><PlusCircle size={20} /></button>
                    <input 
                        className="input" 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        placeholder={t('ai_input')}
                        style={{ background: 'transparent', border: 'none', height: '24px', padding: 0 }}
                    />
                    <div style={{ display: 'flex', gap: '8px', color: 'var(--text-muted)' }}>
                        <button type="button" className="btn btn-ghost btn-icon" style={{ width: '32px', height: '32px' }}><Gift size={20} /></button>
                        <button type="button" className="btn btn-ghost btn-icon" style={{ width: '32px', height: '32px' }}><Smile size={20} /></button>
                        <button type="submit" disabled={!input.trim()} className="btn btn-primary btn-icon" style={{ width: '32px', height: '32px', borderRadius: '4px' }}>
                            <Send size={16} />
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .chat-msg:hover { background: rgba(255,255,255,0.02) !important; }
            `}</style>
        </div>
    );
};
