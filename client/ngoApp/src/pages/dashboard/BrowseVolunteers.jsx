import React, { useState, useEffect } from 'react';
import './BrowseVolunteers.css';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}`;
const INTERESTS = ['All', 'Environment', 'Healthcare', 'Education', 'Community Service', 'Animal Welfare', 'Disaster Relief'];
const AVATAR_COLORS = ['#fcba03', '#3b82f6', '#22c55e', '#a855f7', '#f97316', '#14b8a6'];

const BrowseVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState('All');
  const [selected, setSelected]     = useState(null);
  const [recruiting, setRecruiting] = useState(null); // volunteer being recruited
  const [ngoEvents, setNgoEvents]   = useState([]);
  const [recruited, setRecruited]   = useState(new Set());
  const [inviteError, setInviteError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // ─── Fetch real volunteers ────────────────────────────────────────
  useEffect(() => {
    const fetchVolunteers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/volunteer`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch volunteers');
        
        // Map backend fields to UI fields
        const mapped = (data.volunteers || []).map(v => ({
          ...v,
          age: v.dob ? new Date().getFullYear() - new Date(v.dob).getFullYear() : 'N/A',
          eventsAttended: v.events_attended || 0,
          impactPoints: v.points || 0,
          hoursVolunteered: v.points ? Math.floor(v.points / 10) : 0, // Mock calculation for now
          rating: v.rating || 4.5, // Mock default rating
          skills: v.skills || [],
          about: v.about || 'A passionate volunteer ready to make an impact.',
          avatar: v.name ? v.name.charAt(0).toUpperCase() : 'V',
          joined: v.created_at ? new Date(v.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A'
        }));
        
        setVolunteers(mapped);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVolunteers();

    // Fetch NGO events for recruitment
    if (user.id && user.role === 'ngo') {
      const fetchNgoEvents = async () => {
        try {
          const res = await fetch(`${API_BASE}/events/ngo/${user.id}`);
          const data = await res.json();
          if (res.ok) setNgoEvents(data.events || []);
        } catch (err) {
          console.error("Failed to fetch NGO events", err);
        }
      };
      fetchNgoEvents();
    }
  }, [user.id]);

  const filtered = volunteers.filter(v => {
    const matchSearch  = (v.name || '').toLowerCase().includes(search.toLowerCase()) ||
                         (v.city || '').toLowerCase().includes(search.toLowerCase());
    
    let matchFilter = filter === 'All';
    if (!matchFilter) {
      if (v.skills && Array.isArray(v.skills)) {
        matchFilter = v.skills.some(s => s.toLowerCase().includes(filter.toLowerCase()));
      }
    }
    return matchSearch && matchFilter;
  });

  const handleRecruit = async (eventId, volunteerId, eventTitle) => {
    setInviteError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/invites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          volunteerId,
          ngoId: user.id,
          eventId,
          ngoName: user.name,
          eventTitle
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to recruit');
      
      setRecruited(prev => new Set([...prev, volunteerId]));
      setRecruiting(null);
    } catch (err) {
      setInviteError(err.message);
    }
  };

  return (
    <div className="bv-wrapper">
      <div className="bv-page-header">
        <h1 className="bv-title">Browse Volunteers</h1>
        <p className="bv-subtitle">Discover and recruit passionate volunteers for your events.</p>

        <div className="bv-controls">
          <input
            type="text"
            className="bv-search"
            placeholder="🔍 Search by name or city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="bv-filters">
            {INTERESTS.map(cat => (
              <button
                key={cat}
                className={`bv-filter-pill ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          Loading volunteers...
        </div>
      )}

      {error && !loading && (
        <div style={{ padding: '1.5rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '12px' }}>
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="bv-count">{filtered.length} volunteer{filtered.length !== 1 ? 's' : ''} found</div>

          <div className="bv-grid">
            {filtered.map((v, i) => (
              <div className="bv-card" key={v.id}>
                <div className="bv-card-top">
                  <div className="bv-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                    {v.avatar}
                  </div>
                  <div className="bv-card-info">
                    <div className="bv-name">{v.name}</div>
                    <div className="bv-meta">{v.city || 'Unknown'}, {v.state || 'Unknown'}</div>
                    <div className="bv-interest-pill">
                      {v.skills && v.skills.length > 0 ? v.skills[0] : 'General'}
                    </div>
                  </div>
                  <div className="bv-rating">⭐ {v.rating}</div>
                </div>

                <div className="bv-stats">
                  <div className="bv-stat">
                    <div className="bv-stat-val">{v.eventsAttended}</div>
                    <div className="bv-stat-lbl">Events</div>
                  </div>
                  <div className="bv-stat">
                    <div className="bv-stat-val">{v.hoursVolunteered}h</div>
                    <div className="bv-stat-lbl">Hours</div>
                  </div>
                  <div className="bv-stat">
                    <div className="bv-stat-val">{v.impactPoints.toLocaleString()}</div>
                    <div className="bv-stat-lbl">Points</div>
                  </div>
                </div>

                <div className="bv-skills">
                  {v.skills.length > 0 ? v.skills.slice(0, 3).map(s => (
                    <span className="bv-skill-tag" key={s}>{s}</span>
                  )) : (
                    <span className="bv-skill-tag">General Volunteer</span>
                  )}
                </div>

                <div className="bv-card-actions">
                  <button className="bv-view-btn" onClick={() => setSelected(v)}>
                    👁 View Details
                  </button>
                  <button
                    className={`bv-recruit-btn ${recruited.has(v.id) ? 'recruited' : ''}`}
                    onClick={() => setRecruiting(v)}
                    disabled={recruited.has(v.id)}
                  >
                    {recruited.has(v.id) ? '✅ Invited' : '+ Recruit'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Detail Popup */}
      {selected && (
        <VolunteerDetailModal
          volunteer={selected}
          color={AVATAR_COLORS[volunteers.findIndex(v => v.id === selected.id) % AVATAR_COLORS.length]}
          onClose={() => setSelected(null)}
          recruited={recruited.has(selected.id)}
          onRecruit={() => setRecruiting(selected)}
        />
      )}

      {/* Recruit Modal */}
      {recruiting && (
        <RecruitModal 
          volunteer={recruiting}
          events={ngoEvents}
          onClose={() => { setRecruiting(null); setInviteError(''); }}
          onConfirm={handleRecruit}
          error={inviteError}
        />
      )}
    </div>
  );
};

const VolunteerDetailModal = ({ volunteer: v, color, onClose, recruited, onRecruit }) => (
  <div className="bv-modal-overlay" onClick={onClose}>
    <div className="bv-modal" onClick={e => e.stopPropagation()}>
      <button className="bv-modal-close" onClick={onClose}>✕</button>

      <div className="bv-modal-top">
        <div className="bv-modal-avatar" style={{ background: color }}>{v.avatar}</div>
        <div>
          <div className="bv-modal-name">{v.name}</div>
          <div className="bv-modal-sub">{v.city || 'Unknown'}, {v.state || 'Unknown'} · Joined {v.joined}</div>
          <div className="bv-interest-pill" style={{ marginTop: '0.4rem' }}>
            {v.skills && v.skills.length > 0 ? v.skills.slice(0, 3).join(', ') : 'General'}
          </div>
        </div>
        <div className="bv-modal-rating">⭐ {v.rating}</div>
      </div>

      <p className="bv-about">{v.about}</p>

      <div className="bv-modal-stats">
        {[
          { label: 'Events Attended', val: v.eventsAttended },
          { label: 'Hours Volunteered', val: `${v.hoursVolunteered}h` },
          { label: 'Impact Points', val: v.impactPoints.toLocaleString() },
        ].map(s => (
          <div className="bv-modal-stat" key={s.label}>
            <div className="bv-modal-stat-val">{s.val}</div>
            <div className="bv-modal-stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bv-detail-grid">
        <div className="bv-detail-section">
          <h4>Personal Details</h4>
          <div className="bv-detail-row"><span>Age</span><span>{v.age} years</span></div>
          <div className="bv-detail-row"><span>Gender</span><span>{v.gender || 'N/A'}</span></div>
          <div className="bv-detail-row"><span>Nationality</span><span>{v.nationality || 'N/A'}</span></div>
        </div>
        <div className="bv-detail-section">
          <h4>Contact</h4>
          <div className="bv-detail-row"><span>Email</span><span>{v.email}</span></div>
          <div className="bv-detail-row"><span>Phone</span><span>{v.phone || 'N/A'}</span></div>
        </div>
        <div className="bv-detail-section">
          <h4>Identity</h4>
          <div className="bv-detail-row"><span>Aadhar</span><span>{v.aadhar ? 'Provided ✅' : 'Not provided ❌'}</span></div>
          <div className="bv-detail-row"><span>PAN</span><span>{v.pan ? 'Provided ✅' : 'Not provided ❌'}</span></div>
        </div>
        <div className="bv-detail-section">
          <h4>Skills</h4>
          <div className="bv-skills" style={{ marginTop: '0.5rem' }}>
            {v.skills.length > 0 ? v.skills.map(s => <span className="bv-skill-tag" key={s}>{s}</span>) : <span className="bv-skill-tag">General</span>}
          </div>
        </div>
      </div>

      <div className="bv-modal-actions">
        <button className="bv-view-btn" onClick={onClose}>Close</button>
        <button
          className={`bv-recruit-btn large ${recruited ? 'recruited' : ''}`}
          onClick={onRecruit}
          disabled={recruited}
        >
          {recruited ? '✅ Volunteer Recruited' : '🤝 Recruit Volunteer'}
        </button>
      </div>
    </div>
  </div>
);

const RecruitModal = ({ volunteer, events, onClose, onConfirm, error }) => (
  <div className="bv-modal-overlay" onClick={onClose}>
    <div className="bv-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
      <button className="bv-modal-close" onClick={onClose}>✕</button>
      <h2 style={{ marginBottom: '1rem' }}>Recruit {volunteer.name}</h2>
      <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Select an event to invite this volunteer to. They will receive a notification and can accept or decline.
      </p>

      {error && <div style={{ color: '#dc2626', background: '#fef2f2', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>⚠️ {error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
        {events.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No active events found. Create an event first!</p>
        ) : (
          events.map(ev => (
            <div 
              key={ev.id} 
              className="be-card" 
              style={{ cursor: 'pointer', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              onClick={() => onConfirm(ev.id, volunteer.id, ev.title)}
            >
              <h4 style={{ margin: 0 }}>{ev.title}</h4>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                📅 {new Date(ev.event_date).toLocaleDateString()} · 📍 {ev.city}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="bv-view-btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  </div>
);

export default BrowseVolunteers;
