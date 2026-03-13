import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Hardcoded credentials
    if (email === 'admin@gmail.com' && password === 'admin') {
      setTimeout(() => {
        localStorage.setItem('isAdminAuthenticated', 'true');
        navigate('/admin/dashboard');
        setLoading(false);
      }, 1000);
    } else {
      setTimeout(() => {
        setError('Invalid admin credentials. Access denied.');
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <button className="admin-back-btn" onClick={() => navigate('/')}>
          &larr; Back to Website
        </button>
        <div className="admin-login-header">
          <div className="admin-logo-icon">🛡️</div>
          <h1>Admin Portal Access</h1>
          <p>Please enter your administrative credentials</p>
        </div>

        {error && <div className="admin-login-error">{error}</div>}

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="admin-form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gmail.com"
              required 
            />
          </div>
          <div className="admin-form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>
        
        <div className="admin-login-footer">
          <p>Secure administrative access only. All actions are logged.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
