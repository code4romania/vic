import { IBaseModel } from 'src/common/interfaces/base.model';
import {
  IOrganizationStructureModel,
  OrganizationStructureTransformer,
} from 'src/modules/organization/models/organization-structure.model';
import {
  IOrganizationModel,
  OrganizationTransformer,
} from 'src/modules/organization/models/organization.model';
import {
  AdminUserTransformer,
  IAdminUserModel,
} from 'src/modules/user/models/admin-user.model';
import {
  IRegularUserModel,
  RegularUserTransformer,
} from 'src/modules/user/models/regular-user.model';
import { VolunteerEntity } from '../entities/volunteer.entity';
import { VolunteerStatus } from '../enums/volunteer-status.enum';

export interface IVolunteerModel extends IBaseModel {
  id: string;

  email: string;
  phone: string;
  status: VolunteerStatus;

  activeSince: Date;
  archivedOn: Date;
  blockedOn: Date;

  archivedBy: IAdminUserModel; // If the user leaves the organization, archivedBy will be null
  blockedBy: IAdminUserModel;

  // Relations
  branch: IOrganizationStructureModel;
  department: IOrganizationStructureModel;
  role: IOrganizationStructureModel;

  organization: IOrganizationModel;
  user: IRegularUserModel;
}

// Required: email, phone, user_id, org_id,
// Partial: branch, department, role, activeSince(default currentDate)
export type CreateVolunteerOptions = Pick<
  IVolunteerModel,
  'email' | 'phone'
> & {
  user_id: string;
  organization_id: string;
  activeSince?: Date;
  branchId?: string;
  departmentId?: string;
  roleId?: string;
};

export class VolunteerModelTransformer {
  static fromEntity(volunteer: VolunteerEntity): IVolunteerModel {
    return {
      id: volunteer.id,
      email: volunteer.email,
      phone: volunteer.phone,
      status: volunteer.status,

      activeSince: volunteer.activeSince,
      archivedOn: volunteer.archivedOn,
      blockedOn: volunteer.blockedOn,

      archivedBy: AdminUserTransformer.fromEntity(volunteer.archivedBy),
      blockedBy: AdminUserTransformer.fromEntity(volunteer.blockedBy),

      // Relations
      role: OrganizationStructureTransformer.fromEntity(volunteer.role),
      branch: OrganizationStructureTransformer.fromEntity(volunteer.branch),
      department: OrganizationStructureTransformer.fromEntity(
        volunteer.department,
      ),

      organization: OrganizationTransformer.fromEntity(volunteer.organization),
      user: RegularUserTransformer.fromEntity(volunteer.user),

      updatedOn: volunteer.updatedOn,
      createdOn: volunteer.createdOn,
    };
  }

  static toEntity(volunteer: CreateVolunteerOptions): VolunteerEntity {
    const entity = new VolunteerEntity();
    entity.email = volunteer.email;
    entity.phone = volunteer.phone;
    entity.activeSince = volunteer.activeSince;
    entity.userId = volunteer.user_id;
    entity.organizationId = volunteer.organization_id;
    entity.branchId = volunteer.branchId;
    entity.departmentId = volunteer.departmentId;
    entity.roleId = volunteer.roleId;
    return entity;
  }
}
