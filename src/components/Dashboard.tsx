import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { AAGCommunity } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { Sidebar } from './Sidebar';
import { Feed } from './Feed';
import { ChatArea } from './ChatArea';
import { Squads } from './Squads'; 
import { SettingsHub } from './SettingsHub';
import { ReputationHub } from './ReputationHub';
import { Explore } from './Explore';
import { Logo } from './Logo';
import { ErrorBoundary } from './ErrorBoundary';
import { Search, Bell, Plus, Settings } from 'lucide-react';

type Tab = 'feed' | 'communities' | 'reputation' | 'chat' | 'settings' | 'explore';

export const Dashboard: React.FC = () => {
    const { t, isRTL } = useTranslation();
    const { loadFeed, loadCommunities, communities } = useGameStore();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<Tab>('feed');
    const [chatTarget, setChatTarget] = useState<{ id: string, type: 'global' | 'community' | 'private' }>({ id: 'global', type: 'global' });
    const [selectedServerId, setSelectedServerId] = useState<string | null>(null);

    useEffect(() => {
        loadFeed();
        loadCommunities();
    }, [loadFeed, loadCommunities]);

    const switchTab = (tab: Tab) => {
        if (tab === 'chat') setChatTarget({ id: 'global', type: 'global' });
        setActiveTab(tab);
        setSelectedServerId(null);
    };

    const handleServerClick = (serverId: string) => {
        setSelectedServerId(serverId);
        setActiveTab('chat');
        setChatTarget({ id: serverId, type: 'community' });
    };

    const renderContent = () => {
        try {
            switch (activeTab) {
                case 'feed': return <Feed />;
                case 'communities': return <Squads />;
                case 'reputation': return <ReputationHub />;
                case 'chat': return <ChatArea targetId={chatTarget.id} type={chatTarget.id === 'global' ? 'global' : chatTarget.type} onBack={() => setActiveTab('feed')} />;
                case 'settings': return <SettingsHub />;
                case 'explore': return <Explore />;
                default: return <Feed />;
            }
        } catch (err) {
            console.error('Render error in Dashboard:', err);
            return (
                <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid var(--danger)' }}>
                    <h3 style={{ color: 'var(--danger)', fontFamily: 'Space Grotesk' }}>INTERFACE SYSTEM FAILURE</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '12px 0' }}>A critical error occurred while rendering this module.</p>
                    <button className="btn btn-ghost sm" onClick={() => window.location.reload()}>REBOOT SYSTEM</button>
                </div>
            );
        }
    };

    return (
        <ErrorBoundary>
            <div className="app-shell" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                
                {/* 1. Left Rail: Server Icons */}
                <aside style={{ 
                    width: '72px', background: 'var(--bg-input)', borderRight: '1px solid var(--border-subtle)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: '8px'
                }}>
                    <div 
                        onClick={() => switchTab('feed')}
                        className={`avatar interactive`} 
                        style={{ 
                            width: '48px', height: '48px', borderRadius: '0px',
                            background: activeTab === 'feed' ? 'var(--text-primary)' : 'var(--bg-elevated)',
                            color: activeTab === 'feed' ? 'var(--bg-deep)' : 'var(--text-primary)',
                            cursor: 'pointer'
                        }}
                    >
                        <Logo size={24} />
                    </div>

                    <div style={{ width: '32px', height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

                    {communities.map((comm) => (
                        <div 
                            key={comm.id}
                            onClick={() => handleServerClick(comm.id)}
                            className="avatar interactive"
                            style={{ 
                                width: '48px', height: '48px', borderRadius: '0px',
                                background: selectedServerId === comm.id ? 'var(--text-primary)' : 'var(--bg-surface)',
                                color: selectedServerId === comm.id ? 'var(--bg-deep)' : 'var(--text-primary)',
                                border: '1px solid var(--border-subtle)', cursor: 'pointer'
                            }}
                            title={comm.name}
                        >
                            <span style={{ fontSize: '16px', fontWeight: 800 }}>{comm.name.charAt(0).toUpperCase()}</span>
                        </div>
                    ))}

                    <button className="btn btn-icon btn-ghost" style={{ borderRadius: '0', borderStyle: 'solid', borderColor: 'var(--border-subtle)' }}>
                        <Plus size={20} />
                    </button>

                    <button className="btn btn-icon btn-ghost" style={{ marginTop: 'auto', borderRadius: '0' }} onClick={() => switchTab('settings')}>
                        <Settings size={20} />
                    </button>
                </aside>

                {/* 2. Sidebar: Channels & User Info */}
                <Sidebar activeTab={activeTab} setActiveTab={switchTab} />

                {/* 3. Main Content */}
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)', position: 'relative' }}>
                    {/* Top Header */}
                    <header className="glass-panel" style={{ 
                        padding: '16px 24px', position: 'sticky', top: 0, zIndex: 10,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                           <h2 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                               {activeTab === 'chat' ? (chatTarget.id === 'global' ? '# GLOBAL_COMMS' : `# ${communities.find(c => c.id === chatTarget.id)?.name.toUpperCase() || 'SERVER'}`) : activeTab.toUpperCase()}
                           </h2>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="input" placeholder={t('search')} style={{ width: '200px', height: '36px', paddingLeft: '36px', fontSize: '13px', borderRadius: '0' }} />
                            </div>
                            <button className="btn btn-icon btn-ghost" style={{ width: '36px', height: '36px', borderRadius: '0' }}><Bell size={18} /></button>
                        </div>
                    </header>

                    {/* Scrollable Area */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {renderContent()}
                    </div>
                </main>
            </div>

            <style>{`
                .avatar.interactive:hover { border-radius: 0px !important; background: var(--text-primary) !important; color: var(--bg-deep) !important; }
            `}</style>
        </ErrorBoundary>
    );
};
