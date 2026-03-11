import React from 'react';
import './DashboardOverview.css';

const stats = [
  { label: 'Events Posted', value: '24', icon: '📅', change: '+3 this month', color: 'stat-yellow' },
  { label: 'Total Volunteers', value: '1,248', icon: '🤝', change: '+87 this month', color: 'stat-blue' },
  { label: 'Avg. Volunteers/Event', value: '52', icon: '👥', change: '+5 vs last month', color: 'stat-green' },
  { label: 'Attendance Rate', value: '89%', icon: '✅', change: '+2% improvement', color: 'stat-purple' },
  { label: 'Impact Score', value: '4,730', icon: '🏆', change: '+320 this month', color: 'stat-orange' },
  { label: 'Certificates Issued', value: '863', icon: '🎓', change: '+112 this month', color: 'stat-teal' },
];

const recentEvents = [
  { name: 'Beach Cleanup Drive', date: 'Mar 10, 2026', volunteers: 78, status: 'completed' },
  { name: 'Tree Plantation Drive', date: 'Mar 14, 2026', volunteers: 45, status: 'upcoming' },
  { name: 'Blood Donation Camp', date: 'Mar 18, 2026', volunteers: 102, status: 'upcoming' },
  { name: 'Digital Literacy Workshop', date: 'Feb 28, 2026', volunteers: 33, status: 'completed' },
  { name: 'Food Distribution Drive', date: 'Feb 20, 2026', volunteers: 60, status: 'completed' },
];

const topVolunteers = [
  { name: 'Ananya Sharma', events: 12, hours: 48, location: 'Mumbai' },
  { name: 'Rahul Mehta', events: 10, hours: 40, location: 'Pune' },
  { name: 'Priya Singh', events: 9, hours: 36, location: 'Delhi' },
  { name: 'Arjun Nair', events: 8, hours: 32, location: 'Bangalore' },
];

const DashboardOverview = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="overview-container">
      <div className="overview-header">
        <div>
          <h1 className="overview-title">Welcome back, <span className="text-primary">{user.name || 'Admin'}</span> 👋</h1>
          <p className="overview-subtitle">Here's what's happening with your NGO today.</p>
        </div>
        <button className="btn btn-primary create-btn">+ Create New Event</button>
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
        {/* Recent Events */}
        <div className="overview-card">
          <div className="card-header">
            <h3 className="card-title">Recent Events</h3>
            <button className="text-link">View all →</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Volunteers</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map((ev, i) => (
                <tr key={i}>
                  <td className="event-name">{ev.name}</td>
                  <td>{ev.date}</td>
                  <td>{ev.volunteers}</td>
                  <td>
                    <span className={`status-pill ${ev.status}`}>
                      {ev.status.charAt(0).toUpperCase() + ev.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Volunteers */}
        <div className="overview-card">
          <div className="card-header">
            <h3 className="card-title">Top Volunteers</h3>
            <button className="text-link">View all →</button>
          </div>
          <div className="volunteer-list">
            {topVolunteers.map((v, i) => (
              <div className="volunteer-row" key={i}>
                <div className="vol-rank">{i + 1}</div>
                <div className="vol-avatar">{v.name[0]}</div>
                <div className="vol-info">
                  <div className="vol-name">{v.name}</div>
                  <div className="vol-sub">{v.location} · {v.events} events · {v.hours}h</div>
                </div>
                <div className="vol-badge">🏅</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick action banners */}
      <div className="quick-actions-row">
        <div className="quick-card yellow">
          <div className="qc-icon">📢</div>
          <div>
            <div className="qc-title">Send Notification</div>
            <div className="qc-sub">Broadcast to all volunteers</div>
          </div>
        </div>
        <div className="quick-card blue">
          <div className="qc-icon">🎓</div>
          <div>
            <div className="qc-title">Issue Certificates</div>
            <div className="qc-sub">For completed events</div>
          </div>
        </div>
        <div className="quick-card green">
          <div className="qc-icon">📊</div>
          <div>
            <div className="qc-title">View Analytics</div>
            <div className="qc-sub">Impact & engagement report</div>
          </div>
        </div>
        <div className="quick-card purple">
          <div className="qc-icon">✅</div>
          <div>
            <div className="qc-title">Mark Attendance</div>
            <div className="qc-sub">Open attendance for event</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
