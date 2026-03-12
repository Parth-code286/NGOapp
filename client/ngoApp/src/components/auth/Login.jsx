import React, { useState } from 'react';
import './Auth.css';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api`;

const Login = ({ switchToSignup, onClose }) => {
  const [role, setRole] = useState('volunteer'); // 'volunteer' or 'ngo'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = e.target;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.value,
          password: form.password.value,
          role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="role-toggle-wrapper">
        <div className={`role-toggle-slider ${role === 'ngo' ? 'slide-right' : ''}`}></div>
        <button 
          className={`role-btn ${role === 'volunteer' ? 'active' : ''}`}
          onClick={() => setRole('volunteer')}
          type="button"
        >
          Volunteer
        </button>
        <button 
          className={`role-btn ${role === 'ngo' ? 'active' : ''}`}
          onClick={() => setRole('ngo')}
          type="button"
        >
          NGO
        </button>
      </div>

      {error && <div className="form-error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input 
            type="email" 
            id="email" 
            name="email"
            className="form-input" 
            placeholder="Enter your email" 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            name="password"
            className="form-input" 
            placeholder="Enter your password" 
            required 
          />
        </div>

        <div className="form-options">
          <label className="checkbox-label">
            <input type="checkbox" /> Remember me
          </label>
          <a href="#" className="forgot-password">Forgot Password?</a>
        </div>

        <button type="submit" className="btn btn-primary w-full submit-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div className="auth-footer">
        Don't have an account?{' '}
        <button className="text-link" onClick={switchToSignup}>
          Sign up
        </button>
      </div>
    </div>
  );
};

export default Login;
