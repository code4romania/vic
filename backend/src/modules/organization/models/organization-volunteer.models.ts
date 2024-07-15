import { OrganizationEntity } from '../entities/organization.entity';
import { IOrganizationModel } from './organization.model';

export interface IOrganizationVolunteerModel extends IOrganizationModel {
  volunteerId: string;
  volunteerProfileId: string;
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
      id: organizationEntity.id,
      name: organizationEntity.name,
      email: organizationEntity.email,
      phone: organizationEntity.phone,
      address: organizationEntity.address,
      activityArea: organizationEntity.activityArea,
      logo: organizationEntity.logo,
      description: organizationEntity.description,
      volunteerId: volunteer?.id,
      volunteerProfileId: volunteer?.volunteerProfileId,
    };
  }
}
