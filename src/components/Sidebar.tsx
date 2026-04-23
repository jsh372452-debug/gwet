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
    const { user } = useAuthStore();
    const { t } = useTranslation();

    const mainRoutes = [
        { id: 'feed', icon: Layout, label: 'STORM_FEED' },
        { id: 'explore', icon: Compass, label: 'EXPLORE_SECTORS' },
        { id: 'communities', icon: Users, label: 'ACTIVE_SQUADS' },
        { id: 'reputation', icon: Trophy, label: 'INFLUENCE_LEADERBOARD' },
        { id: 'chat', icon: Hash, label: 'GLOBAL_COMMS' },
    ];

    return (
        <aside style={{ 
            width: '260px', background: 'var(--bg-surface)', 
            display: 'flex', flexDirection: 'column', height: '100%',
            fontFamily: 'JetBrains Mono, monospace'
        }}>
            {/* Branding */}
            <div style={{ 
                padding: '24px', borderBottom: '1px solid var(--border-subtle)', 
                display: 'flex', alignItems: 'center', gap: '12px'
            }}>
                <Logo size={24} />
                <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '2px' }}>GWET_SYSTEMS</span>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '24px 0', overflowY: 'auto' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '2px', padding: '0 24px 16px', textTransform: 'uppercase' }}>
                    Main_Directives
                </div>
                {mainRoutes.map((route) => (
                    <button
                        key={route.id}
                        onClick={() => setActiveTab(route.id)}
                        style={{ 
                            width: '100%', display: 'flex', alignItems: 'center', gap: '12px', 
                            padding: '12px 24px', borderRadius: '0px', border: 'none',
                            background: activeTab === route.id ? 'var(--text-primary)' : 'transparent',
                            color: activeTab === route.id ? 'var(--bg-deep)' : 'var(--text-secondary)',
                            cursor: 'pointer', textAlign: 'left',
                            transition: 'all 0.1s ease',
                            borderLeft: activeTab === route.id ? '4px solid var(--brand-electric)' : '4px solid transparent'
                        }}
                    >
                        <route.icon size={16} />
                        <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>{route.label}</span>
                    </button>
                ))}

                <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '2px', padding: '32px 24px 16px', textTransform: 'uppercase' }}>
                    Control_Panel
                </div>
                <button
                    onClick={() => setActiveTab('settings')}
                    style={{ 
                        width: '100%', display: 'flex', alignItems: 'center', gap: '12px', 
                        padding: '12px 24px', borderRadius: '0px', border: 'none',
                        background: activeTab === 'settings' ? 'var(--text-primary)' : 'transparent',
                        color: activeTab === 'settings' ? 'var(--bg-deep)' : 'var(--text-secondary)',
                        cursor: 'pointer', textAlign: 'left'
                    }}
                >
                    <Settings size={16} />
                    <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>SYSTEM_SETTINGS</span>
                </button>
            </nav>

            {/* Status Footer */}
            <div style={{ 
                padding: '20px 24px', borderTop: '1px solid var(--border-subtle)',
                background: 'var(--bg-input)', display: 'flex', alignItems: 'center', gap: '12px'
            }}>
                <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '0' }} />
                <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--success)', letterSpacing: '1.5px' }}>NODE_ONLINE_SECURE</span>
            </div>
        </aside>
    );
};
