import React from 'react';
import { useAuth } from '../hooks/useAuth';
import PrivateRoutes from './Private';
import PublicRoutes from './Public';
import { useAppState } from '../store/app/app.selector';
import UpdateRequired from '../screens/UpdateRequired';

const Router = () => {
  const { isAuthenticated } = useAuth();
  const { updateRequired } = useAppState();

  // Set by the API client on a 426; it comes before the choice of routes.
  if (updateRequired) {
    return <UpdateRequired />;
  }

  return isAuthenticated ? <PrivateRoutes /> : <PublicRoutes />;
};

export default Router;
