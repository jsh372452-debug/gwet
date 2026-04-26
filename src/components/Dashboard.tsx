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
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 }
};

const pageTransition = { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] };

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
                    height: '60px', borderBottom: '1px solid var(--border-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 28px', background: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(12px)', zIndex: 10
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Logo size={24} />
                        <span style={{ 
                            fontWeight: 700, fontSize: '16px', letterSpacing: '-0.3px',
                            color: 'var(--text-main)'
                        }}>GWET</span>
                        <span style={{ 
                            fontSize: '11px', color: 'var(--text-muted)', 
                            padding: '2px 8px', background: 'rgba(255,255,255,0.04)',
                            borderRadius: '4px', marginLeft: '4px'
                        }}>
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600 }}>{user?.displayName || user?.username}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                Level {Math.floor((user?.influenceScore || 0) / 100) + 1}
                            </div>
                        </div>
                        <div style={{ 
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'var(--bg-sidebar)', border: '1px solid var(--border-light)',
                            overflow: 'hidden'
                        }}>
                            {user?.avatarUrl && <img src={user.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                    </div>
                </header>

                {/* Content with cross-fade transition */}
                <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={pageTransition}
                            style={{ padding: '28px', minHeight: '100%' }}
                        >
                            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                                {renderContent()}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};
