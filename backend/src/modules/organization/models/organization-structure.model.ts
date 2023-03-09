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

export type IFindAllOrganizationStructureByIds = Pick<
  IOrganizationStructureModel,
  'type' | 'organizationId'
> & {
  ids: string[];
};

export class OrganizationStructureTransformer {
  static fromEntity(
    entity: OrganizationStructureEntity & { numberOfMembers?: number },
  ): IOrganizationStructureModel {
    if (!entity) return null;
    return {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      members: entity.numberOfMembers || 0,
      createdBy: entity.createdBy,
      organizationId: entity.organizationId,
      createdOn: entity.createdOn,
      updatedOn: entity.updatedOn,
    };
  }

  static toEntity(
    model: ICreateOrganizationStructureModel,
  ): OrganizationStructureEntity;
  static toEntity(id: string): OrganizationStructureEntity;
  static toEntity(
    model: ICreateOrganizationStructureModel | string,
  ): OrganizationStructureEntity {
    const entity = new OrganizationStructureEntity();
    if (typeof model === 'object') {
      entity.name = model.name;
      entity.type = model.type;
      entity.createdById = model.createdById;
      entity.organizationId = model.organizationId;
    } else {
      // used for ManyToMany relations to generate entity like object
      entity.id = model;
    }
    return entity;
  }
}
