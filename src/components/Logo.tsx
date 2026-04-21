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
                src="/logo.svg" 
                alt="Gwet Logo" 
                style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain'
                }} 
            />
        </div>
    );
};

