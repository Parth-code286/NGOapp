import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupChoicePage from './pages/auth/SignupChoicePage';
import VolunteerSignupPage from './pages/auth/VolunteerSignupPage';
import NGOSignupPage from './pages/auth/NGOSignupPage';
import NGODashboard from './pages/dashboard/NGODashboard';
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import ChatPage from './chat/pages/ChatPage';
import Chatbot from './components/Chatbot/Chatbot';
import { PrivateRoute, PublicRoute } from './components/auth/RouteGuards';
import NotFoundPage from './pages/NotFoundPage';

const App = () => {
  return (
    <>
      <Routes>
        {/* Public pages — always accessible */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth pages — redirect to dashboard if already logged in */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupChoicePage /></PublicRoute>} />
        <Route path="/signup/volunteer" element={<PublicRoute><VolunteerSignupPage /></PublicRoute>} />
        <Route path="/signup/ngo" element={<PublicRoute><NGOSignupPage /></PublicRoute>} />

        {/* Protected dashboards — redirect to /login if not logged in */}
        <Route path="/dashboard/ngo" element={<PrivateRoute role="ngo"><NGODashboard /></PrivateRoute>} />
        <Route path="/dashboard/volunteer" element={<PrivateRoute role="volunteer"><VolunteerDashboard /></PrivateRoute>} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />

        {/* 404 catch-all — must be last */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Chatbot />
    </>
  );
};

export default App;