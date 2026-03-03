import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { countries } from '../data/countries';
import Flag from './Flag';
import { Layout, Shield, Terminal, Settings, LogOut, User, Users, Compass, Trophy } from 'lucide-react';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    const { user, signOut } = useAuthStore();
    const { t } = useTranslation();

    const menuItems = [
        { id: 'feed', icon: Layout, label: t('network') || 'NETWORK' },
        { id: 'explore', icon: Compass, label: t('explore') || 'EXPLORE' },
        { id: 'joined', icon: Users, label: t('joined') || 'HUBS' },
        { id: 'squads', icon: Users, label: t('squads') || 'SQUADS' },
        { id: 'events', icon: Trophy, label: t('events') || 'EVENTS' },
        { id: 'reputation', icon: Shield, label: t('reputation') || 'RANKINGS' },
        { id: 'chat', icon: Terminal, label: t('comms') || 'COMMS' },
        { id: 'settings', icon: Settings, label: t('settings') || 'SETTINGS' },
    ];

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-3xl)', padding: '0 var(--space-sm)' }}>
                <div style={{ padding: '6px', background: 'var(--primary-soft)', borderRadius: 'var(--radius-md)', color: 'var(--primary)', display: 'flex' }}>
                    <Shield size={22} />
                </div>
                <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, letterSpacing: '2px' }}>GWET</h1>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                    >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* User Card */}
            <div style={{ marginTop: 'auto' }}>
                <div className="card compact" style={{ marginBottom: 'var(--space-md)', position: 'relative' }}>
                    <div className="badge" style={{ position: 'absolute', top: 0, right: 0, borderRadius: '0 var(--radius-lg) 0 var(--radius-sm)', fontSize: '0.5rem' }}>PRO</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <div className="avatar md" style={{ backgroundImage: user?.avatarUrl ? `url(${user.avatarUrl})` : 'none' }}>
                            {!user?.avatarUrl && <User size={18} />}
                        </div>
                        <div>
                            <div style={{ fontSize: 'var(--font-base)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {user?.displayName} <Flag code={user?.country || 'Global'} size={18} />
                            </div>
                            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
                                LVL {user?.level} · {user?.rank}
                            </div>
                        </div>
                    </div>
                </div>

                <button onClick={signOut} className="btn danger" style={{ width: '100%' }}>
                    <LogOut size={16} /> {t('logout')}
                </button>
            </div>
        </aside>
    );
};
