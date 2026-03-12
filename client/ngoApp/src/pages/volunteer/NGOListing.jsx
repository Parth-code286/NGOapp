import React, { useState, useEffect } from 'react';
import './NGOListing.css';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}`;

const NGOListing = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedNgo, setSelectedNgo] = useState(null);

  useEffect(() => {
    const fetchNgos = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/ngo`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch NGOs');
        setNgos(data.ngos || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNgos();
  }, []);

  const filtered = ngos.filter(ngo => 
    ngo.name.toLowerCase().includes(search.toLowerCase()) ||
    (ngo.city && ngo.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="nl-wrapper">
      <div className="nl-header">
        <h1 className="nl-title">NGO Listing</h1>
        <p className="nl-subtitle">Discover and connect with registered NGOs in our community.</p>
        
        <div className="nl-controls">
          <input 
            type="text" 
            className="nl-search" 
            placeholder="🔍 Search by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className="nl-loading">
          <div className="nl-spinner"></div>
          <p>Loading NGOs...</p>
        </div>
      )}

      {error && <div className="nl-error">⚠️ {error}</div>}

      {!loading && !error && (
        <>
          <div className="nl-count">{filtered.length} NGO{filtered.length !== 1 ? 's' : ''} found</div>
          
          <div className="nl-grid">
            {filtered.map(ngo => (
              <div key={ngo.id} className="nl-card">
                <div className="nl-card-banner"></div>
                <div className="nl-card-body">
                  <div className="nl-avatar">{ngo.name.charAt(0)}</div>
          <h3 className="nl-ngo-name">{ngo.name}</h3>
                  <p className="nl-ngo-meta">📍 {ngo.city || 'Unknown City'}, {ngo.state || ''}</p>
                  <p className="nl-ngo-description">
                    {ngo.type || 'Registered NGO'} dedicated to community service and social impact.
                  </p>
                  <button className="nl-view-btn" onClick={() => setSelectedNgo(ngo)}>View Details</button>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="nl-empty">
              <div className="nl-empty-icon">🏢</div>
              <p>No NGOs found matching your search.</p>
            </div>
          )}
        </>
      )}

      {selectedNgo && (
        <NGODetailModal ngo={selectedNgo} onClose={() => setSelectedNgo(null)} />
      )}
    </div>
  );
};

const NGODetailModal = ({ ngo, onClose }) => (
  <div className="nl-modal-overlay" onClick={onClose}>
    <div className="nl-modal" onClick={e => e.stopPropagation()}>
      <button className="nl-modal-close" onClick={onClose}>✕</button>
      <div className="nl-modal-header">
        <div className="nl-modal-avatar">{ngo.name.charAt(0)}</div>
        <div>
          <h2 className="nl-modal-name">{ngo.name}</h2>
          <p className="nl-modal-sub">📍 {ngo.city}, {ngo.state} · Registered NGO</p>
        </div>
      </div>

      <div className="nl-modal-body">
        <section className="nl-modal-section">
          <h4>About</h4>
          <p>{ngo.type || 'Registered NGO'} focused on creating positive change in the community.</p>
        </section>

        <div className="nl-modal-grid">
          <section className="nl-modal-section">
            <h4>Contact Info</h4>
            <p>📧 {ngo.official_email}</p>
            <p>📞 {ngo.phone || 'Not provided'}</p>
            <p>🌐 {ngo.website || 'No website'}</p>
          </section>
          
          <section className="nl-modal-section">
            <h4>Location</h4>
            <p><strong>Address:</strong> {ngo.address || 'N/A'}</p>
            <p><strong>Pincode:</strong> {ngo.pincode || 'N/A'}</p>
          </section>
        </div>

        <section className="nl-modal-section">
          <h4>Registration Details</h4>
          <p><strong>Registration ID:</strong> {ngo.registration_id || 'Verified'}</p>
          <p><strong>Verification Status:</strong> ✅ Verified NGO</p>
        </section>
      </div>

      <div className="nl-modal-footer">
        <button className="nl-view-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

export default NGOListing;
