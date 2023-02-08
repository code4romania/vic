import { IBaseModel } from 'src/common/interfaces/base.model';
import { OrganizationStructureEntity } from '../entities/organization-structure.entity';
import { OrganizationStructureType } from '../enums/organization-structure-type.enum';

export interface IOrganizationStructureModel extends IBaseModel {
  id: string;
  name: string;
  type: OrganizationStructureType;

  members: number; // No of members in the structure
  createdBy: { id: string; name: string };
  organizationId?: string;
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

export type IFindAllOrganizationStructureModel = Required<
  Pick<IOrganizationStructureModel, 'organizationId' | 'type'>
>;

export class OrganizationStructureTransformer {
  static fromEntity(
    entity: OrganizationStructureEntity,
  ): IOrganizationStructureModel {
    return {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      members: 0, // TODO: to be implemented when we have the VolunteerOrganization relation
      createdBy: {
        id: entity.adminUser?.id,
        name: entity.adminUser?.user?.name,
      },
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
    entity.createdBy = model.createdById;
    entity.organizationId = model.organizationId;
    return entity;
  }
}
