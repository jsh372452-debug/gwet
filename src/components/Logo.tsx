import React from 'react';

interface LogoProps {
    size?: number;
    className?: string;
    style?: React.CSSProperties;
}

export const Logo: React.FC<LogoProps> = ({ size = 40, className = '', style = {} }) => (
    <img
        src="/assets/gwet-mark.svg"
        alt="GWET"
        className={`gwet-mark ${className}`}
        style={{ width: size, height: size, objectFit: 'contain', ...style }}
    />
);
