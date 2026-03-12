import React from 'react';
import { useTranslation } from 'react-i18next';
import './Features.css';

const Features = () => {
  const { t } = useTranslation();
  return (
    <section className="features" id="features">
      <div className="container">
        <div className="section-header text-center">
          <div className="badge">Why Choose Us</div>
          <h2 className="section-title">{t('features.title', 'Our Features')}</h2>
          <p className="section-subtitle">
            Say goodbye to fragmented spreadsheets and scattered messages. Our centralized platform provides all the tools you need in one place.
          </p>
        </div>

        <div className="features-grid">
          {/* Feature 1 */}
          <div className="feature-card">
            <div className="feature-icon bg-primary-light text-primary-dark">
              <svg xmlns="http://www.w3.org/-2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <h3 className="feature-title">{t('features.f1_title', 'Discover Events')}</h3>
            <p className="feature-desc">
              {t('features.f1_desc', 'Find local events that match your interests.')}
            </p>
          </div>

          {/* Feature 2 */}
          <div className="feature-card highlighted-card">
            <div className="feature-content">
              <div className="badge bg-white text-primary">Live Tracking</div>
              <h3 className="feature-title text-white">{t('features.f2_title', 'Track Impact')}</h3>
              <p className="feature-desc text-white-muted">
                {t('features.f2_desc', 'Visualize volunteer contributions over time.')}
              </p>
            </div>
            <div className="feature-image-wrapper">
              <img src="/feature-event.png" alt="Live Event Tracking" className="feature-image" />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="feature-card">
            <div className="feature-icon bg-blue-light text-blue">
              <svg xmlns="http://www.w3.org/-2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"></path></svg>
            </div>
            <h3 className="feature-title">{t('features.f3_title', 'Build Communities')}</h3>
            <p className="feature-desc">
              {t('features.f3_desc', 'Engage with like-minded individuals.')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
