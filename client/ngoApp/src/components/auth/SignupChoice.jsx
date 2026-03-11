import React from 'react';
import './Auth.css';

const SignupChoice = ({ onSelectChoice, switchToLogin }) => {
  return (
    <div className="auth-form-container">
      <div className="choice-container">
        
        <button 
          className="choice-btn"
          onClick={() => onSelectChoice('volunteer')}
        >
          <div className="choice-icon icon-blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <div className="choice-text">
            <h3>Sign up as Volunteer</h3>
            <p>Join events, track your attendance, and make a real impact in your community.</p>
          </div>
        </button>

        <button 
          className="choice-btn"
          onClick={() => onSelectChoice('ngo')}
        >
          <div className="choice-icon icon-orange">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"></path><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"></path><path d="M10 9h4"></path><path d="M10 13h4"></path></svg>
          </div>
          <div className="choice-text">
            <h3>Sign up as NGO</h3>
            <p>Host events, manage volunteers, and track real-time engagement effortlessly.</p>
          </div>
        </button>

      </div>

      <div className="auth-footer">
        Already have an account?{' '}
        <button className="text-link" onClick={switchToLogin}>
          Log in
        </button>
      </div>
    </div>
  );
};

export default SignupChoice;
