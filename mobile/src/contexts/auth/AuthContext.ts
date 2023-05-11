/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext } from 'react';

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
  login: (credentials: SignInOptions) => void;
  signUp: (options: SignUpOptions) => void;
  confirmSignUp: (code: string) => void;
  resendConfirmationCode: (username: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  login: () => {},
  signUp: (options: SignUpOptions) => {},
  confirmSignUp: (code: string) => {},
  resendConfirmationCode: (username: string) => {},
  logout: () => {},
});
