import React, { useState, useEffect } from 'react';
import './CheckInvites.css';

const API_BASE = 'http://localhost:5053';

const CheckInvites = () => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(null); // id of invite being updated

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.id) {
      fetchInvites();
    }
  }, [user.id]);

  const fetchInvites = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/invites/volunteer/${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch invites');
      setInvites(data.invites || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (inviteId, newStatus) => {
    setProcessing(inviteId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/invites/${inviteId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      // Update local state
      setInvites(prev => prev.map(inv => 
        inv.id === inviteId ? { ...inv, status: newStatus } : inv
      ));
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="ci-wrapper">
      <div className="ci-header">
        <h1 className="ci-title">Check Invites</h1>
        <p className="ci-subtitle">Manage recruitment invitations sent to you by various NGOs.</p>
      </div>

      {loading && <div className="ci-loading">Fetching your invites...</div>}
      {error && <div className="ci-error">⚠️ {error}</div>}

      {!loading && !error && (
        <div className="ci-list">
          {invites.length === 0 ? (
            <div className="ci-empty">
              <div className="ci-empty-icon">✉️</div>
              <p>You haven't received any invitations yet.</p>
            </div>
          ) : (
            invites.map(invite => (
              <InviteCard 
                key={invite.id} 
                invite={invite} 
                onStatusUpdate={handleStatusUpdate}
                processing={processing === invite.id}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

const InviteCard = ({ invite, onStatusUpdate, processing }) => {
  const { ngos: ngo, events: event, status, created_at } = invite;
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showNgoDetails, setShowNgoDetails] = useState(false);

  return (
    <div className={`ci-card ${status}`}>
      <div className="ci-card-header">
        <div className="ci-ngo-avatar">{ngo.name.charAt(0)}</div>
        <div className="ci-main-info">
          <h3 className="ci-event-title">{event.title}</h3>
          <p className="ci-ngo-name">by <strong>{ngo.name}</strong></p>
          <span className="ci-date">Received: {new Date(created_at).toLocaleDateString()}</span>
        </div>
        <div className={`ci-status-badge ${status}`}>{status.toUpperCase()}</div>
      </div>

      <div className="ci-card-body">
        <p className="ci-event-meta">
          📅 {new Date(event.event_date).toLocaleDateString()} · 📍 {event.city}, {event.state}
        </p>
        <p className="ci-description">
          {event.description ? event.description.slice(0, 120) + (event.description.length > 120 ? '...' : '') : 'You have been invited to join this event!'}
        </p>
      </div>

      <div className="ci-card-actions">
        <div className="ci-detail-btns">
          <button className="ci-text-btn" onClick={() => setShowEventDetails(true)}>View Event Details</button>
          <button className="ci-text-btn" onClick={() => setShowNgoDetails(true)}>View NGO Details</button>
        </div>

        {status === 'pending' && (
          <div className="ci-status-btns">
            <button 
              className="ci-btn decline" 
              onClick={() => onStatusUpdate(invite.id, 'declined')}
              disabled={processing}
            >
              Decline
            </button>
            <button 
              className="ci-btn accept" 
              onClick={() => onStatusUpdate(invite.id, 'accepted')}
              disabled={processing}
            >
              {processing ? '...' : 'Accept Invite'}
            </button>
          </div>
        )}
      </div>

      {/* Modals could be extracted but keeping local for simplicity and context */}
      {showEventDetails && (
        <Modal title="Event Details" onClose={() => setShowEventDetails(false)}>
          <div className="ci-modal-content">
            <h3>{event.title}</h3>
            <p><strong>Category:</strong> {event.category}</p>
            <p><strong>Date:</strong> {new Date(event.event_date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {event.start_time} - {event.end_time}</p>
            <p><strong>Mode:</strong> {event.mode}</p>
            <p><strong>Venue:</strong> {event.venue_name || 'N/A'}, {event.city}, {event.state}</p>
            <hr />
            <p><strong>Description:</strong></p>
            <p>{event.description}</p>
          </div>
        </Modal>
      )}

      {showNgoDetails && (
        <Modal title="NGO Details" onClose={() => setShowNgoDetails(false)}>
          <div className="ci-modal-content">
            <h3>{ngo.name}</h3>
            <p><strong>Email:</strong> {ngo.official_email}</p>
            <p><strong>Phone:</strong> {ngo.phone || 'N/A'}</p>
            <p><strong>Website:</strong> {ngo.website || 'N/A'}</p>
            <p><strong>Location:</strong> {ngo.city || 'N/A'}, {ngo.state || 'N/A'}</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div className="nl-modal-overlay" onClick={onClose}>
    <div className="nl-modal" onClick={e => e.stopPropagation()}>
      <button className="nl-modal-close" onClick={onClose}>✕</button>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>{title}</h2>
      {children}
      <button className="nl-view-btn" style={{ marginTop: '2rem' }} onClick={onClose}>Close</button>
    </div>
  </div>
);

export default CheckInvites;
