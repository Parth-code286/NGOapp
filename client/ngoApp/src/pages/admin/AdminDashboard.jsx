import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const API_BASE = 'http://localhost:5053/api';

const AdminDashboard = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [filter, setFilter] = useState('all');

  const navigate = useNavigate();

  useEffect(() => {
    const isAuth = localStorage.getItem('isAdminAuthenticated');
    if (isAuth !== 'true') {
      navigate('/admin/login');
    } else {
      fetchNgos();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    navigate('/admin/login');
  };

  const fetchNgos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admin/ngos`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch NGOs');
      setNgos(data.ngos || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, status, reason = null) => {
    try {
      const res = await fetch(`${API_BASE}/admin/ngos/${id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify NGO');
      
      // Update local state
      setNgos(prev => prev.map(n => n.id === id ? { ...n, verification_status: status, is_verified: status === 'verified', rejection_reason: reason } : n));
      if (selectedNgo && selectedNgo.id === id) {
        setSelectedNgo({ ...selectedNgo, verification_status: status, is_verified: status === 'verified', rejection_reason: reason });
      }
      alert(`NGO ${status} successfully!`);
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredNgos = ngos.filter(ngo => {
    if (filter === 'all') return true;
    return (ngo.verification_status || 'pending') === filter;
  });

  if (loading) return <div className="admin-loading">Loading NGO data...</div>;

  return (
    <div className="admin-wrapper">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Admin Portal <span className="admin-badge">Secure</span></h1>
          <p>Review and verify organization registrations</p>
        </div>
        <div className="admin-header-right">
          <div className="admin-stats">
            <div className="admin-stat-card">
              <span className="val">{ngos.length}</span>
              <span className="lbl">Total NGOs</span>
            </div>
            <div className="admin-stat-card warning">
              <span className="val">{ngos.filter(n => (n.verification_status || 'pending') === 'pending').length}</span>
              <span className="lbl">Pending</span>
            </div>
          </div>
          <button className="admin-btn logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="admin-controls">
        <div className="admin-filters">
          {['all', 'pending', 'verified', 'rejected'].map(f => (
            <button 
              key={f} 
              className={`admin-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="admin-error">⚠️ {error}</div>}

      <div className="admin-grid">
        {filteredNgos.length === 0 ? (
          <div className="admin-empty">No NGOs found for this filter.</div>
        ) : (
          filteredNgos.map(ngo => (
            <div className="admin-card" key={ngo.id}>
              <div className="admin-card-header">
                <div className="admin-ngo-logo-sm">
                  {ngo.name[0]}
                </div>
                <div className="admin-card-title-group">
                  <h3>{ngo.name}</h3>
                  <span className={`status-tag ${(ngo.verification_status || 'pending')}`}>
                    {(ngo.verification_status || 'pending').toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="admin-card-info">
                <p><strong>Type:</strong> {ngo.type}</p>
                <p><strong>Email:</strong> {ngo.official_email}</p>
                <p><strong>City:</strong> {ngo.city}</p>
              </div>
              <div className="admin-card-actions">
                <button className="admin-btn secondary" onClick={() => setSelectedNgo(ngo)}>View Details</button>
                {(ngo.verification_status || 'pending') === 'pending' && (
                  <>
                    <button className="admin-btn approve" onClick={() => handleVerify(ngo.id, 'verified')}>Approve</button>
                    <button className="admin-btn reject" onClick={() => handleVerify(ngo.id, 'rejected')}>Reject</button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedNgo && (
        <NGODetailModal 
          ngo={selectedNgo} 
          onClose={() => setSelectedNgo(null)}
          onVerify={handleVerify}
        />
      )}
    </div>
  );
};

const NGODetailModal = ({ ngo, onClose, onVerify }) => {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <button className="admin-modal-close" onClick={onClose}>✕</button>
        
        <div className="admin-modal-header">
          <div className="admin-ngo-logo-lg">{ngo.name[0]}</div>
          <div>
            <h2>{ngo.name}</h2>
            <p className="admin-modal-subtext">Registration ID: {ngo.reg_no || 'N/A'}</p>
          </div>
          <span className={`status-tag ${(ngo.verification_status || 'pending')}`}>
            {(ngo.verification_status || 'pending').toUpperCase()}
          </span>
        </div>

        <div className="admin-modal-content">
          <section className="admin-modal-section">
            <h3>Organizational Details</h3>
            <div className="admin-detail-grid">
              <div className="detail-item"><span>NGO Type</span><strong>{ngo.type || 'N/A'}</strong></div>
              <div className="detail-item"><span>Reg. Date</span><strong>{ngo.registration_date || 'N/A'}</strong></div>
              <div className="detail-item"><span>PAN</span><strong>{ngo.pan || 'N/A'}</strong></div>
              <div className="detail-item"><span>TAN</span><strong>{ngo.tan || 'N/A'}</strong></div>
              <div className="detail-item"><span>12A Reg.</span><strong>{ngo.reg_12a || 'N/A'}</strong></div>
              <div className="detail-item"><span>Website</span><strong><a href={ngo.website} target="_blank" rel="noreferrer">{ngo.website || 'N/A'}</a></strong></div>
            </div>
          </section>

          <section className="admin-modal-section">
            <h3>Contact Information</h3>
            <div className="admin-detail-grid">
              <div className="detail-item"><span>Official Email</span><strong>{ngo.official_email}</strong></div>
              <div className="detail-item"><span>Official Phone</span><strong>{ngo.phone || 'N/A'}</strong></div>
              <div className="detail-item"><span>Address</span><strong>{ngo.address}, {ngo.city}, {ngo.state} - {ngo.pincode}</strong></div>
            </div>
          </section>

          {ngo.rejection_reason && (
            <section className="admin-modal-section rejection-alert">
              <h3>Rejection Reason</h3>
              <p>{ngo.rejection_reason}</p>
            </section>
          )}

          <section className="admin-modal-section">
            <h3>Documents</h3>
            <div className="admin-doc-list">
              <div className="admin-doc-card">
                <span className="doc-icon">📄</span>
                <div className="doc-info">
                  <strong>PAN Certificate</strong>
                  <span>{ngo.pan_url ? ngo.pan_url.split('/').pop() : `NGO_PAN_${ngo.name.replace(/\s/g, '_')}.pdf`}</span>
                </div>
                <a href={ngo.pan_url || "#"} className="admin-doc-btn" target="_blank" rel="noreferrer" onClick={(e) => { if(!ngo.pan_url) { e.preventDefault(); alert('Downloading placeholder PAN Certificate...'); } }}>
                  {ngo.pan_url ? 'View' : 'Download'}
                </a>
              </div>
              <div className="admin-doc-card">
                <span className="doc-icon">📄</span>
                <div className="doc-info">
                  <strong>80G Registration</strong>
                  <span>{ngo.cert_80g_url ? ngo.cert_80g_url.split('/').pop() : `NGO_80G_${ngo.name.replace(/\s/g, '_')}.pdf`}</span>
                </div>
                <a href={ngo.cert_80g_url || "#"} className="admin-doc-btn" target="_blank" rel="noreferrer" onClick={(e) => { if(!ngo.cert_80g_url) { e.preventDefault(); alert('Downloading placeholder 80G Certificate...'); } }}>
                  {ngo.cert_80g_url ? 'View' : 'Download'}
                </a>
              </div>
              <div className="admin-doc-card">
                <span className="doc-icon">🪪</span>
                <div className="doc-info">
                  <strong>Auth. Person ID Proof</strong>
                  <span>{ngo.auth_id_url ? ngo.auth_id_url.split('/').pop() : `AUTH_ID_${ngo.name.replace(/\s/g, '_')}.pdf`}</span>
                </div>
                <a href={ngo.auth_id_url || "#"} className="admin-doc-btn" target="_blank" rel="noreferrer" onClick={(e) => { if(!ngo.auth_id_url) { e.preventDefault(); alert('Downloading placeholder ID Proof...'); } }}>
                  {ngo.auth_id_url ? 'View' : 'Download'}
                </a>
              </div>
            </div>
          </section>
        </div>

        <div className="admin-modal-footer">
          <button className="admin-btn secondary" onClick={onClose}>Close</button>
          {(ngo.verification_status || 'pending') === 'pending' && (
            <div className="admin-modal-actions-group">
              <button className="admin-btn reject" onClick={() => setShowRejectInput(true)}>Reject NGO</button>
              <button className="admin-btn approve" onClick={() => { onVerify(ngo.id, 'verified'); onClose(); }}>Approve NGO</button>
            </div>
          )}
        </div>

        {showRejectInput && (
          <div className="admin-rejection-overlay">
            <div className="admin-rejection-card">
              <h3>Reason for Rejection</h3>
              <p>Please specify why this organization is being rejected. This will be sent to them via email.</p>
              <textarea 
                className="admin-rejection-textarea"
                placeholder="e.g. Invalid documents, mismatch in PAN details..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="admin-rejection-actions">
                <button className="admin-btn secondary" onClick={() => setShowRejectInput(false)}>Cancel</button>
                <button 
                  className="admin-btn reject" 
                  disabled={!rejectionReason.trim()}
                  onClick={() => {
                    onVerify(ngo.id, 'rejected', rejectionReason);
                    onClose();
                  }}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
