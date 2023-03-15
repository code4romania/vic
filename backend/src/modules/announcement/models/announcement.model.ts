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

export type CreateAnnouncementOptions = Pick<
  IAnnouncementModel,
  'name' | 'description' | 'status' | 'organizationId' | 'targetedVolunteers'
> & {
  targetsIds?: string[];
};

export type UpdateAnnouncementOptions = Partial<
  CreateAnnouncementOptions & Pick<IAnnouncementModel, 'publishedOn'>
>;

export type FindAnnouncementOptions = Partial<
  Pick<IAnnouncementModel, 'id' | 'organizationId'>
>;

export type FindManyAnnouncementOptions = IBasePaginationFilterModel &
  Partial<Pick<IAnnouncementModel, 'status' | 'organizationId'>> & {
    targetsIds?: string[];
  };

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

  static toEntity(model: CreateAnnouncementOptions): AnnouncementEntity {
    const entity = new AnnouncementEntity();

    entity.name = model.name;
    entity.description = model.description;
    entity.status = model.status;
    entity.publishedOn =
      model.status === AnnouncementStatus.PUBLISHED ? new Date() : null;
    entity.organizationId = model.organizationId;
    entity.targets = model.targetsIds?.map(
      OrganizationStructureTransformer.toEntity,
    );
    entity.targetedVolunteers = model.targetedVolunteers;

    return entity;
  }
}
