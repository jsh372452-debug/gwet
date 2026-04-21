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
            <div className="card" style={{ padding: '20px', marginBottom: '32px', borderLeft: '4px solid var(--brand-electric)' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <div className="avatar" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                            {user?.avatarUrl ? <img src={user.avatarUrl} /> : (user?.displayName?.[0] || 'G').toUpperCase()}
                        </div>
                        <textarea 
                            className="input" 
                            placeholder={t('share')} 
                            value={content} 
                            onChange={(e) => setContent(e.target.value)}
                            style={{ minHeight: '100px', padding: '12px', resize: 'none', background: 'var(--bg-input)' }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select 
                                className="input" 
                                value={tag} 
                                onChange={e => setTag(e.target.value)} 
                                style={{ width: 'auto', height: '36px', fontSize: '13px', padding: '0 12px' }}
                            >
                                <option value="Global">Global</option>
                                <option value="Valorant">Valorant</option>
                                <option value="LoL">League of Legends</option>
                                <option value="CS2">CS2</option>
                            </select>
                            <button type="button" className="btn btn-ghost btn-icon" style={{ width: '36px', height: '36px' }}>
                                <ImageIcon size={18} />
                            </button>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ height: '36px', padding: '0 24px' }} disabled={!content.trim() || posting}>
                            {posting ? <Loader size={16} className="spinner" /> : t('gweet')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Posts List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {loading && posts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        <Loader size={32} className="spinner" />
                        <p style={{ marginTop: '16px', fontWeight: 700 }}>SYNCHRONIZING WITH STORM FEED...</p>
                    </div>
                )}

                {filteredPosts.map(post => (
                    <div key={post.id} className="card interactive" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div 
                                className="avatar" 
                                style={{ width: '44px', height: '44px', cursor: 'pointer', flexShrink: 0 }}
                                onClick={() => setSelectedUserId(post.ownerId)}
                            >
                                {post.ownerAvatar ? <img src={post.ownerAvatar} /> : post.ownerName?.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span 
                                                style={{ fontWeight: 800, cursor: 'pointer', fontSize: '15px' }} 
                                                onClick={() => setSelectedUserId(post.ownerId)}
                                            >
                                                {post.ownerName || 'ANON'}
                                            </span>
                                            <TierBadge tier={getTier(post.ownerInfluence)} size={18} />
                                            <Flag code={post.ownerCountry || 'Global'} size={14} />
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                            {new Date(post.createdAt).toLocaleDateString()} · {post.gameTag}
                                        </div>
                                    </div>
                                    <div className="chip chip-info" style={{ fontSize: '10px' }}>
                                        LVL {Math.floor(post.ownerInfluence / 100) + 1}
                                    </div>
                                </div>
                                <div style={{ marginTop: '16px', fontSize: '15px', lineHeight: 1.6, wordBreak: 'break-word' }}>
                                    {post.content}
                                </div>
                                {post.mediaUrl && (
                                    <div style={{ marginTop: '16px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                                        <img src={post.mediaUrl} style={{ width: '100%', display: 'block' }} />
                                    </div>
                                )}

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '24px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                                    <button 
                                        className="btn btn-ghost" 
                                        onClick={() => handleLikeToggle(post.id, post.userLiked)}
                                        style={{ height: '32px', color: post.userLiked ? 'var(--brand-electric)' : 'var(--text-secondary)' }}
                                    >
                                        <Flame size={16} fill={post.userLiked ? 'var(--brand-electric)' : 'none'} /> {post.likeCount || 0}
                                    </button>
                                    <button 
                                        className="btn btn-ghost" 
                                        onClick={() => handleToggleComments(post.id)}
                                        style={{ height: '32px' }}
                                    >
                                        <MessageSquare size={16} /> {post.replyCount || 0}
                                    </button>
                                    <button className="btn btn-ghost" style={{ height: '32px' }}>
                                        <Share2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Comments Drawer */}
                        {expandedPost === post.id && (
                            <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-input)', borderRadius: '10px' }}>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                                    <input 
                                        className="input" 
                                        placeholder={t('comment')}
                                        value={commentText} 
                                        onChange={e => setCommentText(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleCommentSubmit(post.id); }}
                                        style={{ height: '36px' }}
                                    />
                                    <button className="btn btn-primary" onClick={() => handleCommentSubmit(post.id)} style={{ padding: '0 16px' }}>
                                        <Send size={14} />
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {(comments[post.id] || []).map(c => (
                                        <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
                                            <div className="avatar" style={{ width: '28px', height: '28px' }}>
                                                {c.ownerAvatar ? <img src={c.ownerAvatar} /> : c.ownerName.charAt(0)}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '2px' }}>
                                                    <span style={{ fontSize: '12px', fontWeight: 700 }}>{c.ownerName}</span>
                                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleTimeString()}</span>
                                                </div>
                                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{c.content}</p>
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
