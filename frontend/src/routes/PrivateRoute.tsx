import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface PrivateRouteProps {
  element: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const { isAuthenticated } = useAuth();
  return (
    <React.Fragment>
      {isAuthenticated ? element : <Navigate to={'/login'} replace={true} />}
    </React.Fragment>
  );
};

export default PrivateRoute;
