import { OneOf } from 'src/common/helpers/typescript-extends';
import { IBaseModel } from 'src/common/interfaces/base.model';
import {
  IOrganizationStructureModel,
  OrganizationStructureTransformer,
} from 'src/modules/organization/models/organization-structure.model';
import {
  IOrganizationModel,
  OrganizationTransformer,
} from 'src/modules/organization/models/organization.model';
import { ActivityTypeEntity } from '../entities/activity-type.entity';
import { ActivityTypeStatus } from '../enums/activity-type-status.enum';

export interface IActivityTypeModel extends IBaseModel {
  id: string;
  name: string;
  icon: string;
  status: ActivityTypeStatus;
  organization: IOrganizationModel;
  branch?: IOrganizationStructureModel;
  department?: IOrganizationStructureModel;
  role?: IOrganizationStructureModel;
}

export type CreateActivityTypeOptions = Pick<
  IActivityTypeModel,
  'name' | 'icon'
> & {
  organizationId: string;
  branchId?: string;
  departmentId?: string;
  roleId?: string;
};

export type UpdateActivityTypeDataOptions = Pick<IActivityTypeModel, 'id'> & {
  name?: string;
  icons?: string;
  branchId?: string;
  departmentId?: string;
  roleId?: string;
};

type UpdateActivityTypeStatusOptions = Pick<IActivityTypeModel, 'id'> &
  Partial<Pick<IActivityTypeModel, 'status'>>;

export type UpdateActivityTypeOptions = OneOf<
  [UpdateActivityTypeDataOptions, UpdateActivityTypeStatusOptions]
>;

export type FindActivityTypeOptions = Partial<
  Pick<IActivityTypeModel, 'id' | 'name'>
> & {
  organizationId?: string;
};

export type FindManyActivityTypeOptions = Partial<IActivityTypeModel> & {
  organizationId?: string;
};

export class ActivityTypeTransformer {
  static fromEntity(entity: ActivityTypeEntity): IActivityTypeModel {
    return {
      id: entity.id,
      name: entity.name,
      icon: entity.icon,
      status: entity.status,
      organization: OrganizationTransformer.fromEntity(entity.organization),
      branch: OrganizationStructureTransformer.fromEntity(entity.branch),
      department: OrganizationStructureTransformer.fromEntity(
        entity.department,
      ),
      role: OrganizationStructureTransformer.fromEntity(entity.role),
      updatedOn: entity.updatedOn,
      createdOn: entity.createdOn,
    };
  }

  static toEntity(model: CreateActivityTypeOptions): ActivityTypeEntity {
    const entity = new ActivityTypeEntity();
    entity.name = model.name;
    entity.icon = model.icon;
    entity.branchId = model.branchId;
    entity.departmentId = model.departmentId;
    entity.roleId = model.roleId;
    entity.organizationId = model.organizationId;
    return entity;
  }
}
