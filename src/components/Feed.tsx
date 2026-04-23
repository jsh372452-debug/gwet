import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { useTranslation } from '../i18n';
import Flag from './Flag';
import { UserProfile } from './UserProfile';
import { TierBadge } from './TierBadge';
import { Send, MessageSquare, Share2, Flame, Search, X, Loader, Users, Zap, Image as ImageIcon } from 'lucide-react';

export const Feed: React.FC = () => {
    const { user } = useAuthStore();
    const { posts, addPost, likePost, unlikePost, addComment, loadComments, comments, loadFeed, setFeedType, feedType, interacting, loading } = useGameStore();
    const { t, isRTL } = useTranslation();

    const [content, setContent] = useState('');
    const [tag, setTag] = useState('Global');
    const [mediaUrl, setMediaUrl] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedPost, setExpandedPost] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');
    const [posting, setPosting] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    useEffect(() => { loadFeed(feedType); }, [loadFeed, feedType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !user || posting) return;
        setPosting(true);
        try {
            await addPost(content, tag, mediaUrl);
            setContent('');
            setMediaUrl('');
        } finally {
            setPosting(false);
        }
    };

    const handleToggleComments = async (postId: string) => {
        if (expandedPost === postId) {
            setExpandedPost(null);
        } else {
            setExpandedPost(postId);
            await loadComments(postId);
        }
    };

    const handleCommentSubmit = async (postId: string) => {
        if (!commentText.trim()) return;
        await addComment(postId, commentText);
        setCommentText('');
    };

    const handleLikeToggle = async (postId: string, userLiked: boolean) => {
        if (interacting) return;
        userLiked ? await unlikePost(postId) : await likePost(postId);
    };

    const getTier = (influence: number) => {
        if (influence > 5000) return 'MYTHIC';
        if (influence > 2500) return 'LEGEND';
        if (influence > 1000) return 'DIAMOND';
        return 'BRONZE';
    };

    const filteredPosts = posts.filter(p =>
        (p.content?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (p.ownerName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', fontFamily: 'JetBrains Mono, monospace' }}>
            
            {/* Feed Selection */}
            <div style={{ display: 'flex', gap: '1px', background: 'var(--border-subtle)', marginBottom: '32px', border: '1px solid var(--border-subtle)' }}>
                <button 
                    onClick={() => setFeedType('smart')}
                    style={{ 
                        flex: 1, height: '44px', background: feedType === 'smart' ? 'var(--text-primary)' : 'var(--bg-surface)',
                        color: feedType === 'smart' ? 'var(--bg-deep)' : 'var(--text-secondary)',
                        border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 800, letterSpacing: '1px'
                    }}
                >
                    [ INTEL_STREAM ]
                </button>
                <button 
                    onClick={() => setFeedType('following')}
                    style={{ 
                        flex: 1, height: '44px', background: feedType === 'following' ? 'var(--text-primary)' : 'var(--bg-surface)',
                        color: feedType === 'following' ? 'var(--bg-deep)' : 'var(--text-secondary)',
                        border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 800, letterSpacing: '1px'
                    }}
                >
                    [ SQUAD_ACTIVITY ]
                </button>
            </div>

            {/* Terminal Input */}
            <div className="card" style={{ padding: '24px', marginBottom: '40px', borderLeft: '4px solid var(--text-primary)' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', flexShrink: 0 }}>
                            <img src={user?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.username}`} style={{ width: '100%', height: '100%' }} />
                        </div>
                        <textarea 
                            className="input" 
                            placeholder="ENCRYPT_MESSAGE_FOR_BROADCAST..." 
                            value={content} 
                            onChange={(e) => setContent(e.target.value)}
                            style={{ minHeight: '80px', padding: '12px', resize: 'none', background: 'var(--bg-input)', fontSize: '13px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <select 
                            className="input" 
                            value={tag} 
                            onChange={e => setTag(e.target.value)} 
                            style={{ width: 'auto', height: '36px', fontSize: '10px', fontWeight: 800, padding: '0 12px', textTransform: 'uppercase' }}
                        >
                            <option value="Global">GLOBAL_NET</option>
                            <option value="Competitive">COMPETITIVE</option>
                            <option value="Casual">CASUAL</option>
                        </select>
                        <button type="submit" className="btn" style={{ height: '36px', padding: '0 32px', background: 'var(--text-primary)', color: 'var(--bg-deep)', fontWeight: 900, fontSize: '11px', letterSpacing: '2px' }} disabled={!content.trim() || posting}>
                            {posting ? 'SYNCHING...' : 'TRANSMIT_SIGNAL'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Data Blocks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {loading && posts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                        <Loader size={24} className="spinner" />
                        <div style={{ marginTop: '20px', fontSize: '10px', fontWeight: 800, letterSpacing: '2px' }}>DECRYPTING_FEED_DATA...</div>
                    </div>
                )}

                {filteredPosts.map(post => (
                    <div key={post.id} className="card" style={{ padding: '24px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div 
                                style={{ width: '48px', height: '48px', cursor: 'pointer', flexShrink: 0, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                                onClick={() => setSelectedUserId(post.ownerId)}
                            >
                                <img src={post.ownerAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${post.ownerName}`} style={{ width: '100%', height: '100%' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontWeight: 900, fontSize: '13px', letterSpacing: '1px' }}>{post.ownerName?.toUpperCase()}</span>
                                            <TierBadge tier={getTier(post.ownerInfluence)} size={14} />
                                        </div>
                                        <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px', letterSpacing: '1px' }}>
                                            {new Date(post.createdAt).toLocaleTimeString()} // SECTOR_{post.gameTag?.toUpperCase()}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '9px', fontWeight: 800, padding: '4px 8px', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                                        LVL_{Math.floor(post.ownerInfluence / 100) + 1}
                                    </div>
                                </div>
                                <div style={{ marginTop: '16px', fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                                    {post.content}
                                </div>
                                
                                {/* Data Actions */}
                                <div style={{ display: 'flex', gap: '24px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                                    <button 
                                        onClick={() => handleLikeToggle(post.id, post.userLiked)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: post.userLiked ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '11px', fontWeight: 800 }}
                                    >
                                        <Zap size={14} fill={post.userLiked ? 'var(--text-primary)' : 'none'} /> {post.likeCount || 0}
                                    </button>
                                    <button 
                                        onClick={() => handleToggleComments(post.id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 800 }}
                                    >
                                        <MessageSquare size={14} /> {post.replyCount || 0}
                                    </button>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 800 }}>
                                        <Share2 size={14} />
                                    </button>
                                </div>

                                {/* Thread Expansion */}
                                {expandedPost === post.id && (
                                    <div style={{ marginTop: '20px', padding: '20px', background: 'var(--bg-input)', borderLeft: '2px solid var(--border-subtle)' }}>
                                        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                                            <input 
                                                className="input" 
                                                placeholder="SECURE_REPLY..."
                                                value={commentText} 
                                                onChange={e => setCommentText(e.target.value)}
                                                onKeyDown={e => { if (e.key === 'Enter') handleCommentSubmit(post.id); }}
                                                style={{ height: '36px', fontSize: '12px' }}
                                            />
                                            <button onClick={() => handleCommentSubmit(post.id)} style={{ height: '36px', padding: '0 16px', background: 'var(--text-primary)', color: 'var(--bg-deep)', border: 'none', fontWeight: 900 }}>
                                                <Send size={14} />
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {(comments[post.id] || []).map(c => (
                                                <div key={c.id} style={{ display: 'flex', gap: '12px' }}>
                                                    <div style={{ width: '24px', height: '24px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', flexShrink: 0 }}>
                                                        <img src={c.ownerAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${c.ownerName}`} style={{ width: '100%', height: '100%' }} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '11px', fontWeight: 800, marginBottom: '4px' }}>{c.ownerName?.toUpperCase()}</div>
                                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.content}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedUserId && (
                <UserProfile userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
            )}
        </div>
    );
};
