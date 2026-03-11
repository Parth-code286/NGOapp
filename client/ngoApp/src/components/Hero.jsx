import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container hero-container">
        <div className="hero-content animate-fade-in">
          <div className="badge">✨ Revolutionizing NGO Operations</div>
          <h1 className="hero-title">
            Empower Your <span className="text-primary">Volunteers</span>, Amplify Your <span className="text-gradient">Impact</span>
          </h1>
          <p className="hero-subtitle">
            The all-in-one centralized platform for NGOs to post events, seamlessly manage registrations, and track real-time attendance without the hassle of fragmented communication.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg">Start for Free</button>
            <button className="btn btn-secondary btn-lg btn-outline">Watch Demo</button>
          </div>
          
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-number">10k+</span>
              <span className="stat-label">Events Hosted</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">50k+</span>
              <span className="stat-label">Active Volunteers</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">99%</span>
              <span className="stat-label">Satisfaction Rate</span>
            </div>
          </div>
        </div>

        <div className="hero-image-wrapper animate-fade-in delay-200">
          <div className="image-decoration dec-1"></div>
          <div className="image-decoration dec-2"></div>
          <img src="/hero-image.png" alt="Volunteers working together" className="hero-img" />
          
          <div className="floating-card card-1">
            <div className="card-icon">✅</div>
            <div className="card-text">
              <div className="card-title">Registration Confirmed</div>
              <div className="card-sub">Sarah J. joined "Beach Cleanup"</div>
            </div>
          </div>
          
          <div className="floating-card card-2">
            <div className="card-header">
              <div className="card-icon-small bg-primary"></div>
              <span>Live Event</span>
            </div>
            <div className="card-title">Tree Planting Drive</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '85%' }}></div>
            </div>
            <div className="card-sub">85/100 Volunteers Checked In</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
