import React from 'react';
import { Sidebar } from './Sidebar';
import { Feed } from './Feed';
import { Explore } from './Explore';
import { Squads } from './Squads';
import { UserProfile } from './UserProfile';
import { SettingsHub } from './SettingsHub';
import { ReputationHub } from './ReputationHub';
import { ChatArea } from './ChatArea';
import { useAuthStore } from '../store/authStore';
import { Logo } from './Logo';

export const Dashboard: React.FC = () => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = React.useState('feed');

    const renderContent = () => {
        switch (activeTab) {
            case 'feed': return <Feed />;
            case 'explore': return <Explore />;
            case 'squads': return <Squads />;
            case 'reputation': return <ReputationHub />;
            case 'profile': return <UserProfile userId={user?.id || ''} onClose={() => setActiveTab('feed')} />;
            case 'settings': return <SettingsHub />;
            case 'chat': return <ChatArea targetId="global" type="global" />;
            default: return <Feed />;
        }
    };

    return (
        <div style={{ 
            display: 'flex', height: '100vh', width: '100vw', 
            background: 'var(--bg-app)', color: 'var(--text-main)',
            overflow: 'hidden'
        }}>
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            
            <main style={{ 
                flex: 1, display: 'flex', flexDirection: 'column', 
                position: 'relative', overflow: 'hidden'
            }}>
                {/* Header */}
                <header style={{ 
                    height: '64px', borderBottom: '1px solid var(--border-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 32px', background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(8px)', zIndex: 10
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Logo size={28} />
                        <span style={{ 
                            fontWeight: 700, fontSize: '18px', letterSpacing: '-0.5px',
                            background: 'linear-gradient(to right, #fff, #94a3b8)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>GWET</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600 }}>{user?.displayName || user?.username}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Level {Math.floor((user?.influenceScore || 0) / 100) + 1} Member</div>
                        </div>
                        <div style={{ 
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'var(--bg-sidebar)', border: '1px solid var(--border-light)',
                            overflow: 'hidden'
                        }}>
                            {user?.avatarUrl && <img src={user.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                    </div>
                </header>

                <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};
