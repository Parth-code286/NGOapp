import React, { useState } from 'react';
import './DesignCalendar.css';

// Dummy registered events data mapped by date string "YYYY-MM-DD"
const DUMMY_EVENTS = {
  '2026-03-14': { name: 'Tree Plantation Drive', org: 'GreenEarth NGO', time: '9:00 AM' },
  '2026-03-18': { name: 'Blood Donation Camp', org: 'HealthFirst', time: '10:00 AM' },
  '2026-04-05': { name: 'Digital Literacy Campaign', org: 'EduReach', time: '11:00 AM' },
  '2026-04-20': { name: 'Food Distribution Drive', org: 'FoodFirst', time: '8:00 AM' },
};

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
  const startYear  = today.getFullYear();
  // Show 3 years worth of months (current year + 2)
  const allMonths  = [];
  for (let y = startYear; y <= startYear + 2; y++) {
    for (let m = 0; m < 12; m++) {
      allMonths.push({ year: y, month: m });
    }
  }

  // availability state: key  => 'available' | 'busy'
  const [availability, setAvailability] = useState({});
  // reason state: key => string
  const [reasons, setReasons]           = useState({});
  // reason input open: key => bool
  const [reasonOpen, setReasonOpen]     = useState({});

  const getStatus = (key) => availability[key] || 'available';

  const toggleStatus = (key) => {
    const curr = getStatus(key);
    const next = curr === 'available' ? 'busy' : 'available';
    setAvailability(prev => ({ ...prev, [key]: next }));
    if (next === 'available') {
      setReasonOpen(prev => ({ ...prev, [key]: false }));
      setReasons(prev => { const r = { ...prev }; delete r[key]; return r; });
    } else {
      setReasonOpen(prev => ({ ...prev, [key]: true }));
    }
  };

  const saveReason = (key, val) => {
    setReasons(prev => ({ ...prev, [key]: val }));
    setReasonOpen(prev => ({ ...prev, [key]: false }));
  };

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
                  const event     = DUMMY_EVENTS[key];
                  const status    = getStatus(key);
                  const isToday   = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
                  const isPast    = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

                  if (event) {
                    return (
                      <div className="cal-cell cal-event" key={key}>
                        <div className="cal-day-num event-day">{day}</div>
                        <div className="cal-event-name">{event.name}</div>
                        <div className="cal-event-org">{event.org}</div>
                        <div className="cal-event-time">🕐 {event.time}</div>
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
