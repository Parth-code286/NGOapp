import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = ({ onLoginClick, onSignupClick }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-content">
        <a href="/" className="logo">
          Impact<span className="text-primary">Hub</span>
        </a>
        
        <div className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How it Works</a>
          <a href="#about" className="nav-link">About</a>
        </div>

        <div className="nav-actions">
          <button className="btn btn-secondary" onClick={onLoginClick}>Log In</button>
          <button className="btn btn-primary" onClick={onSignupClick}>Sign Up Free</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
