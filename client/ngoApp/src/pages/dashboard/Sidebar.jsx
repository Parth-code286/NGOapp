import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const navItems = [
  { id: 'overview', label: 'Dashboard', icon: '📊' },
  { id: 'create-event', label: 'Create Event', icon: '➕' },
  { id: 'manage-events', label: 'Manage Events', icon: '📋' },
  { id: 'browse-volunteers', label: 'Browse Volunteers', icon: '🔍' },
  { id: 'attendance', label: 'Attendance Tracking', icon: '✅' },
  { id: 'visualization', label: 'Event Visualization', icon: '📈' },
  { id: 'chat', label: 'Chat Section', icon: '💬' },
  { id: 'volunteers', label: 'Volunteer Participation', icon: '🤝' },
  { id: 'analytics', label: 'Impact Analytics', icon: '🔍' },
  { id: 'impact-score', label: 'Community Impact Score', icon: '🏆' },
  { id: 'certificates', label: 'Certificate Generator', icon: '🎓' },
  { id: 'heatmap', label: 'Category Heat Map', icon: '🗺️' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
];

const Sidebar = ({ activeSection, onSectionChange }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-text">Impact<span className="text-primary">Hub</span></span>
        <div className="ngo-badge">NGO Portal</div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => onSectionChange(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
            {item.id === 'notifications' && (
              <span className="notif-badge">3</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className={`sidebar-item ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => onSectionChange('profile')}
        >
          <span className="sidebar-icon">👤</span>
          <span className="sidebar-label">My Profile</span>
        </button>

        <div className="sidebar-user">
          <div className="user-avatar">
            {(user.name || 'N')[0].toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-name">{user.name || 'NGO Admin'}</div>
            <div className="user-role">Administrator</div>
          </div>
        </div>

        <button className="sidebar-item logout-btn" onClick={handleLogout}>
          <span className="sidebar-icon">🚪</span>
          <span className="sidebar-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
