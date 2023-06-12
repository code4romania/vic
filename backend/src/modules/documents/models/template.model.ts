import { IBaseModel } from 'src/common/interfaces/base.model';
import { TemplateEntity } from '../entities/template.entity';
import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';

export interface ITemplateModel extends IBaseModel {
  id: string;
  name: string;
  path: string;
  organizationId: string;
}

export type CreateTemplateOptions = Pick<
  ITemplateModel,
  'name' | 'organizationId' | 'path'
>;

export type FindManyTemplatesOptions = IBasePaginationFilterModel &
  Pick<ITemplateModel, 'organizationId'>;

export class TemplateTransformer {
  static fromEntity(entity: TemplateEntity): ITemplateModel {
    if (!entity) {
      return null;
    }

    return {
      id: entity.id,
      name: entity.name,
      path: entity.path,
      organizationId: entity.organizationId,
      createdOn: entity.createdOn,
      updatedOn: entity.updatedOn,
    };
  }

  static toEntity(model: CreateTemplateOptions): TemplateEntity {
    const entity = new TemplateEntity();

    entity.name = model.name;
    entity.organizationId = model.organizationId;
    entity.path = model.path;

    return entity;
  }
}
