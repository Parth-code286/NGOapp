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

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${isMenuOpen ? 'menu-open' : ''}`}>
      <div className="container nav-content">
        <a href="/" className="logo" onClick={handleLogoClick}>
          Impact<span className="text-primary">Hub</span>
        </a>

        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <a href="#features" className="nav-link" onClick={() => setIsMenuOpen(false)}>{t('nav.features', 'Features')}</a>
          <a href="#how-it-works" className="nav-link" onClick={() => setIsMenuOpen(false)}>How it Works</a>
          <a href="#about" className="nav-link" onClick={() => setIsMenuOpen(false)}>{t('nav.about', 'About Us')}</a>
          
          <div className="nav-mobile-actions show-on-mobile">
             <button className="btn btn-secondary w-full" onClick={() => { onLoginClick(); setIsMenuOpen(false); }}>{t('nav.login', 'Log In')}</button>
             <button className="btn btn-primary w-full" onClick={() => { onSignupClick(); setIsMenuOpen(false); }}>Sign Up Free</button>
          </div>
        </div>

        <div className="nav-actions hide-on-mobile">
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

        <button className="menu-toggle show-on-mobile-flex" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <div className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
