import React, { useEffect, useState } from 'react';
import { ArrowRight, Layout, MessageSquare, BarChart3, Shield } from 'lucide-react';
import { Logo } from './Logo';
import { motion, useInView } from 'framer-motion';

const Section: React.FC<{ children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }> = ({ children, delay = 0, className, style }) => {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    );
};

export const Landing: React.FC<{ onLaunch: () => void }> = ({ onLaunch }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        { icon: <Layout size={24} />, title: 'Unified Dashboard', desc: 'Everything you need in one clean, intuitive interface designed for focus and productivity.' },
        { icon: <MessageSquare size={24} />, title: 'Secure Communications', desc: 'Enterprise-grade encryption for all your private and community conversations.' },
        { icon: <BarChart3 size={24} />, title: 'Advanced Analytics', desc: 'Track growth, engagement, and reputation metrics with real-time data visualization.' },
        { icon: <Shield size={24} />, title: 'Privacy First', desc: 'Your data stays yours. We ensure your privacy is never compromised.' }
    ];

    return (
        <div style={{ background: 'var(--bg-app)', color: 'var(--text-main)', minHeight: '100vh' }}>
            {/* Navigation */}
            <motion.nav 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{ 
                    position: 'fixed', top: 0, width: '100%', zIndex: 1000,
                    padding: '0 40px', height: scrolled ? '60px' : '72px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: scrolled ? 'rgba(15, 23, 42, 0.95)' : 'transparent',
                    backdropFilter: scrolled ? 'blur(16px)' : 'none',
                    borderBottom: scrolled ? '1px solid var(--border-light)' : 'none',
                    transition: 'all 0.3s ease'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Logo size={28} />
                    <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.3px' }}>GWET</span>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button 
                        onClick={onLaunch}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', fontWeight: 600, cursor: 'pointer', padding: '10px 16px', fontSize: '14px' }}
                    >
                        Sign In
                    </button>
                    <button 
                        className="btn-primary" 
                        onClick={onLaunch}
                        style={{ height: '40px', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}
                    >
                        Get Started <ArrowRight size={15} />
                    </button>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section style={{ 
                paddingTop: '160px', paddingBottom: '120px', textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '160px 24px 120px'
            }}>
                <Section>
                    <div style={{ 
                        padding: '6px 14px', background: 'rgba(56, 189, 248, 0.08)', 
                        color: 'var(--brand-primary)', borderRadius: '20px', fontSize: '12px', 
                        fontWeight: 600, marginBottom: '28px', border: '1px solid rgba(56, 189, 248, 0.15)',
                        display: 'inline-flex', alignItems: 'center', gap: '6px'
                    }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                        Platform v1.2 — Enterprise Ready
                    </div>
                </Section>

                <Section delay={0.1}>
                    <h1 style={{ 
                        fontSize: 'clamp(2.5rem, 5.5vw, 4rem)', fontWeight: 800, 
                        maxWidth: '800px', lineHeight: 1.1, marginBottom: '20px',
                        letterSpacing: '-1.5px'
                    }}>
                        Connect. Coordinate.{' '}
                        <span style={{ 
                            background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>Scale.</span>
                    </h1>
                </Section>

                <Section delay={0.2}>
                    <p style={{ 
                        fontSize: '1.1rem', color: 'var(--text-dim)', maxWidth: '560px', 
                        lineHeight: 1.7, marginBottom: '40px'
                    }}>
                        The professional platform for high-performance teams and communities. 
                        Secure, fast, and built for modern collaboration.
                    </p>
                </Section>

                <Section delay={0.3}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button 
                            className="btn-primary" 
                            style={{ height: '52px', padding: '0 28px', fontSize: '15px', fontWeight: 600 }}
                            onClick={onLaunch}
                        >
                            Start Free
                        </button>
                        <button 
                            style={{ 
                                height: '52px', padding: '0 28px', background: 'rgba(255,255,255,0.04)',
                                border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer', fontSize: '15px'
                            }}
                        >
                            Learn More
                        </button>
                    </div>
                </Section>
            </section>

            {/* Features */}
            <section style={{ padding: '60px 24px 100px', maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                    {features.map((f, i) => (
                        <Section key={i} delay={i * 0.1}>
                            <div className="card-professional" style={{ 
                                display: 'flex', flexDirection: 'column', gap: '14px', height: '100%',
                                cursor: 'default'
                            }}>
                                <div style={{ 
                                    width: '44px', height: '44px', borderRadius: 'var(--radius-sm)',
                                    background: 'rgba(56, 189, 248, 0.08)', display: 'flex', 
                                    alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)'
                                }}>
                                    {f.icon}
                                </div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{f.title}</h3>
                                <p style={{ color: 'var(--text-dim)', fontSize: '14px', lineHeight: 1.6 }}>{f.desc}</p>
                            </div>
                        </Section>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <Section>
                <footer style={{ 
                    padding: '48px 24px', borderTop: '1px solid var(--border-light)', textAlign: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Logo size={20} />
                        <span style={{ fontWeight: 700, fontSize: '15px' }}>GWET</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>© 2026 GWET Systems. All rights reserved.</p>
                </footer>
            </Section>
        </div>
    );
};
