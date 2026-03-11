<<<<<<< HEAD
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupChoicePage from './pages/auth/SignupChoicePage';
import VolunteerSignupPage from './pages/auth/VolunteerSignupPage';
import NGOSignupPage from './pages/auth/NGOSignupPage';
import NGODashboard from './pages/dashboard/NGODashboard';
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
=======
import React from "react";
import { Routes, Route } from "react-router-dom";
>>>>>>> 0eb8135dd17a9b57321f735cecfaac8c2676afee

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";

import ChatPage from "./chat/pages/ChatPage";

const HomePage = () => {
  return (
<<<<<<< HEAD
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupChoicePage />} />
      <Route path="/signup/volunteer" element={<VolunteerSignupPage />} />
      <Route path="/signup/ngo" element={<NGOSignupPage />} />
      <Route path="/dashboard/ngo" element={<NGODashboard />} />
      <Route path="/dashboard/volunteer" element={<VolunteerDashboard />} />
=======
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/chat" element={<ChatPage />} />
>>>>>>> 0eb8135dd17a9b57321f735cecfaac8c2676afee
    </Routes>
  );
};

export default App;