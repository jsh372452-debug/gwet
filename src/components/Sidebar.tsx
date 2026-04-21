import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import Flag from './Flag';
import { Hash, Volume2, Settings, Mic, Headphones, LogOut, Layout, Compass, Users, Trophy } from 'lucide-react';
import { Logo } from './Logo';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    const { user, signOut } = useAuthStore();
    const { t } = useTranslation();

    const mainRoutes = [
        { id: 'feed', icon: Layout, label: 'NETWORK_FEED' },
        { id: 'explore', icon: Compass, label: 'DISCOVERY' },
        { id: 'communities', icon: Users, label: 'COMMUNITIES' },
        { id: 'reputation', icon: Trophy, label: 'LEADERBOARD' },
        { id: 'chat', icon: Hash, label: 'GLOBAL_CHAT' },
    ];

    return (
        <aside style={{ 
            width: '260px', background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)',
            display: 'flex', flexDirection: 'column', height: '100%'
        }}>
            {/* Header */}
            <div style={{ 
                padding: '16px', borderBottom: '1px solid var(--border-subtle)', 
                fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: '15px'
            }}>
                GWET STORM HUB
            </div>

            {/* Navigation / Channels */}
            <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', padding: '12px 8px 8px' }}>
                    MAIN_DIRECTIVES
                </div>
                {mainRoutes.map((route) => (
                    <button
                        key={route.id}
                        onClick={() => setActiveTab(route.id)}
                        style={{ 
                            width: '100%', display: 'flex', alignItems: 'center', gap: '8px', 
                            padding: '8px 12px', borderRadius: '6px', border: 'none',
                            background: activeTab === route.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                            color: activeTab === route.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                            cursor: 'pointer', textAlign: 'left', marginBottom: '2px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <route.icon size={18} opacity={activeTab === route.id ? 1 : 0.6} />
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{route.label}</span>
                    </button>
                ))}

                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', padding: '24px 8px 8px' }}>
                    VOICE_CHANNELS
                </div>
                <div className="ch-voice-item" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '6px', color: 'var(--text-secondary)', opacity: 0.5, cursor: 'not-allowed' }}>
                   <Volume2 size={18} />
                   <span style={{ fontSize: '14px', fontWeight: 600 }}>Storm Lobby</span>
                </div>
            </nav>

            {/* User Panel */}
            <div style={{ 
                padding: '10px 8px', background: 'var(--bg-input)', borderTop: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', gap: '10px'
            }}>
                <div className="avatar" style={{ width: '36px', height: '36px', flexShrink: 0 }}>
                    {user?.avatarUrl ? <img src={user.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'G').toUpperCase()}
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: 'var(--success)', border: '2px solid var(--bg-input)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user?.displayName || user?.username || 'OPERATOR'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Online <Flag code={user?.country || 'Global'} size={12} />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn btn-icon btn-ghost" style={{ width: '32px', height: '32px' }}><Mic size={16} /></button>
                    <button className="btn btn-icon btn-ghost" style={{ width: '32px', height: '32px' }}><Settings size={16} onClick={() => setActiveTab('settings')} /></button>
                </div>
            </div>

            <style>{`
                button:hover { background: rgba(255,255,255,0.05) !important; color: white !important; }
            `}</style>
        </aside>
    );
};
