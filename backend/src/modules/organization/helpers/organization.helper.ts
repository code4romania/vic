import { OrganizationEntity } from '../entities/organization.entity';
import { IOrganizationModel } from '../models/organization.model';

export const toOrganizationModel = (
  organizationEntity: OrganizationEntity,
): IOrganizationModel => {
  const organizationModel: IOrganizationModel = {
    id: organizationEntity.id,
    name: organizationEntity.name,
    email: organizationEntity.email,
    phone: organizationEntity.phone,
    address: organizationEntity.address,
    logo: organizationEntity.logo,
    description: organizationEntity.description,
  };
  return organizationModel;
};

export const toOrganizationEntity = (
  organizationModel: Omit<IOrganizationModel, 'id'>,
): OrganizationEntity => {
  const organizationEntity: OrganizationEntity = new OrganizationEntity();
  organizationEntity.name = organizationModel.name;
  organizationEntity.email = organizationModel.email;
  organizationEntity.phone = organizationModel.phone;
  organizationEntity.address = organizationModel.address;
  organizationEntity.logo = organizationModel.logo;
  organizationEntity.description = organizationModel.description;
  return organizationEntity;
};
