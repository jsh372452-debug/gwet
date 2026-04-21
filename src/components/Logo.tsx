import React from 'react';

interface LogoProps {
    size?: number;
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 40, className = "" }) => {
    return (
        <div
            className={`logo-container ${className}`}
            style={{
                width: size,
                height: size,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'transform 0.3s ease'
            }}
        >
            <svg 
                viewBox="0 0 100 100" 
                style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' }}
            >
                {/* Tornado / Vortex Rings */}
                <path 
                    d="M20 30 Q50 20 80 30 T50 40 T20 30" 
                    fill="none" stroke="var(--brand-storm)" strokeWidth="3" opacity="0.4"
                />
                <path 
                    d="M25 45 Q50 35 75 45 T50 55 T25 45" 
                    fill="none" stroke="var(--brand-storm)" strokeWidth="4" opacity="0.6"
                />
                <path 
                    d="M30 60 Q50 50 70 60 T50 70 T30 60" 
                    fill="none" stroke="var(--brand-storm)" strokeWidth="5" opacity="0.8"
                />
                <path 
                    d="M40 75 Q50 70 60 75 T50 85 T40 75" 
                    fill="none" stroke="var(--brand-storm)" strokeWidth="6"
                />
                
                {/* Central Lightning Bolt */}
                <path 
                    d="M60 10 L45 45 L55 45 L40 90 L45 55 L35 55 Z" 
                    fill="var(--brand-electric)"
                    style={{ filter: 'drop-shadow(0 0 4px white)' }}
                >
                    <animate 
                        attributeName="opacity" 
                        values="1;0.8;1;0.9;1" 
                        dur="2s" 
                        repeatCount="indefinite" 
                    />
                </path>
            </svg>

            {/* Glowing background halo */}
            <div
                style={{
                    position: 'absolute',
                    inset: '0',
                    borderRadius: '50%',
                    background: 'var(--brand-glow)',
                    filter: 'blur(20px)',
                    opacity: 0.1,
                    zIndex: -1,
                    animation: 'logo-pulse 4s infinite alternate ease-in-out'
                }}
            />
            <style>
                {`
                    @keyframes logo-pulse {
                        from { transform: scale(0.8); opacity: 0.05; }
                        to { transform: scale(1.2); opacity: 0.15; }
                    }
                `}
            </style>
        </div>
    );
};
