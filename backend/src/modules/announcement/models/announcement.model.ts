import { IBaseModel } from 'src/common/interfaces/base.model';
import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';
import { AnnouncementEntity } from '../entities/announcement.entity';
import { AnnouncementStatus } from '../enums/announcement-status.enum';
import { AnnouncementType } from '../enums/announcement-type.enum';
import {
  IOrganizationModel,
  OrganizationTransformer,
} from 'src/modules/organization/models/organization.model';

export interface IAnnouncementModel extends IBaseModel {
  id: string;
  name: string;
  description: string;
  status: AnnouncementStatus;
  type: AnnouncementType;
  volunteersNeeded?: number;
  displayStartDate: Date;
  displayEndDate?: Date;
  organizationId: string;
  organization?: IOrganizationModel;
  publishedOn?: Date;
  archivedOn?: Date;
  targetedVolunteers?: number;
}

export type CreateAnnouncementOptions = Pick<
  IAnnouncementModel,
  | 'name'
  | 'description'
  | 'status'
  | 'type'
  | 'volunteersNeeded'
  | 'displayStartDate'
  | 'displayEndDate'
  | 'organizationId'
  | 'targetedVolunteers'
>;

export type UpdateAnnouncementOptions = Partial<
  Omit<CreateAnnouncementOptions, 'organizationId'> &
    Pick<IAnnouncementModel, 'publishedOn' | 'archivedOn'>
>;

export type FindAnnouncementOptions = Partial<
  Pick<IAnnouncementModel, 'id' | 'organizationId'>
>;

export type FindManyAnnouncementOptions = IBasePaginationFilterModel &
  Partial<Pick<IAnnouncementModel, 'status' | 'organizationId' | 'type'>> & {
    userId?: string;
    // only announcements whose display period contains this date
    visibleOn?: Date;
  };

export type FindManyAnnouncementForUserOptions = IBasePaginationFilterModel & {
  userId?: string;
};

export class AnnouncementStructureTransformer {
  static fromEntity(entity: AnnouncementEntity): IAnnouncementModel {
    if (!entity) {
      return null;
    }
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      status: entity.status,
      type: entity.type,
      volunteersNeeded: entity.volunteersNeeded,
      displayStartDate: entity.displayStartDate,
      displayEndDate: entity.displayEndDate,
      publishedOn: entity.publishedOn,
      archivedOn: entity.archivedOn,
      organizationId: entity.organizationId,
      createdOn: entity.createdOn,
      updatedOn: entity.updatedOn,
      targetedVolunteers: entity.targetedVolunteers,
      organization: OrganizationTransformer.fromEntity(entity.organization),
    };
  }

  static toEntity(model: CreateAnnouncementOptions): AnnouncementEntity {
    const entity = new AnnouncementEntity();

    entity.name = model.name;
    entity.description = model.description;
    entity.status = model.status;
    entity.type = model.type;
    entity.volunteersNeeded = model.volunteersNeeded ?? null;
    entity.displayStartDate = model.displayStartDate;
    entity.displayEndDate = model.displayEndDate ?? null;
    entity.publishedOn =
      model.status === AnnouncementStatus.ACTIVE ? new Date() : null;
    entity.organizationId = model.organizationId;
    entity.targetedVolunteers = model.targetedVolunteers;

    return entity;
  }
}
