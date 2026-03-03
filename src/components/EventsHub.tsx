import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { api } from '../lib/api';
import { Calendar, Users, MapPin, Award, Trophy, ChevronRight, Plus, X, Loader2, ScrollText, CheckCircle2, UserPlus } from 'lucide-react';

interface Event {
    id: string;
    title: string;
    description: string;
    rules?: string;
    start_time: string;
    event_type: 'tournament' | 'meetup';
    prize_pool: string;
    registration_fee: string;
    frame_type?: string;
    max_slots?: number;
    participant_count?: number;
    squad_id?: string;
    creator_id: string;
}

const TournamentFrame: React.FC<{ type?: string; children: React.ReactNode }> = ({ type, children }) => {
    const getFrameStyles = () => {
        switch (type) {
            case 'neon':
                return { border: '2px solid var(--primary)', boxShadow: '0 0 15px var(--primary-glow)' };
            case 'gold':
                return { border: '2px solid var(--gold)', boxShadow: '0 0 15px rgba(251, 191, 36, 0.3)' };
            case 'cyan':
                return { border: '2px solid var(--accent)', boxShadow: '0 0 15px var(--accent-glow)' };
            default:
                return { border: '1px solid var(--glass-border)' };
        }
    };

    return (
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--stable-radius)', ...getFrameStyles() }}>
            {children}
            {type && type !== 'none' && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: type === 'gold' ? 'var(--gold)' : (type === 'neon' ? 'var(--primary)' : 'var(--accent)') }} />
            )}
        </div>
    );
};

export const EventsHub: React.FC = () => {
    const { t, isRTL } = useTranslation();
    const [activeType, setActiveType] = useState<'all' | 'tournament' | 'meetup'>('all');
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newEvt, setNewEvt] = useState({ title: '', description: '', rules: '', startTime: '', eventType: 'tournament', prizePool: '', registrationFee: 'free', frameType: 'none', maxSlots: 50 });
    const [submitting, setSubmitting] = useState(false);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const { events } = await api.events.list(activeType);
            setEvents(events);
        } catch (err) {
            console.error('Fetch events failed:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [activeType]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.events.create(newEvt);
            setShowCreateModal(false);
            setNewEvt({ title: '', description: '', rules: '', startTime: '', eventType: 'tournament', prizePool: '', registrationFee: 'free', frameType: 'none', maxSlots: 50 });
            fetchEvents();
        } catch (err) {
            console.error('Create event failed:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleJoin = async (id: string) => {
        try {
            await api.events.join(id);
            alert(isRTL ? 'تم الانضمام بنجاح!' : 'Joined successfully!');
            fetchEvents();
        } catch (err) {
            console.error('Join event failed:', err);
        }
    };

    return (
        <div className="page-container" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            <div className="section-header">
                <div className="icon-wrap" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}><Calendar size={22} /></div>
                <div>
                    <h2 style={{ textTransform: 'uppercase', letterSpacing: '2px' }}>{isRTL ? 'محرك الفعاليات' : 'EVENTS ENGINE'}</h2>
                    <p className="subtitle">{isRTL ? 'نظام البطولات واللقاءات العالمي' : 'GLOBAL TOURNAMENTS & MEETUPS SYSTEM'}</p>
                </div>
                <button className="btn primary sharp" onClick={() => setShowCreateModal(true)} style={{ marginLeft: isRTL ? 0 : 'auto', marginRight: isRTL ? 'auto' : 0, fontWeight: 900 }}>
                    <Plus size={16} /> {isRTL ? 'إنشاء حدث' : 'CREATE EVENT'}
                </button>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                <button className={`btn sm sharp ${activeType === 'all' ? 'primary' : 'ghost'}`} onClick={() => setActiveType('all')}>{isRTL ? 'الكل' : 'ALL'}</button>
                <button className={`btn sm sharp ${activeType === 'tournament' ? 'primary' : 'ghost'}`} onClick={() => setActiveType('tournament')}>{isRTL ? 'بطولات' : 'TOURNAMENTS'}</button>
                <button className={`btn sm sharp ${activeType === 'meetup' ? 'primary' : 'ghost'}`} onClick={() => setActiveType('meetup')}>{isRTL ? 'لقاءات' : 'MEETUPS'}</button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader2 className="spinner" size={32} color="var(--primary)" />
                </div>
            ) : events.length === 0 ? (
                <div className="glass-card sharp" style={{ textAlign: 'center', padding: '4rem' }}>
                    <Calendar size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.3 }} />
                    <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>{isRTL ? 'لا توجد فعاليات مجدولة حالياً' : 'NO EVENTS SCHEDULED YET'}</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-xl)' }}>
                    {events.map(event => (
                        <TournamentFrame key={event.id} type={event.frame_type}>
                            <div className="glass-card sharp" style={{ padding: 0, border: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ height: '140px', background: event.event_type === 'tournament' ? 'linear-gradient(135deg, #1e1e2e, #2d2d3d)' : 'linear-gradient(135deg, #161e2e, #1e293b)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {event.event_type === 'tournament' ? <Trophy size={56} color="var(--primary)" opacity={0.4} /> : <Users size={56} color="var(--accent)" opacity={0.4} />}
                                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', padding: '4px 10px', fontSize: '10px', fontWeight: 900, color: 'white', letterSpacing: '1px' }}>
                                        {event.event_type.toUpperCase()}
                                    </div>
                                    {event.prize_pool && event.prize_pool !== '0' && (
                                        <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'var(--gold)', color: 'black', padding: '4px 12px', fontSize: '12px', fontWeight: 900 }}>
                                            {event.prize_pool} PRIZE
                                        </div>
                                    )}
                                </div>

                                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 900 }}>{event.title}</h3>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>{event.description}</p>

                                    {event.rules && (
                                        <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', border: '1px solid var(--glass-border)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                                                <ScrollText size={12} /> {isRTL ? 'القواعد' : 'RULES'}
                                            </div>
                                            <p style={{ fontSize: '11px', whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>{event.rules}</p>
                                        </div>
                                    )}

                                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            <div style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                                                <Calendar size={14} /> {new Date(event.start_time).toLocaleDateString()}
                                            </div>
                                            <div style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                                                <UserPlus size={14} /> {event.participant_count || 0} / {event.max_slots || '∞'}
                                            </div>
                                        </div>

                                        <button className="btn primary sharp" disabled={(event.participant_count || 0) >= (event.max_slots || 99999)} onClick={() => handleJoin(event.id)} style={{ width: '100%', marginTop: '0.5rem', height: '40px', fontWeight: 900 }}>
                                            {isRTL ? 'التسجيل الآن' : 'REGISTER NOW'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </TournamentFrame>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)' }} onClick={() => setShowCreateModal(false)}>
                    <div className="glass-card sharp neon-border" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{isRTL ? 'بث بطولة جديدة' : 'BROADCAST NEW EVENT'}</h2>
                            <button className="btn ghost icon-only" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label className="label">{isRTL ? 'العنوان' : 'EVENT TITLE'}</label>
                                <input className="gaming-input" style={{ marginBottom: 0 }} required value={newEvt.title} onChange={e => setNewEvt({ ...newEvt, title: e.target.value })} placeholder="e.g. Pro Valorant Scrims" />
                            </div>
                            <div>
                                <label className="label">{isRTL ? 'الوصف' : 'DESCRIPTION'}</label>
                                <textarea className="gaming-input" style={{ marginBottom: 0, minHeight: '80px' }} value={newEvt.description} onChange={e => setNewEvt({ ...newEvt, description: e.target.value })} placeholder="Tell people what this is about..." />
                            </div>
                            <div>
                                <label className="label">{isRTL ? 'القواعد' : 'RULES & REGS'}</label>
                                <textarea className="gaming-input" style={{ marginBottom: 0, minHeight: '80px', fontFamily: 'monospace', fontSize: '12px' }} value={newEvt.rules} onChange={e => setNewEvt({ ...newEvt, rules: e.target.value })} placeholder="1. Respect players\n2. No cheats..." />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <label className="label">{isRTL ? 'الوقت' : 'START TIME'}</label>
                                    <input type="datetime-local" className="gaming-input" style={{ marginBottom: 0 }} required value={newEvt.startTime} onChange={e => setNewEvt({ ...newEvt, startTime: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">{isRTL ? 'النوع' : 'CATEGORY'}</label>
                                    <select className="gaming-input" style={{ marginBottom: 0 }} value={newEvt.eventType} onChange={e => setNewEvt({ ...newEvt, eventType: e.target.value as any })}>
                                        <option value="tournament">{isRTL ? 'بطولة' : 'Tournament'}</option>
                                        <option value="meetup">{isRTL ? 'لقاء' : 'Meetup'}</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <label className="label">{isRTL ? 'الجائزة' : 'PRIZE POOL'}</label>
                                    <input className="gaming-input" style={{ marginBottom: 0 }} value={newEvt.prizePool} onChange={e => setNewEvt({ ...newEvt, prizePool: e.target.value })} placeholder="e.g. 1000$" />
                                </div>
                                <div>
                                    <label className="label">{isRTL ? 'عدد المقاعد' : 'MAX SLOTS'}</label>
                                    <input type="number" className="gaming-input" style={{ marginBottom: 0 }} value={newEvt.maxSlots} onChange={e => setNewEvt({ ...newEvt, maxSlots: parseInt(e.target.value) })} />
                                </div>
                            </div>

                            <div>
                                <label className="label">{isRTL ? 'إطار الإعلان' : 'PROMO FRAME'}</label>
                                <select className="gaming-input" style={{ marginBottom: 0 }} value={newEvt.frameType} onChange={e => setNewEvt({ ...newEvt, frameType: e.target.value })}>
                                    <option value="none">None</option>
                                    <option value="neon">Neon Purple</option>
                                    <option value="gold">Elite Gold</option>
                                    <option value="cyan">Cyber Cyan</option>
                                </select>
                            </div>

                            <button className="btn primary sharp" disabled={submitting} style={{ marginTop: '1rem', padding: '1rem', fontSize: '1rem', fontWeight: 900 }}>
                                {submitting ? <Loader2 className="spinner" size={20} /> : (isRTL ? 'نشر الفعالية' : 'BROADCAST EVENT')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
