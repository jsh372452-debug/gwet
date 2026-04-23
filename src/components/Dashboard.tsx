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
    const { loadFeed, loadCommunities } = useGameStore();
    const { user, signOut } = useAuthStore();
    const [activeTab, setActiveTab] = useState<Tab>('feed');
    const [chatTarget, setChatTarget] = useState<{ id: string, type: 'global' | 'community' | 'private' }>({ id: 'global', type: 'global' });

    useEffect(() => {
        loadFeed();
        loadCommunities();
    }, [loadFeed, loadCommunities]);

    const handleTabChange = (tab: Tab) => {
        if (tab === 'chat') setChatTarget({ id: 'global', type: 'global' });
        setActiveTab(tab);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'feed': return <Feed />;
            case 'communities': return <Squads />;
            case 'reputation': return <ReputationHub />;
            case 'chat': return <ChatArea targetId={chatTarget.id} type={chatTarget.id === 'global' ? 'global' : chatTarget.type} onBack={() => setActiveTab('feed')} />;
            case 'settings': return <SettingsHub />;
            case 'explore': return <Explore />;
            default: return <Feed />;
        }
    };

    return (
        <ErrorBoundary>
            <div style={{ 
                height: '100vh', display: 'flex', background: 'var(--bg-deep)', 
                color: 'var(--text-primary)', overflow: 'hidden',
                fontFamily: 'JetBrains Mono, monospace',
                direction: isRTL ? 'rtl' : 'ltr'
            }}>
                {/* Sidebar Navigation */}
                <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />

                {/* Main Node */}
                <main style={{ 
                    flex: 1, display: 'flex', flexDirection: 'column', 
                    background: 'var(--bg-deep)', position: 'relative',
                    borderLeft: '1px solid var(--border-subtle)'
                }}>
                    {/* Tactical Header */}
                    <header style={{ 
                        height: '64px', padding: '0 24px', background: 'var(--bg-surface)', 
                        borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        zIndex: 10
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                           <h2 style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>
                               SYSTEM_NODE // {activeTab}
                           </h2>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ position: 'relative' }} className="hide-mobile">
                                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input 
                                    className="input" 
                                    placeholder="QUERY_SYSTEM..." 
                                    style={{ width: '200px', height: '36px', paddingLeft: '36px', fontSize: '11px', borderRadius: '0', background: 'var(--bg-input)' }} 
                                />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-icon btn-ghost" style={{ width: '36px', height: '36px', borderRadius: '0' }}><Bell size={16} /></button>
                                <button 
                                    className="btn btn-icon btn-ghost" 
                                    style={{ width: '36px', height: '36px', borderRadius: '0', background: 'var(--danger)', color: 'white', border: 'none' }}
                                    onClick={signOut}
                                    title="DISCONNECT"
                                >
                                    <LogOut size={16} />
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Module Viewport */}
                    <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }} className="no-scrollbar">
                        {renderContent()}
                    </div>
                </main>

                {/* Right Analytics Rail (Minimal) */}
                <aside className="hide-mobile" style={{ 
                    width: '300px', borderLeft: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column'
                }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
                        <h3 style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '2px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sector_Activity</h3>
                    </div>
                    <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }} className="no-scrollbar">
                        <ReputationHub minimalist />
                    </div>
                </aside>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .hide-mobile { display: none !important; }
                }
            `}</style>
        </ErrorBoundary>
    );
};
