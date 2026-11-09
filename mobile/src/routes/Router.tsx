import React from 'react';
import { useAuth } from '../hooks/useAuth';
import PrivateRoutes from './Private';
import PublicRoutes from './Public';
import { useAppState } from '../store/app/app.selector';
import UpdateRequired from '../screens/UpdateRequired';
import Maintenance from '../screens/Maintenance';

const Router = () => {
  const { isAuthenticated } = useAuth();
  const { maintenance, updateRequired } = useAppState();

  // Set by the API client (426, 503); they come before the choice of routes.
  if (updateRequired) {
    return <UpdateRequired />;
  }
  if (maintenance) {
    return <Maintenance />;
  }

  return isAuthenticated ? <PrivateRoutes /> : <PublicRoutes />;
};

export default Router;
