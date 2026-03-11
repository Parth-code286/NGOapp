import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupChoicePage from './pages/auth/SignupChoicePage';
import VolunteerSignupPage from './pages/auth/VolunteerSignupPage';
import NGOSignupPage from './pages/auth/NGOSignupPage';

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupChoicePage />} />
      <Route path="/signup/volunteer" element={<VolunteerSignupPage />} />
      <Route path="/signup/ngo" element={<NGOSignupPage />} />
    </Routes>
  );
};

export default App;