import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/auth/AuthContext';

interface PrivateRouteProps {
  element: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return (
    <React.Fragment>
      {isAuthenticated ? element : <Navigate to={'/login'} replace={true} />}
    </React.Fragment>
  );
};

export default PrivateRoute;
