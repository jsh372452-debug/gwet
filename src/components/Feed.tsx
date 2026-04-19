import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { useTranslation } from '../i18n';
import Flag from './Flag';
import { UserProfile } from './UserProfile';
import { TierBadge } from './TierBadge';
import { Send, MessageSquare, Share2, Flame, Search, X, Loader, Users, Zap } from 'lucide-react';

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
        
        if (!content.trim()) {
            alert(isRTL ? 'المحتوى غير موجود!' : 'CONTENT IS EMPTY!');
            return;
        }
        if (!user || posting) return;

        setPosting(true);
        try {
            await addPost(content, tag, mediaUrl);
            setContent('');
            setMediaUrl('');
        } catch (err: any) {
            alert(isRTL ? `خطأ في النشر: ${err.message}` : `PUBLISH ERROR: ${err.message}`);
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
        <div className="page-container" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            {/* Search */}
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem', padding: '10px 15px' }}>
                <Search size={16} color="var(--primary)" />
                <input className="gaming-input" placeholder={t('search').toUpperCase()} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    style={{ border: 'none', background: 'none', padding: 0, margin: 0, height: 'auto', flex: 1 }} />
                {searchQuery && <X size={16} style={{ cursor: 'pointer', color: 'var(--text-dim)' }} onClick={() => setSearchQuery('')} />}
            </div>

            {/* Feed Sort Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
                <button className={`btn ${feedType === 'smart' ? 'primary' : 'ghost'} `} onClick={() => setFeedType('smart')} style={{ flex: 1 }}>
                    <Zap size={14} style={{ marginRight: 8 }} /> SMART FEED
                </button>
                <button className={`btn ${feedType === 'following' ? 'primary' : 'ghost'} `} onClick={() => setFeedType('following')} style={{ flex: 1 }}>
                    <Users size={14} style={{ marginRight: 8 }} /> FOLLOWING
                </button>
            </div>

            {/* Compose */}
            <div className="glass-card premium-pattern" style={{ marginBottom: '2.5rem', borderLeft: '4px solid var(--primary)' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.25rem' }}>
                        <div className="avatar-premium" style={{ width: 44, height: 44 }}>
                            {user?.avatarUrl ? <img src={user.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user?.displayName?.[0] || 'G').toUpperCase()}
                        </div>
                        <textarea className="gaming-input" placeholder={isRTL ? 'شارك لحظتك الأخيرة...' : 'SHARE YOUR ELITE MOMENT...'} value={content} onChange={(e) => setContent(e.target.value)}
                            style={{ minHeight: '80px', margin: 0 }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <select className="gaming-input" value={tag} onChange={e => setTag(e.target.value)} style={{ width: 'auto', padding: '5px 10px', height: '35px', margin: 0 }}>
                            <option value="Global">Global</option>
                            <option value="Valorant">Valorant</option>
                            <option value="LoL">League of Legends</option>
                            <option value="CS2">CS2</option>
                        </select>
                        <button type="submit" className="btn primary" disabled={!content.trim() || posting}>
                            {posting ? <Loader size={14} className="spinner" /> : t('gweet').toUpperCase()}
                        </button>
                    </div>
                </form>
            </div>

            {/* Posts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '4rem' }}>
                {loading && (posts || []).length === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="glass-card sharp" style={{ height: '160px', opacity: 0.5 }}>
                                <div className="skeleton" style={{ width: '40px', height: '40px', marginBottom: '1rem' }} />
                                <div className="skeleton" style={{ width: '60%', height: '14px', marginBottom: '0.5rem' }} />
                                <div className="skeleton" style={{ width: '90%', height: '14px' }} />
                            </div>
                        ))}
                    </div>
                )}

                {(filteredPosts || []).length === 0 && !loading && (
                    <div className="glass-card sharp" style={{ textAlign: 'center', padding: '4rem' }}>
                        <MessageSquare size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <h3 style={{ margin: 0, opacity: 0.5 }}>NO TRANSMISSIONS YET</h3>
                    </div>
                )}

                {filteredPosts.map(post => (
                    <div key={post.id} className="glass-card sharp premium-pattern" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '1.25rem' }}>
                            <div className="avatar-premium" style={{ width: 44, height: 44, fontSize: '1rem', cursor: 'pointer' }} onClick={() => setSelectedUserId(post.ownerId)}>
                                {post.ownerAvatar ? <img src={post.ownerAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : post.ownerName?.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontWeight: 900, cursor: 'pointer', letterSpacing: '0.5px' }} onClick={() => setSelectedUserId(post.ownerId)}>{(post.ownerName || 'ANON').toUpperCase()}</span>
                                        <TierBadge tier={getTier(post.ownerInfluence)} size={20} />
                                    </div>
                                    {post.gameTag && post.gameTag !== 'Global' && (
                                        <span style={{ fontSize: '10px', background: 'var(--primary-soft)', color: 'var(--primary)', padding: '2px 8px', fontWeight: 900 }}>{(post.gameTag || '').toUpperCase()}</span>
                                    )}
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: 'auto', fontWeight: 700 }}>
                                        {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div style={{ marginTop: '1rem', color: 'var(--text-main)', lineHeight: 1.6, fontSize: '15px' }}>{post.content}</div>
                                {post.mediaUrl && <img src={post.mediaUrl} style={{ width: '100%', marginTop: '1rem', borderRadius: '8px' }} />}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                            <button className="btn ghost sm" onClick={() => handleLikeToggle(post.id, post.userLiked)} disabled={interacting} style={{ fontWeight: 900, color: post.userLiked ? 'var(--primary)' : 'var(--text-muted)' }}>
                                <Flame size={16} fill={post.userLiked ? 'var(--primary)' : 'none'} /> {post.likeCount || 0}
                            </button>
                            <button className="btn ghost sm" onClick={() => handleToggleComments(post.id)} style={{ fontWeight: 900 }}>
                                <MessageSquare size={16} /> {post.replyCount || comments[post.id]?.length || 0}
                            </button>
                            <button className="btn ghost sm"><Share2 size={16} /> {post.shareCount || 0}</button>
                            {/* Show Score badge just for coolness */}
                            <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 900, color: 'var(--accent)', opacity: 0.8, display: 'flex', alignItems: 'center' }}>
                                AAG SCORE: {Math.round(post.score)}
                            </span>
                        </div>

                        {expandedPost === post.id && (
                            <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
                                    <input className="gaming-input" placeholder={isRTL ? 'اكتب تعليقك...' : 'APPEND COMMENT...'} value={commentText} onChange={e => setCommentText(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleCommentSubmit(post.id); }}
                                        style={{ flex: 1, margin: 0, height: '36px', fontSize: '13px' }} />
                                    <button className="btn primary sharp sm" onClick={() => handleCommentSubmit(post.id)}><Send size={14} /></button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {comments[post.id]?.map(c => (
                                        <div key={c.id} style={{ display: 'flex', gap: '12px' }}>
                                            <div className="avatar-premium" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                                                {c.ownerAvatar ? <img src={c.ownerAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : c.ownerName.charAt(0)}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.5px' }}>{(c.ownerName || 'ANON').toUpperCase()}</span>
                                                    <TierBadge tier={getTier(c.ownerInfluence)} size={14} />
                                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p style={{ fontSize: '14px', margin: 0, color: 'var(--text-main)' }}>{c.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!comments[post.id] || comments[post.id].length === 0) && (
                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 700 }}>NO COMMENTS DETECTED</p>
                                    )}
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
