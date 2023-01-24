/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext } from 'react';

interface AuthContextProps {
  isAuthenticated: boolean;
  login: (user: object) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  login: (user) => {},
  logout: () => {},
});
