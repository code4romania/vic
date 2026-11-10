import { AuthRealm } from 'src/modules/auth/enums/auth.enums';
import { SessionTokens } from 'src/modules/auth/services/session.service';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';

// A link used for a web login starts a session; one used for a mobile login does not: the page shows
// "Open the app" with the email (decisions R17).
export type WebLoginResult = {
  realm: AuthRealm.WEB;
  tokens: SessionTokens;
  admin: IAdminUserModel & { superAdmin: boolean };
};

export type LinkResult =
  | WebLoginResult
  | { realm: AuthRealm.MOBILE; email: string };
