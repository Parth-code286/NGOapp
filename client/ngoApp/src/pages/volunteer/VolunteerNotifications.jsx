import React, { useState, useEffect } from 'react';
import './VolunteerNotifications.css';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}`;

const VolunteerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.id) {
      fetchNotifications();
    }
  }, [user.id]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/notifications/${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch notifications');
      setNotifications(data.notifications || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/notifications/user/${user.id}/read`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="vn-wrapper">
      <div className="vn-header">
        <div className="vn-title-row">
          <h1 className="vn-title">Notifications</h1>
          {unreadCount > 0 && <span className="vn-badge">{unreadCount} New</span>}
        </div>
        <p className="vn-subtitle">Stay updated with event approvals, invites, and community news.</p>
        
        {notifications.length > 0 && (
          <button className="vn-mark-all" onClick={markAllAsRead}>
            ✓ Mark all as read
          </button>
        )}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '3rem' }}>Loading notifications...</div>}
      {error && <div className="vn-error">⚠️ {error}</div>}

      <div className="vn-list">
        {notifications.length === 0 && !loading ? (
          <div className="vn-empty">
            <div className="vn-empty-icon">📭</div>
            <p>Your inbox is empty. We'll notify you when something happens!</p>
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id} 
              className={`vn-card ${n.is_read ? 'read' : 'unread'}`}
              onClick={() => !n.is_read && markAsRead(n.id)}
            >
              <div className={`vn-icon-wrapper ${n.type || 'info'}`}>
                {n.icon || '🔔'}
              </div>
              <div className="vn-content">
                <div className="vn-top-row">
                  <h3 className="vn-card-title">{n.title}</h3>
                  <span className="vn-time">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="vn-message">{n.message}</p>
              </div>
              <div className="vn-actions">
                {!n.is_read && <div className="vn-unread-dot"></div>}
                <button className="vn-delete-btn" onClick={(e) => deleteNotification(n.id, e)}>✕</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VolunteerNotifications;
