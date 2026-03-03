import React from 'react';

interface TierBadgeProps {
    tier: string;
    size?: number;
    showLabel?: boolean;
}

export const TierBadge: React.FC<TierBadgeProps> = ({ tier = 'BRONZE', size = 32, showLabel = false }) => {
    const tierKey = tier.toUpperCase();

    const getTierConfig = () => {
        switch (tierKey) {
            case 'MYTHIC':
                return { color: '#ff00ff', label: 'MYTHIC', glow: '0 0 15px #ff00ff' };
            case 'LEGEND':
                return { color: '#ff4d00', label: 'LEGEND', glow: '0 0 15px #ff4d00' };
            case 'DIAMOND':
                return { color: '#00d4ff', label: 'DIAMOND', glow: '0 0 15px #00d4ff' };
            case 'PLATINUM':
                return { color: '#e5e7eb', label: 'PLATINUM', glow: '0 0 10px #ffffff' };
            case 'GOLD':
                return { color: '#fbbf24', label: 'GOLD', glow: '0 0 10px #fbbf24' };
            case 'SILVER':
                return { color: '#94a3b8', label: 'SILVER', glow: '0 0-5px #94a3b8' };
            default:
                return { color: '#b45309', label: 'BRONZE', glow: 'none' };
        }
    };

    const config = getTierConfig();

    const renderIcon = () => {
        switch (tierKey) {
            case 'MYTHIC':
                return (
                    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 2L28 10V22L16 30L4 22V10L16 2Z" fill="url(#mythic_grad)" stroke="#ff00ff" strokeWidth="2" />
                        <circle cx="16" cy="16" r="6" fill="white" fillOpacity="0.2" />
                        <path d="M16 8L18 14H24L19 18L21 24L16 20L11 24L13 18L8 14H14L16 8Z" fill="white" />
                        <defs>
                            <linearGradient id="mythic_grad" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#ff00ff" />
                                <stop offset="1" stopColor="#00d4ff" />
                            </linearGradient>
                        </defs>
                    </svg>
                );
            case 'LEGEND':
                return (
                    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 12L16 4L28 12V24L16 30L4 24V12Z" fill="#ff4d00" fillOpacity="0.2" stroke="#ff4d00" strokeWidth="2" />
                        <path d="M16 8L10 20H22L16 8Z" fill="#ff4d00" />
                        <path d="M8 22H24V25H8V22Z" fill="#ff4d00" />
                    </svg>
                );
            case 'DIAMOND':
                return (
                    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 4L26 12L16 28L6 12L16 4Z" fill="#00d4ff" fillOpacity="0.2" stroke="#00d4ff" strokeWidth="2" />
                        <path d="M16 8L22 13L16 22L10 13L16 8Z" fill="#00d4ff" />
                    </svg>
                );
            case 'PLATINUM':
                return (
                    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="6" width="20" height="20" rx="2" transform="rotate(45 16 16)" fill="#ffffff" fillOpacity="0.2" stroke="#ffffff" strokeWidth="2" />
                        <path d="M16 10L18 16L24 18L18 20L16 26L14 20L8 18L14 16L16 10Z" fill="white" />
                    </svg>
                );
            case 'GOLD':
                return (
                    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="12" fill="#fbbf24" fillOpacity="0.2" stroke="#fbbf24" strokeWidth="2" />
                        <path d="M16 8L20 20H12L16 8Z" fill="#fbbf24" />
                        <rect x="12" y="22" width="8" height="2" fill="#fbbf24" />
                    </svg>
                );
            case 'SILVER':
                return (
                    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 6L26 24H6L16 6Z" fill="#94a3b8" fillOpacity="0.2" stroke="#94a3b8" strokeWidth="2" />
                        <circle cx="16" cy="18" r="4" fill="#94a3b8" />
                    </svg>
                );
            default:
                return (
                    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 8H24V24H8V8Z" fill="#b45309" fillOpacity="0.2" stroke="#b45309" strokeWidth="2" />
                        <path d="M12 12H20V20H12V12Z" fill="#b45309" />
                    </svg>
                );
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ filter: `drop-shadow(${config.glow})`, display: 'flex' }}>
                {renderIcon()}
            </div>
            {showLabel && (
                <span style={{ fontSize: '10px', fontWeight: 900, color: config.color, letterSpacing: '1px' }}>{config.label}</span>
            )}
        </div>
    );
};
