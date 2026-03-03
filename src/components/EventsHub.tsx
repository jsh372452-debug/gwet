import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { api } from '../lib/api';
import { Calendar, Users, MapPin, Award, Trophy, ChevronRight, Plus, X, Loader2 } from 'lucide-react';

interface Event {
    id: string;
    title: string;
    description: string;
    start_time: string;
    event_type: 'tournament' | 'meetup';
    prize_pool: string;
    registration_fee: string;
    squad_id?: string;
    creator_id: string;
}

export const EventsHub: React.FC = () => {
    const { t, isRTL } = useTranslation();
    const [activeType, setActiveType] = useState<'all' | 'tournament' | 'meetup'>('all');
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newEvt, setNewEvt] = useState({ title: '', description: '', startTime: '', eventType: 'tournament', prizePool: '', registrationFee: 'free' });
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
            setNewEvt({ title: '', description: '', startTime: '', eventType: 'tournament', prizePool: '', registrationFee: 'free' });
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
        } catch (err) {
            console.error('Join event failed:', err);
        }
    };

    return (
        <div className="page-container" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            <div className="section-header">
                <div className="icon-wrap"><Calendar size={22} /></div>
                <div>
                    <h2 style={{ textTransform: 'uppercase' }}>{t('events') || (isRTL ? 'محرك الفعاليات' : 'EVENTS ENGINE')}</h2>
                    <p className="subtitle">{isRTL ? 'البطولات واللقاءات' : 'TOURNAMENTS & MEETUPS'}</p>
                </div>
                <button className="btn primary" onClick={() => setShowCreateModal(true)} style={{ marginLeft: isRTL ? 0 : 'auto', marginRight: isRTL ? 'auto' : 0, borderRadius: 'var(--radius-full)', padding: '0.5rem 1rem' }}>
                    <Plus size={16} /> {isRTL ? 'إنشاء حدث' : 'CREATE EVENT'}
                </button>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                <button className={`btn ${activeType === 'all' ? 'primary' : 'ghost'}`} onClick={() => setActiveType('all')}>{isRTL ? 'الكل' : 'All'}</button>
                <button className={`btn ${activeType === 'tournament' ? 'primary' : 'ghost'}`} onClick={() => setActiveType('tournament')}>{isRTL ? 'بطولات' : 'Tournaments'}</button>
                <button className={`btn ${activeType === 'meetup' ? 'primary' : 'ghost'}`} onClick={() => setActiveType('meetup')}>{isRTL ? 'لقاءات' : 'Meetups'}</button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader2 className="spinner" size={32} color="var(--primary)" />
                </div>
            ) : events.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <Calendar size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.3 }} />
                    <p style={{ color: 'var(--text-muted)' }}>{isRTL ? 'لا توجد فعاليات مجدولة حالياً' : 'No events scheduled yet'}</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-xl)' }}>
                    {events.map(event => (
                        <div key={event.id} className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--glass-border)', transition: 'transform 0.2s', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ height: '120px', background: event.event_type === 'tournament' ? 'linear-gradient(45deg, #7c3aed, #db2777)' : 'linear-gradient(45deg, #0891b2, #0d9488)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {event.event_type === 'tournament' ? <Trophy size={48} color="white" opacity={0.3} /> : <Users size={48} color="white" opacity={0.3} />}
                                <div style={{ position: 'absolute', top: 12, left: isRTL ? 'auto' : 12, right: isRTL ? 12 : 'auto', background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 900, color: 'white', textTransform: 'uppercase' }}>
                                    {event.event_type === 'tournament' ? (isRTL ? 'بطولة' : 'TOURNAMENT') : (isRTL ? 'لقاء' : 'MEETUP')}
                                </div>
                            </div>

                            <div style={{ padding: 'var(--space-xl)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{event.title}</h3>
                                    {event.prize_pool !== '0' && (
                                        <div style={{ background: 'var(--primary-soft)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Award size={12} /> {event.prize_pool}
                                        </div>
                                    )}
                                </div>

                                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-xl)', height: '40px', overflow: 'hidden' }}>{event.description}</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', fontSize: '12px', color: 'var(--text-muted)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Calendar size={14} /> {new Date(event.start_time).toLocaleString(isRTL ? 'ar-EG' : 'en-US')}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <MapPin size={14} /> {event.registration_fee === 'free' ? (isRTL ? 'مجاني' : 'FREE ENTRY') : event.registration_fee}
                                    </div>
                                </div>

                                <div style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-xl)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                    <button className="btn primary sm" onClick={(e) => { e.stopPropagation(); handleJoin(event.id); }} style={{ padding: '6px 16px', fontSize: '11px', fontWeight: 900 }}>
                                        {isRTL ? 'انضمام' : 'JOIN'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)' }} onClick={() => setShowCreateModal(false)}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{isRTL ? 'إنشاء حدث جديد' : 'CREATE NEW EVENT'}</h2>
                            <button className="btn ghost icon-only" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                            <div>
                                <label className="label">{isRTL ? 'العنوان' : 'TITLE'}</label>
                                <input className="input" required value={newEvt.title} onChange={e => setNewEvt({ ...newEvt, title: e.target.value })} placeholder={isRTL ? 'اسم البطولة أو اللقاء' : 'Tournament or Meeting Name'} />
                            </div>
                            <div>
                                <label className="label">{isRTL ? 'الوصف' : 'DESCRIPTION'}</label>
                                <textarea className="input" value={newEvt.description} onChange={e => setNewEvt({ ...newEvt, description: e.target.value })} placeholder={isRTL ? 'تفاصيل الحدث...' : 'Event details...'} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                <div>
                                    <label className="label">{isRTL ? 'الوقت' : 'START TIME'}</label>
                                    <input type="datetime-local" className="input" required value={newEvt.startTime} onChange={e => setNewEvt({ ...newEvt, startTime: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">{isRTL ? 'النوع' : 'TYPE'}</label>
                                    <select className="input" value={newEvt.eventType} onChange={e => setNewEvt({ ...newEvt, eventType: e.target.value as any })}>
                                        <option value="tournament">{isRTL ? 'بطولة' : 'Tournament'}</option>
                                        <option value="meetup">{isRTL ? 'لقاء' : 'Meetup'}</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                <div>
                                    <label className="label">{isRTL ? 'الجائزة' : 'PRIZE POOL'}</label>
                                    <input className="input" value={newEvt.prizePool} onChange={e => setNewEvt({ ...newEvt, prizePool: e.target.value })} placeholder="e.g. 500$" />
                                </div>
                                <div>
                                    <label className="label">{isRTL ? 'رسوم الدخول' : 'ENTRY FEE'}</label>
                                    <input className="input" value={newEvt.registrationFee} onChange={e => setNewEvt({ ...newEvt, registrationFee: e.target.value })} placeholder="e.g. Free" />
                                </div>
                            </div>
                            <button className="btn primary" disabled={submitting} style={{ marginTop: 'var(--space-md)', padding: '0.8rem' }}>
                                {submitting ? <Loader2 className="spinner" size={18} /> : (isRTL ? 'نشر الحدث' : 'PUBLISH EVENT')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
