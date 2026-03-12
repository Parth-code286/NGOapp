import React, { useState, useEffect } from 'react';
import '../dashboard/CrisisManagement.css'; // Reusing some base styling for consistency

const VolunteerCrises = () => {
  const [crises, setCrises] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Donation Modal State
  const [selectedCrisis, setSelectedCrisis] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationMessage, setDonationMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchActiveCrises();
  }, []);

  const fetchActiveCrises = async () => {
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

  const handleDonate = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch(`http://localhost:5053/api/crises/${selectedCrisis.id}/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteer_id: user.id || '00000000-0000-0000-0000-000000000000', // Fallback for testing
          amount: parseFloat(donationAmount),
          message: donationMessage
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Successfully donated ₹${donationAmount} to ${selectedCrisis.title}!`);
        // Optimistically update the local state so the UI progress bar fills instantly
        setCrises(prevCrises => prevCrises.map(c => 
          c.id === selectedCrisis.id 
            ? { ...c, collected_amount: data.new_total } 
            : c
        ));
        
        // Reset form
        setTimeout(() => {
          setSelectedCrisis(null);
          setDonationAmount('');
          setDonationMessage('');
          setSuccessMsg('');
        }, 3000);
      } else {
        setErrorMsg(data.error || 'Donation failed.');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="crisis-container animated-fade-in">
      <div className="crisis-header">
        <h2 className="crisis-title">🚨 Active Emergency Crises</h2>
        <p className="crisis-subtitle">
          These verified NGOs are facing urgent crises. Your high-impact financial contribution can save lives today.
        </p>
      </div>

      <div className="crises-list" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {loading ? (
          <p>Loading active crises...</p>
        ) : crises.length === 0 ? (
          <p className="no-crises-text">No active crises at the moment. The community is safe.</p>
        ) : (
          crises.map(crisis => {
            const percentage = Math.min((crisis.collected_amount / crisis.required_amount) * 100, 100);
            
            return (
              <div key={crisis.id} className="crisis-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4>{crisis.title}</h4>
                    <p className="crisis-desc-small" style={{ maxWidth: '600px' }}>{crisis.description}</p>
                  </div>
                  <button 
                    className="btn btn-danger" 
                    style={{ width: 'auto', padding: '0.5rem 1.5rem', marginTop: '0' }}
                    onClick={() => setSelectedCrisis(crisis)}
                  >
                    Donate Now
                  </button>
                </div>
                
                <div className="crisis-stats-row">
                  <div className="stat-pill text-green">Collected: ₹{Number(crisis.collected_amount).toLocaleString()}</div>
                  <div className="stat-pill">Goal: ₹{Number(crisis.required_amount).toLocaleString()}</div>
                </div>

                <div className="progress-container">
                  <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
                </div>
                <div className="progress-text">
                  {percentage.toFixed(1)}% funded
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Donation Modal overlay */}
      {selectedCrisis && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="crisis-form-card" style={{ width: '100%', maxWidth: '500px', animation: 'scaleIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, borderBottom: 'none' }}>Support {selectedCrisis.title}</h3>
              <button onClick={() => setSelectedCrisis(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            
            {successMsg && <div className="alert alert-success">{successMsg}</div>}
            {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

            {!successMsg && (
              <form onSubmit={handleDonate}>
                {selectedCrisis.upi_id && (
                  <div className="alert alert-info" style={{ marginBottom: '1rem', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}>
                    <strong>Direct UPI Payment:</strong> {selectedCrisis.upi_id}
                  </div>
                )}
                <div className="form-group">
                  <label>Donation Amount (₹)</label>
                  <input 
                    type="number" 
                    min="100"
                    placeholder="e.g. 5000"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>Message of Support (Optional)</label>
                  <textarea 
                    rows="3"
                    placeholder="Stay strong!"
                    value={donationMessage}
                    onChange={(e) => setDonationMessage(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-danger submit-btn" disabled={isProcessing}>
                  {isProcessing ? 'Processing Securely...' : `Donate ₹${donationAmount || '0'} Now`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerCrises;
