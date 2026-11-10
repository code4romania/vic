/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext } from 'react';
import { SocialProvider } from '../../services/auth/auth.api';

interface AuthContextProps {
  isAuthenticated: boolean;
  isUserPending: boolean;
  // The email the last code was sent to: the code step uses it.
  userName: string;
  // VIC 2.0 (#514): no passwords. Emails a 6-digit code; resolves with the masked email. Sign-up = login.
  requestLoginCode: (email: string) => Promise<string>;
  // The code for userName: stores the tokens and loads the profile. Rejects with { createUser: true }
  // when there is no volunteer profile yet.
  loginWithCode: (code: string) => Promise<void>;
  loginWithSocial: (provider: SocialProvider) => Promise<void>;
  // Unregisters the push token, ends the session on the backend, then clears every local trace.
  logout: () => Promise<void>;
  // Loads the profile again if logged in (the Maintenance screen's Retry).
  reload: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  isUserPending: false,
  userName: '',
  requestLoginCode: (email: string) => Promise.resolve(''),
  loginWithCode: (code: string) => Promise.resolve(),
  loginWithSocial: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  reload: () => Promise.resolve(),
});
