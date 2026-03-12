import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

import {
  LayoutDashboard, PlusCircle, ClipboardList, Search, UserCheck,
  BarChart2, MessageSquare, Users, AlertTriangle, PieChart,
  Award, FileBadge, Map, Bell, User, LogOut
} from 'lucide-react';

const navItems = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'create-event', label: 'Create Event', icon: PlusCircle },
  { id: 'manage-events', label: 'Manage Events', icon: ClipboardList },
  { id: 'browse-volunteers', label: 'Browse Volunteers', icon: Search },
  { id: 'attendance', label: 'Attendance Tracking', icon: UserCheck, url: 'https://ngo-attendance.vercel.app' },
  { id: 'visualization', label: 'Event Visualization', icon: BarChart2 },
  { id: 'chat', label: 'Chat Section', icon: MessageSquare, route: '/chat' },
  { id: 'volunteers', label: 'Volunteer Participation', icon: Users },
  { id: 'crises', label: 'Crisis Broadcast', icon: AlertTriangle },
  { id: 'analytics', label: 'Impact Analytics', icon: PieChart },
  { id: 'impact-score', label: 'Community Impact Score', icon: Award },
  // { id: 'certificates', label: 'Certificate Generator', icon: FileBadge },
  { id: 'heatmap', label: 'Category Heat Map', icon: Map },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  
];

const Sidebar = ({ activeSection, onSectionChange }) => {
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
      const interval = setInterval(fetchUnread, 30000); // 30s poll
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
        <div className="ngo-badge">NGO Portal</div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
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
            <span className="sidebar-icon"><item.icon size={20} /></span>
            <span className="sidebar-label">{item.label}</span>
            {item.id === 'notifications' && unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className={`sidebar-item ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => onSectionChange('profile')}
        >
          <span className="sidebar-icon"><User size={20} /></span>
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
          <span className="sidebar-icon"><LogOut size={20} /></span>
          <span className="sidebar-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
