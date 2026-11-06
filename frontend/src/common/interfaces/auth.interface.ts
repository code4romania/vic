// The logged-in NGO admin (POST /auth/web/login `user`, GET /auth/web/me). Not the volunteer IUser.
export interface IAdminProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  organizationId: string;
  superAdmin: boolean;
}

export interface IWebSession {
  accessToken: string;
  expiresIn: number;
  user?: IAdminProfile;
}

export type AuthRealm = 'web' | 'mobile';
export type TokenType = 'verify_email' | 'reset_password' | 'invite';
// transition = the cutover email; invite = Team page; reset = Forgot password (decisions R16).
export type TokenPurpose = 'transition' | 'invite' | 'reset' | 'verify_email';

// GET /auth/token/:secret
export interface ITokenInfo {
  type: TokenType;
  purpose: TokenPurpose;
  realm: AuthRealm;
  maskedEmail: string;
  organizationName?: string;
}

// set-password and confirm-email for a volunteer: no web session, go to the app (decision 6, R17).
export interface IMobileRealmResult {
  realm: 'mobile';
  email: string;
}

export type LinkResult = IWebSession | IMobileRealmResult;

export const isMobileRealmResult = (result: LinkResult): result is IMobileRealmResult =>
  (result as IMobileRealmResult).realm === 'mobile';
