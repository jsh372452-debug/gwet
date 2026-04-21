import React, { useEffect, useState } from 'react';
import { Zap, Shield, Trophy, Users, MessageSquare, Play, Globe, Star, ArrowRight } from 'lucide-react';
import { Logo } from './Logo';

export const Landing: React.FC<{ onLaunch: () => void }> = ({ onLaunch }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 80);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="landing-page" style={{ background: 'var(--bg-deep)', color: 'var(--text-primary)' }}>
            {/* Navbar */}
            <nav className={`glass-panel`} style={{ 
                position: 'fixed', top: 0, width: '100%', zIndex: 1000,
                padding: '16px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: scrolled ? 'var(--bg-surface)' : 'transparent',
                borderBottom: scrolled ? '1px solid var(--border-subtle)' : 'none',
                transition: 'all 0.3s ease'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Logo size={32} />
                    <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>Gwet</span>
                </div>
                
                <div className="hide-mobile" style={{ display: 'flex', gap: '32px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    <a href="#features" style={{ color: 'inherit', textDecoration: 'none' }}>Features</a>
                    <a href="#community" style={{ color: 'inherit', textDecoration: 'none' }}>Community</a>
                    <a href="#events" style={{ color: 'inherit', textDecoration: 'none' }}>Events</a>
                    <a href="#pricing" style={{ color: 'inherit', textDecoration: 'none' }}>Pricing</a>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button className="btn btn-ghost hide-mobile" onClick={onLaunch}>Sign In</button>
                    <button className="btn btn-primary" onClick={onLaunch} style={{ background: 'var(--text-primary)', color: 'var(--bg-deep)' }}>
                        Initialize <ArrowRight size={16} />
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{ 
                minHeight: '92vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 48px', overflow: 'hidden'
            }}>
                {/* Background effects */}
                <div style={{ 
                    position: 'absolute', inset: 0, 
                    backgroundImage: 'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
                    backgroundSize: '80px 80px', maskImage: 'radial-gradient(circle, black, transparent 85%)',
                    opacity: 0.15, zIndex: 1
                }} />

                <div style={{ maxWidth: '1200px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 400px', gap: '64px', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                    <div className="hero-content">
                        <div className="chip" style={{ marginBottom: '24px', letterSpacing: '1px' }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-primary)', marginRight: 8 }} />
                            SYSTEM V1.0 ACTIVE
                        </div>
                        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-1px' }}>
                            Secure Protocol.<br/>
                            <span>Digital Identity Matrix.</span>
                        </h1>
                        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '560px', marginBottom: '32px' }}>
                            Establish your credentials, synchronize with the global network, and secure your digital perimeter. Engineered for precision.
                        </p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button className="btn btn-primary" style={{ padding: '16px 28px', fontSize: '16px', background: 'var(--text-primary)', color: 'var(--bg-deep)' }} onClick={onLaunch}>
                                Enter System <ArrowRight size={18} />
                            </button>
                            <button className="btn btn-ghost" style={{ padding: '16px 28px', fontSize: '16px' }}>
                                View Documentation
                            </button>
                        </div>
                        <p style={{ marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                            End-to-end encrypted · Node decentralized
                        </p>
                    </div>

                    <div className="hide-mobile" style={{ textAlign: 'center' }}>
                        <div style={{ 
                            animation: 'float 4s ease-in-out infinite',
                            filter: 'drop-shadow(0 0 40px rgba(59, 130, 246, 0.3))'
                        }}>
                             <Logo size={280} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar hidden for beta */}

            {/* Features section */}
            <section id="features" style={{ padding: '96px 48px', maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '44px', fontWeight: 800, textAlign: 'center', marginBottom: '56px' }}>
                    Why <span className="gradient-text">Gwet</span>
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    {[
                        { icon: <Zap />, title: 'Crystal-clear voice', desc: 'Low-latency voice channels for competitive tactical comms.' },
                        { icon: <Users />, title: 'Clan Management', desc: 'Build your squad, manage roles, and grow your community.' },
                        { icon: <Trophy />, title: 'Global Leaderboards', desc: 'Climb the ranks and earn exclusive badges for your profile.' },
                        { icon: <Play />, title: 'Stream Ready', desc: 'Broadcast your gameplay directly to your server with one click.' },
                        { icon: <Shield />, title: 'Community Safety', desc: 'Integrated moderation tools to keep your squad environment healthy.' },
                        { icon: <Globe />, title: 'Global Connectivity', desc: 'Optimized network routing for low-ping performance across regions.' }
                    ].map((f, i) => (
                        <div key={i} className="card interactive" style={{ padding: '32px' }}>
                            <div style={{ 
                                width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gradient-bolt)', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '20px'
                            }}>
                                {f.icon}
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>{f.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials hidden for beta */}

            {/* Footer */}
            <footer style={{ padding: '80px 48px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-deep)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                           <Logo size={24} />
                           <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: '18px' }}>Gwet</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Where Gamers Connect, Compete & Conquer.</p>
                    </div>
                    {[
                        { t: 'Product', l: ['Features', 'Download', 'Status', 'Changelog'] },
                        { t: 'Community', l: ['Clans', 'Events', 'Streamers', 'Blog'] },
                        { t: 'Company', l: ['About', 'Careers', 'Press', 'Contact'] }
                    ].map(c => (
                        <div key={c.t}>
                            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>{c.t}</h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {c.l.map(li => <li key={li} style={{ color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer' }}>{li}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
                <div style={{ maxWidth: '1200px', margin: '48px auto 0', paddingTop: '32px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '13px' }}>
                    <div>© 2026 Gwet · Privacy · Terms · Cookies</div>
                    <div>English ▾</div>
                </div>
            </footer>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                .hero-content h1 .gradient-text {
                    background: var(--gradient-bolt);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                }
            `}</style>
        </div>
    );
};
