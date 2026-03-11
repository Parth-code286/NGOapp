import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../dashboard/Sidebar.css';

const volunteerNavItems = [
  { id: 'overview',     label: 'Dashboard',            icon: '📊' },
  { id: 'calendar',    label: 'Design Calendar',       icon: '📅' },
  { id: 'browse',      label: 'Browse Events',         icon: '🔍' },
  { id: 'registered',  label: 'Registered Events',     icon: '📋' },
  { id: 'certificates',label: 'Certificates Earned',   icon: '🎓' },
  { id: 'visualization',label: 'Event Visualization',  icon: '📈' },
  { id: 'community',   label: 'Community & Leaderboard',icon: '🏆' },
  { id: 'chat',        label: 'Chat Section',          icon: '💬' },
  { id: 'gamification',label: 'Gamification',          icon: '🎮' },
  { id: 'notifications',label: 'Notifications',        icon: '🔔' },
  { id: 'attendance',  label: 'Attendance Section',    icon: '✅' },
];

const VolunteerSidebar = ({ activeSection, onSectionChange }) => {
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
        <div className="ngo-badge" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>Volunteer Portal</div>
      </div>

      <nav className="sidebar-nav">
        {volunteerNavItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => onSectionChange(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
            {item.id === 'notifications' && (
              <span className="notif-badge">2</span>
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
          <div className="user-avatar" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
            {(user.name || 'V')[0].toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-name">{user.name || 'Volunteer'}</div>
            <div className="user-role">Volunteer</div>
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

export default VolunteerSidebar;
