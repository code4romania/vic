import { IBaseModel } from 'src/common/interfaces/base.model';
import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';
import {
  IOrganizationStructureModel,
  OrganizationStructureTransformer,
} from 'src/modules/organization/models/organization-structure.model';
import { AnnouncementEntity } from '../entities/announcement.entity';
import { AnnouncementStatus } from '../enums/announcement-status.enum';

export interface IAnnouncementModel extends IBaseModel {
  id: string;
  name: string;
  description: string;
  status: AnnouncementStatus;
  organizationId: string;
  publishedOn?: Date;
  targets?: IOrganizationStructureModel[];
  targetedVolunteers?: number;
}

export type CreateAnnouncementModel = Omit<
  IAnnouncementModel,
  'id' | 'updatedOn' | 'createdOn'
> & {
  targetsIds?: string[];
};

export type UpdateAnnouncementModel = Partial<
  Omit<IAnnouncementModel, 'id' | 'updatedOn' | 'createdOn'> & {
    targetsIds: string[];
  }
>;

export type FindAnnouncementModel = Partial<
  Pick<IAnnouncementModel, 'id' | 'organizationId'>
>;

export type FindManyAnnouncementModel = IBasePaginationFilterModel &
  Partial<Pick<IAnnouncementModel, 'organizationId'>>;

export class AnnouncementStructureTransformer {
  static fromEntity(entity: AnnouncementEntity): IAnnouncementModel {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      status: entity.status,
      publishedOn: entity.publishedOn,
      organizationId: entity.organizationId,
      targets: entity.targets?.map(OrganizationStructureTransformer.fromEntity),
      createdOn: entity.createdOn,
      updatedOn: entity.updatedOn,
      targetedVolunteers: entity.targetedVolunteers,
    };
  }

  static toEntity(model: CreateAnnouncementModel): AnnouncementEntity {
    const entity = new AnnouncementEntity();

    entity.name = model.name;
    entity.description = model.description;
    entity.status = model.status;
    entity.publishedOn = model.publishedOn;
    entity.organizationId = model.organizationId;
    entity.targets = model.targetsIds?.map(
      OrganizationStructureTransformer.toEntity,
    );
    entity.targetedVolunteers = model.targetedVolunteers;

    return entity;
  }
}
