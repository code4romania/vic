import { IOrganizationStructureModel } from 'src/modules/organization/models/organization-structure.model';
import { IOrganizationModel } from 'src/modules/organization/models/organization.model';
import { ActivityTypeStatus } from '../enums/activity-type-status.enum';

export interface IActivityType {
  name: string;
  icon: string;
  status: ActivityTypeStatus;
  organization: IOrganizationModel;
  branch?: IOrganizationStructureModel;
  department?: IOrganizationStructureModel;
  role?: IOrganizationStructureModel;
}

export type CreateActivityTypeOptions = Pick<IActivityType, 'name' | 'icon'> & {
  organizationId: string;
  branchId?: string;
  departmentId?: string;
  roleId?: string;
};
