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
        <div className="page-container" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '2.5rem' }}>
                <div style={{ padding: '12px', background: 'var(--primary-glow)', borderRadius: '12px', color: 'var(--primary)' }}><TrendingUp size={32} /></div>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>{isRTL ? 'استكشاف' : 'EXPLORE'}</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 700 }}>DISCOVER THE NETWORK</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${activeTab === 'latest' ? 'active' : ''}`} onClick={() => handleTabChange('latest')}>
                    <Clock size={16} /> {t('latest')}
                </button>
                <button className={`tab ${activeTab === 'popular' ? 'active' : ''}`} onClick={() => handleTabChange('popular')}>
                    <TrendingUp size={16} /> {t('popular')}
                </button>
                <button className={`tab ${activeTab === 'game' ? 'active' : ''}`} onClick={() => handleTabChange('game')}>
                    <Gamepad2 size={16} /> {t('by_game')}
                </button>
            </div>

            {/* Game Tag Filter */}
            {activeTab === 'game' && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '2rem' }}>
                    {gameTags.map(tag => (
                        <button key={tag}
                            className={`btn sm ${selectedTag === tag ? 'primary' : 'ghost'}`}
                            onClick={() => setSelectedTag(tag)}>
                            {tag}
                        </button>
                    ))}
                    {gameTags.length === 0 && !loading && (
                        <p style={{ color: 'var(--text-dim)', fontSize: '11px', fontWeight: 700 }}>NO GAME TAGS DETECTED</p>
                    )}
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="grid-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="glass-card" style={{ height: '140px' }}>
                            <div className="skeleton" style={{ height: '16px', width: '40%', marginBottom: '1rem' }} />
                            <div className="skeleton" style={{ height: '40px', width: '90%' }} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid-2">
                    {posts.length === 0 && (
                        <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
                            <Compass size={48} color="var(--text-dim)" style={{ marginBottom: '1rem', opacity: 0.2 }} />
                            <h3 style={{ opacity: 0.5 }}>NO TRANSMISSIONS DETECTED</h3>
                        </div>
                    )}

                    {posts.map(post => (
                        <div key={post.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="avatar-premium" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>{post.username?.charAt(0).toUpperCase()}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Flag code={post.country || 'Global'} size={14} />
                                        <span style={{ fontWeight: 800, fontSize: '13px' }}>{post.username}</span>
                                    </div>
                                </div>
                                {post.game_tag && post.game_tag !== 'Global' && (
                                    <span style={{ fontSize: '9px', background: 'rgba(0, 209, 255, 0.1)', color: 'var(--primary)', padding: '2px 8px', fontWeight: 900, borderRadius: '4px' }}>{post.game_tag.toUpperCase()}</span>
                                )}
                            </div>
                            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden', margin: 0 }}>{post.content}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '11px', color: 'var(--text-dim)', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Trophy size={14} color={(post.wow_count || 0) > 0 ? 'var(--primary)' : undefined} /> {post.wow_count || 0}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MessageSquare size={14} /> 0</span>
                                <span style={{ marginLeft: isRTL ? '0' : 'auto', marginRight: isRTL ? 'auto' : '0' }}>{new Date(post.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
