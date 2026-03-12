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

  // QR & Payment Simulation State
  const [paymentStep, setPaymentStep] = useState('form'); // 'form', 'qr', 'invoice'
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [transactionId, setTransactionId] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    fetchActiveCrises();
  }, []);

  // Timer for QR Payment
  useEffect(() => {
    let timer;
    if (paymentStep === 'qr' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && paymentStep === 'qr') {
      setPaymentStep('form');
      setErrorMsg('Payment session expired. Please try again.');
    }
    return () => clearInterval(timer);
  }, [paymentStep, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchActiveCrises = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/crises`);
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

  const startPaymentFlow = (e) => {
    e.preventDefault();
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      setErrorMsg('Please enter a valid donation amount.');
      return;
    }
    
    // Generate a mock transaction ID (Like Razorpay)
    const mockTxId = 'pay_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setTransactionId(mockTxId);
    setPaymentStep('qr');
    setTimeLeft(300);
    setErrorMsg('');
  };

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    // Simulate API delay for verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/crises/${selectedCrisis.id}/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteer_id: user.id || '00000000-0000-0000-0000-000000000000',
          amount: parseFloat(donationAmount),
          message: donationMessage || 'UPI Quick Donation',
          transaction_id: transactionId
        })
      });

      const data = await res.json();
      if (res.ok) {
        setInvoiceData({
          v_name: user.name || 'Anonymous Donor',
          v_email: user.email || 'N/A',
          c_title: selectedCrisis.title,
          amount: donationAmount,
          date: new Date().toLocaleString(),
          tx_id: transactionId,
          ngo: selectedCrisis.ngo_name || 'ImpactHub Partner'
        });
        
        setCrises(prevCrises => prevCrises.map(c => 
          c.id === selectedCrisis.id 
            ? { ...c, collected_amount: data.new_total } 
            : c
        ));
        
        setPaymentStep('invoice');
      } else {
        setErrorMsg(data.error || 'Payment verification failed.');
      }
    } catch (err) {
      setErrorMsg('Network error verifying payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModals = () => {
    setSelectedCrisis(null);
    setPaymentStep('form');
    setDonationAmount('');
    setDonationMessage('');
    setErrorMsg('');
    setSuccessMsg('');
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
              <h3 style={{ margin: 0, borderBottom: 'none' }}>
                {paymentStep === 'invoice' ? '✅ Payment Receipt' : `Support ${selectedCrisis.title}`}
              </h3>
              <button onClick={closeModals} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            
            {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

            {paymentStep === 'form' && (
              <form onSubmit={startPaymentFlow}>
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

                <button type="submit" className="btn btn-danger submit-btn">
                  Continue to Payment
                </button>
              </form>
            )}

            {paymentStep === 'qr' && (
              <div className="qr-payment-view" style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 1rem 0', fontWeight: '500' }}>Scan QR via any UPI App</p>
                
                <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '2px solid #fee2e2', display: 'inline-block', marginBottom: '1rem' }}>
                   {/* UPI QR generation via public API */}
                   <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${selectedCrisis.upi_id || 'ngo@upi'}&pn=${selectedCrisis.title}&am=${donationAmount}&cu=INR`)}`} 
                    alt="Payment QR" 
                    style={{ display: 'block', margin: '0 auto' }}
                   />
                </div>

                <div className="payment-timer" style={{ fontSize: '1.1rem', fontWeight: 'bold', color: timeLeft < 60 ? '#ef4444' : '#1e3a8a' }}>
                  ⏳ Session expires in: {formatTime(timeLeft)}
                </div>

                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Amount:</span> <strong>₹{donationAmount}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>TX ID:</span> <code style={{ color: '#0369a1' }}>{transactionId}</code>
                  </div>
                </div>

                <button 
                  className="btn btn-success submit-btn" 
                  style={{ marginTop: '1.5rem', background: '#059669' }}
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Verifying Payment...' : '✅ I have scanned & paid'}
                </button>
              </div>
            )}

            {paymentStep === 'invoice' && invoiceData && (
              <div className="invoice-container animated-scale-in">
                 <div className="invoice-header-box" style={{ background: '#ecfdf5', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', marginBottom: '1.5rem', border: '1px solid #10b981' }}>
                    <div style={{ fontSize: '2.5rem' }}>🛡️</div>
                    <h2 style={{ color: '#065f46', margin: '0.5rem 0' }}>Impact Verified</h2>
                    <p style={{ color: '#059669', margin: 0 }}>Your donation has been successfully processed.</p>
                 </div>

                 <div className="invoice-details" style={{ fontSize: '0.95rem', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                    {[
                      ['Volunteer', invoiceData.v_name],
                      ['Email', invoiceData.v_email],
                      ['Crisis', invoiceData.c_title],
                      ['Amount Paid', `₹${invoiceData.amount}`],
                      ['Date', invoiceData.date],
                      ['Transaction ID', invoiceData.tx_id]
                    ].map(([label, val], i) => (
                      <div key={label} style={{ display: 'flex', padding: '0.75rem 1rem', borderTop: i === 0 ? 'none' : '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <span style={{ color: '#64748b', width: '130px', flexShrink: 0 }}>{label}</span>
                        <span style={{ fontWeight: '600', color: '#1e293b' }}>{val}</span>
                      </div>
                    ))}
                 </div>

                 <button className="btn submit-btn" onClick={() => window.print()} style={{ marginTop: '1.5rem', background: '#1e40af' }}>
                   Print Receipt (PDF)
                 </button>
                 <button className="btn" onClick={closeModals} style={{ marginTop: '0.5rem', background: 'none', color: '#64748b', border: '1px solid #e2e8f0' }}>
                   Return to Dashboard
                 </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerCrises;
