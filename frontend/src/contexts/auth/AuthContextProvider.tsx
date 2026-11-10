import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { toastOptions } from '../../hooks/useToast';
import { AuthContext } from './AuthContext';
import { IAdminProfile, IWebSession } from '../../common/interfaces/auth.interface';
import * as authApi from '../../services/auth/auth.api';
import { apiEvents, refreshAccessToken } from '../../services/api';
import { tokenStore } from '../../services/auth/token.store';
import Maintenance from '../../pages/Maintenance';
import AccessBlocked from '../../pages/AccessBlocked';

// The web session: the access token in memory, the refresh token in the httpOnly vic_refresh cookie.
// On load: refresh, then /auth/web/me; any failure means logged out.
const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<IAdminProfile>();
  const [maintenance, setMaintenance] = useState<boolean>(false);
  const [accessBlocked, setAccessBlocked] = useState<boolean>(false);
  // parallel requests all get AUTH_004: end the session only once
  const blockedRef = useRef<boolean>(false);
  const queryClient = useQueryClient();
  const { t } = useTranslation('auth');

  const endSession = useCallback(() => {
    tokenStore.clear();
    setProfile(undefined);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    const offMaintenance = apiEvents.onMaintenance(() => setMaintenance(true));
    // A refresh failed in the middle of the session (expired, revoked, disabled): back to the login page.
    const offSessionEnded = apiEvents.onSessionEnded(() => {
      setProfile((current) => {
        if (current) toast.info(t('session_ended'), toastOptions('info'));
        return undefined;
      });
      queryClient.clear();
    });
    // 403 AUTH_004 mid-session (organization suspended, admin disabled): log out, drop the cached
    // data and show one screen that says why, instead of an error toast on every page.
    const offAccessBlocked = apiEvents.onAccessBlocked(() => {
      if (blockedRef.current) return;
      blockedRef.current = true;
      setAccessBlocked(true);
      setProfile(undefined);
      queryClient.clear();
      // best effort: the API already revoked the sessions on suspension
      authApi.logout().catch(() => undefined);
    });
    return () => {
      offMaintenance();
      offSessionEnded();
      offAccessBlocked();
    };
  }, [queryClient, t]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await refreshAccessToken();
        setProfile(await authApi.getMe());
      } catch {
        tokenStore.clear();
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  const startSession = useCallback(async (session: IWebSession) => {
    tokenStore.set(session.accessToken);
    setProfile(session.user ?? (await authApi.getMe()));
  }, []);

  const refreshProfile = useCallback(async () => {
    setProfile(await authApi.getMe());
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      endSession();
    }
  }, [endSession]);

  const isAuthenticated = !!profile;
  const isSuperAdmin = profile?.superAdmin === true;

  if (maintenance) {
    return <Maintenance onRetry={() => window.location.reload()} />;
  }

  if (accessBlocked) {
    return <AccessBlocked onBackToLogin={() => window.location.assign('/login')} />;
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, profile, isSuperAdmin, logout, startSession, refreshProfile }}
    >
      {!isLoading ? (
        children
      ) : (
        <div role="status" className="h-[100vh] w-full flex items-center justify-center">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-navy"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">{t('states:loading')}</span>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
