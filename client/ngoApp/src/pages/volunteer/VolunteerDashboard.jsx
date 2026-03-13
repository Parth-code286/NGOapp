import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VolunteerSidebar from './VolunteerSidebar';
import VolunteerOverview from './VolunteerOverview';
import DesignCalendar from './DesignCalendar';
import BrowseEvents from './BrowseEvents';
import RegisteredEvents from './RegisteredEvents';
import VolunteerProfile from './VolunteerProfile';
import Community from './Community';
import Leaderboard from './Leaderboard';
import VolunteerNotifications from './VolunteerNotifications';
import CheckInvites from './CheckInvites';
import EventVisualization from './EventVisualization';
import VolunteerCrises from './VolunteerCrises';
import SubscriptionTiers from './SubscriptionTiers';
import '../dashboard/NGODashboard.css';

const ComingSoon = ({ title }) => (
  <div className="coming-soon-wrapper">
    <div className="coming-soon-card">
      <div className="coming-soon-icon">🚀</div>
      <h2>{title}</h2>
      <p>This section is under development and will be available soon.</p>
    </div>
  </div>
);

const VolunteerDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':       return <VolunteerOverview onSectionChange={setActiveSection} />;
      case 'subscriptions':  return <SubscriptionTiers />;
      case 'calendar':       return <DesignCalendar />;
      case 'browse':         return <BrowseEvents />;
      case 'registered':     return <RegisteredEvents />;
      case 'invites':        return <CheckInvites />;
      case 'visualization':  return <EventVisualization />;
      case 'community':      return <Community onSectionChange={setActiveSection} />;
      case 'leaderboard':    return <Leaderboard />;
      case 'chat':           { navigate('/chat'); return null; }
      case 'crises':         return <VolunteerCrises />;
      case 'notifications':  return <VolunteerNotifications />;
      case 'attendance':     return <ComingSoon title="Attendance Section" />;
      case 'profile':        return <VolunteerProfile />;
      default:               return <VolunteerOverview onSectionChange={setActiveSection} />;
    }
  };

  return (
    <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <VolunteerSidebar 
        activeSection={activeSection} 
        onSectionChange={(section) => {
          setActiveSection(section);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="dashboard-main">
        <header className="dashboard-header show-on-mobile-flex">
          <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(true)}>
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <span className="logo-text">Impact<span className="text-primary">Hub</span></span>
        </header>
        {renderContent()}
      </main>
      {isSidebarOpen && <div className="sidebar-overlay show-on-mobile" onClick={() => setIsSidebarOpen(false)}></div>}
    </div>
  );
};

export default VolunteerDashboard;
