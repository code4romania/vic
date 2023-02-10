import { OneOf } from 'src/common/helpers/typescript-extends';
import { IBaseModel } from 'src/common/interfaces/base.model';
import { AccessCodeEntity } from '../entities/access-code.entity';

export interface IAccessCodeModel extends IBaseModel {
  id: string;
  code: string;
  startDate: Date;
  endDate?: Date;
  // TODO: maybe use a AdminUserModel? Because we already strip the data in presenter
  // And it seems confusing to create submodels here?
  createdBy: { id: string; name: string };
  usageCount: number;
  organizationId?: string;
}

export type ICreateAccessCodeModel = Pick<
  IAccessCodeModel,
  'code' | 'startDate' | 'endDate'
> & { createdById: string; organizationId: string };

export type IFindAccessCodeModel = Partial<
  Pick<IAccessCodeModel, 'id' | 'code' | 'organizationId'>
>;

export type IFindAllAccessCodeModel = Required<
  Pick<IAccessCodeModel, 'organizationId'>
>;

type IUpdateAccessCodeEndDate = Required<
  Pick<IAccessCodeModel, 'id' | 'endDate'>
>;
type IUpdateAccessCodeUsageCount = Required<
  Pick<IAccessCodeModel, 'id' | 'usageCount'>
>;

export type IUpdateAccessCodeModel = OneOf<
  [IUpdateAccessCodeEndDate, IUpdateAccessCodeUsageCount]
>;

export class AccessCodeTransformer {
  static fromEntity(entity: AccessCodeEntity): IAccessCodeModel {
    return {
      id: entity.id,
      code: entity.code,
      startDate: entity.startDate,
      endDate: entity.endDate,
      createdBy: {
        id: entity.adminUser?.id,
        name: entity.adminUser?.user?.name,
      },
      usageCount: entity.usageCount,
      organizationId: entity.organizationId,
      updatedOn: entity.updatedOn,
      createdOn: entity.createdOn,
    };
  }

  static toEntity(model: ICreateAccessCodeModel): AccessCodeEntity {
    const entity = new AccessCodeEntity();
    entity.code = model.code;
    entity.startDate = model.startDate;
    entity.endDate = model.endDate;
    entity.createdBy = model.createdById;
    entity.organizationId = model.organizationId;
    return entity;
  }
}
