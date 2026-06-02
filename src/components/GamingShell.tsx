import React from 'react';

interface GamingShellProps {
    children: React.ReactNode;
    compact?: boolean;
}

/** Shared GWET gaming backdrop — Discord-style split layout */
export const GamingShell: React.FC<GamingShellProps> = ({ children, compact }) => {
    return (
        <div className={`gwet-shell ${compact ? 'gwet-shell-compact' : ''}`}>
            <header className="gwet-shell-header">
                <img
                    src="/assets/gwet-logo-3d.png"
                    alt="GWET"
                    className="gwet-logo-3d floating-logo"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.svg';
                    }}
                />
                <div className="gwet-shell-header-line" aria-hidden />
                <nav className="gwet-shell-nav glass-navbar font-nav">
                    <span className="gwet-nav-active"><span className="font-bold">00</span> HOME</span>
                    <span><span className="font-bold">01</span> GAMES</span>
                    <span><span className="font-bold">02</span> NETWORK</span>
                    <span><span className="font-bold">03</span> COMMUNITY</span>
                </nav>
            </header>
            <main className="gwet-shell-main">{children}</main>
        </div>
    );
};
