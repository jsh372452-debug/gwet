import React, { useState, useEffect, useRef } from 'react';
import { api, AAGMessage } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Send, Terminal, ShieldAlert } from 'lucide-react';
import { useTranslation } from '../i18n';

interface ChatAreaProps {
    targetId: string;
    type: 'global' | 'community' | 'private';
    onBack?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ targetId, type, onBack }) => {
    const { user } = useAuthStore();
    const { isRTL } = useTranslation();
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
            // Will re-sync on next poll
        } catch (err: any) {
            console.error('Send failed', err);
            if (err.message?.includes('limit reached')) {
                alert('ANTI-SPAM GUARD: Chat limit reached for today.');
            }
        }
    };

    return (
        <div className="glass-card compact" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center' }}>
                <Terminal size={18} color="var(--primary)" style={{ marginRight: '10px' }} />
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {type === 'global' ? 'GLOBAL COMMS LINK' : `ENCRYPTED COMM CHANNEL [${targetId}]`}
                </h3>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {loading && messages.length === 0 && <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>ESTABLISHING CONNECTION...</div>}
                {messages.map((m) => {
                    const isMe = m.ownerId === user?.id;
                    return (
                        <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                            <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px', padding: '0 4px', display: 'flex', gap: '8px' }}>
                                <span>{(m.ownerName || 'ANON').toUpperCase()}</span>
                                <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div style={{ 
                                background: isMe ? 'var(--primary-soft)' : 'rgba(255,255,255,0.05)', 
                                border: isMe ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                                color: isMe ? '#fff' : 'var(--text-main)',
                                padding: '10px 15px', 
                                borderRadius: isMe ? '12px 2px 12px 12px' : '2px 12px 12px 12px',
                                fontSize: '14px',
                                maxWidth: '80%'
                            }}>
                                {m.content}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} style={{ padding: '15px 20px', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        className="gaming-input" 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        placeholder={isRTL ? 'اكتب رسالتك...' : 'TRANSMIT MESSAGE...'} 
                        style={{ margin: 0, flex: 1 }} 
                    />
                    <button type="submit" className="btn primary sharp" disabled={!input.trim()}>
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
};
