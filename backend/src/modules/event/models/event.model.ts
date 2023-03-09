import { IBaseModel } from 'src/common/interfaces/base.model';
import {
  ActivityTypeTransformer,
  IActivityTypeModel,
} from 'src/modules/activity-type/models/activity-type.model';
import {
  IOrganizationStructureModel,
  OrganizationStructureTransformer,
} from 'src/modules/organization/models/organization-structure.model';
import {
  IOrganizationModel,
  OrganizationTransformer,
} from 'src/modules/organization/models/organization.model';
import { EventEntity } from '../entities/event.entity';
import { EventAttendOptions } from '../enums/event-attendance-options.enum';
import { EventStatus } from '../enums/event-status.enum';
import { IBasePaginationFilterModel } from '../../../infrastructure/base/base-pagination-filter.model';
import { EventTime } from '../enums/event-time.enum';

export interface IEventModel extends IBaseModel {
  id: string;
  name: string;
  description: string;
  location?: string;

  startDate: Date;
  endDate?: Date;

  status: EventStatus;
  isPublic: boolean;

  // image?: string;
  attendanceType: EventAttendOptions;
  attendanceMention?: string;

  observation?: string;

  organization: IOrganizationModel;
  targets?: IOrganizationStructureModel[];
  tasks: IActivityTypeModel[];
}

export type CreateEventOptions = Pick<
  IEventModel,
  | 'name'
  | 'description'
  | 'location'
  | 'startDate'
  | 'endDate'
  | 'isPublic'
  | 'attendanceType'
  | 'attendanceMention'
  | 'observation'
> & {
  status: EventStatus.DRAFT | EventStatus.PUBLISHED;
  organizationId: string;
  targetsIds: string[];
  tasksIds: string[];
};

export type UpdateEventOptions = Partial<
  Omit<CreateEventOptions, 'status' | 'organizationId'>
>;

export type UpdateStatusOptions = EventStatus.PUBLISHED | EventStatus.ARCHIVED;

export type FindManyEventOptions = Omit<
  IBasePaginationFilterModel,
  'search'
> & {
  organizationId: IOrganizationModel['id'];
  eventTime: EventTime;
};

export class EventModelTransformer {
  static fromEntity(entity: EventEntity): IEventModel {
    if (!entity) return null;

    return {
      id: entity.id,
      name: entity.name,
      startDate: entity.startDate,
      endDate: entity.endDate,
      location: entity.location,
      description: entity.description,

      status: entity.status,
      isPublic: entity.isPublic,

      // image: entity.image
      attendanceType: entity.attendanceType,
      attendanceMention: entity.attendanceMention,

      observation: entity.observation,

      organization: OrganizationTransformer.fromEntity(entity.organization),
      targets: entity.targets?.map(OrganizationStructureTransformer.fromEntity),
      tasks: entity.tasks?.map(ActivityTypeTransformer.fromEntity),

      createdOn: entity.createdOn,
      updatedOn: entity.updatedOn,
    };
  }

  static toEntity(model: CreateEventOptions): EventEntity {
    const entity = new EventEntity();
    entity.name = model.name;
    entity.startDate = model.startDate;
    entity.endDate = model.endDate;
    entity.description = model.description;
    entity.location = model.location;
    entity.isPublic = model.isPublic;
    entity.status = model.status;
    entity.attendanceType = model.attendanceType;
    entity.attendanceMention = model.attendanceMention;
    entity.observation = model.observation;
    entity.organizationId = model.organizationId;
    entity.targets = model.targetsIds?.map(
      OrganizationStructureTransformer.toEntity,
    );
    entity.tasks = model.tasksIds?.map(ActivityTypeTransformer.toEntity);
    return entity;
  }
}
