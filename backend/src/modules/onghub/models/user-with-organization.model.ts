import { IOrganizationModel } from 'src/modules/organization/models/organization.model';
import { IUserModel } from 'src/modules/user/models/admin-user.model';

export interface IUserWithOrganizationModel {
  user: IUserModel;
  organization: IOrganizationModel;
}
