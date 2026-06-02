import React from 'react';

interface GamingShellProps {
    children: React.ReactNode;
    compact?: boolean;
}

export const GamingShell: React.FC<GamingShellProps> = ({ children, compact }) => {
    return (
        <div className={`gwet-shell ${compact ? 'gwet-shell-compact' : ''}`}>
            <div className="gwet-mesh" aria-hidden />
            <header className="gwet-shell-header">
                <div className="gwet-brand-lockup">
                    <img src="/assets/gwet-mark.svg" alt="" className="gwet-mark" />
                    <span className="font-display gwet-brand-text">GWET</span>
                </div>
                <nav className="gwet-shell-nav glass-navbar font-nav">
                    <span className="gwet-nav-active">HOME</span>
                    <span>GAMES</span>
                    <span>NETWORK</span>
                    <span>PRO</span>
                </nav>
            </header>
            <main className="gwet-shell-main">{children}</main>
        </div>
    );
};
