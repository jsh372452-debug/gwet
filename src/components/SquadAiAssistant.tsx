import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { useTranslation } from '../i18n';
import { Bot, Send, Terminal, Loader, Sparkles } from 'lucide-react';

interface Props {
    squadId: string;
}

export const SquadAiAssistant: React.FC<Props> = ({ squadId }) => {
    const { t, isRTL } = useTranslation();
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
    }, [messages, loading]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const { response } = await api.squads.aiChat(squadId, userMsg);
            setMessages(prev => [...prev, { role: 'ai', content: response }]);
        } catch (err) {
            console.error('AI Chat failed:', err);
            setMessages(prev => [...prev, { role: 'ai', content: 'System Error: Power supply interrupted. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 'var(--space-md)', direction: isRTL ? 'rtl' : 'ltr' }}>
            <div className="card compact" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', borderLeft: '3px solid var(--primary)' }}>
                <div className="avatar" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', width: 32, height: 32 }}>
                    <Bot size={18} />
                </div>
                <div>
                    <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 800, margin: 0 }}>SQUAD MASTER AI</h3>
                    <p style={{ fontSize: 'var(--font-xs)', color: 'var(--accent)', margin: 0, fontWeight: 700 }}>LLAMA-3 POWERED</p>
                </div>
            </div>

            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', padding: 'var(--space-sm)' }}>
                {messages.length === 0 && (
                    <div className="empty-state" style={{ marginTop: 'var(--space-3xl)' }}>
                        <Sparkles size={40} className="icon" color="var(--primary)" />
                        <h3>Squad Intelligence Active</h3>
                        <p>Ask me about tactics, squad status, or just hype the team!</p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                        <div className="card compact" style={{
                            background: msg.role === 'user' ? 'var(--bg-elevated)' : 'var(--primary-soft)',
                            border: msg.role === 'user' ? '1px solid var(--border)' : '1px solid var(--border-active)',
                            borderRadius: 'var(--radius-lg)'
                        }}>
                            <p style={{ fontSize: 'var(--font-base)', margin: 0, lineHeight: 1.6 }}>{msg.content}</p>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div style={{ alignSelf: 'flex-start' }}>
                        <div className="card compact" style={{ background: 'var(--primary-soft)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Loader size={14} className="spin" />
                            <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700 }}>NEURAL PROCESSING...</span>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSend} className="card compact" style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <input className="input" placeholder="Communicate with Squad Master..." value={input} onChange={e => setInput(e.target.value)} disabled={loading}
                    style={{ flex: 1 }} />
                <button type="submit" className="btn primary icon-only" disabled={loading || !input.trim()}>
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
};
