import React, { useEffect, useState } from 'react';
import { AuthContext, SignInOptions, SignUpOptions } from './AuthContext';
import { Auth } from 'aws-amplify';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    initProfile();
  }, []);

  const initProfile = async () => {
    try {
      // this will throw error if user is not authenticated
      await Auth.currentAuthenticatedUser();
      // if the user is authenticated will auto login
      setIsAuthenticated(true);
    } catch (error) {
      // https://github.com/aws-amplify/amplify-js/blob/6caccc7b4/packages/auth/src/Auth.ts#L1705
      // here are just error strings validating user pool config and if user is authenticated
      console.debug('[Cognito] error while loging in:', error);
      // setIsLoading(false);
    }
  };

  const login = async ({ username, password }: SignInOptions) => {
    try {
      await Auth.signIn(username, password);
      setIsAuthenticated(true);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error while loging in' });
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
      Toast.show({ type: 'error', text1: 'Error while signing up' });
      console.log('error signing up:', error);
      throw error;
    }
  };

  const confirmSignUp = async (code: string) => {
    try {
      await Auth.confirmSignUp(userName, code);
    } catch (error) {
      // TODO: handle user has been disabled and other errors scenarios
      Toast.show({ type: 'error', text1: 'Error while confirming sign up' });
      console.log('error on confirms', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsAuthenticated(false);
      await Auth.signOut({ global: true });
    } catch (error) {
      console.log('error signing out: ', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, signUp, confirmSignUp }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
