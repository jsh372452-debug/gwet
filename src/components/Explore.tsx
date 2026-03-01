import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useTranslation } from '../i18n';
import Flag from './Flag';
import { Compass, TrendingUp, Clock, Gamepad2, Trophy, MessageSquare } from 'lucide-react';

export const Explore: React.FC = () => {
    const { t, isRTL } = useTranslation();
    const [activeTab, setActiveTab] = useState<'latest' | 'popular' | 'game'>('latest');
    const [posts, setPosts] = useState<any[]>([]);
    const [gameTags, setGameTags] = useState<string[]>([]);
    const [selectedTag, setSelectedTag] = useState('');
    const [loading, setLoading] = useState(true);

    const loadExplore = async (tab: string, tag?: string) => {
        setLoading(true);
        try {
            const { posts, gameTags } = await api.explore.get(tab as any, tag);
            setPosts(posts);
            setGameTags(gameTags);
        } catch (err) {
            console.error('Explore failed:', err);
        }
        setLoading(false);
    };

    useEffect(() => { loadExplore(activeTab, selectedTag); }, [activeTab, selectedTag]);

    const handleTabChange = (tab: 'latest' | 'popular' | 'game') => {
        setActiveTab(tab);
        if (tab !== 'game') setSelectedTag('');
    };

    return (
        <div className="page-container wide" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="section-header">
                    <div className="icon-wrap"><Compass size={22} /></div>
                    <div>
                        <h2>{t('explore')}</h2>
                        <p className="subtitle">DISCOVER THE NETWORK</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${activeTab === 'latest' ? 'active' : ''}`} onClick={() => handleTabChange('latest')}>
                    <Clock size={14} style={{ marginRight: '6px' }} /> {t('latest')}
                </button>
                <button className={`tab ${activeTab === 'popular' ? 'active' : ''}`} onClick={() => handleTabChange('popular')}>
                    <TrendingUp size={14} style={{ marginRight: '6px' }} /> {t('popular')}
                </button>
                <button className={`tab ${activeTab === 'game' ? 'active' : ''}`} onClick={() => handleTabChange('game')}>
                    <Gamepad2 size={14} style={{ marginRight: '6px' }} /> {t('by_game')}
                </button>
            </div>

            {/* Game Tag Filter */}
            {activeTab === 'game' && (
                <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                    {gameTags.map(tag => (
                        <button key={tag} className={`btn ${selectedTag === tag ? 'primary' : ''}`}
                            style={{ fontSize: 'var(--font-xs)' }}
                            onClick={() => setSelectedTag(tag)}>
                            {tag}
                        </button>
                    ))}
                    {gameTags.length === 0 && !loading && (
                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>No game tags found yet</p>
                    )}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="grid grid-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="card">
                            <div className="skeleton" style={{ height: 16, width: '50%', marginBottom: 'var(--space-md)' }} />
                            <div className="skeleton" style={{ height: 48 }} />
                        </div>
                    ))}
                </div>
            )}

            {/* Posts Grid */}
            {!loading && (
                <div className="grid grid-2">
                    {posts.length === 0 && (
                        <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                            <Compass size={40} className="icon" />
                            <h3>Nothing to explore yet</h3>
                            <p>Posts will appear here as users share content</p>
                        </div>
                    )}

                    {posts.map(post => (
                        <div key={post.id} className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                                <div className="avatar sm">{post.username?.charAt(0).toUpperCase()}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Flag code={post.country || 'Global'} size={14} />
                                        <span style={{ fontWeight: 700, fontSize: 'var(--font-sm)' }}>{post.username}</span>
                                    </div>
                                </div>
                                {post.game_tag && post.game_tag !== 'Global' && (
                                    <span className="badge accent">{post.game_tag}</span>
                                )}
                            </div>
                            <p style={{ fontSize: 'var(--font-base)', lineHeight: 1.6, color: 'var(--text)', marginBottom: 'var(--space-md)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{post.content}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Trophy size={12} color={(post.wow_count || 0) > 0 ? 'var(--primary)' : undefined} /> {post.wow_count || 0}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MessageSquare size={12} /> 0</span>
                                <span style={{ marginLeft: 'auto' }}>{new Date(post.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
