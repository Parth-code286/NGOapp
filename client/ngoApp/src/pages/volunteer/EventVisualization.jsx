import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './EventVisualization.css';

// Fix for default marker icons in React-Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}`;

// Custom icons
const ngoIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const eventIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Helper component to center map
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const EventVisualization = ({ onSectionChange }) => {
  const [events, setEvents] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState([19.0760, 72.8777]); // Default Mumbai
  const [radius, setRadius] = useState(500); // Default to 500km to show more stuff
  const [searchType, setSearchType] = useState('all'); // 'all', 'events', 'ngos'
  const [geocodedData, setGeocodedData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role || 'volunteer';

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.log("Geolocation error:", err)
      );
    }

    const fetchData = async () => {
      try {
        const [evRes, ngoRes] = await Promise.all([
          fetch(`${API_BASE}/events`),
          fetch(`${API_BASE}/api/ngo`)
        ]);
        const evData = await evRes.json();
        const ngoData = await ngoRes.json();
        
        setEvents(evData.events || []);
        setNgos(ngoData.ngos || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Geocoding logic with fallback
  useEffect(() => {
    const geocodeAll = async () => {
      setIsGeocoding(true);
      const itemsToGeocode = [
        ...events.map(e => ({ 
          ...e, 
          geoType: 'events', 
          addressString: [e.venue_name, e.city, e.state].filter(Boolean).join(', '), 
          fallbackString: [e.city, e.state].filter(Boolean).join(', ') 
        })),
        ...ngos.map(n => ({ 
          ...n, 
          geoType: 'ngo', 
          addressString: [n.city, n.state].filter(Boolean).join(', '), 
          fallbackString: [n.city, n.state].filter(Boolean).join(', ') 
        }))
      ];

      const geocoded = [];
      const cachedCoords = JSON.parse(localStorage.getItem('map_geo_cache') || '{}');
      let cacheUpdated = false;

      for (const item of itemsToGeocode) {
        if (!item.addressString) continue;

        const fullKey = item.addressString.toLowerCase();
        
        if (cachedCoords[fullKey]) {
          geocoded.push({ ...item, coords: cachedCoords[fullKey] });
          continue;
        }

        try {
          // Nominatim requires 1 second between requests
          await new Promise(r => setTimeout(r, 1000)); 
          
          let res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(item.addressString)}&limit=1`, {
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (res.status === 429) {
            console.error("Nominatim Rate Limit hit. Retrying later...");
            continue;
          }

          let data = await res.json();
          
          if (!data || data.length === 0) {
            // Fallback to City, State
            await new Promise(r => setTimeout(r, 1000));
            res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(item.fallbackString)}&limit=1`);
            data = await res.json();
          }

          if (data && data[0]) {
            const loc = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            cachedCoords[fullKey] = loc;
            cacheUpdated = true;
            geocoded.push({ ...item, coords: loc });
          }
        } catch (e) {
          console.error("Geocode failure for:", item.addressString, e);
        }
      }

      if (cacheUpdated) {
        localStorage.setItem('map_geo_cache', JSON.stringify(cachedCoords));
      }

      setGeocodedData(geocoded);
      setIsGeocoding(false);
    };

    if (events.length > 0 || ngos.length > 0) {
      geocodeAll();
    }
  }, [events, ngos]);

  // Haversine distance formula
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filteredData = useMemo(() => {
    return geocodedData.filter(item => {
      const dist = getDistance(userLocation[0], userLocation[1], item.coords[0], item.coords[1]);
      const matchesType = searchType === 'all' || item.geoType === searchType;
      return dist <= radius && matchesType;
    });
  }, [geocodedData, userLocation, radius, searchType]);

  return (
    <div className="ev-container">
      <div className="ev-sidebar">
        <h2 className="ev-title">Event Visualization</h2>
        <p className="ev-desc">Discover NGOs and volunteering opportunities near you.</p>
        
        <div className="ev-filters">
          <div className="ev-filter-group">
            <label>Search Radius: <b>{radius} km</b></label>
            <input 
              type="range" min="5" max="500" step="5" 
              value={radius} onChange={e => setRadius(parseInt(e.target.value))} 
            />
          </div>

          <div className="ev-filter-group">
            <label>What are you looking for?</label>
            <select value={searchType} onChange={e => setSearchType(e.target.value)}>
              <option value="all">All (Events & NGOs)</option>
              <option value="events">Volunteering Events</option>
              <option value="ngos">Registered NGOs</option>
            </select>
          </div>
        </div>

        <div className="ev-stats">
          <div className="ev-stat-card">
            <span className="ev-stat-val">
              {isGeocoding ? '...' : filteredData.filter(d => d.geoType === 'events').length}
            </span>
            <span className="ev-stat-label">Events Found</span>
          </div>
          <div className="ev-stat-card">
            <span className="ev-stat-val">
              {isGeocoding ? '...' : filteredData.filter(d => d.geoType === 'ngo').length}
            </span>
            <span className="ev-stat-label">NGOs Found</span>
          </div>
        </div>

        {isGeocoding && (
          <div className="ev-geocoding-notice">
            ⏳ Pointing locations on map...
          </div>
        )}

        <div className="ev-legend">
          <div className="leg-item"><span className="dot red"></span> Your Location</div>
          <div className="leg-item"><span className="dot gold"></span> Events</div>
          <div className="leg-item"><span className="dot blue"></span> NGOs</div>
        </div>
      </div>

      <div className="ev-map-wrapper">
        <MapContainer center={userLocation} zoom={10} scrollWheelZoom={true} className="ev-map">
          <ChangeView center={userLocation} zoom={10} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <Marker position={userLocation} icon={userIcon}>
            <Popup><b>You are here</b><br/>Discovering impact around you.</Popup>
          </Marker>

          <Circle 
            center={userLocation} 
            pathOptions={{ fillColor: 'blue', fillOpacity: 0.1, color: 'blue', weight: 1 }} 
            radius={radius * 1000} 
          />

          {filteredData.map((item, idx) => (
            <Marker 
              key={`${item.geoType}-${item.id}`} 
              position={item.coords} 
              icon={item.geoType === 'events' ? eventIcon : ngoIcon}
              eventHandlers={{
                mouseover: (e) => e.target.openPopup(),
                click: () => setSelectedItem(item)
              }}
            >
              <Popup className="ev-popup">
                <div className="ev-popup-content">
                  <span className={`badge ${item.geoType}`}>{item.geoType.toUpperCase()}</span>
                  <h3>{item.title || item.name}</h3>
                  <p className="pop-loc">📍 {item.city}, {item.state}</p>
                  <p className="pop-hint">(Click for full details)</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {selectedItem && (
        <DetailModal 
          item={selectedItem} 
          userRole={userRole}
          userId={user.id}
          onSectionChange={onSectionChange}
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </div>
  );
};

const DetailModal = ({ item, onClose, userRole, userId, onSectionChange }) => {
  const isEvent = item.geoType === 'events';
  const isOwnEvent = isEvent && item.ngo_id === userId;
  
  return (
    <div className="ev-modal-overlay" onClick={onClose}>
      <div className="ev-modal" onClick={e => e.stopPropagation()}>
        <button className="ev-modal-close" onClick={onClose}>✕</button>
        
        <div className="ev-modal-header">
          <div className={`ev-modal-icon ${item.geoType}`}>
            {isEvent ? '📅' : '🏢'}
          </div>
          <div>
            <h2 className="ev-modal-title">{item.title || item.name}</h2>
            <p className="ev-modal-sub">📍 {item.city}, {item.state} · {item.geoType.toUpperCase()}</p>
          </div>
        </div>

        <div className="ev-modal-body">
          <section className="ev-modal-section">
            <h4>{isEvent ? 'Description' : 'About NGO'}</h4>
            <p>{item.description || (isEvent ? 'No description provided.' : `${item.name} is a registered NGO dedicated to community service.`)}</p>
          </section>

          {isEvent ? (
            <div className="ev-modal-grid">
              <div className="m-info">
                <h4>Event Info</h4>
                <p>🕒 {item.start_time} - {item.end_time}</p>
                <p>📅 {new Date(item.event_date).toLocaleDateString()}</p>
                <p>🏠 {item.venue_name}</p>
              </div>
              <div className="m-info">
                <h4>Category</h4>
                <p>🏷️ {item.category}</p>
                <p>💻 {item.mode}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="ev-modal-grid">
                <div className="m-info">
                  <h4>About & Mission</h4>
                  <p>✨ {item.type || 'Community Impact'}</p>
                  <p>📜 {item.mission || 'Dedicated to social welfare and community development.'}</p>
                  {item.founded_year && <p>🗓️ Founded in {item.founded_year}</p>}
                </div>
                <div className="m-info">
                  <h4>Contact Info</h4>
                  <p>📧 {item.official_email}</p>
                  <p>📞 {item.phone || 'N/A'}</p>
                  {item.website && (
                    <p>🌐 <a href={item.website} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Official Website</a></p>
                  )}
                </div>
              </div>
              <section className="ev-modal-section" style={{ marginTop: '1.5rem' }}>
                <h4>Location Details</h4>
                <p>🏠 {item.address || 'Address not provided'}</p>
                <p>📍 {item.city}, {item.state} - {item.pincode}</p>
              </section>
              {item.registration_no && (
                <section className="ev-modal-section" style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', fontSize: '0.85rem' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>Registration info</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div><b>Reg No:</b> {item.registration_no}</div>
                    {item.pan && <div><b>PAN:</b> {item.pan}</div>}
                    {item.reg_12a && <div><b>12A:</b> {item.reg_12a}</div>}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        <div className="ev-modal-footer">
          <button className="ev-close-btn" onClick={onClose}>Close Exploration</button>
          {isEvent && userRole === 'volunteer' && (
            <button className="ev-reg-btn">Register Now</button>
          )}
          {isOwnEvent && userRole === 'ngo' && (
            <button 
              className="ev-reg-btn" 
              style={{ background: '#3b82f6' }} 
              onClick={() => {
                onSectionChange?.('manage-events');
                onClose();
              }}
            >
              🛠️ Manage Event
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventVisualization;
