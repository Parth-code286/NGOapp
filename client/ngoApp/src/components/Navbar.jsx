import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Navbar.css';

const Navbar = ({ onLoginClick, onSignupClick }) => {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [logoClicks, setLogoClicks] = useState(0);
  const [clickTimer, setClickTimer] = useState(null);
  const navigate = useNavigate();

  const handleLogoClick = (e) => {
    e.preventDefault();
    const newCount = logoClicks + 1;
    
    if (newCount === 5) {
      setLogoClicks(0);
      clearTimeout(clickTimer);
      navigate('/admin/login');
    } else {
      setLogoClicks(newCount);
      if (clickTimer) clearTimeout(clickTimer);
      setClickTimer(setTimeout(() => setLogoClicks(0), 3000));
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-content">
        <a href="/" className="logo" onClick={handleLogoClick}>
          Impact<span className="text-primary">Hub</span>
        </a>

        <div className="nav-links">
          <a href="#features" className="nav-link">{t('nav.features', 'Features')}</a>
          <a href="#how-it-works" className="nav-link">How it Works</a>
          <a href="#about" className="nav-link">{t('nav.about', 'About Us')}</a>
        </div>

        <div className="nav-actions">
          <select
            className="lang-switcher"
            style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer', outline: 'none', marginRight: '0.5rem' }}
            value={i18n.language || 'en'}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="mr">मराठी (Marathi)</option>
          </select>
          <button className="btn btn-secondary" onClick={onLoginClick}>{t('nav.login', 'Log In')}</button>
          <button className="btn btn-primary" onClick={onSignupClick}>Sign Up Free</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
