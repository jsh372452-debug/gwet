import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGameStore, Post } from '../store/gameStore';
import { useTranslation } from '../i18n';
import Flag from './Flag';
import { SessionCard } from './SessionCard';
import { UserProfile } from './UserProfile';
import { TierBadge } from './TierBadge';
import { Image as ImageIcon, Send, MessageSquare, Share2, Flame, Tag, Search, X, Loader, Sword, Users, Zap } from 'lucide-react';

export const Feed: React.FC = () => {
    const { user } = useAuthStore();
    const { posts, addPost, firePost, addComment, loadComments, comments, loadPosts, loading } = useGameStore();
    const { t, isRTL } = useTranslation();

    const [content, setContent] = useState('');
    const [tag, setTag] = useState('Global');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedPost, setExpandedPost] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');
    const [posting, setPosting] = useState(false);
    const [isSession, setIsSession] = useState(false);
    const [maxSlots, setMaxSlots] = useState(5);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [sort, setSort] = useState<'latest' | 'fire'>('fire');

    useEffect(() => { loadPosts(undefined, sort); }, [loadPosts, sort]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('🚀 SUBMITTING POST...', { content, tag, isSession, user: user?.id });

        if (!content.trim()) {
            alert(isRTL ? 'المحتوى غير موجود!' : 'CONTENT IS EMPTY!');
            return;
        }
        if (!user || posting) return;

        setPosting(true);
        try {
            const metadata = isSession ? { maxSlots, currentSlots: 1 } : {};
            console.log('📡 CALLING addPost API...', { content, tag, type: isSession ? 'session' : 'normal', metadata });

            const result = await addPost(content, tag, isSession ? 'session' : 'normal', metadata);

            if (result && result.post) {
                console.log('✅ POST CREATED SUCCESSFULLY:', result.post);
                setContent('');
                setIsSession(false);
                // Optional: alert(isRTL ? 'تم النشر بنجاح!' : 'POST PUBLISHED!');
            } else {
                console.warn('⚠️ POST CREATION RETURNED NO DATA');
                alert(isRTL ? 'فشل النشر: لم يتم استلام بيانات من الخادم' : 'PUBLISH FAILED: NO DATA FROM SERVER');
            }
        } catch (err: any) {
            console.error('❌ SUBMISSION ERROR:', err);
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

    const filteredPosts = posts.filter(p =>
        (p.content?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (p.username?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (p.game_tag?.toLowerCase() || '').includes(searchQuery.toLowerCase())
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
                <button className={`btn ${sort === 'fire' ? 'primary' : 'ghost'} `} onClick={() => setSort('fire')} style={{ flex: 1 }}>
                    <Flame size={14} style={{ marginRight: 8 }} /> {t('popular').toUpperCase()}
                </button>
                <button className={`btn ${sort === 'latest' ? 'primary' : 'ghost'} `} onClick={() => setSort('latest')} style={{ flex: 1 }}>
                    <Zap size={14} style={{ marginRight: 8 }} /> {t('latest').toUpperCase()}
                </button>
            </div>

            {/* Compose */}
            <div className="glass-card" style={{ marginBottom: '2.5rem', borderLeft: '4px solid var(--primary)' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.25rem' }}>
                        <div className="avatar-premium" style={{ width: 44, height: 44 }}>
                            {user?.avatarUrl ? <img src={user.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user?.displayName?.[0] || 'G').toUpperCase()}
                        </div>
                        <textarea className="gaming-input" placeholder={isRTL ? 'شارك لحظتك الأخيرة...' : 'SHARE YOUR ELITE MOMENT...'} value={content} onChange={(e) => setContent(e.target.value)}
                            style={{ minHeight: '80px', margin: 0 }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="button" className={`btn sm ${isSession ? 'primary' : 'ghost'} `} onClick={() => setIsSession(!isSession)}>
                                <Sword size={12} /> {isSession ? 'SESSION' : 'NORMAL'}
                            </button>
                        </div>
                        <button type="submit" className="btn primary" disabled={!content.trim() || posting}>
                            {posting ? <Loader size={14} className="spinner" /> : t('gweet').toUpperCase()}
                        </button>
                    </div>
                    {isSession && (
                        <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', border: '1px dashed var(--glass-border)' }}>
                            <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--accent)' }}>AVAILABLE SLOTS:</span>
                            <input type="number" className="gaming-input" value={maxSlots} onChange={e => setMaxSlots(parseInt(e.target.value))} style={{ width: 60, padding: '4px 8px', margin: 0, height: '30px', textAlign: 'center' }} min={2} max={20} />
                        </div>
                    )}
                </form>
            </div>

            {/* Posts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '4rem' }}>
                {loading && posts.length === 0 && (
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

                {filteredPosts.length === 0 && !loading && (
                    <div className="glass-card sharp" style={{ textAlign: 'center', padding: '4rem' }}>
                        <MessageSquare size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <h3 style={{ margin: 0, opacity: 0.5 }}>NO TRANSMISSIONS YET</h3>
                    </div>
                )}

                {filteredPosts.map(post => (
                    post.post_type === 'session' ? (
                        <SessionCard key={post.id} post={post} />
                    ) : (
                        <div key={post.id} className="glass-card sharp" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '1.25rem' }}>
                                <div className="avatar-premium" style={{ width: 44, height: 44, fontSize: '1rem', cursor: 'pointer' }} onClick={() => setSelectedUserId(post.user_id)}>
                                    {post.username?.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Flag code={post.country || 'Global'} size={18} />
                                            <span style={{ fontWeight: 900, cursor: 'pointer', letterSpacing: '0.5px' }} onClick={() => setSelectedUserId(post.user_id)}>{post.username.toUpperCase()}</span>
                                            {post.reputation_tier && <TierBadge tier={post.reputation_tier} size={20} />}
                                        </div>
                                        {post.game_tag && post.game_tag !== 'Global' && (
                                            <span style={{ fontSize: '10px', background: 'var(--primary-soft)', color: 'var(--primary)', padding: '2px 8px', fontWeight: 900 }}>{post.game_tag.toUpperCase()}</span>
                                        )}
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: 'auto', fontWeight: 700 }}>
                                            {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div style={{ marginTop: '1rem', color: 'var(--text-main)', lineHeight: 1.6, fontSize: '15px' }}>{post.content}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                                <button className="btn ghost sm" onClick={() => firePost(post.id)} style={{ fontWeight: 900, color: (post.fire_count || 0) > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>
                                    <Flame size={16} fill={(post.fire_count || 0) > 0 ? 'var(--primary)' : 'none'} /> {post.fire_count || 0}
                                </button>
                                <button className="btn ghost sm" onClick={() => handleToggleComments(post.id)} style={{ fontWeight: 900 }}>
                                    <MessageSquare size={16} /> {comments[post.id]?.length || 0}
                                </button>
                                <button className="btn ghost sm"><Share2 size={16} /></button>
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
                                                <div className="avatar-premium" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>{c.username.charAt(0)}</div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                        <Flag code={c.country || 'Global'} size={14} />
                                                        <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.5px' }}>{c.username.toUpperCase()}</span>
                                                        {c.reputation_tier && <TierBadge tier={c.reputation_tier} size={14} />}
                                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
                    )
                ))}
            </div>

            {selectedUserId && (
                <UserProfile userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
            )}
        </div>
    );
};
