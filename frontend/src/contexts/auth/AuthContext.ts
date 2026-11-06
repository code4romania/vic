/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext } from 'react';
import { IAdminProfile, IWebSession } from '../../common/interfaces/auth.interface';

export interface AuthContextProps {
  isAuthenticated: boolean;
  profile?: IAdminProfile;
  isSuperAdmin: boolean;
  // Throws the API error (with code_error) so the login page can react, e.g. AUTH_012 = volunteer account.
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  // After set-password or confirm-email answered with a web session.
  startSession: (session: IWebSession) => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  isSuperAdmin: false,
  login: async (email: string, password: string) => {},
  logout: async () => {},
  startSession: async (session: IWebSession) => {},
});
