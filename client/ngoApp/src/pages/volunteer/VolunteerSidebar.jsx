import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../dashboard/Sidebar.css';

const volunteerNavItems = [
  { id: 'overview',     label: 'Dashboard',            icon: '📊' },
  { id: 'calendar',    label: 'Design Calendar',       icon: '📅' },
  { id: 'browse',      label: 'Browse Events',         icon: '🔍' },
  { id: 'registered',  label: 'Registered Events',     icon: '📋' },
  { id: 'invites',     label: 'Check Invites',         icon: '✉️' },
  { id: 'ngo-listing', label: 'NGO Listing',           icon: '🏢' },
  { id: 'certificates',label: 'Certificates Earned',   icon: '🎓' },
  { id: 'visualization',label: 'Event Visualization',  icon: '📈' },
  { id: 'community',   label: 'Community Hub',         icon: '🤝' },
  { id: 'leaderboard', label: 'Leaderboard',           icon: '🏆' },
  { id: 'chat',        label: 'Chat Section',          icon: '💬', route: '/chat' },
  { id: 'notifications',label: 'Notifications',        icon: '🔔' },
  { id: 'attendance',  label: 'Attendance Section',    icon: '✅', url: 'https://ngo-attendance.vercel.app' },
];

const VolunteerSidebar = ({ activeSection, onSectionChange }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    if (user.id) {
      const fetchUnread = async () => {
        try {
          const res = await fetch(`http://localhost:5053/api/notifications/${user.id}`);
          const data = await res.json();
          if (res.ok) {
            const count = (data.notifications || []).filter(n => !n.is_read).length;
            setUnreadCount(count);
          }
        } catch (err) { console.error(err); }
      };
      fetchUnread();
      const interval = setInterval(fetchUnread, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [user.id]);

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
            onClick={() => {
              if (item.url) {
                window.open(item.url, '_blank');
              } else if (item.route) {
                navigate(item.route);
              } else {
                onSectionChange(item.id);
              }
            }}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
            {item.id === 'notifications' && unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
            {item.id === 'invites' && (
               /* Potential badge for pending invites could go here */
               null
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
