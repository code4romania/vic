import React, { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';
import { AuthContext } from './AuthContext';

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    initProfile();
  }, []);

  const initProfile = async () => {
    await Auth.currentAuthenticatedUser();
    setIsAuthenticated(true);
  };

  const login = async () => {
    await Auth.federatedSignIn();
  };

  const logout = async () => {
    await Auth.signOut();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
