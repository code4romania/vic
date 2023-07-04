import { OrganizationEntity } from '../entities/organization.entity';
import { IOrganizationModel } from './organization.model';

export interface IOrganizationVolunteerModel extends IOrganizationModel {
  volunteerId: string;
}

export class OrganizationVolunteerTransformer {
  static fromEntity(
    organizationEntity: OrganizationEntity,
  ): IOrganizationVolunteerModel {
    if (!organizationEntity) return null;
    return {
      id: organizationEntity.id,
      name: organizationEntity.name,
      email: organizationEntity.email,
      phone: organizationEntity.phone,
      address: organizationEntity.address,
      activityArea: organizationEntity.activityArea,
      logo: organizationEntity.logo,
      description: organizationEntity.description,
      volunteerId: organizationEntity.volunteers[0].id,
    };
  }
}
