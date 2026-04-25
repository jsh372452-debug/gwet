import React from 'react';
import { Layout, Compass, Users, Award, User, Settings, LogOut, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
    const { signOut } = useAuthStore();

    const menuItems = [
        { id: 'feed', icon: Layout, label: 'Activity' },
        { id: 'chat', icon: MessageSquare, label: 'Messages' },
        { id: 'explore', icon: Compass, label: 'Explore' },
        { id: 'squads', icon: Users, label: 'Squads' },
        { id: 'reputation', icon: Award, label: 'Reputation' },
        { id: 'profile', icon: User, label: 'Account' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <aside style={{ 
            width: '260px', background: 'var(--bg-sidebar)',
            borderRight: '1px solid var(--border-light)',
            display: 'flex', flexDirection: 'column', padding: '24px 16px'
        }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                                border: 'none', cursor: 'pointer',
                                background: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                                color: isActive ? 'var(--brand-primary)' : 'var(--text-dim)',
                                transition: 'var(--transition)',
                                textAlign: 'left', width: '100%'
                            }}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span style={{ fontSize: '14px', fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
                        </button>
                    );
                })}
            </div>

            <button
                onClick={signOut}
                style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                    border: 'none', cursor: 'pointer', background: 'transparent',
                    color: '#f87171', transition: 'var(--transition)',
                    marginTop: 'auto'
                }}
            >
                <LogOut size={20} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Sign Out</span>
            </button>
        </aside>
    );
};
