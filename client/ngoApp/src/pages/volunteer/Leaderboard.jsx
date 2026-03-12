import React, { useState, useEffect, useCallback } from 'react';
import './Leaderboard.css';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}`;

const Leaderboard = () => {
  const user  = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading,     setLoading]     = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/gamification/leaderboard`, { headers });
      const data = await res.json();
      if (res.ok) {
        setLeaderboard(data.leaderboard || []);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  if (loading) {
    return (
      <div className="lb-wrapper">
        <div className="lb-loading"><div className="lb-spin" /><p>Calculating rankings…</p></div>
      </div>
    );
  }

  return (
    <div className="lb-wrapper">
      <div className="lb-header animate-fade-in">
        <div className="lb-header-text">
          <h1 className="lb-title">Community Leaderboard</h1>
          <p className="lb-subtitle">Celebrating our most dedicated change-makers.</p>
        </div>
        <div className="lb-trophy">🏆</div>
      </div>

      <div className="lb-card animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="lb-table-container">
          <table className="lb-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Change Maker</th>
                <th>Impact Points</th>
                <th>Expertise Level</th>
                <th>Events Done</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan="5" className="lb-empty">No ranking data available yet. Start your journey!</td>
                </tr>
              ) : (
                leaderboard.map((v) => {
                  const isGold   = v.rank === 1;
                  const isSilver = v.rank === 2;
                  const isBronze = v.rank === 3;
                  const isSelf   = v.id === user.id;

                  return (
                    <tr key={v.id} className={`${isSelf ? 'self' : ''} ${v.rank <= 3 ? 'top-tier' : ''}`}>
                      <td>
                        <div className={`lb-rank-badge ${isGold ? 'gold' : isSilver ? 'silver' : isBronze ? 'bronze' : ''}`}>
                          {v.rank === 1 ? '🥇' : v.rank === 2 ? '🥈' : v.rank === 3 ? '🥉' : v.rank}
                        </div>
                      </td>
                      <td>
                        <div className="lb-user-cell">
                          <div className="lb-avatar" style={{ 
                            background: isSelf ? 'var(--primary)' : 'var(--bg-off)',
                            color: isSelf ? 'white' : 'var(--text-main)'
                          }}>
                            {(v.name || 'V')[0].toUpperCase()}
                          </div>
                          <div className="lb-user-info">
                            <span className="lb-name">{v.name}{isSelf && <span className="lb-self-tag">You</span>}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="lb-points">
                          <span className="pts">{v.points}</span>
                          <span className="label">pts</span>
                        </div>
                      </td>
                      <td>
                        <span className={`lb-level-tag l${v.level || 1}`}>
                           LEVEL {v.level || 1}
                        </span>
                      </td>
                      <td>
                        <div className="lb-attendance">
                           <span className="count">{v.events_attended || 0}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lb-footer-note">
        ✨ Points are earned by completing volunteering tasks and contributing to the community.
      </div>
    </div>
  );
};

export default Leaderboard;
