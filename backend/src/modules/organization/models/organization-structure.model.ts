import { IBaseModel } from 'src/common/interfaces/base.model';
import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { OrganizationStructureEntity } from '../entities/organization-structure.entity';
import { OrganizationStructureType } from '../enums/organization-structure-type.enum';

export interface IOrganizationStructureModel extends IBaseModel {
  id: string;
  name: string;
  type: OrganizationStructureType;
  members: number; // No of members in the structure
  createdBy: IAdminUserModel;
  organizationId: string;
}

export type ICreateOrganizationStructureModel = Required<
  Pick<IOrganizationStructureModel, 'name' | 'type' | 'organizationId'> & {
    createdById: string;
  }
>;

export type IUpdateOrganizationStructureModel = Required<
  Pick<IOrganizationStructureModel, 'id' | 'name'>
>;

export type IFindOrganizationStructureModel = Partial<
  Pick<IOrganizationStructureModel, 'id' | 'name' | 'type' | 'organizationId'>
>;

export type IFindAllOrganizationStructurePaginatedModel =
  IBasePaginationFilterModel &
    Required<Pick<IOrganizationStructureModel, 'organizationId' | 'type'>>;

export type IFindAllOrganizationStructureModel =
  | Partial<IOrganizationStructureModel>
  | Partial<IOrganizationStructureModel>[];

export class OrganizationStructureTransformer {
  static fromEntity(
    entity: OrganizationStructureEntity,
  ): IOrganizationStructureModel {
    if (!entity) return null;
    return {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      members: 0, // TODO: to be implemented when we have the VolunteerOrganization relation
      createdBy: entity.createdBy,
      organizationId: entity.organizationId,
      createdOn: entity.createdOn,
      updatedOn: entity.updatedOn,
    };
  }

  static toEntity(
    model: ICreateOrganizationStructureModel,
  ): OrganizationStructureEntity {
    const entity = new OrganizationStructureEntity();
    entity.name = model.name;
    entity.type = model.type;
    entity.createdById = model.createdById;
    entity.organizationId = model.organizationId;
    return entity;
  }
}
