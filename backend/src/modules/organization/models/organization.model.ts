import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';
import { OrganizationEntity } from '../entities/organization.entity';
import { OrganizationStatus } from '../enums/organization-status.enum';

export interface IOrganizationModel {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  activityArea: string;
  logo: string;
  description: string;
  status: OrganizationStatus;
  validatedAt: Date;
  validatedById: string;
  taxId: string;
  website: string;
  selfDeclaredAt: Date;
  suspendedAt: Date;
  createdOn?: Date;
}

export type ICreateOrganizationModel = Omit<
  IOrganizationModel,
  | 'id'
  | 'status'
  | 'validatedAt'
  | 'validatedById'
  | 'taxId'
  | 'website'
  | 'selfDeclaredAt'
  | 'suspendedAt'
> &
  Partial<
    Pick<IOrganizationModel, 'status' | 'taxId' | 'website' | 'selfDeclaredAt'>
  >;

export type UpdateOrganizationOptions = Partial<
  Pick<
    IOrganizationModel,
    | 'name'
    | 'email'
    | 'phone'
    | 'address'
    | 'activityArea'
    | 'logo'
    | 'description'
    | 'status'
    | 'validatedAt'
    | 'validatedById'
    | 'taxId'
    | 'website'
    | 'suspendedAt'
  >
>;

// Fields that must be unique among organizations, compared ignoring case (registration and edit).
export type OrganizationUniqueFields = Partial<
  Pick<IOrganizationModel, 'name' | 'email' | 'phone' | 'taxId'>
>;

export type IFindOrganizationModel = Pick<
  IOrganizationModel,
  'id' | 'name' | 'email' | 'phone'
>;

export type FindManyOrganizationsOptions = IBasePaginationFilterModel & {
  userId: string;
};

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
      status: organizationEntity.status,
      validatedAt: organizationEntity.validatedAt,
      validatedById: organizationEntity.validatedById,
      taxId: organizationEntity.taxId,
      website: organizationEntity.website,
      selfDeclaredAt: organizationEntity.selfDeclaredAt,
      suspendedAt: organizationEntity.suspendedAt,
      createdOn: organizationEntity.createdOn,
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
    organizationEntity.status = organizationModel.status;
    organizationEntity.taxId = organizationModel.taxId;
    organizationEntity.website = organizationModel.website;
    organizationEntity.selfDeclaredAt = organizationModel.selfDeclaredAt;
    return organizationEntity;
  }
}
