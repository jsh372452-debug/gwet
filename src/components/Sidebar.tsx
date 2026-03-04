import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { countries } from '../data/countries';
import Flag from './Flag';
import { Layout, Shield, Terminal, Settings, LogOut, User, Users, Compass, Trophy } from 'lucide-react';
import { TierBadge } from './TierBadge';
import { Logo } from './Logo';

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '3rem', padding: '0 10px' }}>
                <Logo size={40} />
                <h1 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '2px', background: 'linear-gradient(135deg, #fff, #8b949e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    GWET
                </h1>
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

            <div style={{ marginTop: 'auto' }}>
                <div className="glass-card sharp compact" style={{ marginBottom: 'var(--space-md)', position: 'relative', border: '1px solid var(--glass-border)' }}>
                    <div className="badge sharp" style={{ position: 'absolute', top: -1, right: -1, fontSize: '0.5rem', background: 'var(--primary)', color: 'white', fontWeight: 900 }}>ELITE</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <div className="avatar-premium" style={{ width: 44, height: 44, fontSize: '1rem' }}>
                            {user?.avatarUrl ? <img src={user.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user?.displayName?.[0] || 'G').toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.displayName.toUpperCase()} <Flag code={user?.country || 'Global'} size={14} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800 }}>
                                    LVL {user?.level} · {user?.rank}
                                </div>
                                {user?.reputation_tier && <TierBadge tier={user.reputation_tier} size={14} />}
                            </div>
                        </div>
                    </div>
                </div>

                <button onClick={signOut} className="btn danger sharp" style={{ width: '100%', fontWeight: 900 }}>
                    <LogOut size={16} /> {t('logout').toUpperCase()}
                </button>
            </div>
        </aside>
    );
};
