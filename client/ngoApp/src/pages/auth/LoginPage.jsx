import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Login from '../../components/auth/Login';
import './AuthPages.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isExpired = params.get('expired') === 'true';

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
          {isExpired && (
            <div style={{
              background: '#fef3c7',
              border: '1px solid #f59e0b',
              color: '#92400e',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              ⚠️ Your session has expired. Please log in again.
            </div>
          )}
          <div className="auth-card-header">
            <h2 className="auth-card-title">Welcome Back</h2>
            <p className="auth-card-subtitle">Log in to your account</p>
          </div>
          <div className="auth-card-body">
            <Login
                switchToSignup={() => navigate('/signup')}
                onClose={() => {
                  const user = JSON.parse(localStorage.getItem('user') || '{}');
                  const redirectTo = params.get('redirectTo') || '/';
                  if (user.role === 'ngo') navigate('/dashboard/ngo');
                  else if (user.role === 'volunteer') navigate('/dashboard/volunteer');
                  else navigate(redirectTo);
                }}
              />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

