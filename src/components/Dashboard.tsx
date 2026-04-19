import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { AAGCommunity } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { Sidebar } from './Sidebar';
import { Feed } from './Feed';
import { ChatArea } from './ChatArea';
import { Squads } from './Squads'; // Will act as Communities view
import { SettingsHub } from './SettingsHub';
import { ReputationHub } from './ReputationHub';
import { Explore } from './Explore';
import { Logo } from './Logo';
import { ErrorBoundary } from './ErrorBoundary';
import { Search, Bell } from 'lucide-react';

type Tab = 'feed' | 'communities' | 'reputation' | 'chat' | 'settings' | 'explore';

export const Dashboard: React.FC = () => {
    const { t, isRTL } = useTranslation();
    const { loadFeed, loadCommunities, communities } = useGameStore();
    const [activeTab, setActiveTab] = useState<Tab>('feed');
    const [chatTarget, setChatTarget] = useState<{ id: string, type: 'global' | 'community' | 'private' }>({ id: 'global', type: 'global' });
    const [selectedCommunity, setSelectedCommunity] = useState<AAGCommunity | null>(null);

    useEffect(() => {
        loadFeed();
        loadCommunities();
    }, [loadFeed, loadCommunities]);

    const switchTab = (tab: Tab) => {
        if (tab === 'chat') setChatTarget({ id: 'global', type: 'global' });
        setActiveTab(tab);
    };

    const tabTitles: Record<Tab, string> = {
        feed: 'FEED', explore: 'DISCOVERY', communities: 'COMMUNITIES', reputation: 'LEADERBOARD', chat: 'CHAT', settings: 'SETTINGS'
    };

    const renderContent = () => {
        try {
            switch (activeTab) {
                case 'feed': return <Feed />;
                case 'communities': return <Squads />;
                case 'reputation': return <ReputationHub />;
                case 'chat': return <ChatArea targetId={chatTarget.id} type={chatTarget.id === 'global' ? 'global' : chatTarget.type} onBack={() => setActiveTab('communities')} />;
                case 'settings': return <SettingsHub />;
                case 'explore': return <Explore />;
                default: return <Feed />;
            }
        } catch (err) {
            console.error('Render error in Dashboard:', err);
            return (
                <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,0,0,0.05)', borderRadius: '12px', border: '1px solid rgba(255,0,0,0.1)' }}>
                    <h3 style={{ color: '#ff4d4d' }}>INTERFACE SYSTEM FAILURE</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>A critical error occurred while rendering this module. Please ensure your database schema is up to date.</p>
                    <button className="btn ghost sm" onClick={() => window.location.reload()}>REBOOT SYSTEM</button>
                </div>
            );
        }
    };

    return (
        <div className="app-layout" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            <div className="bg-glow purple" />
            <div className="bg-glow cyan" />

            <Sidebar activeTab={activeTab} setActiveTab={switchTab} />

            <main className="main-content">
                {/* Header */}
                <header className="top-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <Logo size={28} />
                        <h1 style={{ fontSize: 'var(--font-md)', fontWeight: 800, letterSpacing: '1px' }}>{tabTitles[activeTab]}</h1>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                            <input className="input" placeholder={t('search')} style={{ width: '220px', paddingLeft: '32px', fontSize: 'var(--font-sm)' }} />
                        </div>
                        <button className="btn icon-only"><Bell size={16} /></button>
                    </div>
                </header>

                {/* Content */}
                <div className="content-area">
                    <ErrorBoundary>
                        {renderContent()}
                    </ErrorBoundary>
                </div>
            </main>
        </div>
    );
};
