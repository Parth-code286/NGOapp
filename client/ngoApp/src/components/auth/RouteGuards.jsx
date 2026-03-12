import React from 'react';
import { Navigate } from 'react-router-dom';

// Helper: decode JWT payload without a library
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

// Helper: clear session and force logout
export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Helper: check if user is authenticated and token is not expired
const getAuth = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token || !user.id) return { isAuthenticated: false, user: {} };

  // Check if JWT has expired
  const decoded = decodeToken(token);
  const isExpired = decoded ? decoded.exp * 1000 < Date.now() : true;
  if (isExpired) {
    clearSession();
    return { isAuthenticated: false, user: {} };
  }

  return { token, user, isAuthenticated: true };
};

/**
 * PrivateRoute — only accessible when logged in.
 * If not logged in, redirects to /login.
 * Optionally enforces a specific role (e.g. 'ngo' or 'volunteer').
 */
export const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, user } = getAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If a required role is specified but doesn't match, kick them to their own dashboard
  if (role && user.role !== role) {
    if (user.role === 'ngo') return <Navigate to="/dashboard/ngo" replace />;
    if (user.role === 'volunteer') return <Navigate to="/dashboard/volunteer" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * PublicRoute — only accessible when NOT logged in.
 * If already logged in, redirects to the appropriate dashboard.
 * Used for /login, /signup, etc.
 */
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = getAuth();

  if (isAuthenticated) {
    if (user.role === 'ngo') return <Navigate to="/dashboard/ngo" replace />;
    if (user.role === 'volunteer') return <Navigate to="/dashboard/volunteer" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};
