import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { Sidebar } from './Sidebar';
import { Feed } from './Feed';
import { ChatArea } from './ChatArea';
import { Communities } from './Communities';
import { SettingsHub } from './SettingsHub';
import { JoinedHub } from './JoinedHub';
import { Search, Bell, Menu, Layout, Command, Shield, Zap } from 'lucide-react';

type Tab = 'feed' | 'communities' | 'chat' | 'settings' | 'joined';

export const Dashboard: React.FC = () => {
    const { user } = useAuthStore();
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

    const renderContent = () => {
        switch (activeTab) {
            case 'feed': return <Feed />;
            case 'communities': return <Communities />;
            case 'chat': return <ChatArea targetId={chatTarget.id} type={chatTarget.id === 'global' ? 'global' : chatTarget.type} onBack={() => setActiveTab('joined')} />;
            case 'settings': return <SettingsHub />;
            case 'joined': return <JoinedHub onSelect={handleSelectChat} />;
            default: return <Feed />;
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)', direction: isRTL ? 'rtl' : 'ltr', position: 'relative', overflow: 'hidden' }}>
            {/* Floating background particles */}
            <div className="energy-blob blob-1" />
            <div className="energy-blob blob-2" />
            {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                    position: 'fixed', borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
                    width: `${4 + i * 2}px`, height: `${4 + i * 2}px`,
                    background: i % 2 === 0 ? 'var(--primary)' : 'var(--accent)',
                    opacity: 0.15 + (i * 0.03),
                    top: `${15 + i * 14}%`, left: `${30 + i * 10}%`,
                    animation: `float-particle ${8 + i * 3}s infinite ease-in-out`,
                    animationDelay: `${i * -2}s`,
                    filter: `blur(${1 + i * 0.3}px)`,
                }} />
            ))}

            <Sidebar activeTab={activeTab} setActiveTab={switchTab} />

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <header style={{
                    padding: '1rem 2rem', borderBottom: '1px solid var(--glass-border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(10, 10, 12, 0.85)', backdropFilter: 'blur(12px)', zIndex: 10
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '7px', borderRadius: '10px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex' }}>
                            <Command size={18} />
                        </div>
                        <h1 style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '1px', color: 'white' }}>
                            {activeTab === 'feed' ? 'FEED' : activeTab === 'communities' ? 'COMMUNITIES' : activeTab === 'chat' ? 'CHAT' : activeTab === 'settings' ? 'SETTINGS' : 'HUB'}
                        </h1>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Search size={16} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '12px', color: 'var(--text-dim)' }} />
                            <input
                                className="gaming-input"
                                placeholder={t('search')}
                                style={{ width: '250px', marginBottom: 0, padding: '0.55rem 1rem', [isRTL ? 'paddingRight' : 'paddingLeft']: '40px', fontSize: '0.75rem', borderRadius: '12px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-premium" style={{ padding: '8px', borderRadius: '11px' }}><Bell size={18} /></button>
                            <button className="btn-premium" style={{ padding: '8px', borderRadius: '11px', background: 'var(--primary-glow)', border: '1px solid var(--primary)' }}>
                                <Zap size={18} fill="white" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem', position: 'relative' }}>
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

