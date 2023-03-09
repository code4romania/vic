import { AgeRangeEnum } from 'src/common/enums/age-range.enum';
import { OneOf } from 'src/common/helpers/typescript-extends';
import { IBaseModel } from 'src/common/interfaces/base.model';
import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';
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
import {
  IVolunteerProfileModel,
  VolunteerProfileModelTransformer,
} from './volunteer-profile.model';

export interface IVolunteerModel extends IBaseModel {
  id: string;
  status: VolunteerStatus;

  archivedOn: Date;
  blockedOn: Date;

  // Relations
  volunteerProfile: IVolunteerProfileModel;
  archivedBy: IAdminUserModel; // If the user leaves the organization, archivedBy will be null
  blockedBy: IAdminUserModel;
  organization: IOrganizationModel;
  user: IRegularUserModel;
}

export type CreateVolunteerOptions = {
  userId: IVolunteerModel['user']['id'];
  organizationId: IVolunteerModel['organization']['id'];
};

export type ArchiveVolunteerOptions = {
  status: VolunteerStatus.ARCHIVED;
  archivedOn: Date;
  archivedById: string;
};

export type BlockVolunteerOptions = {
  status: VolunteerStatus.BLOCKED;
  blockedOn: Date;
  blockedById: string;
};

export type ActivateVolunteerOptions = {
  status: VolunteerStatus.ACTIVE;
  blockedOn: null;
  blockedById: null;
  archivedOn: null;
  archivedById: null;
};

export type UpdateVolunteerOptions = Pick<IVolunteerModel, 'id'> &
  OneOf<
    [ArchiveVolunteerOptions, BlockVolunteerOptions, ActivateVolunteerOptions]
  >;

export type FindVolunteerOptions = Partial<IVolunteerModel> & {
  userId?: IVolunteerModel['user']['id'];
  organizationId?: IVolunteerModel['organization']['id'];
};

export type FindManyVolunteersOptions = Pick<IVolunteerModel, 'status'> & {
  organizationId: IVolunteerModel['organization']['id'];
} & Partial<{
    locationId: number;
    branchId: string;
    departmentId: string;
    roleId: string;
    age: AgeRangeEnum;
    activeSinceStart: Date;
    activeSinceEnd: Date;
  }> &
  IBasePaginationFilterModel;

export class VolunteerModelTransformer {
  static fromEntity(volunteer: VolunteerEntity): IVolunteerModel {
    if (!volunteer) return null;
    return {
      id: volunteer.id,
      status: volunteer.status,

      archivedOn: volunteer.archivedOn,
      blockedOn: volunteer.blockedOn,

      archivedBy: AdminUserTransformer.fromEntity(volunteer.archivedBy),
      blockedBy: AdminUserTransformer.fromEntity(volunteer.blockedBy),

      // Relations
      volunteerProfile: VolunteerProfileModelTransformer.fromEntity(
        volunteer.volunteerProfile,
      ),
      organization: OrganizationTransformer.fromEntity(volunteer.organization),
      user: RegularUserTransformer.fromEntity(volunteer.user),

      updatedOn: volunteer.updatedOn,
      createdOn: volunteer.createdOn,
    };
  }

  static toEntity(volunteer: CreateVolunteerOptions): VolunteerEntity {
    const entity = new VolunteerEntity();

    entity.userId = volunteer.userId;
    entity.organizationId = volunteer.organizationId;

    return entity;
  }
}
