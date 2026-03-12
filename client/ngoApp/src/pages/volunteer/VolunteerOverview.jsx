import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import '../dashboard/DashboardOverview.css';
import './VolunteerOverview.css';

const VolunteerOverview = ({ onSectionChange }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Events Registered',   value: '0',  icon: '📋', color: 'stat-blue' },
    { label: 'Events Attended',     value: '0',  icon: '✅', color: 'stat-green' },
    { label: 'Hours Volunteered',   value: '0',  icon: '⏱️', color: 'stat-yellow' },
    { label: 'Certificates Earned', value: '0',  icon: '🎓', color: 'stat-purple' },
    { label: 'Impact Points',       value: '0',  icon: '🏆', color: 'stat-orange' },
    { label: 'Leaderboard Rank',    value: '...', icon: '🥇', color: 'stat-teal' },
  ]);

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchVolunteerData = async () => {
    try {
      // 1. Fetch Volunteer Profile (Points, Attended, rank)
      const { data: volProfile } = await supabase
        .from('volunteers')
        .select('*')
        .eq('id', user.id)
        .single();

      // 2. Fetch Leaderboard Rank
      const { data: allVols } = await supabase
        .from('volunteers')
        .select('id, name, points')
        .order('points', { ascending: false });
      
      const rank = allVols?.findIndex(v => v.id === user.id) + 1 || '...';
      const topVols = allVols?.slice(0, 5).map((v, i) => ({
        rank: i + 1,
        name: v.id === user.id ? 'You' : v.name,
        points: v.points,
        badge: i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⭐',
        highlight: v.id === user.id
      })) || [];

      // 3. Fetch Registrations (Registered count, Upcoming)
      const { data: registrations } = await supabase
        .from('event_registrations')
        .select('*, events(title, event_date, ngo_id, ngos(name))')
        .eq('volunteer_id', user.id);

      const registeredCount = registrations?.length || 0;
      const upcoming = registrations?.filter(r => new Date(r.events.event_date) >= new Date())
        .map(r => ({
          name: r.events.title,
          date: new Date(r.events.event_date).toLocaleDateString(),
          org: r.events.ngos?.name || 'Unknown',
          status: r.status
        })) || [];

      // 4. Fetch Past Events (Attendance)
      // Removed .order('created_at') because attendance table might lack it
      const { data: attendance } = await supabase
        .from('attendance')
        .select('*, events(title, event_date)')
        .eq('volunteer_id', user.id);

      const past = attendance?.map(a => ({
        name: a.events?.title || 'Unknown Event',
        date: a.events?.event_date ? new Date(a.events.event_date).toLocaleDateString() : '—',
        hours: 4, 
        points: 100, 
        attended: a.verified
      })) || [];

      setStats([
        { label: 'Events Registered',   value: registeredCount, icon: '📋', color: 'stat-blue' },
        { label: 'Events Attended',     value: volProfile?.events_attended || 0, icon: '✅', color: 'stat-green' },
        { label: 'Hours Volunteered',   value: (volProfile?.events_attended || 0) * 4, icon: '⏱️', color: 'stat-yellow' },
        { label: 'Impact Points',       value: volProfile?.points.toLocaleString() || 0, icon: '🏆', color: 'stat-orange' },
        { label: 'Leaderboard Rank',    value: `#${rank}`, icon: '🥇', color: 'stat-teal' },
      ]);

      setUpcomingEvents(upcoming.slice(0, 4));
      setPastEvents(past.slice(0, 5));
      setLeaderboard(topVols);

    } catch (error) {
      console.error('Error fetching volunteer data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteerData();

    const channel = supabase
      .channel('volunteer-realtime')
      .on('postgres_changes', { event: '*', table: 'volunteers', filter: `id=eq.${user.id}` }, () => fetchVolunteerData())
      .on('postgres_changes', { event: '*', table: 'event_registrations', filter: `volunteer_id=eq.${user.id}` }, () => fetchVolunteerData())
      .on('postgres_changes', { event: '*', table: 'attendance', filter: `volunteer_id=eq.${user.id}` }, () => fetchVolunteerData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <div className="loading-state">Loading your impact profile...</div>;

  return (
    <div className="overview-container">
      <div className="overview-header">
        <div>
          <h1 className="overview-title">Hi, <span className="text-vol">{user.name || 'Volunteer'}</span> 👋</h1>
          <p className="overview-subtitle">Here's your volunteering activity and upcoming events.</p>
        </div>
        <button className="btn btn-vol browse-btn" onClick={() => onSectionChange('browse')}>
          🔍 Browse Events
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div className={`stat-card ${stat.color}`} key={i}>
            <div className="stat-card-top">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
            <div className="stat-label-text">{stat.label}</div>
            <div className="stat-change">Live Updates</div>
          </div>
        ))}
      </div>

      <div className="overview-grid-2">
        {/* Upcoming Events */}
        <div className="overview-card">
          <div className="card-header">
            <h3 className="card-title">My Schedule</h3>
            <button className="text-link" onClick={() => onSectionChange('registered')}>View all →</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Organizer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {upcomingEvents.length > 0 ? upcomingEvents.map((ev, i) => (
                <tr key={i}>
                  <td className="event-name">{ev.name}</td>
                  <td>{ev.date}</td>
                  <td>{ev.org}</td>
                  <td>
                    <span className={`status-pill ${ev.status === 'approved' ? 'completed' : 'upcoming'}`}>
                      {ev.status === 'approved' ? 'Approved' : ev.status.charAt(0).toUpperCase() + ev.status.slice(1)}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No upcoming events found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Leaderboard */}
        <div className="overview-card">
          <div className="card-header">
            <h3 className="card-title">Top Players</h3>
            <button className="text-link" onClick={() => onSectionChange('leaderboard')}>Rankings →</button>
          </div>
          <div className="volunteer-list">
            {leaderboard.map((v, i) => (
              <div className={`volunteer-row ${v.highlight ? 'highlight-row' : ''}`} key={i}>
                <div className="vol-rank">{v.rank}</div>
                <div className="vol-avatar vol-avatar-blue">{v.name[0]}</div>
                <div className="vol-info">
                  <div className="vol-name">{v.name}</div>
                  <div className="vol-sub">{v.points.toLocaleString()} impact points</div>
                </div>
                <div className="vol-badge">{v.badge}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Past Events */}
      <div className="overview-card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Recent History</h3>
          <button className="text-link">Full history →</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Hours</th>
              <th>Points</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pastEvents.length > 0 ? pastEvents.map((ev, i) => (
              <tr key={i}>
                <td className="event-name">{ev.name}</td>
                <td>{ev.date}</td>
                <td>{ev.hours}h</td>
                <td>+{ev.points}</td>
                <td>
                  <span className={`status-pill ${ev.attended ? 'completed' : 'absent'}`}>
                    {ev.attended ? '✅ Verified' : '❌ Pending'}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No past activity yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-row">
        <div className="quick-card blue" onClick={() => onSectionChange('browse')}>
          <div className="qc-icon">🔍</div>
          <div><div className="qc-title">Browse Events</div><div className="qc-sub">Find events near you</div></div>
        </div>
        <div className="quick-card green" onClick={() => onSectionChange('attendance')}>
          <div className="qc-icon">✅</div>
          <div><div className="qc-title">Mark Attendance</div><div className="qc-sub">Enter attendance code</div></div>
        </div>
        <div className="quick-card yellow" onClick={() => onSectionChange('certificates')}>
          <div className="qc-icon">🎓</div>
          <div><div className="qc-title">My Certificates</div><div className="qc-sub">View & download</div></div>
        </div>
        <div className="quick-card purple" onClick={() => onSectionChange('leaderboard')}>
          <div className="qc-icon">🏆</div>
          <div><div className="qc-title">Leaderboard</div><div className="qc-sub">See your ranking</div></div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerOverview;
