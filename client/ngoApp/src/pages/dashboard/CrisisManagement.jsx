import React, { useState, useEffect } from 'react';
import './CrisisManagement.css';

const CrisisManagement = () => {
  const [crises, setCrises] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredAmount, setRequiredAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch all crises on mount to see past ones (simplified approach: fetching all active)
  useEffect(() => {
    fetchCrises();
  }, []);

  const fetchCrises = async () => {
    try {
      const res = await fetch('http://localhost:5053/api/crises');
      const data = await res.json();
      if (res.ok) {
        const sortedCrises = (data.crises || []).sort((a, b) => {
          const gapA = a.required_amount - a.collected_amount;
          const gapB = b.required_amount - b.collected_amount;
          return gapB - gapA; // Largest gap first
        });
        setCrises(sortedCrises);
      }
    } catch (err) {
      console.error('Failed to fetch crises:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCrisis = async (crisisId) => {
    try {
      const res = await fetch(`http://localhost:5053/api/crises/${crisisId}/close`, {
        method: 'PATCH'
      });
      if (res.ok) fetchCrises();
    } catch (err) {
      console.error('Failed to close crisis:', err);
    }
  };

  const handlePostCrisis = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:5053/api/crises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ngo_id: user.id || '00000000-0000-0000-0000-000000000000', // Fallback for testing
          title,
          description,
          required_amount: parseFloat(requiredAmount),
          upi_id: upiId
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Emergency crisis broadcasted successfully!');
        setTitle('');
        setDescription('');
        setRequiredAmount('');
        setUpiId('');
        fetchCrises(); // Refresh the list
      } else {
        setMessage(data.error || 'Failed to post crisis.');
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="crisis-container animated-fade-in">
      <div className="crisis-header">
        <h2 className="crisis-title">🚨 Emergency Crisis Broadcast</h2>
        <p className="crisis-subtitle">
          Instantly alert high-net-worth individuals and targeted volunteers about urgent local crises to gather immediate financial and physical support.
        </p>
      </div>

      <div className="crisis-grid">
        {/* Creation Form */}
        <div className="crisis-form-card">
          <h3>Post a New Crisis</h3>
          {message && (
            <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-error'}`}>
              {message}
            </div>
          )}
          
          <form onSubmit={handlePostCrisis}>
            <div className="form-group">
              <label>Emergency Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Assam Flood Relief"
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Detailed Description</label>
              <textarea 
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the situation, required manpower, and how funds will be used..."
                required 
              />
            </div>

            <div className="form-group">
              <label>Required Fund Target (₹)</label>
              <input 
                type="number" 
                min="1000"
                value={requiredAmount}
                onChange={(e) => setRequiredAmount(e.target.value)}
                placeholder="50000"
                required 
              />
            </div>

            <div className="form-group">
              <label>UPI ID for Donations (e.g. ngo@okaxis)</label>
              <input 
                type="text" 
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="ngo@upi"
                required 
              />
            </div>

            <button type="submit" className="btn btn-danger submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Broadcasting...' : '🚨 Broadcast Emergency'}
            </button>
          </form>
        </div>

        {/* Active Crises List */}
        <div className="crisis-list-card">
          <h3>Active Crises Overview</h3>
          
          {loading ? (
            <p>Loading active crises...</p>
          ) : crises.length === 0 ? (
            <p className="no-crises-text">No active crises at the moment.</p>
          ) : (
            <div className="crises-list">
              {crises.map(crisis => {
                const percentage = Math.min((crisis.collected_amount / crisis.required_amount) * 100, 100);
                const isFundingComplete = Number(crisis.collected_amount) >= Number(crisis.required_amount);
                
                return (
                  <div key={crisis.id} className="crisis-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4>{crisis.title}</h4>
                      {isFundingComplete && crisis.status !== 'resolved' && (
                        <button 
                          className="btn" 
                          style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.4rem 1rem', fontSize: '0.85rem', borderRadius: '6px', cursor: 'pointer' }}
                          onClick={() => handleCloseCrisis(crisis.id)}
                        >
                          ✓ Close Crisis
                        </button>
                      )}
                    </div>
                    <p className="crisis-desc-small">{crisis.description}</p>
                    
                    <div className="crisis-stats-row">
                      <div className="stat-pill">Status: <span className={`status-badge ${crisis.status === 'resolved' ? '' : 'active'}`} style={crisis.status === 'resolved' ? { background: '#e2e8f0', color: '#475569', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600' } : {}}>{crisis.status}</span></div>
                      <div className="stat-pill text-green">Collected: ₹{Number(crisis.collected_amount).toLocaleString()}</div>
                    </div>

                    <div className="progress-container">
                      <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <div className="progress-text">
                      {percentage.toFixed(1)}% funded of ₹{Number(crisis.required_amount).toLocaleString()} goal
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrisisManagement;
