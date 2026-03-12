import React, { useState, useEffect } from 'react';
import './CertificateGenerator.css';

const CertificateGenerator = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [certificateUrl, setCertificateUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const ngo = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Fetch volunteers and events for this NGO
    const fetchData = async () => {
      try {
        const [volRes, devRes] = await Promise.all([
          fetch('http://localhost:5053/api/volunteer'), // assuming this exists
          fetch(`http://localhost:5053/events?ngo_id=${ngo.id}`)
        ]);
        
        const volData = await volRes.json();
        const devData = await devRes.json();

        if (volRes.ok) setVolunteers(volData.volunteers || []);
        if (devRes.ok) setEvents(devData.events || []);
      } catch (err) {
        console.error("Error fetching generator data:", err);
      }
    };

    if (ngo.id) fetchData();
  }, [ngo.id]);

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!selectedVolunteer || !selectedEvent || !certificateUrl) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5053/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteer_id: selectedVolunteer,
          ngo_id: ngo.id,
          event_id: selectedEvent,
          certificate_url: certificateUrl
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Certificate issued successfully!' });
        setSelectedVolunteer('');
        setSelectedEvent('');
        setCertificateUrl('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to issue certificate.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Connection error.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cg-container animate-fade-in">
      <div className="cg-header">
        <h1 className="cg-title">Certificate <span className="text-primary">Generator</span></h1>
        <p className="cg-subtitle">Recognize dedication. Honor impact. Inspire change.</p>
      </div>

      <div className="cg-form-card">
        <form onSubmit={handleIssue}>
          <div className="cg-field">
            <label>Select Volunteer</label>
            <select 
              value={selectedVolunteer} 
              onChange={(e) => setSelectedVolunteer(e.target.value)}
              className="cg-input"
            >
              <option value="">-- Choose a volunteer --</option>
              {volunteers.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.email})</option>
              ))}
            </select>
          </div>

          <div className="cg-field">
            <label>Select Event</label>
            <select 
              value={selectedEvent} 
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="cg-input"
            >
              <option value="">-- Choose an event --</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>

          <div className="cg-field">
            <label>Certificate URL (Hosted image/PDF)</label>
            <input 
              type="url" 
              placeholder="https://example.com/certificate.pdf" 
              value={certificateUrl}
              onChange={(e) => setCertificateUrl(e.target.value)}
              className="cg-input"
            />
          </div>

          {message.text && (
            <div className={`cg-message ${message.type}`}>
              {message.text}
            </div>
          )}

          <button type="submit" className="cg-submit-btn" disabled={loading}>
            {loading ? 'Issuing...' : 'Issue Certificate 🎓'}
          </button>
        </form>
      </div>

      <div className="cg-info-grid">
        <div className="cg-info-card">
          <div className="cg-info-icon">🌟</div>
          <h3>Customized Recognition</h3>
          <p>Each certificate provides a permanent record of achievement for the volunteer.</p>
        </div>
        <div className="cg-info-card">
          <div className="cg-info-icon">⚡</div>
          <h3>Instant Delivery</h3>
          <p>Issued certificates appear immediately in the volunteer's personal dashboard.</p>
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerator;
