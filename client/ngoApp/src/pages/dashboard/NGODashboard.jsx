import React, { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardOverview from './DashboardOverview';
import CreateEvent from './CreateEvent';
import BrowseVolunteers from './BrowseVolunteers';
import './NGODashboard.css';

// Placeholder section for unbuilt features
const ComingSoon = ({ title }) => (
  <div className="coming-soon-wrapper">
    <div className="coming-soon-card">
      <div className="coming-soon-icon">🚀</div>
      <h2>{title}</h2>
      <p>This section is under development and will be available soon.</p>
    </div>
  </div>
);

const NGODashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview />;
      case 'create-event': return <CreateEvent />;
      case 'browse-volunteers': return <BrowseVolunteers />;
      case 'manage-events':
        return <ComingSoon title="Manage Events" />;
      case 'attendance':
        return <ComingSoon title="Attendance Tracking" />;
      case 'visualization':
        return <ComingSoon title="Event Visualization" />;
      case 'chat':
        return <ComingSoon title="Chat Section" />;
      case 'volunteers':
        return <ComingSoon title="Volunteer Participation Tracking" />;
      case 'analytics':
        return <ComingSoon title="Impact Analytical Dashboard" />;
      case 'impact-score':
        return <ComingSoon title="Community Impact Score" />;
      case 'certificates':
        return <ComingSoon title="Volunteer Certificate Generator" />;
      case 'heatmap':
        return <ComingSoon title="Category Heat Map" />;
      case 'notifications':
        return <ComingSoon title="Notifications" />;
      case 'profile':
        return <ComingSoon title="My Profile" />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="dashboard-main">
        {renderContent()}
      </main>
    </div>
  );
};

export default NGODashboard;
