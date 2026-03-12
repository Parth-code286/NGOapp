import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './AnalyticsHeatmap.css';

const API_BASE = 'http://localhost:5053';

// Pre-defined categories for consistent colors
const CATEGORY_COLORS = {
  health:        { css: 'cat-color-health', hex: '#ef4444' },
  cleanliness:   { css: 'cat-color-cleanliness', hex: '#3b82f6' },
  food:          { css: 'cat-color-food', hex: '#f97316' },
  education:     { css: 'cat-color-education', hex: '#8b5cf6' },
  environment:   { css: 'cat-color-environment', hex: '#22c55e' },
  animal:        { css: 'cat-color-animal', hex: '#ec4899' },
  tech:          { css: 'cat-color-tech', hex: '#06b6d4' },
};

const getCatAttr = (categoryStr) => {
  const norm = categoryStr.toLowerCase().trim();
  // Check predefined tags
  for (const key in CATEGORY_COLORS) {
    if (norm.includes(key)) return { name: categoryStr, className: CATEGORY_COLORS[key].css, hex: CATEGORY_COLORS[key].hex };
  }
  return { name: categoryStr, className: 'cat-color-default', hex: '#94a3b8' };
};

const AnalyticsHeatmap = () => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  // Extracted dynamically found categories across all locations for the legend
  const [allCategories, setAllCategories] = useState({});

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/analytics/volunteer-heatmap`, { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch heatmap data');
        
        setHeatmapData(data.heatmap || []);

        // Aggregate unique categories for legend
        const cats = {};
        (data.heatmap || []).forEach(loc => {
          Object.keys(loc.categories).forEach(cat => {
            if (!cats[cat]) cats[cat] = getCatAttr(cat);
          });
        });
        setAllCategories(cats);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHeatmap();
  }, [token]);

  if (loading) {
    return (
      <div className="hm-wrapper">
        <div className="hm-loading">
          <div className="hm-spin" />
          <p>Generating Heatmap Analytics…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hm-wrapper">
        <div className="hm-header">
          <h1 className="hm-title">Volunteer Heatmap</h1>
          <p className="hm-subtitle" style={{ color: 'var(--danger)' }}>Error: {error}</p>
        </div>
      </div>
    );
  }

  const totalVolunteers = heatmapData.reduce((acc, loc) => acc + loc.total, 0);
  const totalLocations  = heatmapData.length;

  return (
    <div className="hm-wrapper">
      <div className="hm-header">
        <h1 className="hm-title">Volunteer Heatmap Analytics</h1>
        <p className="hm-subtitle">
          Visualize the concentration of volunteers across different regions, categorized by their interests.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="hm-overview-row">
        <div className="hm-overview-card">
          <div className="hm-card-icon">👥</div>
          <div className="hm-card-content">
            <h3>Total Volunteers</h3>
            <p>{totalVolunteers}</p>
          </div>
        </div>
        <div className="hm-overview-card">
          <div className="hm-card-icon">📍</div>
          <div className="hm-card-content">
            <h3>Active Regions</h3>
            <p>{totalLocations}</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      {Object.keys(allCategories).length > 0 && (
        <div className="hm-legend">
          {Object.values(allCategories).map(cat => (
            <div className="hm-legend-item" key={cat.name}>
              <div className={`hm-legend-color ${cat.className}`} />
              <span style={{ textTransform: 'capitalize' }}>{cat.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Geographic Map */}
      <div className="hm-map-container" style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem', border: '1px solid var(--border)', position: 'relative', zIndex: 0 }}>
        <MapContainer center={[20.5937, 78.9629]} zoom={4} style={{ height: '100%', width: '100%', zIndex: 0 }}>
          {/* Subtle dark-themed map layer if in dark mode, or standard OSM */}
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          {heatmapData.map((loc) => {
             if (!loc.lat || !loc.lng) return null;
             
             // Create an emoji-based custom map marker
             const emojiIcon = new L.divIcon({
               html: '<div style="font-size: 28px; line-height: 1; text-align: center; text-shadow: 1px 1px 3px rgba(0,0,0,0.4);">📍</div>',
               className: 'hm-emoji-marker',
               iconSize: [28, 28],
               iconAnchor: [14, 28],
               popupAnchor: [0, -28],
             });

             return (
               <Marker 
                 key={loc.location}
                 position={[loc.lat, loc.lng]}
                 icon={emojiIcon}
               >
                 <Popup>
                   <div style={{ padding: '4px', fontFamily: 'var(--font)' }}>
                     <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#111827' }}>{loc.location}</h3>
                     <div style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '8px' }}>
                       <strong>{loc.total}</strong> Total Volunteers
                     </div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       {Object.entries(loc.categories).sort((a,b)=>b[1]-a[1]).map(([cName, cCount]) => (
                         <div key={cName} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                           <span style={{ textTransform: 'capitalize' }}>{cName}</span>
                           <span style={{ fontWeight: 'bold' }}>{cCount}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                 </Popup>
               </Marker>
             );
          })}
        </MapContainer>
      </div>

      {Object.keys(allCategories).length > 0 && (
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Detailed Region Breakdown</h2>
      )}

      {/* Heatmap Grid (Detailed Breakdown) */}
      <div className="hm-grid">
        {heatmapData.length === 0 ? (
          <div className="hm-empty">
            <h2>No Data Available</h2>
            <p>Once volunteers register and add interests, the heatmap will generate automatically.</p>
          </div>
        ) : (
          heatmapData.map((loc, idx) => {
            // Flatten categories into an array of individual 'dots' for the waffle chart
            const dots = [];
            Object.entries(loc.categories).forEach(([catName, count]) => {
              const catAttr = getCatAttr(catName);
              for (let i = 0; i < count; i++) {
                dots.push({ catName, className: catAttr.className, id: `${idx}-${catName}-${i}` });
              }
            });

            // Sort categories by count desc for the breakdown list
            const sortedBreakdown = Object.entries(loc.categories)
              .sort((a, b) => b[1] - a[1]);

            return (
              <div className="hm-region-card" key={loc.location}>
                <div className="hm-region-header">
                  <div className="hm-region-name">📍 {loc.location}</div>
                  <div className="hm-region-total">{loc.total} Vols</div>
                </div>

                {/* The Heatmap Visual (Waffle Chart dots) */}
                <div className="hm-waffle">
                  {dots.map(dot => (
                     <div 
                       key={dot.id} 
                       className={`hm-waffle-dot ${dot.className}`}
                       data-tooltip={`${loc.location} — ${dot.catName.charAt(0).toUpperCase() + dot.catName.slice(1)}`}
                     />
                  ))}
                </div>

                {/* Breakdown Progress Bars */}
                <div className="hm-breakdown">
                  {sortedBreakdown.map(([catName, count]) => {
                    const catAttr = getCatAttr(catName);
                    const pct = (count / loc.total) * 100;
                    return (
                      <div className="hm-breakdown-item" key={catName}>
                        <div className="hm-breakdown-label">
                          <div className={`hm-legend-color ${catAttr.className}`} style={{ width: 10, height: 10 }} />
                          <span style={{ textTransform: 'capitalize' }}>{catName}</span>
                        </div>
                        <div className="hm-breakdown-bar-wrap">
                          <div 
                            className={`hm-breakdown-bar ${catAttr.className}`} 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                        <div className="hm-breakdown-value">{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AnalyticsHeatmap;
