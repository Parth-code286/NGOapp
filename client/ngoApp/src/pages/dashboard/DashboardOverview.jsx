import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import './DashboardOverview.css';

const DashboardOverview = ({ onSectionChange }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState([
    { label: 'Events Posted', value: '0', icon: '📅', color: 'stat-yellow' },
    { label: 'Total Volunteers', value: '0', icon: '🤝', color: 'stat-blue' },
    { label: 'Active Participation', value: '0', icon: '👥', color: 'stat-green' },
    { label: 'Attendance Rate', value: '0%', icon: '✅', color: 'stat-purple' },
    { label: 'Impact Score', value: '0', icon: '🏆', color: 'stat-orange' },
    { label: 'Certificates Sync', value: 'Live', icon: '🎓', color: 'stat-teal' },
  ]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Events Posted
      const { count: eventCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('ngo_id', user.id);

      // 2. Fetch Recent Events
      const { data: eventsData } = await supabase
        .from('events')
        .select('title, event_date, category, status')
        .eq('ngo_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // 3. Fetch Total Volunteers & Participation
      const { data: registrations } = await supabase
        .from('event_registrations')
        .select('volunteer_id, status, events!inner(ngo_id)')
        .eq('events.ngo_id', user.id);

      const uniqueVols = new Set(registrations?.map(r => r.volunteer_id)).size;
      const activeParticipation = registrations?.filter(r => r.status === 'approved').length;

      // 4. Attendance Rate
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('verified, events!inner(ngo_id)')
        .eq('events.ngo_id', user.id);
      
      const verifiedCount = attendanceData?.filter(a => a.verified).length || 0;
      const totalAttendanceRecords = attendanceData?.length || 0;
      const attendRate = totalAttendanceRecords > 0 ? Math.round((verifiedCount / totalAttendanceRecords) * 100) : 0;

      setStats([
        { label: 'Events Posted', value: eventCount || 0, icon: '📅', color: 'stat-yellow' },
        { label: 'Total Volunteers', value: uniqueVols || 0, icon: '🤝', color: 'stat-blue' },
        { label: 'Active Participation', value: activeParticipation || 0, icon: '👥', color: 'stat-green' },
        { label: 'Attendance Rate', value: `${attendRate}%`, icon: '✅', color: 'stat-purple' },
        { label: 'Impact Score', value: (activeParticipation * 50) + (eventCount * 100), icon: '🏆', color: 'stat-orange' },
        { label: 'Certificates Sync', value: 'Active', icon: '🎓', color: 'stat-teal' },
      ]);

      setRecentEvents(eventsData?.map(ev => ({
        name: ev.title,
        date: new Date(ev.event_date).toLocaleDateString(),
        status: ev.status || 'upcoming'
      })) || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Subscribe to changes
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', table: 'events', filter: `ngo_id=eq.${user.id}` }, () => fetchDashboardData())
      .on('postgres_changes', { event: '*', table: 'event_registrations' }, () => fetchDashboardData())
      .on('postgres_changes', { event: '*', table: 'attendance' }, () => fetchDashboardData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <div className="loading-state">Syncing real-time impact...</div>;

  return (
    <div className="overview-container">
      <div className="overview-header">
        <div>
          <h1 className="overview-title">Welcome back, <span className="text-primary">{user.name || 'Admin'}</span> 👋</h1>
          <p className="overview-subtitle">Here's what's happening with your NGO today.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary manage-btn" onClick={() => onSectionChange('manage-events')}>
            ⚙️ Manage Events
          </button>
          <button className="btn btn-primary create-btn" onClick={() => onSectionChange('create-event')}>
            + Create New Event
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div className={`stat-card ${stat.color}`} key={i}>
            <div className="stat-card-top">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
            <div className="stat-label-text">{stat.label}</div>
            <div className="stat-change">Live Updates Engaged</div>
          </div>
        ))}
      </div>

      <div className="overview-grid-2">
        <div className="overview-card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
            <button className="text-link" onClick={() => onSectionChange('manage-events')}>View all →</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.length > 0 ? recentEvents.map((ev, i) => (
                <tr key={i}>
                  <td className="event-name">{ev.name}</td>
                  <td>{ev.date}</td>
                  <td>
                    <span className={`status-pill ${ev.status}`}>
                      {ev.status.charAt(0).toUpperCase() + ev.status.slice(1)}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>No recent events found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="overview-card">
          <div className="card-header">
            <h3 className="card-title">Quick Stats</h3>
          </div>
          <div className="quick-stats-summary">
            <div className="qs-item">
              <span>Verified Attendance</span>
              <strong>{stats[3].value}</strong>
            </div>
            <div className="qs-item">
              <span>Community Impact</span>
              <strong>{stats[4].value} pts</strong>
            </div>
            <div className="qs-item" style={{ border: 'none' }}>
              <span>Connection Status</span>
              <span className="live-indicator"><span className="ping-dot"></span> Supabase Realtime</span>
            </div>
          </div>
        </div>
      </div>

      <div className="quick-actions-row">
        <div className="quick-card yellow" onClick={() => onSectionChange('notifications')}>
          <div className="qc-icon">📢</div>
          <div><div className="qc-title">Send Notification</div><div className="qc-sub">Broadcast to volunteers</div></div>
        </div>
        <div className="quick-card blue" onClick={() => onSectionChange('certificates')}>
          <div className="qc-icon">🎓</div>
          <div><div className="qc-title">Certificates</div><div className="qc-sub">Automated issuance</div></div>
        </div>
        <div className="quick-card green" onClick={() => onSectionChange('analytics')}>
          <div className="qc-icon">📊</div>
          <div><div className="qc-title">Analytics</div><div className="qc-sub">Data-driven insights</div></div>
        </div>
        <div className="quick-card purple" onClick={() => onSectionChange('attendance')}>
          <div className="qc-icon">✅</div>
          <div><div className="qc-title">Attendance</div><div className="qc-sub">Real-time verification</div></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
