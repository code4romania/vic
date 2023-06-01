import { OrganizationEntity } from '../entities/organization.entity';

export interface IOrganizationWithVolunteersModel {
  id: string;
  name: string;
  logo: string;
  numberOfVolunteers: number;
}

export class OrganizationWithVolunteersTransformer {
  static fromEntity(
    organizationEntity: OrganizationEntity & { numberOfVolunteers: number },
  ): IOrganizationWithVolunteersModel {
    if (!organizationEntity) return null;
    return {
      id: organizationEntity.id,
      name: organizationEntity.name,
      logo: organizationEntity.logo,
      numberOfVolunteers: organizationEntity.numberOfVolunteers,
    };
  }
}
