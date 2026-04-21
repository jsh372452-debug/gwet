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
                            padding: '10px 12px', borderRadius: '0px', border: 'none',
                            background: activeTab === route.id ? 'var(--text-primary)' : 'transparent',
                            color: activeTab === route.id ? 'var(--bg-deep)' : 'var(--text-secondary)',
                            cursor: 'pointer', textAlign: 'left', marginBottom: '2px',
                            transition: 'all 0.2s ease',
                            borderLeft: activeTab === route.id ? '3px solid var(--text-primary)' : '3px solid transparent'
                        }}
                    >
                        <route.icon size={18} opacity={activeTab === route.id ? 1 : 0.6} />
                        <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>{route.label}</span>
                    </button>
                ))}

                <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1.5px', padding: '24px 8px 8px', textTransform: 'uppercase' }}>
                    VOICE_CHANNELS
                </div>
                <div className="ch-voice-item" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '0', color: 'var(--text-muted)', opacity: 0.5, cursor: 'not-allowed' }}>
                   <Volume2 size={18} />
                   <span style={{ fontSize: '12px', fontWeight: 700 }}>STORM_LOBBY</span>
                </div>
            </nav>

            {/* User Panel */}
            <div style={{ 
                padding: '12px 16px', background: 'var(--bg-input)', borderTop: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', gap: '12px'
            }}>
                <div className="avatar" style={{ width: '32px', height: '32px', flexShrink: 0, borderRadius: '0px' }}>
                    {user?.avatarUrl ? <img src={user.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'G').toUpperCase()}
                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 8, height: 8, borderRadius: '0', background: 'var(--success)', border: '1px solid var(--bg-input)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '0.5px' }}>
                        {user?.displayName || user?.username || 'OPERATOR'}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
                        ACTIVE_NODE <Flag code={user?.country || 'Global'} size={10} />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn btn-icon btn-ghost" style={{ width: '28px', height: '28px', borderRadius: '0' }}><Mic size={14} /></button>
                    <button className="btn btn-icon btn-ghost" style={{ width: '28px', height: '28px', borderRadius: '0' }}><Settings size={14} onClick={() => setActiveTab('settings')} /></button>
                </div>
            </div>

            <style>{`
                .ch-voice-item:hover { background: rgba(255,255,255,0.02); }
            `}</style>
        </aside>
    );
};
