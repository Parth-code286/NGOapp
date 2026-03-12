import React, { useState, useEffect, useCallback } from 'react';
import './DesignCalendar.css';

const API_BASE = 'http://localhost:5053';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const today = new Date();

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDay   = (year, month) => new Date(year, month, 1).getDay();

const toKey = (year, month, day) => {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

const DesignCalendar = () => {
  const user  = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const startYear  = today.getFullYear();
  const startMonth = today.getMonth();
  const allMonths  = [];
  
  for (let y = startYear; y <= startYear + 1; y++) {
    const mStart = (y === startYear) ? startMonth : 0;
    for (let m = mStart; m < 12; m++) {
      allMonths.push({ year: y, month: m });
    }
  }

  // availability state: key => 'available' | 'busy'
  const [availability, setAvailability] = useState({});
  const [reasons, setReasons]           = useState({});
  const [reasonOpen, setReasonOpen]     = useState({});
  const [events, setEvents]             = useState({});
  const [loading, setLoading]           = useState(true);

  // ── Load data from backend ──
  const fetchData = useCallback(async () => {
    if (!user.id) { setLoading(false); return; }
    try {
      const res  = await fetch(`${API_BASE}/api/calendar/${user.id}`, { headers });
      const data = await res.json();
      if (res.ok) {
        // Build availability map from backend entries
        const avail = {};
        const reas  = {};
        for (const entry of (data.availability || [])) {
          avail[entry.date] = entry.status;
          if (entry.reason) reas[entry.date] = entry.reason;
        }
        setAvailability(avail);
        setReasons(reas);
        setEvents(data.events || {});
      }
    } catch {}
    setLoading(false);
  }, [user.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getStatus = (key) => availability[key] || 'available';

  const toggleStatus = async (key) => {
    const curr = getStatus(key);
    const next = curr === 'available' ? 'busy' : 'available';

    // Optimistic update
    setAvailability(prev => ({ ...prev, [key]: next }));

    if (next === 'available') {
      setReasonOpen(prev => ({ ...prev, [key]: false }));
      setReasons(prev => { const r = { ...prev }; delete r[key]; return r; });
      // Persist to backend
      try {
        await fetch(`${API_BASE}/api/calendar/${user.id}/date`, {
          method: 'PUT', headers,
          body: JSON.stringify({ date: key, status: 'available' }),
        });
      } catch {}
    } else {
      setReasonOpen(prev => ({ ...prev, [key]: true }));
    }
  };

  const saveReason = async (key, val) => {
    setReasons(prev => ({ ...prev, [key]: val }));
    setReasonOpen(prev => ({ ...prev, [key]: false }));
    // Persist busy status + reason to backend
    try {
      await fetch(`${API_BASE}/api/calendar/${user.id}/date`, {
        method: 'PUT', headers,
        body: JSON.stringify({ date: key, status: 'busy', reason: val || null }),
      });
    } catch {}
  };

  if (loading) {
    return (
      <div className="cal-wrapper">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6rem 2rem', color: 'var(--text-muted)' }}>
          <div style={{ width: 36, height: 36, border: '3px solid var(--border-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          <p style={{ marginTop: '1rem' }}>Loading calendar…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cal-wrapper">
      <div className="cal-header">
        <h1 className="cal-title">My Availability Calendar</h1>
        <p className="cal-subtitle">Manage your schedule — mark dates as Busy or Available, and see your registered events at a glance.</p>
        <div className="cal-legend">
          <span className="legend-dot green" /> Available
          <span className="legend-dot red" /> Busy
          <span className="legend-dot yellow" /> Event Registered
        </div>
      </div>

      <div className="cal-months-container">
        {allMonths.map(({ year, month }) => {
          const daysInMonth  = getDaysInMonth(year, month);
          const firstDay     = getFirstDay(year, month);
          const blanks       = Array(firstDay).fill(null);
          const days         = Array.from({ length: daysInMonth }, (_, i) => i + 1);

          return (
            <div className="cal-month" key={`${year}-${month}`}>
              <div className="cal-month-header">
                {MONTHS[month]} {year}
              </div>

              <div className="cal-grid">
                {DAYS.map(d => (
                  <div className="cal-day-name" key={d}>{d}</div>
                ))}

                {blanks.map((_, i) => (
                  <div className="cal-cell cal-blank" key={`b-${i}`} />
                ))}

                {days.map(day => {
                  const key       = toKey(year, month, day);
                  const event     = events[key];
                  const status    = getStatus(key);
                  const isToday   = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
                  const isPast    = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

                  if (event) {
                    return (
                      <div className="cal-cell cal-event" key={key}>
                        <div className="cal-day-num event-day">{day}</div>
                        <div className="cal-event-name">{event.name}</div>
                        {event.category && <div className="cal-event-org">{event.category}</div>}
                        {event.time && <div className="cal-event-time">🕐 {event.time}</div>}
                      </div>
                    );
                  }

                  return (
                    <div
                      className={`cal-cell cal-avail-cell ${status} ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}`}
                      key={key}
                    >
                      <div className={`cal-day-num ${isToday ? 'today-num' : ''}`}>{day}</div>
                      {!isPast && (
                        <button
                          className={`avail-toggle ${status}`}
                          onClick={() => toggleStatus(key)}
                          title={status === 'available' ? 'Click to mark Busy' : 'Click to mark Available'}
                        >
                          {status === 'available' ? '✓ Free' : '● Busy'}
                        </button>
                      )}
                      {isPast && <div className="past-label">—</div>}

                      {/* Reason modal */}
                      {reasonOpen[key] && (
                        <ReasonPopup
                          onSave={(val) => saveReason(key, val)}
                          onCancel={() => {
                            setAvailability(prev => ({ ...prev, [key]: 'available' }));
                            setReasonOpen(prev => ({ ...prev, [key]: false }));
                            // revert on backend too
                            fetch(`${API_BASE}/api/calendar/${user.id}/date`, {
                              method: 'PUT', headers,
                              body: JSON.stringify({ date: key, status: 'available' }),
                            }).catch(() => {});
                          }}
                        />
                      )}
                      {reasons[key] && !reasonOpen[key] && (
                        <div className="reason-tag" title={reasons[key]}>📝 {reasons[key].slice(0, 12)}{reasons[key].length > 12 ? '…' : ''}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ReasonPopup = ({ onSave, onCancel }) => {
  const [val, setVal] = useState('');
  return (
    <div className="reason-popup" onClick={e => e.stopPropagation()}>
      <p className="reason-title">Why are you busy?</p>
      <textarea
        className="reason-input"
        placeholder="e.g. Exams, travel..."
        value={val}
        onChange={e => setVal(e.target.value)}
        rows={2}
        autoFocus
      />
      <div className="reason-actions">
        <button className="reason-skip" onClick={() => onSave('')}>Skip</button>
        <button className="reason-save" onClick={() => onSave(val)}>Save</button>
        <button className="reason-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default DesignCalendar;
