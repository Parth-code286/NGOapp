import React, { useState } from 'react';
import VolunteerSidebar from './VolunteerSidebar';
import VolunteerOverview from './VolunteerOverview';
import DesignCalendar from './DesignCalendar';
import BrowseEvents from './BrowseEvents';
import RegisteredEvents from './RegisteredEvents';
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

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':       return <VolunteerOverview />;
      case 'calendar':       return <DesignCalendar />;
      case 'browse':         return <BrowseEvents />;
      case 'registered':     return <RegisteredEvents />;
      case 'certificates':   return <ComingSoon title="Certificates Earned" />;
      case 'visualization':  return <ComingSoon title="Event Visualization" />;
      case 'community':      return <ComingSoon title="Community & Leaderboard" />;
      case 'chat':           return <ComingSoon title="Chat Section" />;
      case 'gamification':   return <ComingSoon title="Gamification" />;
      case 'notifications':  return <ComingSoon title="Notifications" />;
      case 'attendance':     return <ComingSoon title="Attendance Section" />;
      case 'profile':        return <ComingSoon title="My Profile" />;
      default:               return <VolunteerOverview />;
    }
  };

  return (
    <div className="dashboard-layout">
      <VolunteerSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="dashboard-main">
        {renderContent()}
      </main>
    </div>
  );
};

export default VolunteerDashboard;
