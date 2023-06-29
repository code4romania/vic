/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext } from 'react';
import { IUserPersonalData, IUserProfile } from '../../common/interfaces/user-profile.interface';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import { IOrganizationVolunteer } from '../../common/interfaces/organization-list-item.interface';

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
  userProfile: IUserProfile | null;
  isAuthenticated: boolean;
  isUserPending: boolean;
  login: (credentials: SignInOptions) => void;
  loginWithSocial: (provider: CognitoHostedUIIdentityProvider) => Promise<void>;
  signUp: (options: SignUpOptions) => void;
  confirmSignUp: (code: string) => void;
  resendConfirmationCode: (username: string) => void;
  logout: () => void;
  setUserProfile: (user: any) => void;
  setActiveOrganization: (organization: IOrganizationVolunteer) => void;
  setIdentityData: (personalData: IUserPersonalData) => void;
}

export const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  isUserPending: false,
  userProfile: null,
  login: () => {},
  loginWithSocial: () => Promise.resolve(),
  signUp: (options: SignUpOptions) => {},
  confirmSignUp: (code: string) => {},
  resendConfirmationCode: (username: string) => {},
  logout: () => {},
  setUserProfile: (user: any) => {},
  setActiveOrganization: (organization: IOrganizationVolunteer) => {},
  setIdentityData: (personalData: IUserPersonalData) => {},
});
