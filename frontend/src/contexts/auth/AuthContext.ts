/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext } from 'react';
import { IUser } from '../../common/interfaces/user.interface';

interface AuthContextProps {
  isAuthenticated: boolean;
  profile?: IUser;
  login: (user: object) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  login: (user) => {},
  logout: () => {},
});
