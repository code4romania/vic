import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import MainLayout from '../layouts/MainLayout';
import Landing from '../pages/Landing';

// "/" and every private page under it (R29): logged in → the app; logged out → the landing page
// on "/" itself, and /login (remembering where they were going) anywhere else.
const RootRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    return <MainLayout />;
  }

  if (location.pathname === '/') {
    return <Landing />;
  }

  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default RootRoute;
