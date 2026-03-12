import React, { useState, useEffect } from 'react';
import './Certificates.css';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await fetch(`http://localhost:5053/api/certificates/volunteer/${user.id}`);
        const data = await res.json();
        if (res.ok) {
          setCertificates(data.certificates || []);
        }
      } catch (err) {
        console.error("Error fetching certificates:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user.id) fetchCertificates();
  }, [user.id]);

  if (loading) {
    return (
      <div className="cert-loading">
        <div className="cert-spinner"></div>
        <p>Polishing your achievements...</p>
      </div>
    );
  }

  return (
    <div className="cert-container animate-fade-in">
      <div className="cert-header">
        <h1 className="cert-title">My <span className="text-primary">Certificates</span></h1>
        <p className="cert-subtitle">A celebration of your dedication and social impact.</p>
      </div>

      {certificates.length === 0 ? (
        <div className="cert-empty">
          <div className="cert-empty-icon">🎓</div>
          <h2>No certificates yet</h2>
          <p>Participate in more events to earn official recognition for your impact!</p>
        </div>
      ) : (
        <div className="cert-grid">
          {certificates.map((cert) => (
            <div key={cert.id} className="cert-card">
              <div className="cert-card-top">
                <div className="cert-ngo-logo">
                  {cert.ngos?.logo_url ? (
                    <img src={cert.ngos.logo_url} alt={cert.ngos.name} />
                  ) : (
                    <div className="cert-ngo-initial">{cert.ngos?.name?.[0]}</div>
                  )}
                </div>
                <div className="cert-badge">{cert.events?.category || 'General'}</div>
              </div>
              
              <div className="cert-card-body">
                <h3 className="cert-event-title">{cert.events?.title || 'Unknown Event'}</h3>
                <p className="cert-ngo-name">{cert.ngos?.name}</p>
                <div className="cert-meta">
                  <span>📅 {new Date(cert.issue_date).toLocaleDateString()}</span>
                  <span>🆔 #{cert.id.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>

              <div className="cert-card-footer">
                <a 
                  href={cert.certificate_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="cert-view-btn"
                >
                  View Certificate
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certificates;
