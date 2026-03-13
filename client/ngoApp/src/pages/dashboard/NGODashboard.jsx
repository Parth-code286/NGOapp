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
import WalletView from './WalletView';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview onSectionChange={setActiveSection} />;
      case 'wallet': return <WalletView />;
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
      case 'notifications':
        return <VolunteerNotifications />;
      case 'profile':
        return <NGOProfile />;
      default:
        return <DashboardOverview onSectionChange={setActiveSection} />;
    }
  };

  return (
    <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar 
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

export default NGODashboard;
