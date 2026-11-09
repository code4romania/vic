/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext } from 'react';
import { SocialProvider } from '../../services/auth/auth.api';

export interface SignUpOptions {
  username: string;
  password: string;
  phoneNumber: string;
}

export interface SignInOptions {
  username: string;
  password: string;
}
interface AuthContextProps {
  isAuthenticated: boolean;
  isUserPending: boolean;
  initialPhoneNumber: string | undefined;
  // The email of the last login, sign-up or password reset: the check-email and code screens use it.
  userName: string;
  login: (credentials: SignInOptions) => void;
  loginWithSocial: (provider: SocialProvider) => Promise<void>;
  signUp: (options: SignUpOptions) => void;
  resendConfirmationCode: (username: string) => void;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (username: string) => Promise<void>;
  forgotPasswordSubmit: (code: string, new_password: string) => Promise<void>;
  // Loads the profile again if logged in (the Maintenance screen's Retry).
  reload: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  isUserPending: false,
  initialPhoneNumber: undefined,
  userName: '',
  login: () => {},
  loginWithSocial: () => Promise.resolve(),
  signUp: (options: SignUpOptions) => {},
  resendConfirmationCode: (username: string) => {},
  logout: () => {},
  changePassword: (oldPassword: string, newPassword: string) => Promise.resolve(),
  forgotPassword: (username: string) => Promise.resolve(),
  forgotPasswordSubmit: (code: string, new_password: string) => Promise.resolve(),
  reload: () => Promise.resolve(),
});
