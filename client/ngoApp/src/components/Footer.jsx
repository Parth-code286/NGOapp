import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <a href="/" className="logo">
            Impact<span className="text-primary">Hub</span>
          </a>
          <p className="footer-desc">
            Empowering NGOs to manage volunteers efficiently and maximize their community impact through centralized coordination.
          </p>
          <div className="social-links">
            <a href="#" className="social-icon">IN</a>
            <a href="#" className="social-icon">TW</a>
            <a href="#" className="social-icon">FB</a>
          </div>
        </div>
        
        <div className="footer-links-container">
          <div className="footer-links-group">
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-list">
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#demo">Request Demo</a></li>
            </ul>
          </div>
          
          <div className="footer-links-group">
            <h4 className="footer-heading">Resources</h4>
            <ul className="footer-list">
              <li><a href="#blog">Blog</a></li>
              <li><a href="#guides">NGO Guides</a></li>
              <li><a href="#help">Help Center</a></li>
            </ul>
          </div>
          
          <div className="footer-links-group">
            <h4 className="footer-heading">Legal</h4>
            <ul className="footer-list">
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom container">
        <p>&copy; {new Date().getFullYear()} ImpactHub. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
