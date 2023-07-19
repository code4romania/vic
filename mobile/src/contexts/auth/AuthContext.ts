/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext } from 'react';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';

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
  login: (credentials: SignInOptions) => void;
  loginWithSocial: (provider: CognitoHostedUIIdentityProvider) => Promise<void>;
  signUp: (options: SignUpOptions) => void;
  confirmSignUp: (code: string) => void;
  resendConfirmationCode: (username: string) => void;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (username: string) => Promise<void>;
  forgotPasswordSubmit: (code: string, new_password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  isUserPending: false,
  login: () => {},
  loginWithSocial: () => Promise.resolve(),
  signUp: (options: SignUpOptions) => {},
  confirmSignUp: (code: string) => {},
  resendConfirmationCode: (username: string) => {},
  logout: () => {},
  changePassword: (oldPassword: string, newPassword: string) => Promise.resolve(),
  forgotPassword: (username: string) => Promise.resolve(),
  forgotPasswordSubmit: (code: string, new_password: string) => Promise.resolve(),
});
