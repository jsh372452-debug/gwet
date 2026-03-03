import React, { useState, useEffect } from 'react';
import { useGameStore, Squad } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { Sidebar } from './Sidebar';
import { Feed } from './Feed';
import { ChatArea } from './ChatArea';
import { Squads } from './Squads';
import { SettingsHub } from './SettingsHub';
import { JoinedHub } from './JoinedHub';
import { Explore } from './Explore';
import { EventsHub } from './EventsHub';
import { ReputationHub } from './ReputationHub';
import { Search, Bell, Command, Calendar, Shield, Trophy } from 'lucide-react';

type Tab = 'feed' | 'explore' | 'squads' | 'events' | 'reputation' | 'chat' | 'settings' | 'joined';

export const Dashboard: React.FC = () => {
    const { t, isRTL } = useTranslation();
    const { loadPosts, loadSquads, loadGroups, squads } = useGameStore(); // Added useGameStore hook
    const [activeTab, setActiveTab] = useState<Tab>('feed');
    const [chatTarget, setChatTarget] = useState<{ id: string, type: 'global' | 'squad' | 'group' | 'private' }>({ id: 'global', type: 'global' });
    const [selectedSquad, setSelectedSquad] = useState<any | null>(null); // Added state for selectedSquad

    useEffect(() => {
        loadPosts();
        loadSquads();
        loadGroups();

        // Handle Deep-linking: ?join=SQUAD_ID
        const params = new URLSearchParams(window.location.search);
        const joinId = params.get('join');
        if (joinId) {
            setActiveTab('squads');
            // We set the current squad if it exists in store
            const s = squads.find(x => x.id === joinId);
            if (s) setSelectedSquad(s);
            // Clean URL
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [loadPosts, loadSquads, loadGroups]);

    // Re-check squads for deep-link if they weren't loaded yet
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const joinId = params.get('join');
        if (joinId && squads.length > 0 && !selectedSquad) {
            const s = squads.find(x => x.id === joinId);
            if (s) setSelectedSquad(s);
        }
    }, [squads, selectedSquad]);

    const switchTab = (tab: Tab) => {
        if (tab === 'chat') setChatTarget({ id: 'global', type: 'global' });
        setActiveTab(tab);
    };

    const handleSelectChat = (id: string, type: 'squad' | 'group' | 'private') => {
        setChatTarget({ id, type });
        setActiveTab('chat');
    };

    const tabTitles: Record<Tab, string> = {
        feed: 'FEED', explore: 'EXPLORE', squads: 'SQUADS', events: 'EVENTS', reputation: 'REPUTATION', chat: 'CHAT', settings: 'SETTINGS', joined: 'HUB'
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'feed': return <Feed />;
            case 'explore': return <Explore />;
            case 'squads': return <Squads />;
            case 'events': return <EventsHub />;
            case 'reputation': return <ReputationHub />;
            case 'chat': return <ChatArea targetId={chatTarget.id} type={chatTarget.id === 'global' ? 'global' : chatTarget.type} onBack={() => setActiveTab('joined')} />;
            case 'settings': return <SettingsHub />;
            case 'joined': return <JoinedHub onSelect={handleSelectChat} />;
            default: return <Feed />;
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
                        <div style={{ padding: '6px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex' }}>
                            <Command size={16} />
                        </div>
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
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};
