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
import { EventState } from '../enums/event-time.enum';
import { EventFilterEnum } from '../enums/event-filter.enum';
import { IEventRSVPModel } from './event-rsvp.model';
import { EventRSVPModelTransformer } from './event-rsvp.model';
import { EventVolunteerStatus } from '../enums/event-volunteer-status.enum';

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
  eventRsvps?: IEventRSVPModel[];
}

export interface IEventWithVolunteerStatus
  extends Omit<IEventModel, 'eventRsvps'> {
  volunteerStatus: EventVolunteerStatus;
  numberOfPersonsGoingToEvent: number;
}
export interface IEventsListItemModel
  extends Pick<
    IEventModel,
    | 'id'
    | 'name'
    | 'startDate'
    | 'endDate'
    | 'status'
    | 'isPublic'
    | 'targets'
    | 'location'
  > {
  going: number;
  notGoing: number;

  activityLogged: {
    totalHours: number;
    volunteers: number;
  };
}

export type IEventsMobileListItemModel = Pick<
  IEventModel,
  | 'id'
  | 'name'
  | 'startDate'
  | 'endDate'
  | 'status'
  | 'isPublic'
  | 'targets'
  | 'location'
> & {
  organizationLogo?: string;
};

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

export type FindOneEventOptions = Pick<IActivityTypeModel, 'id'> & {
  userId?: string;
  organizationId?: string;
};

export type UpdateEventOptions = Partial<
  Omit<CreateEventOptions, 'status' | 'organizationId'>
>;

export type UpdateStatusOptions = EventStatus.PUBLISHED | EventStatus.ARCHIVED;

export type FindManyEventOptions = {
  organizationId: IOrganizationModel['id'];
  eventState?: EventState;
} & IBasePaginationFilterModel;

export type FindMyEventsOptions = {
  userId: string;
  eventFilter: EventFilterEnum;
} & IBasePaginationFilterModel;

export type FindOngoingAndFinishedEventOptions = {
  organizationId: string;
  userId: string;
};

export class EventModelTransformer {
  static fromEntityToEventItem(
    entity: EventEntity & { going: number; notGoing: number },
  ): IEventsListItemModel {
    if (!entity) return null;

    const logged = entity.activityLogs?.reduce(
      (acc, curr) => {
        acc.volunteers[curr.volunteerId] = curr;
        acc.totalHours += curr.hours;
        return acc;
      },
      { totalHours: 0, volunteers: {} as Record<string, unknown> },
    );

    return {
      id: entity.id,
      name: entity.name,
      startDate: entity.startDate,
      endDate: entity.endDate,

      status: entity.status,
      isPublic: entity.isPublic,

      going: entity.going,
      notGoing: entity.notGoing,
      location: entity.location,

      // image: entity.image
      targets: entity.targets?.map(OrganizationStructureTransformer.fromEntity),

      activityLogged: {
        totalHours: logged?.totalHours,
        volunteers: Object.keys(logged?.volunteers).length,
      },
    };
  }

  static fromEntityToMobileEventItem(
    entity: EventEntity,
  ): IEventsMobileListItemModel {
    if (!entity) return null;

    return {
      id: entity.id,
      name: entity.name,
      startDate: entity.startDate,
      endDate: entity.endDate,

      status: entity.status,
      isPublic: entity.isPublic,
      location: entity.location,

      // image: entity.image
      targets: entity.targets?.map(OrganizationStructureTransformer.fromEntity),
      organizationLogo: entity.organization?.logo || '',
    };
  }

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
      eventRsvps: entity.eventRSVPs?.map(EventRSVPModelTransformer.fromEntity),

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
