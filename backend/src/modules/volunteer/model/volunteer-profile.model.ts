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
  activeSince?: Date;
  branchId?: string;
  departmentId?: string;
  roleId?: string;
};

// export type FindVolunteerOptions = Partial<IVolunteerProfileModel>;

export class VolunteerProfileModelTransformer {
  static fromEntity(volunteer: VolunteerProfileEntity): IVolunteerProfileModel {
    if (!volunteer) return null;
    return {
      id: volunteer.id,
      email: volunteer.email,
      phone: volunteer.phone,
      activeSince: volunteer.activeSince,

      // Relations
      role: OrganizationStructureTransformer.fromEntity(volunteer.role),
      branch: OrganizationStructureTransformer.fromEntity(volunteer.branch),
      department: OrganizationStructureTransformer.fromEntity(
        volunteer.department,
      ),

      // Base
      updatedOn: volunteer.updatedOn,
      createdOn: volunteer.createdOn,
    };
  }

  static toEntity(
    volunteer: CreateVolunteerProfileOptions,
  ): VolunteerProfileEntity {
    const entity = new VolunteerProfileEntity();
    entity.email = volunteer.email;
    entity.phone = volunteer.phone;
    entity.activeSince = volunteer.activeSince;
    entity.branchId = volunteer.branchId;
    entity.departmentId = volunteer.departmentId;
    entity.roleId = volunteer.roleId;
    return entity;
  }
}
