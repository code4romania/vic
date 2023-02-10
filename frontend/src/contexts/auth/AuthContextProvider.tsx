import React, { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';
import { AuthContext } from './AuthContext';
import { useLogin } from '../../services/auth/auth.service';
import { IUser } from '../../common/interfaces/user.interface';

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [profile, setProfile] = useState<IUser>();
  const { mutate: getProfile, data: userProfile, isLoading: isFetchingProfile } = useLogin();

  useEffect(() => {
    initProfile();
  }, []);

  useEffect(() => {
    // once we retrieve the profile we can asume we are logged in
    if (userProfile) {
      // set user and authenticated which will automatically show protected routes
      setIsAuthenticated(true);
      // set user profile
      setProfile(userProfile);
    }
  }, [userProfile]);

  const initProfile = async () => {
    // show loading screen
    setIsLoading(true);
    try {
      // this will throw error if user is not authenticated
      await Auth.currentAuthenticatedUser();

      // request profile data
      getProfile();
    } catch (error) {
      // https://github.com/aws-amplify/amplify-js/blob/6caccc7b4/packages/auth/src/Auth.ts#L1705
      // here are just error strings validating user pool config and if user is authenticated
      console.debug('[Cognito] error while loging in:', error);
    } finally {
      // hide loading screen
      setIsLoading(false);
    }
  };

  const login = async () => {
    await Auth.federatedSignIn();
  };

  const logout = async () => {
    await Auth.signOut();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, profile }}>
      {!(isLoading || isFetchingProfile) ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
