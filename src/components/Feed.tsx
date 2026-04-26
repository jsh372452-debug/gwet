import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { useTranslation } from '../i18n';
import Flag from './Flag';
import { UserProfile } from './UserProfile';
import { TierBadge } from './TierBadge';
import { Send, MessageSquare, Share2, Heart, Search, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const postVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }
    })
};

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

    const getLevel = (influence: number) => Math.floor(influence / 100) + 1;

    const filteredPosts = posts.filter(p =>
        (p.content?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (p.ownerName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            
            {/* Feed Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', padding: '4px' }}>
                {[
                    { key: 'smart', label: 'For You' },
                    { key: 'following', label: 'Following' }
                ].map(tab => (
                    <button 
                        key={tab.key}
                        onClick={() => setFeedType(tab.key as any)}
                        style={{ 
                            flex: 1, height: '40px', borderRadius: 'var(--radius-sm)',
                            background: feedType === tab.key ? 'var(--bg-card)' : 'transparent',
                            color: feedType === tab.key ? 'var(--text-main)' : 'var(--text-muted)',
                            border: feedType === tab.key ? '1px solid var(--border-light)' : '1px solid transparent',
                            cursor: 'pointer', fontSize: '13px', fontWeight: 600
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Compose */}
            <div className="card-professional" style={{ marginBottom: '28px' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ 
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'var(--bg-app)', border: '1px solid var(--border-light)',
                            overflow: 'hidden', flexShrink: 0
                        }}>
                            <img src={user?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.username}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <textarea 
                            className="input-standard" 
                            placeholder="Share an update..."
                            value={content} 
                            onChange={(e) => setContent(e.target.value)}
                            style={{ 
                                minHeight: '72px', resize: 'none', flex: 1,
                                fontSize: '14px', lineHeight: 1.5
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <select 
                            className="input-standard" 
                            value={tag} 
                            onChange={e => setTag(e.target.value)} 
                            style={{ width: 'auto', height: '36px', fontSize: '13px', padding: '0 12px' }}
                        >
                            <option value="Global">Global</option>
                            <option value="Competitive">Competitive</option>
                            <option value="Casual">Casual</option>
                        </select>
                        <button 
                            type="submit" className="btn-primary" 
                            style={{ height: '36px', padding: '0 20px', fontSize: '13px' }} 
                            disabled={!content.trim() || posting}
                        >
                            {posting ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Posts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {loading && posts.length === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="card-professional" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                    <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                    <div style={{ flex: 1 }}>
                                        <div className="skeleton" style={{ width: '120px', height: '14px', marginBottom: '8px' }} />
                                        <div className="skeleton" style={{ width: '80px', height: '10px' }} />
                                    </div>
                                </div>
                                <div className="skeleton" style={{ width: '100%', height: '16px', marginBottom: '8px' }} />
                                <div className="skeleton" style={{ width: '75%', height: '16px' }} />
                            </div>
                        ))}
                    </div>
                )}

                <AnimatePresence>
                    {filteredPosts.map((post, index) => (
                        <motion.div 
                            key={post.id}
                            custom={index}
                            variants={postVariants}
                            initial="hidden"
                            animate="visible"
                            className="card-professional"
                        >
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div 
                                    style={{ 
                                        width: '40px', height: '40px', cursor: 'pointer', flexShrink: 0,
                                        borderRadius: '50%', overflow: 'hidden',
                                        border: '1px solid var(--border-light)'
                                    }}
                                    onClick={() => setSelectedUserId(post.ownerId)}
                                >
                                    <img src={post.ownerAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${post.ownerName}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontWeight: 700, fontSize: '14px' }}>{post.ownerName}</span>
                                                <TierBadge tier={post.ownerInfluence > 5000 ? 'MYTHIC' : post.ownerInfluence > 2500 ? 'LEGEND' : post.ownerInfluence > 1000 ? 'DIAMOND' : 'BRONZE'} size={14} />
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {post.gameTag}
                                            </div>
                                        </div>
                                        <span style={{ 
                                            fontSize: '11px', color: 'var(--text-muted)', 
                                            padding: '2px 8px', background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '4px'
                                        }}>
                                            Lv.{getLevel(post.ownerInfluence)}
                                        </span>
                                    </div>
                                    <div style={{ marginTop: '12px', fontSize: '14px', lineHeight: 1.65, color: 'var(--text-main)' }}>
                                        {post.content}
                                    </div>
                                    
                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '20px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                                        <button 
                                            onClick={() => handleLikeToggle(post.id, post.userLiked)}
                                            style={{ 
                                                background: 'none', border: 'none', cursor: 'pointer', 
                                                display: 'flex', alignItems: 'center', gap: '6px', 
                                                color: post.userLiked ? '#f43f5e' : 'var(--text-muted)', 
                                                fontSize: '13px', fontWeight: 500, padding: '4px 0'
                                            }}
                                        >
                                            <Heart size={16} fill={post.userLiked ? '#f43f5e' : 'none'} /> {post.likeCount || 0}
                                        </button>
                                        <button 
                                            onClick={() => handleToggleComments(post.id)}
                                            style={{ 
                                                background: 'none', border: 'none', cursor: 'pointer', 
                                                display: 'flex', alignItems: 'center', gap: '6px', 
                                                color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500, padding: '4px 0'
                                            }}
                                        >
                                            <MessageSquare size={16} /> {post.replyCount || 0}
                                        </button>
                                        <button style={{ 
                                            background: 'none', border: 'none', cursor: 'pointer', 
                                            display: 'flex', alignItems: 'center', gap: '6px', 
                                            color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500, padding: '4px 0'
                                        }}>
                                            <Share2 size={16} />
                                        </button>
                                    </div>

                                    {/* Comments */}
                                    <AnimatePresence>
                                        {expandedPost === post.id && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                                style={{ overflow: 'hidden', marginTop: '12px' }}
                                            >
                                                <div style={{ 
                                                    padding: '16px', background: 'rgba(255,255,255,0.02)', 
                                                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)'
                                                }}>
                                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                                        <input 
                                                            className="input-standard" 
                                                            placeholder="Write a reply..."
                                                            value={commentText} 
                                                            onChange={e => setCommentText(e.target.value)}
                                                            onKeyDown={e => { if (e.key === 'Enter') handleCommentSubmit(post.id); }}
                                                            style={{ height: '36px', fontSize: '13px', flex: 1 }}
                                                        />
                                                        <button 
                                                            onClick={() => handleCommentSubmit(post.id)} 
                                                            className="btn-primary"
                                                            style={{ height: '36px', padding: '0 14px' }}
                                                        >
                                                            <Send size={14} />
                                                        </button>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                        {(comments[post.id] || []).map((c, ci) => (
                                                            <motion.div 
                                                                key={c.id} 
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: ci * 0.05 }}
                                                                style={{ display: 'flex', gap: '10px' }}
                                                            >
                                                                <div style={{ 
                                                                    width: '24px', height: '24px', borderRadius: '50%',
                                                                    overflow: 'hidden', border: '1px solid var(--border-light)', flexShrink: 0
                                                                }}>
                                                                    <img src={c.ownerAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${c.ownerName}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>{c.ownerName}</div>
                                                                    <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{c.content}</div>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {selectedUserId && (
                <UserProfile userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
            )}
        </div>
    );
};
