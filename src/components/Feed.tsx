import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGameStore, Post, Comment } from '../store/gameStore';
import { useTranslation } from '../i18n';
import Flag from './Flag';
import { Image as ImageIcon, Send, MessageSquare, Share2, Trophy, Tag, Plus, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Feed: React.FC = () => {
    const { user } = useAuthStore();
    const { posts, addPost, wowPost, addComment, comments, syncData } = useGameStore();
    const { t, isRTL } = useTranslation();

    const [content, setContent] = useState('');
    const [image, setImage] = useState<Blob | null>(null);
    const [tag, setTag] = useState('Global');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [commentText, setCommentText] = useState('');

    useEffect(() => { syncData(); }, [syncData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !user) return;
        const { addXP } = useAuthStore.getState();
        await addPost(content, image, user.id, user.displayName, tag, user.country || 'Global');
        addXP(25);
        setContent('');
        setImage(null);
    };

    const handleCommentSubmit = async (postId: string) => {
        if (!commentText.trim() || !user) return;
        await addComment(postId, user.id, user.displayName, commentText, user.country || 'Global');
        setCommentText('');
    };

    const filteredPosts = posts.filter(p =>
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.gameTag.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto', direction: isRTL ? 'rtl' : 'ltr' }}>

            <div className="glass-card" style={{ padding: '0.75rem 1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Search size={18} color="var(--text-dim)" />
                <input className="gaming-input" placeholder={t('search')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ marginBottom: 0, background: 'none', border: 'none', boxShadow: 'none' }} />
                {searchQuery && <X size={18} style={{ cursor: 'pointer' }} onClick={() => setSearchQuery('')} />}
            </div>

            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="avatar-premium" style={{ width: '44px', height: '44px', flexShrink: 0, backgroundImage: `url(${user?.avatarUrl})`, backgroundSize: 'cover' }}>
                            {!user?.avatarUrl && <Plus size={20} color="white" />}
                        </div>
                        <textarea className="gaming-input" placeholder={t('share')} value={content} onChange={(e) => setContent(e.target.value)} style={{ minHeight: '80px', resize: 'none', marginBottom: 0 }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <label className="btn-premium" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                                <ImageIcon size={16} />
                                <input type="file" hidden onChange={(e) => setImage(e.target.files?.[0] || null)} />
                            </label>
                            <button type="button" className="btn-premium" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                                <Tag size={16} /> {tag}
                            </button>
                        </div>
                        <button type="submit" className="btn-premium" disabled={!content.trim()}>{t('gweet')}</button>
                    </div>
                </form>
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
                <AnimatePresence>
                    {filteredPosts.map((post) => (
                        <motion.div key={post.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ borderRadius: '20px' }}>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div className="avatar-premium" style={{ width: '48px', height: '48px', fontSize: '1rem' }}>{post.username?.charAt(0).toUpperCase()}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Flag code={(post as any).country || 'Global'} size={22} />
                                        <span style={{ fontWeight: '800', color: 'white' }}>{post.username}</span>
                                        <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: '800' }}>{new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div style={{ marginTop: '0.75rem', color: 'rgba(255,255,255,0.9)', lineHeight: '1.6' }}>{post.content}</div>
                                </div>
                            </div>

                            {post.image && <img src={URL.createObjectURL(post.image)} alt="Post" style={{ width: '100%', borderRadius: '14px', marginTop: '0.5rem', border: '1px solid var(--glass-border)' }} />}

                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <button className="btn-premium" style={{ background: 'none', boxShadow: 'none', padding: 0, color: 'var(--text-dim)' }} onClick={() => wowPost(post.id)}>
                                    <Trophy size={18} style={{ [isRTL ? 'marginLeft' : 'marginRight']: '6px', color: (post.wowCount || 0) > 0 ? 'var(--primary)' : 'inherit' }} /> {post.wowCount || 0}
                                </button>
                                <button className="btn-premium" style={{ background: 'none', boxShadow: 'none', padding: 0, color: 'var(--text-dim)' }} onClick={() => setSelectedPost(selectedPost?.id === post.id ? null : post)}>
                                    <MessageSquare size={18} style={{ [isRTL ? 'marginLeft' : 'marginRight']: '6px' }} /> {comments[post.id]?.length || 0}
                                </button>
                                <button className="btn-premium" style={{ background: 'none', boxShadow: 'none', padding: 0, color: 'var(--text-dim)' }}><Share2 size={18} /></button>
                            </div>

                            {selectedPost?.id === post.id && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ marginTop: '1.5rem', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                                        <input className="gaming-input" placeholder={t('comment')} value={commentText} onChange={e => setCommentText(e.target.value)} style={{ marginBottom: 0, flex: 1, padding: '0.6rem 1rem' }} />
                                        <button className="btn-premium" style={{ padding: '0 1rem' }} onClick={() => handleCommentSubmit(post.id)}><Send size={16} /></button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: isRTL ? 0 : '1rem', paddingRight: isRTL ? '1rem' : 0, borderLeft: isRTL ? 'none' : '2px solid rgba(255,255,255,0.05)', borderRight: isRTL ? '2px solid rgba(255,255,255,0.05)' : 'none' }}>
                                        {comments[post.id]?.map(c => (
                                            <div key={c.id} style={{ display: 'flex', gap: '0.75rem' }}>
                                                <div className="avatar-premium" style={{ width: '28px', height: '28px', fontSize: '0.6rem' }}>{c.username.charAt(0)}</div>
                                                <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                                        <Flag code={(c as any).country || 'Global'} size={16} />
                                                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--primary)' }}>{c.username}</span>
                                                        <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.85rem', margin: 0 }}>{c.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
