import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import MainLayout from '../layouts/MainLayout';
import Landing from '../pages/Landing';

// "/" and every private page under it (R29): logged in → the app; logged out → the landing page
// on "/" itself, and /login (remembering where they were going) anywhere else.
const RootRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const { i18n } = useTranslation();

  if (isAuthenticated) {
    // Most of the app reads its texts while drawing, without listening for a language change. The
    // key draws the whole logged-in area again in the new language: no reload, the session and the
    // loaded data stay, but what was typed in an unsaved form on the open page is lost.
    return <MainLayout key={i18n.resolvedLanguage} />;
  }

  if (location.pathname === '/') {
    return <Landing />;
  }

  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default RootRoute;
