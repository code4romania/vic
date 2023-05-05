import { createContext } from 'react';

interface AuthContextProps {
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});
