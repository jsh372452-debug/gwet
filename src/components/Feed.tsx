import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGameStore, Post } from '../store/gameStore';
import { useTranslation } from '../i18n';
import Flag from './Flag';
import { Image as ImageIcon, Send, MessageSquare, Share2, Trophy, Tag, Search, X, Loader } from 'lucide-react';

export const Feed: React.FC = () => {
    const { user } = useAuthStore();
    const { posts, addPost, wowPost, addComment, loadComments, comments, loadPosts, loading } = useGameStore();
    const { t, isRTL } = useTranslation();

    const [content, setContent] = useState('');
    const [tag, setTag] = useState('Global');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedPost, setExpandedPost] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');
    const [posting, setPosting] = useState(false);

    useEffect(() => { loadPosts(); }, [loadPosts]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !user || posting) return;
        setPosting(true);
        try {
            const result = await addPost(content, tag);
            if (result) {
                useAuthStore.getState().setUser({ ...user, xp: result.xp, level: result.level, rank: result.rank });
            }
            setContent('');
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

    const filteredPosts = posts.filter(p =>
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.game_tag.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="page-container" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            {/* Search */}
            <div className="card compact" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <Search size={16} color="var(--text-muted)" />
                <input className="input" placeholder={t('search')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    style={{ border: 'none', background: 'none', boxShadow: 'none', padding: '0.3rem 0' }} />
                {searchQuery && <X size={16} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSearchQuery('')} />}
            </div>

            {/* Compose */}
            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                        <div className="avatar md" style={{ backgroundImage: user?.avatarUrl ? `url(${user.avatarUrl})` : 'none' }}>
                            {!user?.avatarUrl && (user?.displayName?.[0] || 'G').toUpperCase()}
                        </div>
                        <textarea className="input" placeholder={t('share')} value={content} onChange={(e) => setContent(e.target.value)}
                            style={{ minHeight: '70px' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="btn-group">
                            <button type="button" className="btn" style={{ fontSize: 'var(--font-xs)' }}>
                                <Tag size={14} /> {tag}
                            </button>
                        </div>
                        <button type="submit" className="btn primary" disabled={!content.trim() || posting}>
                            {posting ? <Loader size={14} /> : null} {t('gweet')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Posts */}
            {loading && posts.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card">
                            <div style={{ display: 'flex', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                                <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)' }} />
                                <div style={{ flex: 1 }}>
                                    <div className="skeleton" style={{ width: '30%', height: 14, marginBottom: 8 }} />
                                    <div className="skeleton" style={{ width: '80%', height: 14 }} />
                                </div>
                            </div>
                            <div className="skeleton" style={{ height: 60 }} />
                        </div>
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', paddingBottom: 'var(--space-3xl)' }}>
                {filteredPosts.length === 0 && !loading && (
                    <div className="empty-state">
                        <MessageSquare size={40} className="icon" />
                        <h3>No posts yet</h3>
                        <p>Be the first to share something!</p>
                    </div>
                )}

                {filteredPosts.map((post) => (
                    <div key={post.id} className="card">
                        <div style={{ display: 'flex', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                            <div className="avatar md" style={{ fontSize: 'var(--font-base)' }}>
                                {post.username?.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                    <Flag code={post.country || 'Global'} size={18} />
                                    <span style={{ fontWeight: 700 }}>{post.username}</span>
                                    {post.game_tag && post.game_tag !== 'Global' && (
                                        <span className="badge accent" style={{ marginLeft: '4px' }}>{post.game_tag}</span>
                                    )}
                                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                        {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div style={{ marginTop: 'var(--space-md)', color: 'var(--text)', lineHeight: 1.6 }}>{post.content}</div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 'var(--space-xl)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border)' }}>
                            <button className="btn ghost" onClick={() => wowPost(post.id)}>
                                <Trophy size={16} style={{ color: (post.wow_count || 0) > 0 ? 'var(--primary)' : 'inherit' }} /> {post.wow_count || 0}
                            </button>
                            <button className="btn ghost" onClick={() => handleToggleComments(post.id)}>
                                <MessageSquare size={16} /> {comments[post.id]?.length || 0}
                            </button>
                            <button className="btn ghost"><Share2 size={16} /></button>
                        </div>

                        {/* Comments */}
                        {expandedPost === post.id && (
                            <div style={{ marginTop: 'var(--space-lg)' }}>
                                <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                                    <input className="input" placeholder={t('comment')} value={commentText} onChange={e => setCommentText(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleCommentSubmit(post.id); }}
                                        style={{ flex: 1 }} />
                                    <button className="btn primary icon-only" onClick={() => handleCommentSubmit(post.id)}><Send size={14} /></button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', paddingLeft: isRTL ? 0 : 'var(--space-lg)', paddingRight: isRTL ? 'var(--space-lg)' : 0, borderLeft: isRTL ? 'none' : '2px solid var(--border)', borderRight: isRTL ? '2px solid var(--border)' : 'none' }}>
                                    {comments[post.id]?.map(c => (
                                        <div key={c.id} style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                            <div className="avatar sm">{c.username.charAt(0)}</div>
                                            <div style={{ flex: 1, background: 'var(--bg-hover)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                                                    <Flag code={c.country || 'Global'} size={14} />
                                                    <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--primary)' }}>{c.username}</span>
                                                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p style={{ fontSize: 'var(--font-base)', margin: 0 }}>{c.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!comments[post.id] || comments[post.id].length === 0) && (
                                        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-md)' }}>No comments yet</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
