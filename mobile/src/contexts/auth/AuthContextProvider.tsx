/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { AuthContext, SignInOptions, SignUpOptions } from './AuthContext';
import { Auth } from 'aws-amplify';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import i18n from '../../common/config/i18n';
import { useUserProfile } from '../../services/user/user.service';
import { IUserProfile } from '../../common/interfaces/user-profile.interface';

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);
  const { mutate: getUserProfile } = useUserProfile();

  useEffect(() => {
    console.log('[APP Init]');
    initProfile();
  }, []);

  useEffect(() => {
    setIsAuthenticated(userProfile !== null);
  }, [userProfile]);

  const initProfile = async () => {
    try {
      // this will throw error if user is not authenticated
      await Auth.currentAuthenticatedUser();
      // if the user is authenticated will auto login
      await getProfile();
    } catch (error) {
      // https://github.com/aws-amplify/amplify-js/blob/6caccc7b4/packages/auth/src/Auth.ts#L1705
      // here are just error strings validating user pool config and if user is authenticated
      console.debug('[Cognito][Init]:', error);
      // setIsLoading(false);
    }
  };

  const login = async ({ username, password }: SignInOptions) => {
    try {
      await Auth.signIn(username, password);
      getProfile();
    } catch (error: any) {
      console.log('[Auth][Login]:', JSON.stringify(error));
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
      console.log('[Auth][Signup]:', JSON.stringify(error));
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
      await Auth.confirmSignUp(userName, code);
    } catch (error) {
      console.log('[Auth][Signup][Confirm]:', JSON.stringify(error));
      Toast.show({ type: 'error', text1: `${i18n.t('auth:errors.signup')}` });
      throw error;
    }
  };

  const resendConfirmationCode = async (username: string): Promise<void> => {
    try {
      await Auth.resendSignUp(username);
    } catch (error) {
      console.log('[Auth][Signup][Resend_Code]:', JSON.stringify(error));
      Toast.show({ type: 'error', text1: `${i18n.t('auth:errors.resend_code')}` });
    }
  };

  const logout = async () => {
    try {
      setIsAuthenticated(false);
      setUserProfile(null);
      await Auth.signOut({ global: true });
    } catch (error) {
      console.log('[Auth][SignOut]:', JSON.stringify(error));
    }
  };

  const getProfile = async () => {
    // request profile from the database
    getUserProfile(undefined, {
      onSuccess: (profile: IUserProfile) => {
        setUserProfile(profile);
      },
      onError: (error: any) => {
        // if the profile doesn't exists redirect to the the create account page
        console.log('[Profile]:', JSON.stringify(error));
        Toast.show({ type: 'error', text1: `${i18n.t('auth:errors.init_profile')}` });
      },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        signUp,
        confirmSignUp,
        resendConfirmationCode,
        userProfile,
        setUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
