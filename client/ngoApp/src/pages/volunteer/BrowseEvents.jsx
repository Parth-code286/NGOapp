import React, { useState, useEffect } from 'react';
import EventDetailModal from '../../components/EventDetailModal';
import './BrowseEvents.css';

const API_BASE = 'http://localhost:5053';

const CATEGORIES = ['All', 'Environment', 'Education', 'Healthcare', 'Food Distribution', 'Disaster Relief', 'Animal Welfare', 'Community Service'];

const BrowseEvents = () => {
  const user      = JSON.parse(localStorage.getItem('user') || '{}');
  const token     = localStorage.getItem('token');

  const [events,     setEvents]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [search,     setSearch]     = useState('');
  const [category,   setCategory]   = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Track per-event registration state  { [eventId]: 'idle' | 'loading' | 'registered' | 'error'  }
  const [regStatus,  setRegStatus]  = useState({});
  // Store registrationId for already-registered events
  const [alreadyReg, setAlreadyReg] = useState(new Set());

  // ─── Fetch events from backend ────────────────────────────────────
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category !== 'All') params.append('category', category);
        const res  = await fetch(`${API_BASE}/events?${params}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch events');
        setEvents(data.events || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [category]);

  // ─── Fetch volunteer's existing registrations ─────────────────────
  useEffect(() => {
    if (!user.id) return;
    const fetchMyRegs = async () => {
      try {
        const res  = await fetch(`${API_BASE}/events/registrations/volunteer/${user.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (res.ok && data.registrations) {
          const ids = new Set(data.registrations.map(r => r.event_id));
          setAlreadyReg(ids);
        }
      } catch (_) {}
    };
    fetchMyRegs();
  }, [user.id]);

  // ─── Register for an event ────────────────────────────────────────
  const handleRegister = async (eventId) => {
    if (!user.id) return;
    setRegStatus(prev => ({ ...prev, [eventId]: 'loading' }));
    try {
      const res  = await fetch(`${API_BASE}/events/${eventId}/register`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ volunteer_id: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setRegStatus(prev => ({ ...prev, [eventId]: 'registered' }));
      setAlreadyReg(prev => new Set([...prev, eventId]));
    } catch (err) {
      setRegStatus(prev => ({ ...prev, [eventId]: 'error' }));
      setTimeout(() => setRegStatus(prev => ({ ...prev, [eventId]: 'idle' })), 3000);
    }
  };

  // ─── Derived filtered list ────────────────────────────────────────
  const filtered = events.filter(ev => {
    const matchSearch = ev.title?.toLowerCase().includes(search.toLowerCase()) ||
                        ev.city?.toLowerCase().includes(search.toLowerCase()) ||
                        ev.ngo_name?.toLowerCase().includes(search.toLowerCase());
    const matchMode   = modeFilter === 'All' || ev.mode === modeFilter;
    return matchSearch && matchMode;
  });

  const getRegLabel = (ev) => {
    const s = regStatus[ev.id];
    if (s === 'loading')    return { text: 'Registering…', cls: 'registering' };
    if (s === 'registered' || alreadyReg.has(ev.id))
                            return { text: '✅ Registered', cls: 'done' };
    if (s === 'error')      return { text: '❌ Failed — Retry', cls: 'failed' };
    return { text: '+ Register', cls: 'idle' };
  };

  const isDisabled = (ev) =>
    regStatus[ev.id] === 'loading' || alreadyReg.has(ev.id) || regStatus[ev.id] === 'registered';

  return (
    <div className="be-wrapper">
      <div className="be-header">
        <h1 className="be-title">Browse Events</h1>
        <p className="be-subtitle">Discover volunteering opportunities and register to make an impact.</p>

        <div className="be-controls">
          <input
            className="be-search"
            type="text"
            placeholder="🔍 Search by title, NGO or city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="be-filter-row">
            <div className="be-filter-group">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`be-chip ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <select className="be-mode-select" value={modeFilter} onChange={e => setModeFilter(e.target.value)}>
              <option value="All">All Modes</option>
              <option>Offline</option>
              <option>Online</option>
              <option>Hybrid</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="be-loading">
          <div className="be-spinner" />
          <p>Loading events…</p>
        </div>
      )}

      {error && !loading && (
        <div className="be-error">⚠️ {error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="be-count">{filtered.length} event{filtered.length !== 1 ? 's' : ''} found</div>

          {filtered.length === 0 ? (
            <div className="be-empty">
              <div className="be-empty-icon">📭</div>
              <p>No events found. Try a different filter.</p>
            </div>
          ) : (
            <div className="be-grid">
              {filtered.map(ev => {
                const label    = getRegLabel(ev);
                const deadline = ev.registration_deadline ? new Date(ev.registration_deadline) : null;
                const isExpired = deadline && deadline < new Date();

                return (
                  <div className="be-card" key={ev.id}>
                    {/* Mode badge */}
                    <div className={`be-mode-badge ${ev.mode?.toLowerCase()}`}>{ev.mode}</div>

                    <div className="be-card-body">
                      <div className="be-category-tag">{ev.category}</div>
                      <h3 className="be-event-title">{ev.title}</h3>
                      <p className="be-ngo-name">🏢 {ev.ngo_name || 'Organisation'}</p>

                      <div className="be-meta-row">
                        <span>📅 {ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                        {ev.city && <span>📍 {ev.city}, {ev.state}</span>}
                      </div>
                      <div className="be-meta-row">
                        <span>🕐 {ev.start_time?.slice(0, 5)} – {ev.end_time?.slice(0, 5)}</span>
                        <span>⏱ {ev.volunteering_hours}h</span>
                      </div>

                      <p className="be-description">{ev.description?.slice(0, 120)}{ev.description?.length > 120 ? '…' : ''}</p>

                      <div className="be-perks">
                        {ev.certificate_provided && <span className="perk-tag">🎓 Certificate</span>}
                        {ev.meals_provided       && <span className="perk-tag">🍽 Meals</span>}
                        {ev.travel_allowance     && <span className="perk-tag">🚌 Travel</span>}
                      </div>

                      <div className="be-footer-row">
                        <div className="be-slots">
                          <span>👥 {ev.total_volunteers} volunteers needed</span>
                          {deadline && (
                            <span className={isExpired ? 'deadline expired' : 'deadline'}>
                              {isExpired ? '⛔ Deadline passed' : `⏳ Register by ${deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                            </span>
                          )}
                        </div>
                        <div className="be-actions" style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                          <button 
                            className="be-view-btn" 
                            style={{ padding: '0.55rem', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer', transition: 'all 0.2s' }}
                            onClick={() => setSelectedEvent(ev)}
                          >
                            👁 Details
                          </button>
                          <button
                            className={`be-reg-btn ${label.cls}`}
                            onClick={() => handleRegister(ev.id)}
                            disabled={isDisabled(ev) || isExpired}
                          >
                            {label.text}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          actionButton={
            <button
              className={`be-reg-btn ${getRegLabel(selectedEvent).cls}`}
              style={{ padding: '0.7rem 1.5rem', borderRadius: '12px' }}
              onClick={() => {
                handleRegister(selectedEvent.id);
                // Keep modal open so they see it register
              }}
              disabled={isDisabled(selectedEvent) || (selectedEvent.registration_deadline && new Date(selectedEvent.registration_deadline) < new Date())}
            >
              {getRegLabel(selectedEvent).text}
            </button>
          }
        />
      )}
    </div>
  );
};

export default BrowseEvents;
