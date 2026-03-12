import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardOverview from './DashboardOverview';
import CreateEvent from './CreateEvent';
import ManageEvents from './ManageEvents';
import BrowseVolunteers from './BrowseVolunteers';
import NGOProfile from './NGOProfile';
import VolunteerNotifications from '../volunteer/VolunteerNotifications';
import EventVisualization from '../volunteer/EventVisualization';
import VolunteerParticipation from './VolunteerParticipation';
import ImpactAnalytics from './ImpactAnalytics';
import AnalyticsHeatmap from './AnalyticsHeatmap';
import ImpactScore from './ImpactScore';
import CrisisManagement from './CrisisManagement';
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
  const navigate = useNavigate();

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview onSectionChange={setActiveSection} />;
      case 'create-event': return <CreateEvent />;
      case 'browse-volunteers': return <BrowseVolunteers />;
      case 'manage-events':
        return <ManageEvents />;
      case 'attendance':
        return <ComingSoon title="Attendance Tracking" />;
      case 'visualization':
        return <EventVisualization onSectionChange={setActiveSection} />;
      case 'chat':
        navigate('/chat'); return null;
      case 'volunteers':
        return <VolunteerParticipation />;
      case 'crises':
        return <CrisisManagement />;
      case 'analytics':
        return <ImpactAnalytics />;
      case 'heatmap':
        return <AnalyticsHeatmap />;
      case 'impact-score':
        return <ImpactScore />;
      case 'certificates':
        return <ComingSoon title="Volunteer Certificate Generator" />;
      case 'notifications':
        return <VolunteerNotifications />;
      case 'profile':
        return <NGOProfile />;
      default:
        return <DashboardOverview onSectionChange={setActiveSection} />;
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
