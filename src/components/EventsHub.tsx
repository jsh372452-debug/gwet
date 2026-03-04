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
                return { border: '2px solid var(--primary)', boxShadow: '0 0 20px var(--primary-glow)' };
            case 'gold':
                return { border: '2px solid var(--gold)', boxShadow: '0 0 20px rgba(251, 191, 36, 0.4)' };
            case 'cyan':
                return { border: '2px solid var(--accent)', boxShadow: '0 0 20px var(--accent-glow)' };
            default:
                return { border: '1px solid var(--glass-border)' };
        }
    };

    return (
        <div className="pulse-hover" style={{ position: 'relative', overflow: 'hidden', borderRadius: '20px', ...getFrameStyles() }}>
            {children}
            {type && type !== 'none' && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: type === 'gold' ? 'var(--gold)' : (type === 'neon' ? 'var(--primary)' : 'var(--accent)'), zIndex: 10 }} />
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '2.5rem' }}>
                <div style={{ padding: '12px', background: 'var(--primary-glow)', borderRadius: '12px', color: 'var(--primary)' }}><Calendar size={32} /></div>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>{isRTL ? 'محرك الفعاليات' : 'EVENTS ENGINE'}</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 700 }}>{isRTL ? 'نظام البطولات واللقاءات العالمي' : 'GLOBAL TOURNAMENTS & MEETUPS SYSTEM'}</p>
                </div>
                <button className="btn primary" onClick={() => setShowCreateModal(true)} style={{ marginLeft: isRTL ? 0 : 'auto', marginRight: isRTL ? 'auto' : 0 }}>
                    <Plus size={16} /> {isRTL ? 'إنشاء حدث' : 'CREATE EVENT'}
                </button>
            </div>

            <div className="tabs">
                <button className={`tab ${activeType === 'all' ? 'active' : ''}`} onClick={() => setActiveType('all')}>{isRTL ? 'الكل' : 'ALL'}</button>
                <button className={`tab ${activeType === 'tournament' ? 'active' : ''}`} onClick={() => setActiveType('tournament')}>{isRTL ? 'بطولات' : 'TOURNAMENTS'}</button>
                <button className={`tab ${activeType === 'meetup' ? 'active' : ''}`} onClick={() => setActiveType('meetup')}>{isRTL ? 'لقاءات' : 'MEETUPS'}</button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader2 className="spinner" size={32} color="var(--primary)" />
                </div>
            ) : events.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <Calendar size={48} color="var(--text-dim)" style={{ marginBottom: '1rem', opacity: 0.2 }} />
                    <p style={{ color: 'var(--text-dim)', fontWeight: 800 }}>{isRTL ? 'لا توجد فعاليات مجدولة حالياً' : 'NO EVENTS SCHEDULED YET'}</p>
                </div>
            ) : (
                <div className="grid-2">
                    {events.map(event => (
                        <TournamentFrame key={event.id} type={event.frame_type}>
                            <div className="glass-card" style={{ padding: 0, border: 'none', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)' }}>
                                <div style={{ height: '160px', background: event.event_type === 'tournament' ? 'linear-gradient(135deg, #001a33, #000)' : 'linear-gradient(135deg, #000b1a, #000)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--glass-border)' }}>
                                    {event.event_type === 'tournament' ? <Trophy size={60} color="var(--primary)" style={{ opacity: 0.3 }} /> : <Users size={60} color="var(--accent)" style={{ opacity: 0.3 }} />}
                                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.8)', padding: '4px 12px', fontSize: '9px', fontWeight: 900, color: 'white', letterSpacing: '1px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        {event.event_type.toUpperCase()}
                                    </div>
                                    {event.prize_pool && event.prize_pool !== '0' && (
                                        <div style={{ position: 'absolute', bottom: 12, [isRTL ? 'right' : 'left']: 12, background: 'var(--gold)', color: 'black', padding: '4px 14px', fontSize: '11px', fontWeight: 900, borderRadius: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                                            {event.prize_pool} PRIZE
                                        </div>
                                    )}
                                </div>

                                <div style={{ padding: '2rem 1.5rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 900 }}>{event.title.toUpperCase()}</h3>
                                    <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '1.5rem', lineHeight: '1.6', height: '40px', overflow: 'hidden' }}>{event.description}</p>

                                    {event.rules && (
                                        <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 900, color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>
                                                <ScrollText size={12} /> {isRTL ? 'القواعد' : 'RULES'}
                                            </div>
                                            <p style={{ fontSize: '11px', whiteSpace: 'pre-wrap', color: 'var(--text-main)', margin: 0 }}>{event.rules}</p>
                                        </div>
                                    )}

                                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                                            <div style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontWeight: 700 }}>
                                                <Calendar size={14} /> {new Date(event.start_time).toLocaleDateString()}
                                            </div>
                                            <div style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontWeight: 700, justifyContent: 'flex-end' }}>
                                                <UserPlus size={14} /> {event.participant_count || 0} / {event.max_slots || '∞'}
                                            </div>
                                        </div>

                                        <button className="btn primary" disabled={(event.participant_count || 0) >= (event.max_slots || 99999)} onClick={() => handleJoin(event.id)} style={{ width: '100%', height: '44px' }}>
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
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(15px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} onClick={() => setShowCreateModal(false)}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '3rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, textTransform: 'uppercase' }}>{isRTL ? 'بث بطولة جديدة' : 'BROADCAST NEW EVENT'}</h2>
                            <button className="btn ghost sm" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>{isRTL ? 'العنوان' : 'EVENT TITLE'}</label>
                                <input className="gaming-input" required value={newEvt.title} onChange={e => setNewEvt({ ...newEvt, title: e.target.value })} placeholder="e.g. Pro Valorant Scrims" />
                            </div>
                            <div>
                                <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>{isRTL ? 'الوصف' : 'DESCRIPTION'}</label>
                                <textarea className="gaming-input" style={{ minHeight: '80px' }} value={newEvt.description} onChange={e => setNewEvt({ ...newEvt, description: e.target.value })} placeholder="Tell people what this is about..." />
                            </div>
                            <div>
                                <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>{isRTL ? 'القواعد' : 'RULES & REGS'}</label>
                                <textarea className="gaming-input" style={{ minHeight: '80px', fontFamily: 'monospace', fontSize: '12px' }} value={newEvt.rules} onChange={e => setNewEvt({ ...newEvt, rules: e.target.value })} placeholder="1. Respect players\n2. No cheats..." />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>{isRTL ? 'الوقت' : 'START TIME'}</label>
                                    <input type="datetime-local" className="gaming-input" required value={newEvt.startTime} onChange={e => setNewEvt({ ...newEvt, startTime: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>{isRTL ? 'النوع' : 'CATEGORY'}</label>
                                    <select className="gaming-input" value={newEvt.eventType} onChange={e => setNewEvt({ ...newEvt, eventType: e.target.value as any })}>
                                        <option value="tournament" style={{ background: '#000' }}>{isRTL ? 'بطولة' : 'Tournament'}</option>
                                        <option value="meetup" style={{ background: '#000' }}>{isRTL ? 'لقاء' : 'Meetup'}</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>{isRTL ? 'الجائزة' : 'PRIZE POOL'}</label>
                                    <input className="gaming-input" value={newEvt.prizePool} onChange={e => setNewEvt({ ...newEvt, prizePool: e.target.value })} placeholder="e.g. 1000$" />
                                </div>
                                <div>
                                    <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>{isRTL ? 'عدد المقاعد' : 'MAX SLOTS'}</label>
                                    <input type="number" className="gaming-input" value={newEvt.maxSlots} onChange={e => setNewEvt({ ...newEvt, maxSlots: parseInt(e.target.value) })} />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>{isRTL ? 'إطار الإعلان' : 'PROMO FRAME'}</label>
                                <select className="gaming-input" value={newEvt.frameType} onChange={e => setNewEvt({ ...newEvt, frameType: e.target.value })}>
                                    <option value="none" style={{ background: '#000' }}>None</option>
                                    <option value="neon" style={{ background: '#000' }}>Neon Purple</option>
                                    <option value="gold" style={{ background: '#000' }}>Elite Gold</option>
                                    <option value="cyan" style={{ background: '#000' }}>Cyber Cyan</option>
                                </select>
                            </div>

                            <button className="btn primary" disabled={submitting} style={{ marginTop: '1rem', height: '54px', fontSize: '1.1rem' }}>
                                {submitting ? <Loader2 className="spinner" size={24} /> : (isRTL ? 'نشر الفعالية' : 'BROADCAST EVENT')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
