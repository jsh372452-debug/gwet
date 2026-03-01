import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { Sidebar } from './Sidebar';
import { Feed } from './Feed';
import { ChatArea } from './ChatArea';
import { Communities } from './Communities';
import { SettingsHub } from './SettingsHub';
import { JoinedHub } from './JoinedHub';
import { Explore } from './Explore';
import { Search, Bell, Command } from 'lucide-react';

type Tab = 'feed' | 'explore' | 'communities' | 'chat' | 'settings' | 'joined';

export const Dashboard: React.FC = () => {
    const { t, isRTL } = useTranslation();
    const [activeTab, setActiveTab] = useState<Tab>('feed');
    const [chatTarget, setChatTarget] = useState<{ id: string, type: 'global' | 'community' | 'group' | 'private' }>({ id: 'global', type: 'global' });

    const switchTab = (tab: Tab) => {
        if (tab === 'chat') setChatTarget({ id: 'global', type: 'global' });
        setActiveTab(tab);
    };

    const handleSelectChat = (id: string, type: 'community' | 'group' | 'private') => {
        setChatTarget({ id, type });
        setActiveTab('chat');
    };

    const tabTitles: Record<Tab, string> = {
        feed: 'FEED', explore: 'EXPLORE', communities: 'COMMUNITIES', chat: 'CHAT', settings: 'SETTINGS', joined: 'HUB'
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'feed': return <Feed />;
            case 'explore': return <Explore />;
            case 'communities': return <Communities />;
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
