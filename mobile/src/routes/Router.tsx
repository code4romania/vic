import React from 'react';
import { useAuth } from '../hooks/useAuth';
import PrivateRoutes from './Private';
import PublicRoutes from './Public';

const Router = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <PrivateRoutes /> : <PublicRoutes />;
};

export default Router;
