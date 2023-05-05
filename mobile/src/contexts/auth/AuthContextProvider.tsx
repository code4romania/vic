import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { Auth } from 'aws-amplify';
import API from '../../services/api';

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    initProfile();
  }, []);

  const initProfile = async () => {
    try {
      // this will throw error if user is not authenticated
      const res = await Auth.currentAuthenticatedUser();
      console.log('res', res);
    } catch (error) {
      // https://github.com/aws-amplify/amplify-js/blob/6caccc7b4/packages/auth/src/Auth.ts#L1705
      // here are just error strings validating user pool config and if user is authenticated
      console.debug('[Cognito] error while loging in:', error);
      // setIsLoading(false);
    }
  };

  const login = async ({ email, password }: { email: string; password: string }) => {
    try {
      const user = await Auth.signIn(email, password);
      console.log('user', JSON.stringify(user));
      setIsAuthenticated(true);
      const result = await API.get('/mobile/user');
      console.log('result', result);
    } catch (error) {
      console.log('error signing in', error);
    }
  };

  const logout = async () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
