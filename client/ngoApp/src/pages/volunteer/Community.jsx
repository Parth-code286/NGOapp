import React, { useState, useEffect, useCallback } from 'react';
import './Community.css';

const API_BASE = 'http://localhost:5053';

const LEVEL_TIERS = [
  { level: 1, name: 'Newcomer',   icon: '🌱', min: 0,    max: 199  },
  { level: 2, name: 'Rising Star', icon: '⭐', min: 200,  max: 499  },
  { level: 3, name: 'Champion',    icon: '🔥', min: 500,  max: 999  },
  { level: 4, name: 'Legend',      icon: '👑', min: 1000, max: Infinity },
];

const BADGE_ICONS = {
  'First Step':    '🎯',
  'Helping Hand':  '🤝',
  'Eco Warrior':   '🌿',
  'Veteran':       '🏅',
  'Super Star':    '💫',
};

const Community = ({ onSectionChange }) => {
  const user  = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const [stats,       setStats]       = useState(null);
  const [badges,      setBadges]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkResult,  setCheckResult]  = useState(null);

  const fetchData = useCallback(async () => {
    if (!user.id) return;
    setLoading(true);
    try {
      const [statsRes, badgesRes] = await Promise.all([
        fetch(`${API_BASE}/gamification/stats/${user.id}`, { headers }),
        fetch(`${API_BASE}/gamification/badges/${user.id}`, { headers }),
      ]);
      const statsData  = await statsRes.json();
      const badgesData = await badgesRes.json();

      if (statsRes.ok)  setStats(statsData);
      if (badgesRes.ok) setBadges(badgesData.badges || []);
    } catch {}
    setLoading(false);
  }, [user.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCheckBadges = async () => {
    setCheckLoading(true);
    setCheckResult(null);
    try {
      const res = await fetch(`${API_BASE}/gamification/check-badges`, {
        method: 'POST', headers,
        body: JSON.stringify({ volunteer_id: user.id }),
      });
      const data = await res.json();
      setCheckResult(data);
      if (data.new_badges?.length > 0) fetchData();
    } catch {}
    setCheckLoading(false);
  };

  const currentTier = LEVEL_TIERS.find(t => t.level === (stats?.level || 1)) || LEVEL_TIERS[0];
  const nextTier    = LEVEL_TIERS.find(t => t.level === currentTier.level + 1);
  const pts         = stats?.points || 0;
  const progressPct = nextTier
    ? Math.min(100, ((pts - currentTier.min) / (nextTier.min - currentTier.min)) * 100)
    : 100;

  const radius        = 75;
  const circumference = 2 * Math.PI * radius;
  const dashOffset    = circumference - (progressPct / 100) * circumference;

  if (loading) {
    return (
      <div className="cm-wrapper">
        <div className="cm-loading"><div className="cm-spin" /><p>Loading your profile…</p></div>
      </div>
    );
  }

  return (
    <div className="cm-wrapper">
      <div className="cm-header animate-fade-in">
        <div className="cm-header-flex">
          <div>
            <h1 className="cm-title">Community Hub</h1>
            <p className="cm-subtitle">Your personal impact trail and achievements.</p>
          </div>
          <button 
            className="cm-leaderboard-btn"
            onClick={() => onSectionChange('leaderboard')}
          >
            🏆 Leaderboard
          </button>
        </div>
      </div>

      <div className="cm-stats-grid">
        <div className="cm-stat-card animate-fade-in delay-100">
          <div className="icon">⚡</div>
          <div className="details">
            <span className="value">{stats?.points || 0}</span>
            <span className="label">Total Points</span>
          </div>
        </div>
        <div className="cm-stat-card animate-fade-in delay-200">
          <div className="icon">🎖️</div>
          <div className="details">
            <span className="value">{stats?.level || 1}</span>
            <span className="label">Current Level</span>
          </div>
        </div>
        <div className="cm-stat-card animate-fade-in delay-300">
          <div className="icon">🔥</div>
          <div className="details">
            <span className="value">{stats?.streak || 0}</span>
            <span className="label">Activity Streak</span>
          </div>
        </div>
        <div className="cm-stat-card animate-fade-in delay-300">
          <div className="icon">📅</div>
          <div className="details">
            <span className="value">{stats?.events_attended || 0}</span>
            <span className="label">Events Impacted</span>
          </div>
        </div>
      </div>

      <div className="cm-main-grid">
        <div className="cm-progress-card animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="cm-ring-box">
            <svg className="cm-ring-svg" viewBox="0 0 180 180">
              <circle className="cm-ring-bg" cx="90" cy="90" r={radius} />
              <circle
                className="cm-ring-progress"
                cx="90" cy="90" r={radius}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div className="cm-ring-content">
              <span className="emoji">{currentTier.icon}</span>
              <span className="lvl">LVL {stats?.level || 1}</span>
            </div>
          </div>
          <div className="cm-prog-details">
            <h2 className="tier-name">{currentTier.name}</h2>
            <p className="pts-info">
              {nextTier 
                ? `${nextTier.min - pts} points until next level` 
                : 'Highest Honor Unlocked!'}
            </p>
            <div className="prog-bar-wrap">
               <div className="prog-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>

        <div className="cm-tiers-card">
          <h3>🏆 Advancement Path</h3>
          <div className="cm-tier-list">
            {LEVEL_TIERS.map(t => (
              <div key={t.level} className={`cm-tier-item ${t.level === stats?.level ? 'active' : ''} ${t.level < stats?.level ? 'completed' : ''}`}>
                <div className="tier-icon">{t.icon}</div>
                <div className="tier-info">
                  <span className="name">Level {t.level}: {t.name}</span>
                  <span className="requirement">{t.min}+ points</span>
                </div>
                {t.level <= (stats?.level || 1) && <span className="status">✓</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cm-badges-section">
        <div className="cm-section-header">
           <h2>🏅 Merit Badges ({badges.length})</h2>
           <button className="cm-check-btn" onClick={handleCheckBadges} disabled={checkLoading}>
             {checkLoading ? 'Checking…' : '🔍 Scan for Badges'}
           </button>
        </div>
        
        {checkResult && (
          <div className={`cm-check-msg ${checkResult.new_badges?.length > 0 ? 'success' : 'info'}`}>
            {checkResult.message}
          </div>
        )}

        <div className="cm-badges-grid">
          {badges.length === 0 ? (
            <div className="cm-empty-badges">
              <div className="icon">🎖️</div>
              <p>No badges yet. Start participating in events to unlock your first badge!</p>
            </div>
          ) : (
            badges.map((badge, idx) => (
              <div className="cm-badge-card" key={idx}>
                <div className="badge-glow" />
                <div className="badge-icon">{BADGE_ICONS[badge.name] || '🏆'}</div>
                <h4 className="badge-name">{badge.name}</h4>
                <p className="badge-desc">{badge.description}</p>
                {badge.earned_at && (
                  <span className="earned-date">
                    {new Date(badge.earned_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;
