/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { AuthContext, SignInOptions, SignUpOptions } from './AuthContext';
import { Auth, Hub } from 'aws-amplify';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import i18n from '../../common/config/i18n';
import {
  INotificationsSettings,
  IUserPersonalData,
  IUserProfile,
} from '../../common/interfaces/user-profile.interface';
import { JSONStringifyError } from '../../common/utils/utils';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import * as SplashScreen from 'expo-splash-screen';
import { getUserProfile } from '../../services/user/user.api';
import { getMyOrganizations } from '../../services/organization/organization.api';
import { IOrganizationVolunteer } from '../../common/interfaces/organization-list-item.interface';

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // meaning that the user has been validated by cognito but is not in our database
  const [isUserPending, setIsUserPending] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    console.log('[APP Init]');
    initProfile();

    const unsubscribe = Hub.listen('auth', ({ payload: { event } }) => {
      switch (event) {
        case 'signIn': {
          // redirect from social sign in done successfully
          initProfile();
          break;
        }
        case 'signIn_failure': {
          // error on social sign in
          Toast.show({ type: 'error', text1: `${i18n.t('auth:errors.login')}` });
          break;
        }
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    setIsAuthenticated(userProfile !== null);
  }, [userProfile]);

  const setActiveOrganization = (organization: IOrganizationVolunteer) => {
    if (userProfile !== null) {
      setUserProfile({ ...userProfile, activeOrganization: organization });
    }
  };

  const setIdentityData = (userData: IUserPersonalData) => {
    if (userProfile !== null) {
      setUserProfile({ ...userProfile, userPersonalData: userData });
    }
  };

  const updateSettings = (newSettings: INotificationsSettings) => {
    if (userProfile !== null) {
      setUserProfile({ ...userProfile, notificationsSettings: newSettings });
    }
  };

  const initProfile = async () => {
    try {
      // reset pending user status
      setIsUserPending(false);
      // this will throw error if user is not authenticated
      await Auth.currentAuthenticatedUser({ bypassCache: true });
      // if the user is authenticated will auto login
      await getProfile();
    } catch (error: any) {
      // https://github.com/aws-amplify/amplify-js/blob/6caccc7b4/packages/auth/src/Auth.ts#L1705
      // here are just error strings validating user pool config and if user is authenticated
      console.debug('[Cognito][Init]:', JSONStringifyError(error));
    } finally {
      await SplashScreen.hideAsync();
    }
  };

  const login = async ({ username, password }: SignInOptions) => {
    try {
      await Auth.signIn(username, password);
      await getProfile();
    } catch (error: any) {
      console.log('[Auth][Login]:', JSONStringifyError(error));
      // Handle scenario where user is created in cognito but not activated
      if (error.code === 'UserNotConfirmedException') {
        // send event to confirm account to login screen
        throw { confirmAccount: true };
      } else {
        // show any other error
        Toast.show({ type: 'error', text1: `${i18n.t('auth:errors.unauthorizeed')}` });
      }
    }
  };

  const loginWithSocial = async (provider: CognitoHostedUIIdentityProvider) => {
    try {
      await Auth.federatedSignIn({
        provider,
      });
    } catch (error: any) {
      console.log('error', JSONStringifyError(error));
    }
  };

  const signUp = async ({ username, password, phoneNumber }: SignUpOptions) => {
    try {
      await Auth.signUp({
        username,
        password,
        attributes: {
          email: username,
          phone_number: phoneNumber, // E.164 number convention
        },
        autoSignIn: {
          // optional - enables auto sign in after user is confirmed
          enabled: true,
        },
      });

      // save username for confirmation
      // TBD: if this is the best approach
      setUserName(username);
    } catch (error: any) {
      console.log('[Auth][Signup]:', JSONStringifyError(error));
      if (error.code === 'UsernameExistsException') {
        Toast.show({
          type: 'error',
          text1: `${i18n.t('auth:errors.username_exists')}`,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: `${i18n.t('auth:errors.signup')}`,
        });
      }
      throw error;
    }
  };

  const confirmSignUp = async (code: string) => {
    try {
      let email = userName;
      if (!email) {
        const user = await Auth.currentAuthenticatedUser();
        email = user.attributes.email;
      }

      await Auth.confirmSignUp(email, code);
    } catch (error: any) {
      console.log('[Auth][Signup][Confirm]:', JSONStringifyError(error));
      if (error.code === 'CodeMismatchException') {
        Toast.show({ type: 'error', text1: `${i18n.t('auth:errors.code_missmatch')}` });
      } else {
        Toast.show({ type: 'error', text1: `${i18n.t('auth:errors.signup')}` });
      }

      throw error;
    }
  };

  const resendConfirmationCode = async (username: string): Promise<void> => {
    try {
      await Auth.resendSignUp(username);
    } catch (error: any) {
      console.log('[Auth][Signup][Resend_Code]:', JSONStringifyError(error));
      Toast.show({ type: 'error', text1: `${i18n.t('auth:errors.resend_code')}` });
    }
  };

  const logout = async () => {
    try {
      setIsAuthenticated(false);
      setUserProfile(null);
      await Auth.signOut({ global: true });
    } catch (error: any) {
      console.log('[Auth][SignOut]:', JSONStringifyError(error));
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      // check if logged in
      const user = await Auth.currentAuthenticatedUser();
      await Auth.changePassword(user, oldPassword, newPassword);
      Toast.show({ text1: `${i18n.t('change_password:submit.success')}`, type: 'success' });
    } catch (error: any) {
      console.log('[Auth][ChangePassword]:', JSONStringifyError(error));
      if (error.code === 'NotAuthorizedException') {
        Toast.show({ type: 'error', text1: `${i18n.t('auth:errors.unauthorizeed')}` });
      } else if (error.code === 'InvalidPasswordException') {
        Toast.show({ type: 'error', text1: `${i18n.t('auth:errors.invalid_password')}` });
      } else {
        Toast.show({ type: 'error', text1: `${i18n.t('auth:errors.password')}` });
      }
      throw error;
    }
  };

  const getProfile = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        // get the user profile
        const profile = await getUserProfile();
        // get the organizations the user is part of
        const myOragnizations = await getMyOrganizations();
        // set profile in context with all the organizations
        setUserProfile({ ...profile, myOrganizations: myOragnizations });
        resolve(profile);
      } catch (error: any) {
        // if the profile doesn't exists redirect to the the create account page
        console.log('[Profile]:', JSONStringifyError(error));
        if (error.response.status === 404) {
          setIsUserPending(true);
          reject();
        } else {
          Toast.show({ type: 'error', text1: `${i18n.t('auth:errors.init_profile')}` });
        }
      }
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isUserPending,
        login,
        logout,
        signUp,
        confirmSignUp,
        resendConfirmationCode,
        userProfile,
        setUserProfile,
        loginWithSocial,
        setActiveOrganization,
        setIdentityData,
        changePassword,
        updateSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
