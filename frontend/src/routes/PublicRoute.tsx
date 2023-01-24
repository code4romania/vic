import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/auth/AuthContext';

interface PublicRouteProps {
  element: React.ReactNode;
}

const PublicRoute = ({ element }: PublicRouteProps) => {
  const { isAuthenticated } = useContext(AuthContext);
  return (
    <React.Fragment>
      {isAuthenticated ? <Navigate to={'/'} replace={true} /> : element}
    </React.Fragment>
  );
};

export default PublicRoute;
