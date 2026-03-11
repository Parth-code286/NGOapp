import React from 'react';
import { useNavigate } from 'react-router-dom';
import VolunteerSignup from '../../components/auth/VolunteerSignup';
import './AuthPages.css';

const VolunteerSignupPage = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-page-wrapper animate-fade-in">
      <div className="auth-page-header">
        <div className="container" style={{ padding: '2rem 1.5rem', display: 'flex', justifyContent: 'space-between' }}>
          <a href="/" className="logo">Impact<span className="text-primary">Hub</span></a>
          <button className="text-link" onClick={() => navigate('/')}>&larr; Back to Home</button>
        </div>
      </div>
      
      <div className="auth-page-container">
        <div className="auth-card large-card">
          <div className="auth-card-header">
            <h2 className="auth-card-title">Volunteer Registration</h2>
            <p className="auth-card-subtitle">Join events, track your attendance, and make a real impact.</p>
          </div>
          <div className="auth-card-body">
            <VolunteerSignup onBack={() => navigate('/signup')} onClose={() => navigate('/dashboard')} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerSignupPage;
