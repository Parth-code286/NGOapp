import React, { useState, useEffect } from 'react';
import { Check, IndianRupee, Wallet } from 'lucide-react';
import './SubscriptionTiers.css';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}`;

const SubscriptionTiers = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  
  const [balance, setBalance] = useState(0);
  const [currentTier, setCurrentTier] = useState('free');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWalletInfo();
  }, []);

  const fetchWalletInfo = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/payments/wallet-info`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setBalance(data.balance || 0);
        setCurrentTier(data.tier || 'free');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (newTier) => {
    const cost = newTier === 'premium' ? 100 : 50;
    if (balance < cost) {
      alert(`Insufficient funds. You need ₹${cost} to upgrade to ${newTier.toUpperCase()}.\nParticipate in more events to earn money in your wallet!`);
      return;
    }

    if (!window.confirm(`Are you sure you want to spend ₹${cost} from your wallet to upgrade to ${newTier.toUpperCase()}?`)) return;

    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/api/payments/upgrade-tier`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tier: newTier })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setBalance(data.newBalance);
        setCurrentTier(data.newTier);
        
        // Update local storage
        const updatedUser = { ...user, subscription_tier: data.newTier };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Network error while upgrading.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="tiers-loading">Loading subscription info...</div>;

  return (
    <div className="tiers-container">
      <div className="tiers-header">
        <h1>Volunteer Subscriptions</h1>
        <p>Unlock more events and exclusive opportunities by upgrading your tier.</p>
        
        <div className="wallet-pill">
          <Wallet size={18} />
          <span>Wallet Balance: <strong>₹{balance}</strong></span>
        </div>
      </div>

      <div className="tiers-grid">
        {/* FREE TIER */}
        <div className={`tier-card ${currentTier === 'free' ? 'active-tier' : ''}`}>
          {currentTier === 'free' && <div className="tier-badge">Current Plan</div>}
          <h2 className="tier-name">Free</h2>
          <div className="tier-price">₹0<span>/month</span></div>
          <p className="tier-desc">Get started with volunteering</p>
          
          <ul className="tier-features">
            <li><Check size={16} /> Access to max 3 events</li>
            <li><Check size={16} /> Basic volunteering profile</li>
            <li><Check size={16} /> Earn wallet money from NGO payouts</li>
            <li className="disabled-feature"><Check size={16} /> Interest-based filtering</li>
            <li className="disabled-feature"><Check size={16} /> High ROI event priority</li>
          </ul>

          <button className="tier-btn" disabled>
            {currentTier === 'free' ? 'Current Plan' : 'Downgrade'}
          </button>
        </div>

        {/* BASIC TIER */}
        <div className={`tier-card basic ${currentTier === 'basic' ? 'active-tier' : ''}`}>
          {currentTier === 'basic' && <div className="tier-badge">Current Plan</div>}
          <h2 className="tier-name">Basic</h2>
          <div className="tier-price">₹50<span>/month</span></div>
          <p className="tier-desc">More impactful volunteering</p>
          
          <ul className="tier-features">
            <li><Check size={16} /> Access to max 15 events</li>
            <li><Check size={16} /> Filtered by your interests</li>
            <li><Check size={16} /> Standard priority matching</li>
            <li><Check size={16} /> Basic volunteering profile</li>
            <li className="disabled-feature"><Check size={16} /> High ROI event priority</li>
          </ul>

          <button 
            className="tier-btn basic-btn" 
            onClick={() => handleUpgrade('basic')}
            disabled={processing || currentTier === 'basic' || currentTier === 'premium'}
          >
            {currentTier === 'basic' ? 'Current Plan' : currentTier === 'premium' ? 'Included' : `Upgrade for ₹50`}
          </button>
        </div>

        {/* PREMIUM TIER */}
        <div className={`tier-card premium ${currentTier === 'premium' ? 'active-tier' : ''}`}>
          {currentTier === 'premium' && <div className="tier-badge">Current Plan</div>}
          <div className="premium-glow"></div>
          <h2 className="tier-name">Premium</h2>
          <div className="tier-price">₹100<span>/month</span></div>
          <p className="tier-desc">The ultimate changemaker</p>
          
          <ul className="tier-features">
            <li><Check size={16} /> Unlimited event access</li>
            <li><Check size={16} /> Strictly matches your interests</li>
            <li><Check size={16} /> High ROI (Reward Points) priority</li>
            <li><Check size={16} /> Dedicated Premium Badge</li>
            <li><Check size={16} /> Early access to Govt events</li>
          </ul>

          <button 
            className="tier-btn premium-btn" 
            onClick={() => handleUpgrade('premium')}
            disabled={processing || currentTier === 'premium'}
          >
            {currentTier === 'premium' ? 'Current Plan' : `Upgrade for ₹100`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionTiers;
