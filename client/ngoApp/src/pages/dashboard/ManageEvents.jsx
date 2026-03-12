import React, { useState, useEffect, useCallback } from 'react';
import './ManageEvents.css';

const API_BASE = 'http://localhost:5053';

// ─────────────────────────────────────────────────────────────
//  ManageEvents — list view + detail drill-down
// ─────────────────────────────────────────────────────────────
const ManageEvents = () => {
  const user  = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  // ── list state ──
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // ── detail state ──
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [roles,         setRoles]         = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── edit modal ──
  const [editEvent,   setEditEvent]   = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // ── delete confirm ──
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ═══ Fetch NGO's events ═══
  const fetchEvents = useCallback(async () => {
    if (!user.id) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/events/ngo/${user.id}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load events');
      setEvents(data.events || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // ═══ Drill-down: fetch event detail + roles + registrations ═══
  const openDetail = async (event) => {
    setSelectedEvent(event);
    setDetailLoading(true);
    try {
      const [rolesRes, regsRes] = await Promise.all([
        fetch(`${API_BASE}/events/${event.id}/roles`, { headers }),
        fetch(`${API_BASE}/events/${event.id}/registrations`, { headers }),
      ]);
      const rolesData = await rolesRes.json();
      const regsData  = await regsRes.json();
      setRoles(rolesData.roles || []);
      setRegistrations(regsData.registrations || []);
    } catch {}
    setDetailLoading(false);
  };

  // ═══ Edit event ═══
  const handleEdit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    const f = e.target;
    const payload = {
      title:                 f.title.value,
      category:              f.category.value,
      description:           f.description.value,
      event_date:            f.event_date.value,
      start_time:            f.start_time.value,
      end_time:              f.end_time.value,
      registration_deadline: f.registration_deadline.value,
      total_volunteers:      parseInt(f.total_volunteers.value) || null,
      status:                f.status.value,
    };
    try {
      const res = await fetch(`${API_BASE}/events/${editEvent.id}`, {
        method: 'PUT', headers, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEditEvent(null);
      fetchEvents();
      if (selectedEvent?.id === editEvent.id) {
        setSelectedEvent({ ...selectedEvent, ...payload });
      }
    } catch {}
    setEditLoading(false);
  };

  // ═══ Delete event ═══
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_BASE}/events/${deleteTarget.id}`, {
        method: 'DELETE', headers,
      });
      if (!res.ok) throw new Error('Delete failed');
      setDeleteTarget(null);
      if (selectedEvent?.id === deleteTarget.id) setSelectedEvent(null);
      fetchEvents();
    } catch {}
    setDeleteLoading(false);
  };

  // ═══ Update registration status ═══
  const updateRegStatus = async (regId, status) => {
    try {
      const res = await fetch(`${API_BASE}/events/registrations/${regId}/status`, {
        method: 'PUT', headers, body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRegistrations(prev =>
          prev.map(r => r.id === regId ? { ...r, status } : r)
        );
      }
    } catch {}
  };

  // ═══ Delete a role ═══
  const handleDeleteRole = async (roleId) => {
    try {
      await fetch(`${API_BASE}/events/roles/${roleId}`, { method: 'DELETE', headers });
      setRoles(prev => prev.filter(r => r.id !== roleId));
    } catch {}
  };

  // ────────────────────────────────────────────────────────
  //  RENDER: Detail View
  // ────────────────────────────────────────────────────────
  if (selectedEvent) {
    const ev = selectedEvent;
    return (
      <div className="me-wrapper">
        <button className="me-back-btn" onClick={() => setSelectedEvent(null)}>
          ← Back to Events
        </button>

        <div className="me-header">
          <h1 className="me-title">{ev.title}</h1>
          <p className="me-subtitle">
            <span className={`me-status-dot ${ev.status || 'published'}`}>
              {(ev.status || 'published').charAt(0).toUpperCase() + (ev.status || 'published').slice(1)}
            </span>
            {' · '}{ev.category} · {ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
          </p>
        </div>

        {detailLoading ? (
          <div className="me-loading"><div className="me-spinner" /><p>Loading details…</p></div>
        ) : (
          <div className="me-detail">
            {/* ── Event Info Card ── */}
            <div className="me-detail-card">
              <h3>📋 Event Details</h3>
              <div className="me-info-grid">
                <div className="me-info-item">
                  <span className="info-label">Date</span>
                  <span className="info-value">{ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-IN') : '—'}</span>
                </div>
                <div className="me-info-item">
                  <span className="info-label">Time</span>
                  <span className="info-value">{ev.start_time?.slice(0,5)} – {ev.end_time?.slice(0,5)}</span>
                </div>
                <div className="me-info-item">
                  <span className="info-label">Mode</span>
                  <span className="info-value">{ev.mode || '—'}</span>
                </div>
                <div className="me-info-item">
                  <span className="info-label">Location</span>
                  <span className="info-value">{ev.venue_name ? `${ev.venue_name}, ${ev.city}` : ev.meeting_link ? 'Online' : '—'}</span>
                </div>
                <div className="me-info-item">
                  <span className="info-label">Total Volunteers</span>
                  <span className="info-value">{ev.total_volunteers || '—'}</span>
                </div>
                <div className="me-info-item">
                  <span className="info-label">Registration Deadline</span>
                  <span className="info-value">{ev.registration_deadline ? new Date(ev.registration_deadline).toLocaleDateString('en-IN') : '—'}</span>
                </div>
              </div>
              {ev.description && (
                <div style={{ marginTop: '1.25rem' }}>
                  <span className="info-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Description</span>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.9rem' }}>{ev.description}</p>
                </div>
              )}
            </div>

            {/* ── Roles Card ── */}
            <div className="me-detail-card">
              <h3>👥 Volunteer Roles ({roles.length})</h3>
              {roles.length === 0 ? (
                <p className="me-no-data">No roles defined for this event.</p>
              ) : (
                <div className="me-role-list">
                  {roles.map(role => (
                    <div className="me-role-row" key={role.id}>
                      <div className="me-role-info">
                        <div className="me-role-name">{role.role_name}</div>
                        {role.role_description && <div className="me-role-desc">{role.role_description}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="me-role-count">{role.volunteers_required} needed</span>
                        <button className="me-icon-btn danger" title="Delete role" onClick={() => handleDeleteRole(role.id)}>🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Registrations Card ── */}
            <div className="me-detail-card">
              <h3>📝 Volunteer Registrations ({registrations.length})</h3>
              {registrations.length === 0 ? (
                <p className="me-no-data">No volunteers have registered yet.</p>
              ) : (
                <div className="me-table-wrap">
                  <table className="me-table">
                    <thead>
                      <tr>
                        <th>Volunteer</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>City</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map(reg => {
                        const vol = reg.volunteers || {};
                        return (
                          <tr key={reg.id}>
                            <td><span className="me-vol-name">{vol.name || '—'}</span></td>
                            <td><span className="me-vol-email">{vol.email || '—'}</span></td>
                            <td>{vol.phone || '—'}</td>
                            <td>{vol.city || '—'}</td>
                            <td>
                              <span className={`me-reg-status ${reg.status || 'pending'}`}>
                                {(reg.status || 'pending').charAt(0).toUpperCase() + (reg.status || 'pending').slice(1)}
                              </span>
                            </td>
                            <td>
                              <div className="me-action-group">
                                {reg.status !== 'approved' && (
                                  <button className="me-act-btn approve" onClick={() => updateRegStatus(reg.id, 'approved')}>✓ Approve</button>
                                )}
                                {reg.status !== 'rejected' && (
                                  <button className="me-act-btn reject" onClick={() => updateRegStatus(reg.id, 'rejected')}>✗ Reject</button>
                                )}
                                {reg.status !== 'waitlisted' && (
                                  <button className="me-act-btn waitlist" onClick={() => updateRegStatus(reg.id, 'waitlisted')}>⏳ Waitlist</button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ────────────────────────────────────────────────────────
  //  RENDER: Event List View
  // ────────────────────────────────────────────────────────
  const published = events.filter(e => e.status === 'published' || !e.status);
  const past      = events.filter(e => e.status === 'completed' || e.status === 'cancelled');
  const drafts    = events.filter(e => e.status === 'draft');

  return (
    <div className="me-wrapper">
      <div className="me-header">
        <h1 className="me-title">Manage Events</h1>
        <p className="me-subtitle">View, edit, and manage all your organisation's events.</p>
      </div>

      {loading && (
        <div className="me-loading"><div className="me-spinner" /><p>Loading your events…</p></div>
      )}

      {error && !loading && (
        <div className="me-error">⚠️ {error}</div>
      )}

      {!loading && !error && (
        <>
          {/* Stats */}
          <div className="me-stats-row">
            <div className="me-stat-badge">
              <span className="num">{events.length}</span>
              <span className="label">Total Events</span>
            </div>
            <div className="me-stat-badge">
              <span className="num">{published.length}</span>
              <span className="label">Active / Published</span>
            </div>
            <div className="me-stat-badge">
              <span className="num">{past.length}</span>
              <span className="label">Completed</span>
            </div>
            <div className="me-stat-badge">
              <span className="num">{drafts.length}</span>
              <span className="label">Drafts</span>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="me-empty">
              <div className="me-empty-icon">📭</div>
              <p>You haven't created any events yet.<br />Go to <strong>Create Event</strong> to get started!</p>
            </div>
          ) : (
            <div className="me-grid">
              {events.map(ev => (
                <div className="me-card" key={ev.id} onClick={() => openDetail(ev)}>
                  <div className="me-card-top">
                    <span className="me-category-tag">{ev.category || 'Event'}</span>
                    <span className={`me-status-dot ${ev.status || 'published'}`}>
                      {(ev.status || 'published').charAt(0).toUpperCase() + (ev.status || 'published').slice(1)}
                    </span>
                  </div>
                  <div className="me-event-title">{ev.title}</div>
                  <div className="me-meta">
                    <span>📅 {ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                    {ev.city && <span>📍 {ev.city}</span>}
                    <span>👥 {ev.total_volunteers || 0} volunteers</span>
                    <span>⏱ {ev.volunteering_hours || 0}h</span>
                  </div>
                  <div className="me-card-actions" onClick={e => e.stopPropagation()}>
                    <button className="me-btn-sm view" onClick={() => openDetail(ev)}>View Details</button>
                    <button className="me-btn-sm" onClick={() => setEditEvent(ev)}>✏️ Edit</button>
                    <button className="me-btn-sm danger" onClick={() => setDeleteTarget(ev)}>🗑 Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ═══ Edit Modal ═══ */}
      {editEvent && (
        <div className="me-modal-overlay" onClick={() => setEditEvent(null)}>
          <div className="me-modal" onClick={e => e.stopPropagation()}>
            <h2>Edit Event</h2>
            <form className="me-modal-form" onSubmit={handleEdit}>
              <div className="me-modal-field">
                <label>Event Title</label>
                <input name="title" className="me-modal-input" defaultValue={editEvent.title} required />
              </div>
              <div className="me-modal-row">
                <div className="me-modal-field">
                  <label>Category</label>
                  <select name="category" className="me-modal-input" defaultValue={editEvent.category}>
                    {['Environment','Education','Healthcare','Food Distribution','Disaster Relief','Animal Welfare','Community Service','Other'].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="me-modal-field">
                  <label>Status</label>
                  <select name="status" className="me-modal-input" defaultValue={editEvent.status || 'published'}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="me-modal-field">
                <label>Description</label>
                <textarea name="description" className="me-modal-input" rows={3} defaultValue={editEvent.description} />
              </div>
              <div className="me-modal-row">
                <div className="me-modal-field">
                  <label>Event Date</label>
                  <input type="date" name="event_date" className="me-modal-input" defaultValue={editEvent.event_date} />
                </div>
                <div className="me-modal-field">
                  <label>Registration Deadline</label>
                  <input type="date" name="registration_deadline" className="me-modal-input" defaultValue={editEvent.registration_deadline} />
                </div>
              </div>
              <div className="me-modal-row">
                <div className="me-modal-field">
                  <label>Start Time</label>
                  <input type="time" name="start_time" className="me-modal-input" defaultValue={editEvent.start_time} />
                </div>
                <div className="me-modal-field">
                  <label>End Time</label>
                  <input type="time" name="end_time" className="me-modal-input" defaultValue={editEvent.end_time} />
                </div>
              </div>
              <div className="me-modal-field">
                <label>Total Volunteers Needed</label>
                <input type="number" name="total_volunteers" className="me-modal-input" min="1" defaultValue={editEvent.total_volunteers} />
              </div>
              <div className="me-modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditEvent(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                  {editLoading ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ Delete Confirmation Modal ═══ */}
      {deleteTarget && (
        <div className="me-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="me-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <h2>Delete Event</h2>
            <p className="me-confirm-msg">
              Are you sure you want to delete <strong>{deleteTarget.title}</strong>? This will also remove all associated roles and registrations. This action cannot be undone.
            </p>
            <div className="me-modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ background: '#dc2626', boxShadow: 'none' }} onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? 'Deleting…' : '🗑 Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;
