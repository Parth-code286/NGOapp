import React, { useState, useEffect } from 'react';
import './VolunteerParticipation.css';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}`;

const VolunteerParticipation = () => {
  const [participation, setParticipation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchParticipation();
  }, [user.id]);

  const fetchParticipation = async () => {
    if (!user.id) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/participation/${user.id}`);
      const data = await res.json();
      if (res.ok) {
        setParticipation(data.participation || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteerDetails = async (volunteerId) => {
    try {
      const res = await fetch(`${API_BASE}/api/volunteer/${volunteerId}`);
      const data = await res.json();
      if (res.ok && data.volunteer) { // Backend returns { volunteer: { ... } }
        const v = data.volunteer;
        // Map data for UI
        const mapped = {
          ...v,
          age: v.dob ? new Date().getFullYear() - new Date(v.dob).getFullYear() : 'N/A',
          eventsAttended: v.events_attended || 0,
          impactPoints: v.points || 0,
          hoursVolunteered: v.points ? Math.floor(v.points / 10) : 0,
          rating: v.rating || 4.5,
          skills: v.skills || [],
          about: v.about || 'A passionate volunteer ready to make an impact.',
          avatar: v.name ? v.name.charAt(0).toUpperCase() : 'V',
          joined: v.created_at ? new Date(v.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A'
        };
        setSelectedVolunteer(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch volunteer details", err);
    }
  };

  const handleStatusUpdate = async (id, type, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/participation/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, status })
      });
      if (res.ok) {
        setMessage({ text: `Volunteer ${status} successfully!`, type: 'success' });
        fetchParticipation();
      } else {
        setMessage({ text: 'Failed to update status.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const approveAll = async () => {
    try {
      const items = participation.map(p => ({ id: p.id, type: p.type }));
      if (items.length === 0) return;

      const res = await fetch(`${API_BASE}/api/participation/approve-all/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      if (res.ok) {
        setMessage({ text: 'All volunteers approved!', type: 'success' });
        fetchParticipation();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="vp-loader">Loading participation requests...</div>;

  return (
    <div className="vp-container">
      <div className="vp-header">
        <div>
          <h2 className="vp-title">Volunteer Participation</h2>
          <p className="vp-subtitle">Review and approve volunteers who have registered or accepted invitations.</p>
        </div>
        {participation.length > 0 && (
          <button className="vp-approve-all-btn" onClick={approveAll}>
            ✅ Approve All ({participation.length})
          </button>
        )}
      </div>

      {message.text && (
        <div className={`vp-alert ${message.type}`}>
          {message.text}
          <button onClick={() => setMessage({ text: '', type: '' })}>✕</button>
        </div>
      )}

      {participation.length === 0 ? (
        <div className="vp-empty">
          <div className="vp-empty-icon">🤝</div>
          <h3>No Pending Participation</h3>
          <p>When volunteers register for your events or accept your invites, they will appear here.</p>
        </div>
      ) : (
        <div className="vp-grid">
          {participation.map((p) => (
            <div key={`${p.type}-${p.id}`} className="vp-card">
              <div className="vp-card-type-badge">
                {p.type === 'registration' ? '📝 Registration' : '✉️ Accepted Invite'}
              </div>
              
              <div className="vp-volunteer-info">
                <div className="vp-avatar">{(p.volunteer?.name || 'V')[0]}</div>
                <div>
                  <h4 className="vp-vol-name">{p.volunteer?.name}</h4>
                  <p className="vp-vol-email">{p.volunteer?.email}</p>
                  <p className="vp-vol-loc">📍 {p.volunteer?.city}</p>
                </div>
              </div>

              <div className="vp-event-preview">
                <span className="vp-label">EVENT</span>
                <h5 className="vp-event-title">{p.event?.title}</h5>
                <p className="vp-event-date">📅 {new Date(p.event?.event_date).toLocaleDateString()}</p>
              </div>

              <button 
                className="vp-view-details-btn"
                onClick={() => fetchVolunteerDetails(p.volunteer?.id)}
              >
                👁 View Full Profile
              </button>

              <div className="vp-actions">
                <button 
                  className="vp-btn approve"
                  onClick={() => handleStatusUpdate(p.id, p.type, 'approved')}
                >
                  Approve
                </button>
                <button 
                  className="vp-btn reject"
                  onClick={() => handleStatusUpdate(p.id, p.type, 'rejected')}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedVolunteer && (
        <VolunteerDetailModal 
          volunteer={selectedVolunteer} 
          onClose={() => setSelectedVolunteer(null)} 
        />
      )}
    </div>
  );
};

const VolunteerDetailModal = ({ volunteer: v, onClose }) => (
  <div className="vp-modal-overlay" onClick={onClose}>
    <div className="vp-modal" onClick={e => e.stopPropagation()}>
      <button className="vp-modal-close" onClick={onClose}>✕</button>

      <div className="vp-modal-top">
        <div className="vp-modal-avatar">{v.avatar}</div>
        <div>
          <div className="vp-modal-name">{v.name}</div>
          <div className="vp-modal-sub">{v.city || 'Unknown'}, {v.state || 'Unknown'} · Joined {v.joined}</div>
        </div>
        <div className="vp-modal-rating">⭐ {v.rating}</div>
      </div>

      <p className="vp-modal-about">{v.about}</p>

      <div className="vp-modal-stats">
        {[
          { label: 'Events Attended', val: v.eventsAttended },
          { label: 'Hours Volunteered', val: `${v.hoursVolunteered}h` },
          { label: 'Impact Points', val: v.impactPoints.toLocaleString() },
        ].map(s => (
          <div className="vp-modal-stat" key={s.label}>
            <div className="vp-modal-stat-val">{s.val}</div>
            <div className="vp-modal-stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="vp-detail-grid">
        <div className="vp-detail-section">
          <h4>Personal Details</h4>
          <div className="vp-detail-row"><span>Age</span><span>{v.age} years</span></div>
          <div className="vp-detail-row"><span>Gender</span><span>{v.gender || 'N/A'}</span></div>
          <div className="vp-detail-row"><span>Nationality</span><span>{v.nationality || 'N/A'}</span></div>
        </div>
        <div className="vp-detail-section">
          <h4>Contact</h4>
          <div className="vp-detail-row"><span>Email</span><span>{v.email}</span></div>
          <div className="vp-detail-row"><span>Phone</span><span>{v.phone || 'N/A'}</span></div>
        </div>
        <div className="vp-detail-section">
          <h4>Identity Verification</h4>
          <div className="vp-detail-row"><span>Aadhar</span><span>{v.aadhar ? 'Provided ✅' : 'Not provided ❌'}</span></div>
          <div className="vp-detail-row"><span>PAN</span><span>{v.pan ? 'Provided ✅' : 'Not provided ❌'}</span></div>
        </div>
        <div className="vp-detail-section">
          <h4>Interests & Skills</h4>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
            {Array.isArray(v.interests) ? v.interests.join(', ') : (v.interests || 'General')}
          </p>
          <div className="vp-modal-skills">
            {v.skills && v.skills.length > 0 ? v.skills.map(s => <span className="vp-skill-tag" key={s}>{s}</span>) : <span className="vp-skill-tag">General</span>}
          </div>
        </div>
      </div>

      <div className="vp-modal-actions">
        <button className="vp-btn reject" style={{ padding: '0.75rem 2rem' }} onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

export default VolunteerParticipation;
