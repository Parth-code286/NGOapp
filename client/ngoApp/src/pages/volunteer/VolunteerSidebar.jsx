import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../dashboard/Sidebar.css';

import {
  LayoutDashboard, CalendarRange, Search, ClipboardList, Mail,
  Building2, FileBadge, BarChart2, Award, AlertTriangle,
  MessageSquare, Bell, UserCheck, User, LogOut
} from 'lucide-react';

const volunteerNavItems = [
  { id: 'overview',     label: 'Dashboard',            icon: LayoutDashboard },
  { id: 'calendar',    label: 'Design Calendar',       icon: CalendarRange },
  { id: 'browse',      label: 'Browse Events',         icon: Search },
  { id: 'registered',  label: 'Registered Events',     icon: ClipboardList },
  { id: 'invites',     label: 'Check Invites',         icon: Mail },
  { id: 'ngo-listing', label: 'NGO Listing',           icon: Building2 },
  { id: 'certificates',label: 'Certificates Earned',   icon: FileBadge },
  { id: 'visualization',label: 'Event Visualization',  icon: BarChart2 },
  { id: 'community',   label: 'Community Hub',         icon: Award },
  { id: 'leaderboard', label: 'Leaderboard',           icon: Award },
  { id: 'crises', label: 'Emergency Donations', icon: AlertTriangle },
  { id: 'chat',        label: 'Chat Section',          icon: MessageSquare, route: '/chat' },
  { id: 'notifications',label: 'Notifications',        icon: Bell },
  { id: 'attendance',  label: 'Attendance Section',    icon: UserCheck, url: 'https://ngo-attendance.vercel.app' },
];

const VolunteerSidebar = ({ activeSection, onSectionChange }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    if (!user.id) return;

    const fetchUnread = async () => {
      try {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
        
        if (!error) setUnreadCount(count || 0);
      } catch (err) { console.error('Error fetching notifications:', err); }
    };

    fetchUnread();

    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications', 
        filter: `user_id=eq.${user.id}` 
      }, () => fetchUnread())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
            <span className="sidebar-icon"><item.icon size={20} strokeWidth={2.5} /></span>
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
          <span className="sidebar-icon"><User size={20} strokeWidth={2.5} /></span>
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
          <span className="sidebar-icon"><LogOut size={20} strokeWidth={2.5} /></span>
          <span className="sidebar-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default VolunteerSidebar;
