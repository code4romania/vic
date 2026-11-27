import { Language } from '../config/language';

// The logged-in NGO admin (POST /auth/login-link `user`, GET /auth/web/me). Not the volunteer IUser.
export interface IAdminProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  organizationId: string;
  superAdmin: boolean;
  // The language saved on the account (emails follow it); null until the admin's first login
  // after VIC became bilingual.
  language?: Language | null;
}

export interface IWebSession {
  accessToken: string;
  expiresIn: number;
  user?: IAdminProfile;
}

export type AuthRealm = 'web' | 'mobile';
export type TokenType = 'verify_email' | 'login' | 'invite';
// transition = the cutover email; invite = Team page; login = the magic link from the login page (#514).
export type TokenPurpose = 'transition' | 'invite' | 'login' | 'verify_email';

// GET /auth/token/:secret
export interface ITokenInfo {
  type: TokenType;
  purpose: TokenPurpose;
  realm: AuthRealm;
  maskedEmail: string;
  organizationName?: string;
}

// login-link and confirm-email for a volunteer: no web session, go to the app (decision 6, R17).
export interface IMobileRealmResult {
  realm: 'mobile';
  email: string;
}

export type LinkResult = IWebSession | IMobileRealmResult;

// Login with NGO Hub: what the registration form starts from when NGO Hub's organization is new to VIC.
// The CUI, the organization's name and the admin's email are locked (the API takes them from the ticket).
export interface INgoHubPrefill {
  organization: {
    name: string;
    taxId: string;
    email: string;
    phone: string;
    address: string;
    description: string;
    website: string;
    logoUrl: string | null;
  };
  admin: { email: string; firstName: string; lastName: string };
}

export interface INgoHubRegistration {
  ticket: string;
  prefill: INgoHubPrefill;
}

// POST /auth/web/ngohub/callback: a session, or a registration for an NGO VIC does not know yet.
export type NgoHubCallbackResult = IWebSession | { registration: INgoHubRegistration };

export const isNgoHubRegistration = (
  result: NgoHubCallbackResult,
): result is { registration: INgoHubRegistration } =>
  !!(result as { registration?: INgoHubRegistration }).registration;

export interface INgoHubRegisterForm {
  email: string;
  phone: string;
  address: string;
  description: string;
  website: string;
  firstName: string;
  lastName: string;
  adminPhone: string;
  useNgoHubLogo: boolean;
  acceptedTerms: boolean;
}

export const isMobileRealmResult = (result: LinkResult): result is IMobileRealmResult =>
  (result as IMobileRealmResult).realm === 'mobile';
