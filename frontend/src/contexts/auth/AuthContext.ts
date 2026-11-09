/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext } from 'react';
import { IAdminProfile, IWebSession } from '../../common/interfaces/auth.interface';

export interface AuthContextProps {
  isAuthenticated: boolean;
  profile?: IAdminProfile;
  isSuperAdmin: boolean;
  logout: () => Promise<void>;
  // After the login link (/login/link) or confirm-email answered with a web session.
  startSession: (session: IWebSession) => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  isSuperAdmin: false,
  logout: async () => {},
  startSession: async (session: IWebSession) => {},
});
