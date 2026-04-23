import React, { useEffect, useState } from 'react';
import { Zap, Shield, Trophy, Users, MessageSquare, Play, Globe, Star, ArrowRight, ChevronRight, Activity, Terminal } from 'lucide-react';
import { Logo } from './Logo';

export const Landing: React.FC<{ onLaunch: () => void }> = ({ onLaunch }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="landing-page" style={{ background: 'var(--bg-deep)', color: 'var(--text-primary)', position: 'relative', overflow: 'hidden' }}>
            <div className="glow-mesh" />
            <div className="scan-line" />

            {/* Premium Header */}
            <nav style={{ 
                position: 'fixed', top: 0, width: '100%', zIndex: 1000,
                padding: scrolled ? '12px 48px' : '24px 48px', 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: scrolled ? 'var(--bg-surface)' : 'transparent',
                backdropFilter: scrolled ? 'var(--glass-blur)' : 'none',
                borderBottom: scrolled ? 'var(--glass-border)' : 'none',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <Logo size={scrolled ? 28 : 36} />
                    <span style={{ 
                        fontFamily: 'var(--font-sans)', fontWeight: 900, 
                        fontSize: scrolled ? '18px' : '22px', letterSpacing: '2px',
                        textTransform: 'uppercase'
                    }}>GWET</span>
                </div>
                
                <div className="hide-mobile" style={{ display: 'flex', gap: '40px', fontSize: '11px', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' }}>
                    {['Tactics', 'Network', 'Leaderboard', 'HQ'].map(item => (
                        <a key={item} href={`#${item.toLowerCase()}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>{item}</a>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <button className="btn btn-ghost hide-mobile" onClick={onLaunch} style={{ border: 'none' }}>LOG_IN</button>
                    <button className="btn btn-primary" onClick={onLaunch} style={{ height: '40px', padding: '0 24px', borderRadius: '0' }}>
                        INITIALIZE <ChevronRight size={16} />
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{ 
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 48px', position: 'relative'
            }}>
                <div style={{ maxWidth: '1400px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
                    <div className="hero-content" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
                        <div className="chip" style={{ marginBottom: '32px', color: 'var(--brand-electric)', background: 'var(--brand-glow)', border: '1px solid var(--border-active)' }}>
                           <Activity size={12} style={{ marginRight: '8px' }} /> LIVE_SYSTEM_V1.1_ACTIVE
                        </div>
                        <h1 style={{ 
                            fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 0.9, 
                            fontWeight: 900, marginBottom: '32px', letterSpacing: '-2px',
                            textTransform: 'uppercase'
                        }}>
                            Dominate the <span className="text-gradient">Registry.</span>
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '580px', marginBottom: '48px', lineHeight: 1.6 }}>
                            The next generation of tactical coordination. Secure your squad, track global influence, and execute operations with zero latency.
                        </p>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <button className="btn btn-primary" style={{ height: '56px', padding: '0 40px', fontSize: '14px' }} onClick={onLaunch}>
                                ENTER_VAULT <Terminal size={18} style={{ marginLeft: '12px' }} />
                            </button>
                            <button className="btn btn-ghost" style={{ height: '56px', padding: '0 32px' }}>
                                CORE_INTEL
                            </button>
                        </div>
                    </div>

                    <div className="hero-visual hide-mobile" style={{ position: 'relative' }}>
                        <div style={{ 
                            width: '500px', height: '500px', 
                            background: 'radial-gradient(circle, var(--brand-glow) 0%, transparent 70%)',
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            zIndex: -1
                        }} />
                        <div style={{ animation: 'float 6s ease-in-out infinite', filter: 'drop-shadow(0 0 50px var(--brand-glow))' }}>
                            <Logo size={450} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Grid */}
            <section id="tactics" style={{ padding: '120px 48px', position: 'relative' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '6px', color: 'var(--brand-electric)', marginBottom: '16px' }}>SYSTEM_CAPABILITIES</h2>
                        <h3 style={{ fontSize: '48px', fontWeight: 900, textTransform: 'uppercase' }}>Tactical Infrastructure</h3>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
                        {[
                            { icon: <Zap />, title: 'NEURAL_LINK', desc: 'Zero-latency synchronization for mission-critical squad updates.' },
                            { icon: <Shield />, title: 'ENCRYPTED_COMMS', desc: 'Secure, private communication channels with multi-layered protection.' },
                            { icon: <Trophy />, title: 'GLOBAL_INFLUENCE', desc: 'Real-time leaderboard tracking and tier-based reputation system.' },
                            { icon: <Users />, title: 'SQUAD_ENGINE', desc: 'Advanced clan management with granular role and permission control.' },
                            { icon: <Activity />, title: 'LIVE_ANALYTICS', desc: 'Monitor engagement metrics and node activity across all sectors.' },
                            { icon: <Globe />, title: 'REGIONAL_NODES', desc: 'High-performance routing for seamless connectivity worldwide.' }
                        ].map((f, i) => (
                            <div key={i} className="card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ 
                                    width: '56px', height: '56px', background: 'var(--bg-input)', 
                                    border: '1px solid var(--border-subtle)', display: 'flex', 
                                    alignItems: 'center', justifyContent: 'center', color: 'var(--brand-electric)'
                                }}>
                                    {f.icon}
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '12px', letterSpacing: '1px' }}>{f.title}</h4>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '100px 48px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '80px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                           <Logo size={32} />
                           <span style={{ fontWeight: 900, fontSize: '20px', letterSpacing: '2px' }}>GWET</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '300px', lineHeight: 1.6 }}>
                            Engineered for high-stakes coordination and decentralized community growth.
                        </p>
                    </div>
                    {['Registry', 'Network', 'Legal'].map(cat => (
                        <div key={cat}>
                            <h5 style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '24px', color: 'var(--text-muted)' }}>{cat}</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {['Protocol', 'Sectors', 'Nodes', 'Intel'].map(item => (
                                    <a key={item} href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px' }}>{item}</a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </footer>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-20px) scale(1.02); }
                }
            `}</style>
        </div>
    );
};
