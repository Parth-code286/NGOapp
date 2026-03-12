import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import EventDetailModal from '../../components/EventDetailModal';
import './BrowseEvents.css'; /* Reuse same base styles */
import './RegisteredEvents.css';

const API_BASE = 'http://localhost:5053';

const STATUS_CONFIG = {
  pending:    { label: '⏳ Pending',    cls: 'status-pending'    },
  approved:   { label: '✅ Approved',   cls: 'status-approved'   },
  rejected:   { label: '❌ Rejected',   cls: 'status-rejected'   },
  waitlisted: { label: '📋 Waitlisted', cls: 'status-waitlisted' },
};

const RegisteredEvents = () => {
  const user  = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const [registrations, setRegistrations] = useState([]);
  const [loading,        setLoading]       = useState(true);
  const [error,          setError]         = useState('');
  const [cancelStatus,   setCancelStatus]  = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchRegs = async () => {
    if (!user.id) return;
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('event_registrations')
        .select('*, events(*)')
        .eq('volunteer_id', user.id);
      
      if (fetchError) throw fetchError;
      setRegistrations(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegs();

    const channel = supabase
      .channel(`volunteer-regs-${user.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'event_registrations', 
        filter: `volunteer_id=eq.${user.id}` 
      }, () => fetchRegs())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id]);

  const handleCancel = async (eventId, regId) => {
    setCancelStatus(prev => ({ ...prev, [regId]: 'loading' }));
    try {
      const res = await fetch(`${API_BASE}/events/${eventId}/register/${user.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed');
      setRegistrations(prev => prev.filter(r => r.id !== regId));
    } catch {
      setCancelStatus(prev => ({ ...prev, [regId]: 'error' }));
    }
  };

  if (loading) return (
    <div className="be-wrapper">
      <div className="be-loading"><div className="be-spinner" /><p>Loading your registrations…</p></div>
    </div>
  );

  if (error) return (
    <div className="be-wrapper"><div className="be-error">⚠️ {error}</div></div>
  );

  const upcoming = registrations.filter(r => r.events && new Date(r.events.event_date) >= new Date());
  const past     = registrations.filter(r => r.events && new Date(r.events.event_date) <  new Date());

  return (
    <div className="be-wrapper">
      <div className="be-header">
        <h1 className="be-title">My Registered Events</h1>
        <p className="be-subtitle">Track all events you've signed up for — upcoming and past.</p>
      </div>

      {registrations.length === 0 ? (
        <div className="be-empty">
          <div className="be-empty-icon">📭</div>
          <p>You haven't registered for any events yet.<br/>Go to <strong>Browse Events</strong> to find one!</p>
        </div>
      ) : (
        <>
          {/* ─── Upcoming ─── */}
          {upcoming.length > 0 && (
            <div className="re-section">
              <div className="re-section-title">🗓 Upcoming Events ({upcoming.length})</div>
              <div className="re-list">
                {upcoming.map(reg => {
                  const ev  = reg.events || {};
                  const cfg = STATUS_CONFIG[reg.status] || STATUS_CONFIG.pending;
                  return (
                    <div className="re-card" key={reg.id}>
                      <div className="re-card-left">
                        <div className="re-date-block">
                          <div className="re-month">{ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-IN', { month: 'short' }) : '—'}</div>
                          <div className="re-day">{ev.event_date ? new Date(ev.event_date).getDate() : '—'}</div>
                        </div>
                      </div>
                      <div className="re-card-body">
                        <span className={`re-status ${cfg.cls}`}>{cfg.label}</span>
                        <h3 className="re-event-title">{ev.title || 'Event'}</h3>
                        <div className="re-meta">
                          <span>🏢 {reg.ngo_name || ev.ngo_name || 'NGO'}</span>
                          <span>📍 {ev.city ? `${ev.city}, ${ev.state}` : 'Online'}</span>
                          <span>🕐 {ev.start_time?.slice(0,5)} – {ev.end_time?.slice(0,5)}</span>
                          <span>⏱ {ev.volunteering_hours}h</span>
                        </div>
                        <div className="re-perks">
                          {ev.certificate_provided && <span className="perk-tag">🎓 Certificate</span>}
                          {ev.meals_provided       && <span className="perk-tag">🍽 Meals</span>}
                          {ev.travel_allowance     && <span className="perk-tag">🚌 Travel</span>}
                        </div>
                      </div>
                      <div className="re-card-right">
                        <span className={`re-mode ${ev.mode?.toLowerCase()}`}>{ev.mode}</span>
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                          <button 
                            className="re-cancel-btn"
                            style={{ padding: '0.4rem 0.6rem', color: '#0f172a', backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
                            onClick={() => setSelectedEvent(ev)}
                          >
                            👁 Details
                          </button>
                          {reg.status === 'pending' || reg.status === 'approved' ? (
                            <button
                              className="re-cancel-btn"
                              onClick={() => handleCancel(ev.id, reg.id)}
                              disabled={cancelStatus[reg.id] === 'loading'}
                            >
                              {cancelStatus[reg.id] === 'loading' ? 'Cancelling…' : 'Cancel'}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Past ─── */}
          {past.length > 0 && (
            <div className="re-section">
              <div className="re-section-title">📚 Past Events ({past.length})</div>
              <div className="re-list">
                {past.map(reg => {
                  const ev  = reg.events || {};
                  const cfg = STATUS_CONFIG[reg.status] || STATUS_CONFIG.pending;
                  return (
                    <div className="re-card past" key={reg.id}>
                      <div className="re-card-left">
                        <div className="re-date-block past">
                          <div className="re-month">{ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-IN', { month: 'short' }) : '—'}</div>
                          <div className="re-day">{ev.event_date ? new Date(ev.event_date).getDate() : '—'}</div>
                        </div>
                      </div>
                      <div className="re-card-body">
                        <span className={`re-status ${cfg.cls}`}>{cfg.label}</span>
                        <h3 className="re-event-title">{ev.title || 'Event'}</h3>
                        <div className="re-meta">
                          <span>🏢 {reg.ngo_name || ev.ngo_name || 'NGO'}</span>
                          <span>📍 {ev.city ? `${ev.city}, ${ev.state}` : 'Online'}</span>
                          <span>⏱ {ev.volunteering_hours}h volunteered</span>
                        </div>
                      </div>
                      <div className="re-card-right" style={{ alignItems: 'flex-end', gap: '0.5rem' }}>
                        <span className={`re-mode ${ev.mode?.toLowerCase()}`}>{ev.mode}</span>
                        {ev.certificate_provided && reg.status === 'approved' && (
                          <span className="re-cert-badge">🎓 Certificate Earned</span>
                        )}
                        <button 
                          className="re-cancel-btn"
                          style={{ padding: '0.4rem 0.6rem', color: '#0f172a', backgroundColor: '#f8fafc', borderColor: '#e2e8f0', marginTop: 'auto' }}
                          onClick={() => setSelectedEvent(ev)}
                        >
                          👁 Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default RegisteredEvents;
