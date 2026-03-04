import React from 'react';
import { Post, useGameStore } from '../store/gameStore';
import { useTranslation } from '../i18n';
import { Users, Sword, Calendar, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';

interface Props {
    post: Post;
}

export const SessionCard: React.FC<Props> = ({ post }) => {
    const { t } = useTranslation();
    const metadata = JSON.parse(post.metadata_json || '{}');
    const { squadId, maxSlots = 5, currentSlots = 1 } = metadata;

    const isFull = currentSlots >= maxSlots;

    const handleJoin = async () => {
        if (isFull) return;
        try {
            const { metadata: newMeta } = await api.posts.joinSession(post.id);
            // Update local state by re-loading posts (simple way)
            useGameStore.getState().loadPosts();
        } catch (err) {
            console.error('Join failed:', err);
        }
    };

    return (
        <div className="glass-card sharp neon-border premium-pattern" style={{ border: '1px solid var(--primary)', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(10, 10, 12, 0) 100%)', position: 'relative', overflow: 'hidden', padding: '1.5rem' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 12px', background: 'var(--primary)', color: 'white', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
                LIVE SESSION
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div className="avatar-premium" style={{ width: 44, height: 44, fontSize: '1rem' }}>
                    {post.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 900, letterSpacing: '0.5px' }}>{post.username.toUpperCase()}'S LOBBY</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{ fontSize: '10px', background: 'var(--primary-soft)', color: 'var(--primary)', padding: '2px 8px', fontWeight: 900 }}>{post.game_tag.toUpperCase()}</span>
                    </div>
                </div>
            </div>

            <p style={{ fontSize: '15px', marginBottom: '1.5rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                {post.content}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', border: '1px solid var(--glass-border)' }}>
                    <Users size={16} color="var(--accent)" />
                    <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--accent)' }}>{currentSlots} / {maxSlots} OPERATORS</span>
                </div>

                <button className={`btn sharp ${isFull ? 'ghost' : 'accent'}`} disabled={isFull} onClick={handleJoin} style={{ height: '44px', padding: '0 20px', fontSize: '11px', fontWeight: 900 }}>
                    {isFull ? 'DEPLOYED' : 'JOIN OPERATION'}
                </button>
            </div>

            {/* Decorative status indicator */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: isFull ? 'var(--text-muted)' : 'var(--accent)', opacity: 0.5 }}></div>
        </div>
    );
};
