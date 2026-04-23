import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { Hash, Settings, Layout, Compass, Users, Trophy, ChevronRight, Monitor, Radio, Zap } from 'lucide-react';
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
        { id: 'explore', icon: Compass, label: 'SECTOR_NAV' },
        { id: 'communities', icon: Users, label: 'ACTIVE_SQUADS' },
        { id: 'reputation', icon: Trophy, label: 'GLOBAL_RANK' },
        { id: 'chat', icon: Hash, label: 'GLOBAL_COMMS' },
    ];

    return (
        <aside style={{ 
            width: '280px', background: 'var(--bg-surface)', 
            backdropFilter: 'var(--glass-blur)',
            display: 'flex', flexDirection: 'column', height: '100%',
            borderRight: 'var(--glass-border)',
            fontFamily: 'var(--font-mono)'
        }}>
            {/* Branding */}
            <div style={{ 
                padding: '32px 24px', borderBottom: 'var(--glass-border)', 
                display: 'flex', alignItems: 'center', gap: '16px'
            }}>
                <div style={{ filter: 'drop-shadow(0 0 8px var(--brand-glow))' }}>
                    <Logo size={28} />
                </div>
                <span style={{ fontWeight: 900, fontSize: '16px', letterSpacing: '4px', color: 'var(--text-primary)' }}>GWET</span>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '32px 0', overflowY: 'auto' }} className="no-scrollbar">
                <div style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '3px', padding: '0 24px 20px', textTransform: 'uppercase' }}>
                    <Monitor size={10} style={{ marginRight: '8px' }} /> CORE_DIRECTIVES
                </div>
                
                {mainRoutes.map((route) => (
                    <button
                        key={route.id}
                        onClick={() => setActiveTab(route.id)}
                        style={{ 
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 24px', borderRadius: '0px', border: 'none',
                            background: activeTab === route.id ? 'rgba(0, 210, 255, 0.08)' : 'transparent',
                            color: activeTab === route.id ? 'var(--brand-electric)' : 'var(--text-secondary)',
                            cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderLeft: activeTab === route.id ? '4px solid var(--brand-electric)' : '4px solid transparent'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <route.icon size={18} strokeWidth={activeTab === route.id ? 2.5 : 2} />
                            <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '1.5px' }}>{route.label}</span>
                        </div>
                        {activeTab === route.id && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
                    </button>
                ))}

                <div style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '3px', padding: '40px 24px 20px', textTransform: 'uppercase' }}>
                    <Radio size={10} style={{ marginRight: '8px' }} /> SUBSYSTEMS
                </div>
                
                <button
                    onClick={() => setActiveTab('settings')}
                    style={{ 
                        width: '100%', display: 'flex', alignItems: 'center', gap: '14px', 
                        padding: '14px 24px', borderRadius: '0px', border: 'none',
                        background: activeTab === 'settings' ? 'rgba(0, 210, 255, 0.08)' : 'transparent',
                        color: activeTab === 'settings' ? 'var(--brand-electric)' : 'var(--text-secondary)',
                        cursor: 'pointer', textAlign: 'left',
                        borderLeft: activeTab === 'settings' ? '4px solid var(--brand-electric)' : '4px solid transparent'
                    }}
                >
                    <Settings size={18} />
                    <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '1.5px' }}>NODE_CONFIG</span>
                </button>
            </nav>

            {/* User Focus Mini-Profile */}
            <div style={{ 
                padding: '24px', borderTop: 'var(--glass-border)',
                background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '12px'
            }}>
                <div style={{ 
                    width: '36px', height: '36px', background: 'var(--bg-elevated)', 
                    border: '1px solid var(--border-subtle)', flexShrink: 0,
                    overflow: 'hidden'
                }}>
                    <img src={user?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.username}`} alt="avatar" style={{ width: '100%', height: '100%' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user?.username?.toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <div style={{ width: '6px', height: '6px', background: 'var(--brand-electric)', borderRadius: '50%', boxShadow: '0 0 5px var(--brand-electric)' }} />
                        <span style={{ fontSize: '8px', fontWeight: 800, color: 'var(--brand-electric)', letterSpacing: '1px' }}>LINK_SECURE</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};
