import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupChoicePage from './pages/auth/SignupChoicePage';
import VolunteerSignupPage from './pages/auth/VolunteerSignupPage';
import NGOSignupPage from './pages/auth/NGOSignupPage';
import NGODashboard from './pages/dashboard/NGODashboard';
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupChoicePage />} />
      <Route path="/signup/volunteer" element={<VolunteerSignupPage />} />
      <Route path="/signup/ngo" element={<NGOSignupPage />} />
      <Route path="/dashboard/ngo" element={<NGODashboard />} />
      <Route path="/dashboard/volunteer" element={<VolunteerDashboard />} />
    </Routes>
  );
};

export default App;