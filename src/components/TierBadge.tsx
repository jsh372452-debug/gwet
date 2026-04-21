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
                return { color: '#ffffff', label: 'MYTHIC_NODE', border: '#ffffff' };
            case 'LEGEND':
                return { color: '#e5e7eb', label: 'LEGEND_CORE', border: '#e5e7eb' };
            case 'DIAMOND':
                return { color: '#9ca3af', label: 'DIAMOND_CELL', border: '#9ca3af' };
            case 'PLATINUM':
                return { color: '#6b7280', label: 'PLATINUM_LINK', border: '#6b7280' };
            case 'GOLD':
                return { color: '#4b5563', label: 'GOLD_UNIT', border: '#4b5563' };
            case 'SILVER':
                return { color: '#374151', label: 'SILVER_SYNC', border: '#374151' };
            default:
                return { color: '#1f2937', label: 'BRONZE_ENTRY', border: '#1f2937' };
        }
    };

    const config = getTierConfig();

    const renderIcon = () => {
        switch (tierKey) {
            case 'MYTHIC':
                return (
                    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="4" width="24" height="24" stroke="var(--text-primary)" strokeWidth="2" />
                        <rect x="10" y="10" width="12" height="12" fill="var(--text-primary)" />
                        <path d="M4 4L10 10M28 4L22 10M4 28L10 22M28 28L22 22" stroke="var(--text-primary)" strokeWidth="1" />
                    </svg>
                );
            case 'LEGEND':
                return (
                    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 4L28 12V20L16 28L4 20V12L16 4Z" stroke="var(--text-primary)" strokeWidth="2" />
                        <rect x="13" y="13" width="6" height="6" fill="var(--text-primary)" />
                    </svg>
                );
            case 'DIAMOND':
                return (
                    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 4L28 16L16 28L4 16L16 4Z" stroke="var(--text-primary)" strokeWidth="2" />
                        <rect x="14" y="14" width="4" height="4" fill="var(--text-primary)" />
                    </svg>
                );
            case 'PLATINUM':
                return (
                    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="6" width="20" height="20" stroke="var(--text-secondary)" strokeWidth="2" />
                        <rect x="12" y="12" width="8" height="8" fill="var(--text-secondary)" />
                    </svg>
                );
            case 'GOLD':
                return (
                    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="8" y="8" width="16" height="16" stroke="var(--text-muted)" strokeWidth="2" />
                        <rect x="13" y="13" width="6" height="6" fill="var(--text-muted)" />
                    </svg>
                );
            case 'SILVER':
                return (
                    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="10" y="10" width="12" height="12" stroke="var(--text-muted)" strokeWidth="2" />
                    </svg>
                );
            default:
                return (
                    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="12" y="12" width="8" height="8" stroke="var(--text-muted)" strokeWidth="1" />
                    </svg>
                );
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ display: 'flex' }}>
                {renderIcon()}
            </div>
            {showLabel && (
                <span style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>{config.label}</span>
            )}
        </div>
    );
};
