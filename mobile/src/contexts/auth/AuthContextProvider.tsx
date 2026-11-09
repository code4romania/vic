/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import i18n from '../../common/config/i18n';
import * as SplashScreen from 'expo-splash-screen';
import { getUserProfile } from '../../services/user/user.api';
import useStore from '../../store/store';
import { useUserProfile } from '../../store/profile/profile.selector';
import * as authApi from '../../services/auth/auth.api';
import { SocialProvider } from '../../services/auth/auth.api';
import {
  clearLegacyStorage,
  clearTokens,
  getRefreshToken,
  setTokens,
} from '../../services/auth/token.storage';
import { authEvents } from '../../services/auth/auth.events';
import { getSocialToken, signOutSocial, SocialCancelledError } from '../../services/auth/social';
import { getAuthErrorCode } from '../../common/utils/auth-error';
import { AUTH_ERRORS } from '../../common/errors/entities/auth.errors';
import { InternalErrors } from '../../common/errors/internal-errors.class';
import { USER_ERRORS } from '../../common/errors/entities/user.errors';

const showError = (text1: string, text2?: string) => Toast.show({ type: 'error', text1, text2 });

// The message of a failed auth call: the AUTH_xxx text, else the screen's generic one.
const authErrorText = (error: unknown, fallbackKey: string): string => {
  const code = getAuthErrorCode(error);
  return code ? InternalErrors.AUTH_ERRORS.getError(code) : i18n.t(fallbackKey);
};

// The profile does not exist yet: the login worked but CreateUser has not run.
const isMissingProfile = (error: any): boolean =>
  error?.response?.status === 404 || error?.response?.data?.code_error === USER_ERRORS.USER_001;

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // logged in, but no volunteer profile yet: CreateUser
  const [isUserPending, setIsUserPending] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  const { setUserProfile } = useStore();
  const { userProfile } = useUserProfile();

  useEffect(() => {
    initProfile();
    // A refresh the backend refused (expired, revoked, login disabled).
    return authEvents.on('logout', endSession);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsAuthenticated(userProfile !== null);
    }
  }, [userProfile]);

  const endSession = () => {
    setIsAuthenticated(false);
    setIsUserPending(false);
    setUserProfile(null);
  };

  const initProfile = async () => {
    try {
      setIsUserPending(false);
      await clearLegacyStorage();
      // Logged in before: the profile call refreshes the access token if it expired.
      if (await getRefreshToken()) {
        await getProfile();
      }
    } catch {
      // getProfile already showed what went wrong
    } finally {
      setTimeout(async () => {
        await SplashScreen.hideAsync();
      }, 500);
    }
  };

  // Every path settles: resolves with the profile, rejects with { createUser: true } when there is
  // none yet, rejects with the error otherwise.
  const getProfile = async () => {
    try {
      const profile = await getUserProfile();
      setUserProfile(profile);
      return profile;
    } catch (error: any) {
      if (isMissingProfile(error)) {
        setIsUserPending(true);
        throw { createUser: true };
      }
      // 401 after a failed refresh: the logout event already ended the session.
      // 503 / 426: the Maintenance / UpdateRequired screens take over.
      const status = error?.response?.status;
      if (status !== 401 && status !== 503 && status !== 426) {
        showError(i18n.t('auth:errors.init_profile'));
      }
      throw error;
    }
  };

  const startSession = async (session: authApi.ISession) => {
    await setTokens(session);
    await getProfile();
  };

  const requestLoginCode = async (rawEmail: string): Promise<string> => {
    const email = rawEmail.trim();
    try {
      const { maskedEmail } = await authApi.requestLogin(email);
      setUserName(email);
      return maskedEmail;
    } catch (error) {
      if (!isHandledElsewhere(error)) {
        showError(authErrorText(error, 'auth:errors.login'));
      }
      throw error;
    }
  };

  const loginWithCode = async (code: string) => {
    let session: authApi.ISession;
    try {
      session = await authApi.loginWithCode(userName, code.trim());
    } catch (error: any) {
      const errorCode = getAuthErrorCode(error);
      if (errorCode === AUTH_ERRORS.AUTH_005) {
        showError(i18n.t('auth:errors.code_mismatch'));
      } else if (!isHandledElsewhere(error)) {
        showError(authErrorText(error, 'auth:errors.login'));
      }
      throw error;
    }
    // no profile yet: rejects with { createUser: true } and Login opens CreateUser
    await startSession(session);
  };

  const loginWithSocial = async (provider: SocialProvider) => {
    let token: string;
    try {
      token = await getSocialToken(provider);
    } catch (error) {
      if (!(error instanceof SocialCancelledError)) {
        console.log('[Auth][Social]:', provider, error);
        showError(i18n.t('auth:errors.social_failed'));
      }
      return;
    }
    try {
      await startSession(await authApi.loginWithSocial(provider, token));
    } catch (error: any) {
      if (error?.createUser) {
        // Landing sends a pending user to CreateUser
        return;
      }
      if (!isHandledElsewhere(error) && error?.response) {
        showError(authErrorText(error, 'auth:errors.social_failed'));
      }
    }
  };

  const logout = async () => {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      // ends the session on the backend; offline or already dead is fine
      await authApi.logout(refreshToken).catch(() => undefined);
    }
    await clearTokens();
    await signOutSocial().catch(() => undefined);
    endSession();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isUserPending,
        userName,
        requestLoginCode,
        loginWithCode,
        loginWithSocial,
        logout,
        reload: initProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 503 and 426 switch the whole app to the Maintenance / UpdateRequired screens: no toast.
const isHandledElsewhere = (error: any): boolean => {
  const status = error?.response?.status;
  return status === 503 || status === 426;
};

export default AuthContextProvider;
