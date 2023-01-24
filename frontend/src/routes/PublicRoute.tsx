import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface PublicRouteProps {
  element: React.ReactNode;
}

const PublicRoute = ({ element }: PublicRouteProps) => {
  const { isAuthenticated } = useAuth();
  return (
    <React.Fragment>
      {isAuthenticated ? <Navigate to={'/'} replace={true} /> : element}
    </React.Fragment>
  );
};

export default PublicRoute;
