import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface PrivateRouteProps {
  element: React.ReactNode;
}

// Redirect them to the /login page, but save the current location they were
// trying to go to when they were redirected. This allows us to send them
// along to that page after they login, which is a nicer user experience
// than dropping them off on the home page.
const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <React.Fragment>
      {isAuthenticated ? (
        element
      ) : (
        <Navigate to={'/login'} state={{ from: location }} replace={true} />
      )}
    </React.Fragment>
  );
};

export default PrivateRoute;
