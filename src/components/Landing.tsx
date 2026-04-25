import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronRight, Globe, Shield, Zap, Layout, MessageSquare, BarChart3 } from 'lucide-react';
import { Logo } from './Logo';

export const Landing: React.FC<{ onLaunch: () => void }> = ({ onLaunch }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div style={{ background: 'var(--bg-app)', color: 'var(--text-main)', minHeight: '100vh' }}>
            {/* Navigation */}
            <nav style={{ 
                position: 'fixed', top: 0, width: '100%', zIndex: 1000,
                padding: '0 40px', height: scrolled ? '64px' : '80px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: scrolled ? 'rgba(15, 23, 42, 0.9)' : 'transparent',
                backdropFilter: scrolled ? 'blur(12px)' : 'none',
                borderBottom: scrolled ? '1px solid var(--border-light)' : 'none',
                transition: 'all 0.3s ease'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Logo size={32} />
                    <span style={{ fontWeight: 700, fontSize: '20px', letterSpacing: '-0.5px' }}>GWET</span>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                        onClick={onLaunch}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', fontWeight: 600, cursor: 'pointer', padding: '8px 16px' }}
                    >
                        Sign In
                    </button>
                    <button 
                        className="btn-primary" 
                        onClick={onLaunch}
                        style={{ height: '40px', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        Get Started <ArrowRight size={16} />
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{ 
                paddingTop: '160px', paddingBottom: '100px', textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
                <div style={{ 
                    padding: '6px 12px', background: 'rgba(56, 189, 248, 0.1)', 
                    color: 'var(--brand-primary)', borderRadius: '20px', fontSize: '12px', 
                    fontWeight: 700, marginBottom: '32px', border: '1px solid rgba(56, 189, 248, 0.2)'
                }}>
                    v1.2 ENTERPRISE READY
                </div>
                <h1 style={{ 
                    fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, 
                    maxWidth: '900px', lineHeight: 1.1, marginBottom: '24px',
                    letterSpacing: '-1.5px'
                }}>
                    Connect. Coordinate. <span style={{ color: 'var(--brand-primary)' }}>Scale.</span>
                </h1>
                <p style={{ 
                    fontSize: '1.2rem', color: 'var(--text-dim)', maxWidth: '640px', 
                    lineHeight: 1.6, marginBottom: '40px'
                }}>
                    The professional communication platform for high-performance teams and communities. 
                    Simple, secure, and built for modern coordination.
                </p>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                        className="btn-primary" 
                        style={{ height: '56px', padding: '0 32px', fontSize: '16px' }}
                        onClick={onLaunch}
                    >
                        Create Your Network
                    </button>
                    <button 
                        style={{ 
                            height: '56px', padding: '0 32px', background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)',
                            color: 'white', fontWeight: 600, cursor: 'pointer'
                        }}
                    >
                        View Demo
                    </button>
                </div>
            </section>

            {/* Features */}
            <section style={{ padding: '80px 40px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    {[
                        { icon: <Layout />, title: 'Unified Dashboard', desc: 'Everything you need in one clean, intuitive interface designed for focus.' },
                        { icon: <MessageSquare />, title: 'Secure Comms', desc: 'Enterprise-grade encryption for all your private and community conversations.' },
                        { icon: <BarChart3 />, title: 'Advanced Analytics', desc: 'Track growth, engagement, and reputation metrics with real-time data.' },
                        { icon: <Shield />, title: 'Privacy First', desc: 'You own your data. We ensure your privacy is never compromised.' }
                    ].map((f, i) => (
                        <div key={i} className="card-professional" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ color: 'var(--brand-primary)' }}>{f.icon}</div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{f.title}</h3>
                            <p style={{ color: 'var(--text-dim)', fontSize: '14px', lineHeight: 1.6 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer style={{ 
                padding: '60px 40px', borderTop: '1px solid var(--border-light)',
                marginTop: '100px', textAlign: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
                    <Logo size={24} />
                    <span style={{ fontWeight: 700, fontSize: '18px' }}>GWET</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '32px' }}>
                    {['Features', 'Solutions', 'Security', 'About'].map(l => (
                        <a key={l} href="#" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '14px' }}>{l}</a>
                    ))}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>© 2026 GWET Systems. All rights reserved.</p>
            </footer>
        </div>
    );
};
