import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
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
import { Search, Bell, Activity, Wifi, Shield, LogOut, Terminal, Cpu } from 'lucide-react';

type Tab = 'feed' | 'communities' | 'reputation' | 'chat' | 'settings' | 'explore';

export const Dashboard: React.FC = () => {
    const { isRTL } = useTranslation();
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
                fontFamily: 'var(--font-sans)',
                direction: isRTL ? 'rtl' : 'ltr'
            }}>
                <div className="glow-mesh" />
                
                {/* Tactical Sidebar */}
                <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />

                {/* Main Command Center */}
                <main style={{ 
                    flex: 1, display: 'flex', flexDirection: 'column', 
                    position: 'relative', overflow: 'hidden',
                    background: 'rgba(2, 4, 10, 0.4)'
                }}>
                    {/* Integrated Header */}
                    <header style={{ 
                        height: '72px', padding: '0 32px', 
                        background: 'var(--bg-surface)', 
                        backdropFilter: 'var(--glass-blur)',
                        borderBottom: 'var(--glass-border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        zIndex: 10
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '8px', height: '8px', background: 'var(--brand-electric)', borderRadius: '50%', boxShadow: '0 0 10px var(--brand-electric)' }} />
                                <h2 style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                                    SYSTEM_NODE // {activeTab}
                                </h2>
                           </div>
                           <div className="hide-mobile" style={{ display: 'flex', gap: '20px', color: 'var(--text-muted)', fontSize: '10px', fontWeight: 800 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Wifi size={12} /> LNC_STABLE</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={12} /> SEC_ACTIVE</span>
                           </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <div style={{ position: 'relative' }} className="hide-mobile">
                                <Search size={14} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input 
                                    className="input" 
                                    placeholder="SEARCH_NETWORK..." 
                                    style={{ width: '260px', height: '40px', paddingLeft: '44px', fontSize: '11px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)' }} 
                                />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className="btn btn-ghost" style={{ width: '40px', height: '40px', padding: 0 }}>
                                    <Bell size={18} />
                                </button>
                                <button 
                                    className="btn" 
                                    style={{ width: '40px', height: '40px', padding: 0, background: 'rgba(255, 77, 0, 0.1)', color: 'var(--brand-orange)', border: '1px solid rgba(255, 77, 0, 0.2)' }}
                                    onClick={signOut}
                                    title="DISCONNECT"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Viewport */}
                    <div style={{ flex: 1, overflowY: 'auto', position: 'relative', padding: '24px' }} className="no-scrollbar">
                        {renderContent()}
                    </div>

                    {/* Footer Status Bar */}
                    <footer style={{ 
                        height: '32px', background: 'var(--bg-surface)', borderTop: 'var(--glass-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px', padding: '0 24px'
                    }}>
                        <div style={{ display: 'flex', gap: '24px' }}>
                            <span>CORE_OS_V1.1</span>
                            <span>USER_SYNC: {user?.username?.toUpperCase()}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <span style={{ color: 'var(--brand-electric)' }}><Activity size={10} style={{ marginRight: '4px' }} /> PACKET_STABLE</span>
                            <span>{new Date().toISOString()}</span>
                        </div>
                    </footer>
                </main>

                {/* Performance Analytics Rail */}
                <aside className="hide-mobile" style={{ 
                    width: '320px', background: 'var(--bg-surface)', 
                    borderLeft: 'var(--glass-border)', display: 'flex', flexDirection: 'column'
                }}>
                    <div style={{ padding: '24px', borderBottom: 'var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '3px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Influence_Map</h3>
                        <Cpu size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }} className="no-scrollbar">
                        <ReputationHub />
                    </div>
                </aside>
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    .hide-mobile { display: none !important; }
                }
            `}</style>
        </ErrorBoundary>
    );
};
