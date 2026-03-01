import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import { countries } from '../data/countries';
import Flag from './Flag';
import { Layout, Shield, Terminal, Settings, LogOut, Zap, User, Target, ChevronRight, Globe, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    const { user, signOut } = useAuthStore();
    const { t, isRTL } = useTranslation();

    const menuItems = [
        { id: 'feed', icon: Layout, label: t('network') },
        { id: 'joined', icon: Users, label: t('joined') },
        { id: 'communities', icon: Shield, label: t('squads') },
        { id: 'chat', icon: Terminal, label: t('comms') },
        { id: 'settings', icon: Settings, label: t('settings') },
    ];

    return (
        <aside style={{ width: '280px', background: '#0a0a0c', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', height: '100vh', padding: '1.5rem', zIndex: 100 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', padding: '0 0.5rem' }}>
                <div style={{ padding: '8px', background: 'var(--primary-glow)', borderRadius: '12px', color: 'var(--primary)', display: 'flex' }}>
                    <Shield size={24} />
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '2px', color: 'white' }}>GWET</h1>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`btn-premium ${isActive ? 'active' : ''}`}
                            style={{
                                width: '100%', justifyContent: 'flex-start', border: 'none', background: isActive ? 'var(--primary-glow)' : 'transparent',
                                color: isActive ? 'white' : 'var(--text-dim)', boxShadow: 'none'
                            }}
                        >
                            <item.icon size={20} />
                            <span style={{ fontSize: '0.85rem', fontWeight: '800' }}>{item.label}</span>
                            {isActive && <motion.div layoutId="active-indicator" style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', background: 'white' }} />}
                        </button>
                    );
                })}
            </nav>

            <div style={{ marginTop: 'auto' }}>
                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '20px', marginBottom: '1.25rem', border: '1px solid var(--primary-glow)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 8px', background: 'var(--primary)', color: 'white', fontSize: '0.5rem', fontWeight: '900', borderRadius: '0 0 0 10px' }}>PRO</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="avatar-premium" style={{ width: '44px', height: '44px', backgroundImage: `url(${user?.avatarUrl})`, backgroundSize: 'cover' }}>
                            {!user?.avatarUrl && <User size={20} />}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '900', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {user?.displayName} <Flag code={user?.country || 'Global'} size={20} />
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 'bold' }}>LVL {user?.level} • {user?.rank}</div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={signOut}
                    className="btn-premium"
                    style={{ width: '100%', justifyContent: 'center', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.2)', background: 'rgba(248, 113, 113, 0.05)' }}
                >
                    <LogOut size={18} /> {t('logout')}
                </button>
            </div>
        </aside>
    );
};
