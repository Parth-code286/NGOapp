import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import './ImpactScore.css';

const API_BASE = 'http://localhost:5053';

const ImpactScore = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchScore = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/analytics/impact-score`);
      const result = await res.json();
      if (res.ok) {
        setData(result);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch impact score:', err);
    }
  };

  useEffect(() => {
    fetchScore().then(() => setLoading(false));

    // Real-time subscriptions
    const channels = [
      supabase.channel('is-events').on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, fetchScore).subscribe(),
      supabase.channel('is-volunteers').on('postgres_changes', { event: '*', schema: 'public', table: 'volunteers' }, fetchScore).subscribe(),
      supabase.channel('is-registrations').on('postgres_changes', { event: '*', schema: 'public', table: 'event_registrations' }, fetchScore).subscribe()
    ];

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, []);

  if (loading) {
    return (
      <div className="is-loading">
        <div className="is-spin" />
        <p>Calculating Community Impact...</p>
      </div>
    );
  }

  const { totalImpactScore, breakdown, metrics } = data || {};

  return (
    <div className="is-container">
      <div className="is-header animate-fade-in">
        <h1 className="is-title">Community <span className="text-primary">Impact Score</span></h1>
        <p className="is-subtitle">Measuring the cumulative weight of social change.</p>
      </div>

      <div className="is-main-score-card animate-fade-in delay-100">
        <div className="is-score-display">
          <div className="is-score-value">{totalImpactScore?.toLocaleString()}</div>
          <div className="is-score-label">Total Impact Points</div>
        </div>
        <div className="is-score-visual">
          <div className="is-progress-meter">
            <div className="is-progress-fill" style={{ width: '75%' }}></div>
          </div>
          <div className="is-milestone">Next Milestone: 1M Points</div>
        </div>
      </div>

      <div className="is-metrics-grid">
        <div className="is-metric-card animate-fade-in delay-200">
          <div className="is-m-icon">⚡</div>
          <div className="is-m-info">
            <div className="is-m-val">{breakdown?.contributionScore?.toLocaleString()}</div>
            <div className="is-m-lab">Contribution Intensity</div>
          </div>
        </div>
        <div className="is-metric-card animate-fade-in delay-300">
          <div className="is-m-icon">🎯</div>
          <div className="is-m-info">
            <div className="is-m-val">{breakdown?.participationScore?.toLocaleString()}</div>
            <div className="is-m-lab">Participation Reach</div>
          </div>
        </div>
        <div className="is-metric-card animate-fade-in delay-300">
          <div className="is-m-icon">🌍</div>
          <div className="is-m-info">
            <div className="is-m-val">{breakdown?.diversityScore?.toLocaleString()}</div>
            <div className="is-m-lab">Geographic Influence</div>
          </div>
        </div>
        <div className="is-metric-card animate-fade-in delay-300">
          <div className="is-m-icon">🔥</div>
          <div className="is-m-info">
            <div className="is-m-val">{breakdown?.frequencyScore?.toLocaleString()}</div>
            <div className="is-m-lab">Activity Frequency</div>
          </div>
        </div>
      </div>

      <div className="is-details-grid">
        <div className="is-detail-card animate-fade-in delay-100">
          <h3 className="is-d-title">Raw Platform Data</h3>
          <div className="is-d-list">
            <div className="is-d-item">
              <span>Total Points Earned</span>
              <strong>{metrics?.totalPoints?.toLocaleString()}</strong>
            </div>
            <div className="is-d-item">
              <span>Approved Participants</span>
              <strong>{metrics?.approvedCount}</strong>
            </div>
            <div className="is-d-item">
              <span>Cities Impacted</span>
              <strong>{metrics?.uniqueCities}</strong>
            </div>
            <div className="is-d-item">
              <span>Total Events Lifecycle</span>
              <strong>{metrics?.eventCount}</strong>
            </div>
          </div>
        </div>

        <div className="is-detail-card animate-fade-in delay-200">
          <h3 className="is-d-title">Impact Insights</h3>
          <p className="is-d-text">
            Your community's impact score is calculated by weighting volunteer contribution intensity, 
            the reach of your events across different cities, and the frequency of successful participation. 
            Currently, <strong>Contribution Intensity</strong> is your strongest factor!
          </p>
          <div className="is-d-footer">
            Keep organizing events to boost your <strong>Activity Frequency</strong> score.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactScore;
