import { Role } from 'src/common/enums/role.enum';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';

// What both strategies add to request.user next to the profile (decisions R11).
export interface IAuthenticatedIdentity {
  identityId: string;
  sessionId: string; // the access token's sid: the refresh_token row id
}

export type IWebRequestUser = IAdminUserModel &
  IAuthenticatedIdentity & {
    role: Role.ADMIN;
    superAdmin: boolean;
  };

// A volunteer who has logged in but not created a profile yet: no user row, so no id.
export type IMobileRequestStub = IAuthenticatedIdentity & {
  email: string;
  role: Role.VOLUNTEER;
};

export type IMobileRequestUser =
  | (IRegularUserModel &
      IAuthenticatedIdentity & {
        role: Role.VOLUNTEER;
      })
  | IMobileRequestStub;
