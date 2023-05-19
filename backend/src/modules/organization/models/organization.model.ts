import { OrganizationEntity } from '../entities/organization.entity';

export interface IOrganizationModel {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  activityArea: string;
  logo: string;
  description: string;
}

export type ICreateOrganizationModel = Omit<IOrganizationModel, 'id'>;

export type IFindOrganizationModel = Pick<
  IOrganizationModel,
  'id' | 'name' | 'email' | 'phone'
>;

export class OrganizationTransformer {
  static fromEntity(
    organizationEntity: OrganizationEntity,
  ): IOrganizationModel {
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
    };
  }

  static toEntity(
    organizationModel: ICreateOrganizationModel,
  ): OrganizationEntity {
    const organizationEntity: OrganizationEntity = new OrganizationEntity();
    organizationEntity.name = organizationModel.name;
    organizationEntity.email = organizationModel.email;
    organizationEntity.phone = organizationModel.phone;
    organizationEntity.address = organizationModel.address;
    organizationEntity.activityArea = organizationModel.activityArea;
    organizationEntity.logo = organizationModel.logo;
    organizationEntity.description = organizationModel.description;
    return organizationEntity;
  }
}
