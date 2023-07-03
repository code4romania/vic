import { IBaseModel } from 'src/common/interfaces/base.model';
import { TemplateEntity } from '../entities/template.entity';
import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';

export interface ITemplateDownloadModel {
  Denumire: string;
  Utilizari: number;
}

export interface ITemplateModel extends IBaseModel {
  id: string;
  name: string;
  path: string;
  organizationId: string;
  numberOfContracts?: number;
}

export type CreateTemplateOptions = Pick<
  ITemplateModel,
  'name' | 'organizationId' | 'path'
>;

export type UpdateTemplateOptions = Pick<CreateTemplateOptions, 'name'>;

export type FindManyTemplatesOptions = IBasePaginationFilterModel &
  Pick<ITemplateModel, 'organizationId'>;

export type FindTemplateOptions = Partial<
  Pick<ITemplateModel, 'id' | 'organizationId'>
> & { search?: string };

export class TemplateTransformer {
  static fromEntity(
    entity: TemplateEntity & { numberOfContracts?: number },
  ): ITemplateModel {
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
      numberOfContracts: entity.numberOfContracts,
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
