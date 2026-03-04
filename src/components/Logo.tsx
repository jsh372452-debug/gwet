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
            <img
                src="/logo.png"
                alt="GWET Logo"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 12px var(--primary-glow))'
                }}
            />
            {/* Added a pulsing background glow for a premium feel */}
            <div
                style={{
                    position: 'absolute',
                    inset: '-10%',
                    borderRadius: '50%',
                    background: 'var(--primary-glow)',
                    filter: 'blur(15px)',
                    opacity: 0.15,
                    zIndex: -1,
                    animation: 'logo-pulse 4s infinite alternate ease-in-out'
                }}
            />
            <style>
                {`
                    @keyframes logo-pulse {
                        from { transform: scale(0.9); opacity: 0.1; }
                        to { transform: scale(1.1); opacity: 0.2; }
                    }
                `}
            </style>
        </div>
    );
};
