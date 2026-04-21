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
        
        if (!content.trim()) return;
        if (!user || posting) return;

        setPosting(true);
        try {
            await addPost(content, tag, mediaUrl);
            setContent('');
            setMediaUrl('');
        } catch (err: any) {
            console.error('Publish error:', err);
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
        if (userLiked) {
            await unlikePost(postId);
        } else {
            await likePost(postId);
        }
    };

    const getTier = (influence: number) => {
        if (influence > 5000) return 'MYTHIC';
        if (influence > 2500) return 'LEGEND';
        if (influence > 1000) return 'DIAMOND';
        if (influence > 500) return 'PLATINUM';
        if (influence > 250) return 'GOLD';
        if (influence > 100) return 'SILVER';
        return 'BRONZE';
    };

    const filteredPosts = posts.filter(p =>
        (p.content?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (p.ownerName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (p.gameTag?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', direction: isRTL ? 'rtl' : 'ltr' }}>
            
            {/* Feed Type Switcher */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <button 
                    onClick={() => setFeedType('smart')}
                    className={`btn ${feedType === 'smart' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ flex: 1, height: '40px' }}
                >
                    <Zap size={16} fill={feedType === 'smart' ? 'white' : 'none'} /> {t('latest')}
                </button>
                <button 
                    onClick={() => setFeedType('following')}
                    className={`btn ${feedType === 'following' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ flex: 1, height: '40px' }}
                >
                    <Users size={16} fill={feedType === 'following' ? 'white' : 'none'} /> {t('joined')}
                </button>
            </div>

            {/* Compose Area */}
            <div className="card" style={{ padding: '20px', marginBottom: '32px', borderLeft: '1px solid var(--text-primary)' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <div className="avatar" style={{ width: '48px', height: '48px', flexShrink: 0, borderRadius: '0' }}>
                            {user?.avatarUrl ? <img src={user.avatarUrl} /> : (user?.displayName?.[0] || 'G').toUpperCase()}
                        </div>
                        <textarea 
                            className="input" 
                            placeholder={t('share')} 
                            value={content} 
                            onChange={(e) => setContent(e.target.value)}
                            style={{ minHeight: '100px', padding: '12px', resize: 'none', background: 'var(--bg-input)', borderRadius: '0' }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select 
                                className="input" 
                                value={tag} 
                                onChange={e => setTag(e.target.value)} 
                                style={{ width: 'auto', height: '36px', fontSize: '11px', fontWeight: 700, padding: '0 12px', borderRadius: '0', textTransform: 'uppercase' }}
                            >
                                <option value="Global">Global</option>
                                <option value="Valorant">Valorant</option>
                                <option value="LoL">League of Legends</option>
                                <option value="CS2">CS2</option>
                            </select>
                            <button type="button" className="btn btn-ghost btn-icon" style={{ width: '36px', height: '36px', borderRadius: '0' }}>
                                <ImageIcon size={18} />
                            </button>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ height: '36px', padding: '0 24px', background: 'var(--text-primary)', color: 'var(--bg-deep)', borderRadius: '0' }} disabled={!content.trim() || posting}>
                            {posting ? <Loader size={16} className="spinner" /> : 'TRANSMIT'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Posts List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {loading && posts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        <Loader size={32} className="spinner" />
                        <p style={{ marginTop: '16px', fontWeight: 800, fontSize: '10px', letterSpacing: '2px' }}>SYNCHRONIZING_STORM_FEED...</p>
                    </div>
                )}

                {filteredPosts.map(post => (
                    <div key={post.id} className="card interactive" style={{ padding: '24px', borderRadius: '0' }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div 
                                className="avatar" 
                                style={{ width: '44px', height: '44px', cursor: 'pointer', flexShrink: 0, borderRadius: '0' }}
                                onClick={() => setSelectedUserId(post.ownerId)}
                            >
                                {post.ownerAvatar ? <img src={post.ownerAvatar} /> : post.ownerName?.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span 
                                                style={{ fontWeight: 800, cursor: 'pointer', fontSize: '14px', letterSpacing: '0.5px' }} 
                                                onClick={() => setSelectedUserId(post.ownerId)}
                                            >
                                                {post.ownerName || 'ANON'}
                                            </span>
                                            <TierBadge tier={getTier(post.ownerInfluence)} size={16} />
                                        </div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {new Date(post.createdAt).toLocaleDateString()} · {post.gameTag}
                                        </div>
                                    </div>
                                    <div className="chip" style={{ fontSize: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                                        LVL {Math.floor(post.ownerInfluence / 100) + 1}
                                    </div>
                                </div>
                                <div style={{ marginTop: '16px', fontSize: '14px', lineHeight: 1.6, wordBreak: 'break-word', color: 'var(--text-primary)' }}>
                                    {post.content}
                                </div>
                                {post.mediaUrl && (
                                    <div style={{ marginTop: '16px', borderRadius: '0', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                                        <img src={post.mediaUrl} style={{ width: '100%', display: 'block' }} />
                                    </div>
                                )}

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '16px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                                    <button 
                                        className="btn btn-ghost" 
                                        onClick={() => handleLikeToggle(post.id, post.userLiked)}
                                        style={{ height: '32px', color: post.userLiked ? 'var(--text-primary)' : 'var(--text-muted)', border: 'none', background: 'transparent', padding: '0 8px' }}
                                    >
                                        <Flame size={14} fill={post.userLiked ? 'var(--text-primary)' : 'none'} /> {post.likeCount || 0}
                                    </button>
                                    <button 
                                        className="btn btn-ghost" 
                                        onClick={() => handleToggleComments(post.id)}
                                        style={{ height: '32px', color: 'var(--text-muted)', border: 'none', background: 'transparent', padding: '0 8px' }}
                                    >
                                        <MessageSquare size={14} /> {post.replyCount || 0}
                                    </button>
                                    <button className="btn btn-ghost" style={{ height: '32px', color: 'var(--text-muted)', border: 'none', background: 'transparent', padding: '0 8px' }}>
                                        <Share2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Comments Drawer */}
                        {expandedPost === post.id && (
                            <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-input)', borderRadius: '0', borderLeft: '1px solid var(--border-subtle)' }}>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                    <input 
                                        className="input" 
                                        placeholder="Enter secure message..."
                                        value={commentText} 
                                        onChange={e => setCommentText(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleCommentSubmit(post.id); }}
                                        style={{ height: '36px', borderRadius: '0', fontSize: '13px' }}
                                    />
                                    <button className="btn btn-primary" onClick={() => handleCommentSubmit(post.id)} style={{ padding: '0 16px', borderRadius: '0', background: 'var(--text-primary)', color: 'var(--bg-deep)' }}>
                                        <Send size={14} />
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {(comments[post.id] || []).map(c => (
                                        <div key={c.id} style={{ display: 'flex', gap: '12px' }}>
                                            <div className="avatar" style={{ width: '24px', height: '24px', borderRadius: '0' }}>
                                                {c.ownerAvatar ? <img src={c.ownerAvatar} /> : c.ownerName.charAt(0)}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                                    <span style={{ fontSize: '12px', fontWeight: 800 }}>{c.ownerName}</span>
                                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{new Date(c.createdAt).toLocaleTimeString()}</span>
                                                </div>
                                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {selectedUserId && (
                <UserProfile userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
            )}
        </div>
    );
};
