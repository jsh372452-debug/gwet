import React from 'react';

interface LogoProps {
    size?: number;
    className?: string;
    style?: React.CSSProperties;
}

export const Logo: React.FC<LogoProps> = ({ size = 40, className = "", style = {} }) => {
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
                ...style
            }}
        >
            <img 
                src="/logo.svg" 
                alt="Gwet Logo" 
                style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 8px var(--brand-glow))'
                }} 
            />
        </div>
    );
};
