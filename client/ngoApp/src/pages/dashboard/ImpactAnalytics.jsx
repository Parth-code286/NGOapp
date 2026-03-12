import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { supabase } from '../../lib/supabaseClient';
import './ImpactAnalytics.css';

const API_BASE = 'http://localhost:5053';

const COLORS = ['#fcba03', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f97316'];

const ImpactAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    try {
      const [statsRes, heatmapRes] = await Promise.all([
        fetch(`${API_BASE}/api/analytics/stats`),
        fetch(`${API_BASE}/api/analytics/volunteer-heatmap`)
      ]);

      const statsData = await statsRes.json();
      const heatmapData = await heatmapRes.json();

      if (statsRes.ok) setStats(statsData);
      if (heatmapRes.ok) setHeatmap(heatmapData.heatmap || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  useEffect(() => {
    fetchData().then(() => setLoading(false));

    // Setup Supabase Realtime Subscriptions
    const channels = [
      supabase.channel('public:events').on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, fetchData).subscribe(),
      supabase.channel('public:volunteers').on('postgres_changes', { event: '*', schema: 'public', table: 'volunteers' }, fetchData).subscribe(),
      supabase.channel('public:registrations').on('postgres_changes', { event: '*', schema: 'public', table: 'event_registrations' }, fetchData).subscribe()
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  if (loading) {
    return (
      <div className="ia-loading">
        <div className="ia-spin" />
        <p>Analyzing impact data...</p>
      </div>
    );
  }

  // Prepping trend data (Mocking trend as backend only provides snapshots currently)
  const trendData = [
    { name: 'Jan', impact: 400, volunteers: 240 },
    { name: 'Feb', impact: 300, volunteers: 139 },
    { name: 'Mar', impact: 200, volunteers: 980 },
    { name: 'Apr', impact: 278, volunteers: 390 },
    { name: 'May', impact: 189, volunteers: 480 },
    { name: 'Jun', impact: 239, volunteers: 380 },
  ];

  // Prepping Category Data from Heatmap
  const categorySummary = {};
  heatmap.forEach(loc => {
    Object.entries(loc.categories).forEach(([cat, count]) => {
      categorySummary[cat] = (categorySummary[cat] || 0) + count;
    });
  });

  const pieData = Object.entries(categorySummary).map(([name, value]) => ({ 
    name: name.charAt(0).toUpperCase() + name.slice(1), 
    value 
  })).sort((a,b) => b.value - a.value).slice(0, 6);

  return (
    <div className="ia-container">
      <div className="ia-header animate-fade-in">
        <h1 className="ia-title">Impact <span className="text-primary">Analytics</span></h1>
        <p className="ia-subtitle">Real-time engagement and contribution insights.</p>
      </div>

      {/* Overview Grid */}
      <div className="ia-stats-grid">
        <div className="ia-stat-card animate-fade-in delay-100">
          <div className="ia-stat-icon">👥</div>
          <div className="ia-stat-info">
            <div className="ia-stat-value">{stats?.totalVolunteers || 0}</div>
            <div className="ia-stat-label">Total Volunteers</div>
          </div>
        </div>
        <div className="ia-stat-card animate-fade-in delay-200">
          <div className="ia-stat-icon">📅</div>
          <div className="ia-stat-info">
            <div className="ia-stat-value">{stats?.totalEvents || 0}</div>
            <div className="ia-stat-label">Events Organized</div>
          </div>
        </div>
        <div className="ia-stat-card animate-fade-in delay-300">
          <div className="ia-stat-icon">📈</div>
          <div className="ia-stat-info">
            <div className="ia-stat-value">{stats?.attendanceRate || '0%'}</div>
            <div className="ia-stat-label">Attendance Rate</div>
          </div>
        </div>
        <div className="ia-stat-card animate-fade-in delay-300">
          <div className="ia-stat-icon">📍</div>
          <div className="ia-stat-info">
            <div className="ia-stat-value">{stats?.topCity || 'N/A'}</div>
            <div className="ia-stat-label">Top Impact City</div>
          </div>
        </div>
      </div>

      <div className="ia-grid-main">
        {/* Engagement Trend */}
        <div className="ia-card chart-card animate-fade-in delay-100">
          <h3 className="ia-card-title">Volunteer Engagement Trend</h3>
          <div className="ia-chart-wrap">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fcba03" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fcba03" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="impact" stroke="#fcba03" strokeWidth={3} fillOpacity={1} fill="url(#colorImpact)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="ia-card chart-card animate-fade-in delay-200">
          <h3 className="ia-card-title">Impact via Categories</h3>
          <div className="ia-chart-wrap">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="ia-grid-bottom">
        {/* Geographic Breakdown Table */}
        <div className="ia-card table-card animate-fade-in delay-300">
          <h3 className="ia-card-title">Geographic Breakdown</h3>
          <div className="ia-table-scroll">
            <table className="ia-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Volunteers</th>
                  <th>Key Interest</th>
                  <th>Impact Level</th>
                </tr>
              </thead>
              <tbody>
                {heatmap.map((loc, i) => (
                  <tr key={i}>
                    <td className="loc-name">{loc.location}</td>
                    <td>{loc.total}</td>
                    <td>{Object.keys(loc.categories)[0] || 'Generic'}</td>
                    <td>
                      <div className="impact-bar-bg">
                        <div className="impact-bar-fill" style={{ width: `${Math.min(loc.total * 10, 100)}%` }}></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactAnalytics;
