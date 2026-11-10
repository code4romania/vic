import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { OrganizationEntity } from '../entities/organization.entity';
import {
  IOrganizationModel,
  OrganizationTransformer,
} from './organization.model';

export interface IOrganizationVolunteerModel extends IOrganizationModel {
  volunteerId: string;
  volunteerProfileId: string;
  // Active, or Inactive when the organization made the volunteer inactive (view and documents only).
  volunteerStatus: VolunteerStatus;
}

export class OrganizationVolunteerTransformer {
  static fromEntity(
    organizationEntity: OrganizationEntity,
    userId: string,
  ): IOrganizationVolunteerModel {
    if (!organizationEntity) return null;

    const volunteer = organizationEntity.volunteers.find(
      (v) => v.userId === userId,
    );

    return {
      ...OrganizationTransformer.fromEntity(organizationEntity),
      volunteerId: volunteer?.id,
      volunteerProfileId: volunteer?.volunteerProfileId,
      volunteerStatus: volunteer?.status,
    };
  }
}
