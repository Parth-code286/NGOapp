import React, { useState, useEffect, useCallback } from 'react';
import './Gamification.css';

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

const Gamification = () => {
  const user  = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const [stats,       setStats]       = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [badges,      setBadges]      = useState([]);
  const [loading,     setLoading]     = useState(true);

  const [checkLoading, setCheckLoading] = useState(false);
  const [checkResult,  setCheckResult]  = useState(null);

  // ── Fetch all data ──
  const fetchData = useCallback(async () => {
    if (!user.id) return;
    setLoading(true);
    try {
      const [statsRes, lbRes, badgesRes] = await Promise.all([
        fetch(`${API_BASE}/gamification/stats/${user.id}`, { headers }),
        fetch(`${API_BASE}/gamification/leaderboard`, { headers }),
        fetch(`${API_BASE}/gamification/badges/${user.id}`, { headers }),
      ]);
      const statsData  = await statsRes.json();
      const lbData     = await lbRes.json();
      const badgesData = await badgesRes.json();

      if (statsRes.ok)  setStats(statsData);
      if (lbRes.ok)     setLeaderboard(lbData.leaderboard || []);
      if (badgesRes.ok) setBadges(badgesData.badges || []);
    } catch {}
    setLoading(false);
  }, [user.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Check for new badges ──
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
      if (data.new_badges?.length > 0) fetchData(); // refresh
    } catch {}
    setCheckLoading(false);
  };

  // ── Level progress computation ──
  const currentTier = LEVEL_TIERS.find(t => t.level === (stats?.level || 1)) || LEVEL_TIERS[0];
  const nextTier    = LEVEL_TIERS.find(t => t.level === currentTier.level + 1);
  const pts         = stats?.points || 0;
  const progressPct = nextTier
    ? Math.min(100, ((pts - currentTier.min) / (nextTier.min - currentTier.min)) * 100)
    : 100;

  // SVG ring
  const radius        = 75;
  const circumference = 2 * Math.PI * radius;
  const dashOffset    = circumference - (progressPct / 100) * circumference;

  if (loading) {
    return (
      <div className="gm-wrapper">
        <div className="gm-loading"><div className="gm-spin" /><p>Loading your stats…</p></div>
      </div>
    );
  }

  return (
    <div className="gm-wrapper">
      {/* Header */}
      <div className="gm-header">
        <h1 className="gm-title">Gamification Hub</h1>
        <p className="gm-subtitle">Track your progress, earn badges, and climb the leaderboard.</p>
      </div>

      {/* ═══ Stats Row ═══ */}
      <div className="gm-stats-row">
        <div className="gm-stat-card">
          <div className="gm-stat-icon">⚡</div>
          <div className="gm-stat-value">{stats?.points || 0}</div>
          <div className="gm-stat-label">Total Points</div>
        </div>
        <div className="gm-stat-card">
          <div className="gm-stat-icon">🎖️</div>
          <div className="gm-stat-value">{stats?.level || 1}</div>
          <div className="gm-stat-label">Current Level</div>
        </div>
        <div className="gm-stat-card">
          <div className="gm-stat-icon">🔥</div>
          <div className="gm-stat-value">{stats?.streak || 0}</div>
          <div className="gm-stat-label">Day Streak</div>
        </div>
        <div className="gm-stat-card">
          <div className="gm-stat-icon">📅</div>
          <div className="gm-stat-value">{stats?.events_attended || 0}</div>
          <div className="gm-stat-label">Events Attended</div>
        </div>
      </div>

      {/* ═══ Level Ring + Tiers ═══ */}
      <div className="gm-level-section">
        <div className="gm-level-ring-card">
          <div className="gm-ring-wrap">
            <svg className="gm-ring-svg" viewBox="0 0 180 180">
              <defs>
                <linearGradient id="gm-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fcba03" />
                  <stop offset="50%" stopColor="#ff6b6b" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <circle className="gm-ring-bg" cx="90" cy="90" r={radius} />
              <circle
                className="gm-ring-progress"
                cx="90" cy="90" r={radius}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div className="gm-ring-center">
              <div className="gm-ring-level">{currentTier.icon}</div>
              <div className="gm-ring-label">Level {stats?.level || 1}</div>
            </div>
          </div>
          <div className="gm-level-title">{currentTier.name}</div>
          <div className="gm-level-sub">
            {nextTier
              ? `${nextTier.min - pts} pts to ${nextTier.name}`
              : 'Max level reached! 🎉'}
          </div>
        </div>

        <div className="gm-tiers-card">
          <div className="gm-tiers-title">🏆 Level Tiers</div>
          <div className="gm-tier-list">
            {LEVEL_TIERS.map(tier => (
              <div className={`gm-tier ${tier.level === (stats?.level || 1) ? 'active' : ''}`} key={tier.level}>
                <div className="gm-tier-icon">{tier.icon}</div>
                <div className="gm-tier-info">
                  <div className="gm-tier-name">Level {tier.level} — {tier.name}</div>
                  <div className="gm-tier-range">
                    {tier.max === Infinity ? `${tier.min}+ points` : `${tier.min} – ${tier.max} points`}
                  </div>
                </div>
                {(stats?.level || 1) >= tier.level && (
                  <div className="gm-tier-check">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Badges ═══ */}
      <div className="gm-section-title">
        🏅 Badges Earned <span className="count">{badges.length}</span>
      </div>
      <div className="gm-badges-grid">
        {badges.length === 0 ? (
          <div className="gm-no-badges">
            <div className="icon">🎖️</div>
            <p>No badges earned yet. Keep volunteering to unlock achievements!</p>
            <button className="gm-check-btn" onClick={handleCheckBadges} disabled={checkLoading}>
              {checkLoading ? 'Checking…' : '🔍 Check for New Badges'}
            </button>
            {checkResult && (
              <div className={`gm-check-result ${checkResult.new_badges?.length > 0 ? 'new' : 'none'}`}>
                {checkResult.message}
              </div>
            )}
          </div>
        ) : (
          <>
            {badges.map((badge, i) => (
              <div className="gm-badge-card" key={i}>
                <div className="gm-badge-icon">{BADGE_ICONS[badge.name] || badge.icon || '🏆'}</div>
                <div className="gm-badge-name">{badge.name}</div>
                <div className="gm-badge-desc">{badge.description || 'Achievement unlocked!'}</div>
                {badge.earned_at && (
                  <div className="gm-badge-date">
                    Earned {new Date(badge.earned_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                )}
              </div>
            ))}
            <div className="gm-no-badges" style={{ background: 'transparent', border: '1px dashed rgba(255,255,255,0.08)' }}>
              <button className="gm-check-btn" onClick={handleCheckBadges} disabled={checkLoading}>
                {checkLoading ? 'Checking…' : '🔍 Check for New Badges'}
              </button>
              {checkResult && (
                <div className={`gm-check-result ${checkResult.new_badges?.length > 0 ? 'new' : 'none'}`}>
                  {checkResult.message}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ═══ Leaderboard ═══ */}
      <div className="gm-section-title">🏆 Leaderboard — Top 10</div>
      <div className="gm-leaderboard-card">
        {leaderboard.length === 0 ? (
          <div className="gm-lb-empty">
            <p>No leaderboard data yet. Be the first to earn points!</p>
          </div>
        ) : (
          <table className="gm-lb-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Volunteer</th>
                <th>Points</th>
                <th>Level</th>
                <th>Events</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map(v => {
                const rankClass = v.rank === 1 ? 'gold' : v.rank === 2 ? 'silver' : v.rank === 3 ? 'bronze' : 'normal';
                const isSelf    = v.id === user.id;
                const levelCls  = `l${v.level || 1}`;
                return (
                  <tr key={v.id} className={isSelf ? 'self' : ''}>
                    <td>
                      <span className={`gm-rank ${rankClass}`}>
                        {v.rank <= 3 ? ['🥇', '🥈', '🥉'][v.rank - 1] : v.rank}
                      </span>
                    </td>
                    <td>
                      <div className="gm-lb-name">
                        <div className="gm-lb-avatar">{(v.name || 'V')[0].toUpperCase()}</div>
                        <span className="gm-lb-vol-name">
                          {v.name}{isSelf ? ' (You)' : ''}
                        </span>
                      </div>
                    </td>
                    <td><span className="gm-lb-pts">{v.points}</span></td>
                    <td><span className={`gm-lb-level ${levelCls}`}>LVL {v.level || 1}</span></td>
                    <td><span className="gm-lb-events">{v.events_attended || 0}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Gamification;
