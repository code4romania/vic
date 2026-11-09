import { EventRegistrationStatus } from '../enums/event-registration-status.enum';
import { IBaseModel } from 'src/common/interfaces/base.model';
import { IActivityTypeModel } from 'src/modules/activity-type/models/activity-type.model';
import {
  IOrganizationStructureModel,
  OrganizationStructureTransformer,
} from 'src/modules/organization/models/organization-structure.model';
import {
  IOrganizationModel,
  OrganizationTransformer,
} from 'src/modules/organization/models/organization.model';
import { EventEntity } from '../entities/event.entity';
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
  // Maximum number of registered volunteers; null = no limit
  capacity?: number;

  startDate: Date;
  endDate?: Date;

  status: EventStatus;
  isPublic: boolean;

  organization: IOrganizationModel;
  targets?: IOrganizationStructureModel[];
  eventRsvps?: IEventRSVPModel[];
}

export interface IEventWithVolunteerStatus
  extends Omit<IEventModel, 'eventRsvps'> {
  volunteerStatus: EventVolunteerStatus;
  numberOfPersonsGoingToEvent: number;
  // #501: the NGO's decision on the volunteer's registration (null when not going)
  registrationStatus?: EventRegistrationStatus;
  rejectionReason?: string;
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
    | 'capacity'
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
  | 'capacity'
> & {
  organizationLogo?: string;
  // redesigned mobile list: the organization on each card and an "Înscris" badge
  organizationId?: string;
  organizationName?: string;
  isGoing?: boolean;
};

export type CreateEventOptions = Pick<
  IEventModel,
  | 'name'
  | 'description'
  | 'location'
  | 'startDate'
  | 'endDate'
  | 'isPublic'
  | 'capacity'
> & {
  status: EventStatus.DRAFT | EventStatus.PUBLISHED;
  organizationId: string;
  targetsIds: string[];
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
  status?: EventStatus;
  departmentId?: string;
} & IBasePaginationFilterModel;

export type FindMyEventsOptions = {
  userId: string;
  eventFilter: EventFilterEnum;
  // mobile search: one organization and/or a start date range (inclusive)
  organizationId?: string;
  startFrom?: Date;
  startTo?: Date;
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

      capacity: entity.capacity,
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

      capacity: entity.capacity,
      targets: entity.targets?.map(OrganizationStructureTransformer.fromEntity),
      organizationLogo: entity.organization?.logo || '',
      organizationId: entity.organizationId,
      organizationName: entity.organization?.name,
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

      capacity: entity.capacity,

      organization: OrganizationTransformer.fromEntity(entity.organization),
      targets: entity.targets?.map(OrganizationStructureTransformer.fromEntity),
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
    entity.capacity = model.capacity ?? null;
    entity.organizationId = model.organizationId;
    entity.targets = model.targetsIds?.map(
      OrganizationStructureTransformer.toEntity,
    );
    return entity;
  }
}

// #493: the events page counters (published events only; a draft or archived event is not happening)
export type EventCountersOptions = {
  organizationId: string;
  departmentId?: string;
};

export interface IEventCountersModel {
  upcoming: number;
  ongoing: number;
  // "going" answers on the upcoming and ongoing events
  participants: number;
}

// #496: volunteers the NGO can add to an event (active, with a profile, in the event's departments)
export type FindEventCandidatesOptions = {
  eventId: string;
  organizationId: string;
  // null or empty: every department
  departmentIds?: string[];
  search?: string;
  volunteerIds?: string[];
};

export interface IEventCandidateModel {
  volunteerId: string;
  userId: string;
  name: string;
  email: string;
  department?: string;
  // approved hours in the organization
  totalHours: number;
  registered: boolean;
}

// #497: one registered ("going") volunteer of an event, with every exportable field
export interface IEventRegistrationExportRow {
  name: string;
  email: string;
  phone: string;
  department?: string;
  branch?: string;
  role?: string;
  hours: number;
  registeredOn: Date;
}
