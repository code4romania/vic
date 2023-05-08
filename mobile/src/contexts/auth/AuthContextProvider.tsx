import React, { useEffect, useState } from 'react';
import { AuthContext, SignInOptions, SignUpOptions } from './AuthContext';
import { Auth } from 'aws-amplify';

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');

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

  const login = async ({ username, password }: SignInOptions) => {
    try {
      const user = await Auth.signIn(username, password);
      console.log('user', JSON.stringify(user));
      setIsAuthenticated(true);
    } catch (error) {
      console.log('error signing in', error);
    }
  };

  const signUp = async ({ username, password, phoneNumber }: SignUpOptions) => {
    try {
      const { user } = await Auth.signUp({
        username,
        password,
        attributes: {
          email: username, // optional
          phone_number: phoneNumber, // optional - E.164 number convention
          // other custom attributes
        },
        autoSignIn: {
          // optional - enables auto sign in after user is confirmed
          enabled: true,
        },
      });
      // save username for confirmation
      // TBD: if this is the best approach
      setUserName(username);
      console.log(user);
    } catch (error) {
      console.log('error signing up:', error);
      throw error;
    }
  };

  const confirmSignUp = async (code: string) => {
    try {
      console.log('code', code);
      console.log('userName', userName);
      const result = await Auth.confirmSignUp(userName, code);
      console.log('result', result);
    } catch (error) {
      console.log('error on confirm', error);
      throw error;
    }
  };

  const logout = async () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, signUp, confirmSignUp }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
