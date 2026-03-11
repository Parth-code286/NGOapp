import React from 'react';
import { useNavigate } from 'react-router-dom';
import SignupChoice from '../../components/auth/SignupChoice';
import './AuthPages.css';

const SignupChoicePage = () => {
  const navigate = useNavigate();

  const handleSelectChoice = (role) => {
    navigate(`/signup/${role}`);
  };

  return (
    <div className="auth-page-wrapper animate-fade-in">
      <div className="auth-page-header">
        <div className="container" style={{ padding: '2rem 1.5rem', display: 'flex', justifyContent: 'space-between' }}>
          <a href="/" className="logo">Impact<span className="text-primary">Hub</span></a>
          <button className="text-link" onClick={() => navigate('/')}>&larr; Back to Home</button>
        </div>
      </div>
      
      <div className="auth-page-container">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-card-title">Create an Account</h2>
            <p className="auth-card-subtitle">How would you like to use ImpactHub?</p>
          </div>
          <div className="auth-card-body">
            <SignupChoice onSelectChoice={handleSelectChoice} switchToLogin={() => navigate('/login')} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupChoicePage;
