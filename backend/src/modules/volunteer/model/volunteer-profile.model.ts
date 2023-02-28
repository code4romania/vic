import { IBaseModel } from 'src/common/interfaces/base.model';
import {
  IOrganizationStructureModel,
  OrganizationStructureTransformer,
} from 'src/modules/organization/models/organization-structure.model';
import { VolunteerProfileEntity } from '../entities/volunteer-profile.entity';

export interface IVolunteerProfileModel extends IBaseModel {
  id: string;

  email: string;
  phone: string;
  activeSince: Date;

  // Relations
  branch: IOrganizationStructureModel;
  department: IOrganizationStructureModel;
  role: IOrganizationStructureModel;
}

export type CreateVolunteerProfileOptions = Pick<
  IVolunteerProfileModel,
  'email' | 'phone'
> & {
  volunteerId: string;
  activeSince?: Date;
  branchId?: string;
  departmentId?: string;
  roleId?: string;
};

export type UpdateVolunteerProfileOptions = Omit<
  CreateVolunteerProfileOptions,
  'volunteerId'
> & { id: string };

// export type FindVolunteerOptions = Partial<IVolunteerProfileModel>;

export class VolunteerProfileModelTransformer {
  static fromEntity(profile: VolunteerProfileEntity): IVolunteerProfileModel {
    if (!profile) return null;
    return {
      id: profile.id,
      email: profile.email,
      phone: profile.phone,
      activeSince: profile.activeSince,

      // Relations
      role: OrganizationStructureTransformer.fromEntity(profile.role),
      branch: OrganizationStructureTransformer.fromEntity(profile.branch),
      department: OrganizationStructureTransformer.fromEntity(
        profile.department,
      ),

      // Base
      updatedOn: profile.updatedOn,
      createdOn: profile.createdOn,
    };
  }

  static toEntity(
    volunteer: CreateVolunteerProfileOptions,
  ): VolunteerProfileEntity {
    const entity = new VolunteerProfileEntity();
    entity.email = volunteer.email;
    entity.phone = volunteer.phone;
    entity.activeSince = volunteer.activeSince ?? new Date();
    entity.branchId = volunteer.branchId;
    entity.departmentId = volunteer.departmentId;
    entity.roleId = volunteer.roleId;
    return entity;
  }
}
