/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { AuthContext, SignInOptions, SignUpOptions } from './AuthContext';
import { Auth } from 'aws-amplify';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import i18n from '../../common/config/i18n';
import { useUserProfile } from '../../services/user/user.service';
import { IUserProfile } from '../../common/interfaces/user-profile.interface';
import { JSONStringifyError } from '../../common/utils/utils';

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);
  const [userName, setUserName] = useState<string>('');
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
      await Auth.currentAuthenticatedUser({ bypassCache: true });
      // if the user is authenticated will auto login
      await getProfile();
    } catch (error: any) {
      // https://github.com/aws-amplify/amplify-js/blob/6caccc7b4/packages/auth/src/Auth.ts#L1705
      // here are just error strings validating user pool config and if user is authenticated
      console.debug('[Cognito][Init]:', JSONStringifyError(error));
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
      } else if (error.code === 'UserNotFoundException') {
        throw { createUser: true };
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
      Toast.show({ type: 'error', text1: `${i18n.t('auth:errors.signup')}` });
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

  const getProfile = async () => {
    return new Promise((resolve, reject) => {
      getUserProfile(undefined, {
        onSuccess: (profile: IUserProfile) => {
          setUserProfile(profile);
          resolve(profile);
        },
        onError: (error: any) => {
          // if the profile doesn't exists redirect to the the create account page
          console.log('[Profile]:', JSONStringifyError(error));
          if (error.response.status === 404) {
            reject({ code: 'UserNotFoundException' });
          } else {
            Toast.show({ type: 'error', text1: `${i18n.t('auth:errors.init_profile')}` });
          }
        },
      });
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
