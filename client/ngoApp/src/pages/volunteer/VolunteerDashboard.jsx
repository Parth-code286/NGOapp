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
import NGOListing from './NGOListing';
import CheckInvites from './CheckInvites';
import EventVisualization from './EventVisualization';
import Certificates from './Certificates';
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
  const navigate = useNavigate();

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':       return <VolunteerOverview />;
      case 'calendar':       return <DesignCalendar />;
      case 'browse':         return <BrowseEvents />;
      case 'registered':     return <RegisteredEvents />;
      case 'invites':        return <CheckInvites />;
      case 'ngo-listing':    return <NGOListing />;
      case 'certificates':   return <Certificates />;
      case 'visualization':  return <EventVisualization />;
      case 'community':      return <Community />;
      case 'leaderboard':    return <Leaderboard />;
      case 'chat':           { navigate('/chat'); return null; }
      case 'notifications':  return <VolunteerNotifications />;
      case 'attendance':     return <ComingSoon title="Attendance Section" />;
      case 'profile':        return <VolunteerProfile />;
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
