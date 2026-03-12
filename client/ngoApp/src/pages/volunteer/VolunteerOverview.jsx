import React from 'react';
import '../dashboard/DashboardOverview.css';
import './VolunteerOverview.css';

const stats = [
  { label: 'Events Registered',   value: '12',  icon: '📋', change: '+2 this month',    color: 'stat-blue' },
  { label: 'Events Attended',     value: '9',   icon: '✅', change: '+1 this month',    color: 'stat-green' },
  { label: 'Hours Volunteered',   value: '47',  icon: '⏱️', change: '+6h this month',   color: 'stat-yellow' },
  { label: 'Certificates Earned', value: '5',   icon: '🎓', change: '+1 recently',      color: 'stat-purple' },
  { label: 'Impact Points',       value: '1,320',icon: '🏆',change: '+240 this month',  color: 'stat-orange' },
  { label: 'Leaderboard Rank',    value: '#14', icon: '🥇', change: '↑ 3 positions',    color: 'stat-teal' },
];

const upcomingEvents = [
  { name: 'Tree Plantation Drive',      date: 'Mar 14, 2026', org: 'GreenEarth NGO',   status: 'registered' },
  { name: 'Blood Donation Camp',        date: 'Mar 18, 2026', org: 'HealthFirst',       status: 'registered' },
  { name: 'Night Shelter Volunteering', date: 'Mar 22, 2026', org: 'CareBridge',        status: 'open' },
  { name: 'Digital Literacy Campaign',  date: 'Mar 28, 2026', org: 'EduReach',          status: 'open' },
];

const pastEvents = [
  { name: 'Beach Cleanup Drive',     date: 'Mar 10, 2026', hours: 5,  points: 150, attended: true },
  { name: 'Food Distribution Drive', date: 'Feb 20, 2026', hours: 4,  points: 120, attended: true },
  { name: 'Animal Shelter Help',     date: 'Feb 12, 2026', hours: 3,  points: 90,  attended: false },
];

const leaderboard = [
  { rank: 1, name: 'Ananya Sharma',  points: 3200, badge: '🥇' },
  { rank: 2, name: 'Rahul Mehta',    points: 2980, badge: '🥈' },
  { rank: 3, name: 'Priya Singh',    points: 2740, badge: '🥉' },
  { rank: 14, name: 'You',           points: 1320, badge: '⭐', highlight: true },
];

const VolunteerOverview = ({ onSectionChange }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

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
            <div className="stat-change">↑ {stat.change}</div>
          </div>
        ))}
      </div>

      <div className="overview-grid-2">
        {/* Upcoming Events */}
        <div className="overview-card">
          <div className="card-header">
            <h3 className="card-title">Upcoming Events</h3>
            <button className="text-link">Browse all →</button>
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
              {upcomingEvents.map((ev, i) => (
                <tr key={i}>
                  <td className="event-name">{ev.name}</td>
                  <td>{ev.date}</td>
                  <td>{ev.org}</td>
                  <td>
                    <span className={`status-pill ${ev.status === 'registered' ? 'completed' : 'upcoming'}`}>
                      {ev.status === 'registered' ? 'Registered' : 'Open'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Leaderboard */}
        <div className="overview-card">
          <div className="card-header">
            <h3 className="card-title">Community Leaderboard</h3>
            <button className="text-link">Full view →</button>
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
          <h3 className="card-title">Past Participation</h3>
          <button className="text-link">View all →</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Hours</th>
              <th>Points Earned</th>
              <th>Attended</th>
            </tr>
          </thead>
          <tbody>
            {pastEvents.map((ev, i) => (
              <tr key={i}>
                <td className="event-name">{ev.name}</td>
                <td>{ev.date}</td>
                <td>{ev.hours}h</td>
                <td>+{ev.points}</td>
                <td>
                  <span className={`status-pill ${ev.attended ? 'completed' : 'absent'}`}>
                    {ev.attended ? '✅ Present' : '❌ Absent'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-row">
        <div className="quick-card blue">
          <div className="qc-icon">🔍</div>
          <div><div className="qc-title">Browse Events</div><div className="qc-sub">Find events near you</div></div>
        </div>
        <div className="quick-card green">
          <div className="qc-icon">✅</div>
          <div><div className="qc-title">Mark Attendance</div><div className="qc-sub">Enter attendance code</div></div>
        </div>
        <div className="quick-card yellow">
          <div className="qc-icon">🎓</div>
          <div><div className="qc-title">My Certificates</div><div className="qc-sub">View & download</div></div>
        </div>
        <div className="quick-card purple">
          <div className="qc-icon">🏆</div>
          <div><div className="qc-title">Leaderboard</div><div className="qc-sub">See your ranking</div></div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerOverview;
