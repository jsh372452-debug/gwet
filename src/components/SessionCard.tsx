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
        <div className="card" style={{ border: '1px solid var(--primary)', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(10, 10, 12, 0) 100%)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 12px', background: 'var(--primary)', color: 'white', fontSize: '10px', fontWeight: 900, borderBottomLeftRadius: 'var(--radius-sm)', textTransform: 'uppercase' }}>
                PLAY SESSION
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                <div className="avatar sm" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                    <Sword size={16} />
                </div>
                <div>
                    <h4 style={{ margin: 0, fontSize: 'var(--font-sm)', fontWeight: 800 }}>{post.username}'s Lobby</h4>
                    <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)' }}>{post.game_tag}</p>
                </div>
            </div>

            <p style={{ fontSize: 'var(--font-sm)', marginBottom: 'var(--space-lg)', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {post.content}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flex: 1, background: 'rgba(0,0,0,0.2)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                    <Users size={14} color="var(--accent)" />
                    <span style={{ fontSize: 'var(--font-sm)', fontWeight: 800 }}>{currentSlots} / {maxSlots} SLOTS</span>
                </div>

                <button className={`btn ${isFull ? 'ghost' : 'primary'}`} disabled={isFull} onClick={handleJoin} style={{ padding: '0.6rem 1.5rem', fontSize: '10px', fontWeight: 900 }}>
                    {isFull ? 'FULL' : 'JOIN SESSION'}
                </button>

                <button className="btn" onClick={() => {
                    const url = `${window.location.origin}?join=${squadId || ''}`;
                    navigator.clipboard.writeText(url);
                    alert('Link copied!');
                }} style={{ padding: '0.6rem' }}>
                    <Calendar size={14} />
                </button>
            </div>

            {/* Decorative pulse if not full */}
            {!isFull && <div className="pulse" style={{ position: 'absolute', bottom: 10, left: 10, width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}></div>}
        </div>
    );
};
