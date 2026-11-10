import { IBaseModel } from 'src/common/interfaces/base.model';
import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';
import {
  IRegularUserModel,
  RegularUserTransformer,
} from 'src/modules/user/models/regular-user.model';
import { EventRSVPEntity } from '../entities/event-rsvp.entity';
import { EventRegistrationStatus } from '../enums/event-registration-status.enum';
import { EventModelTransformer, IEventModel } from './event.model';

export interface IEventRSVPModel extends IBaseModel {
  id: string;
  going: boolean;
  mention?: string;

  // #501
  status?: EventRegistrationStatus;
  rejectionReason?: string;
  decidedOn?: Date;
  decidedByName?: string;

  event: IEventModel;
  user: IRegularUserModel;

  volunteerId: string;
}

export type CreateEventRSVPOptions = Pick<
  IEventRSVPModel,
  'going' | 'mention' | 'status'
> & {
  decidedById?: string;
  decidedOn?: Date;
  eventId: IEventRSVPModel['event']['id'];
  userId: IEventRSVPModel['user']['id'];
};

export type UpdateEventRSVPOptions = Pick<IEventRSVPModel, 'going'> &
  Partial<Pick<IEventRSVPModel, 'status' | 'rejectionReason' | 'decidedOn'>> & {
    decidedById?: string;
  };

// B7: what a registration change can do while it holds the lock on its event (see
// EventRSVPRepository.withEventLock): the capacity and the approved count are read under the lock.
export interface IEventRSVPTransaction {
  capacity: number | null;
  countApproved(): Promise<number>;
  findStatus(userId: string): Promise<{
    id: string;
    going: boolean;
    status: EventRegistrationStatus | null;
    rejectionReason: string | null;
  } | null>;
  create(rsvp: CreateEventRSVPOptions): Promise<string>;
  update(
    id: string,
    updates: UpdateEventRSVPOptions & { rejectionReason?: string | null },
  ): Promise<void>;
}

export type FindEventRSVPOptions = Partial<
  Pick<IEventRSVPModel, 'id'> &
    Pick<CreateEventRSVPOptions, 'eventId' | 'userId'>
>;

export type FindManyEventRSVPOptions = Partial<
  Pick<IEventRSVPModel, 'going'> & {
    branch: string;
    department: string;
    role: string;
  }
> & { eventId: string } & IBasePaginationFilterModel;

export class EventRSVPModelTransformer {
  static fromEntity(entity: EventRSVPEntity): IEventRSVPModel {
    if (!entity) return null;
    return {
      id: entity.id,

      going: entity.going,
      mention: entity.mention,

      status: entity.status ?? null,
      rejectionReason: entity.rejectionReason ?? null,
      decidedOn: entity.decidedOn ?? null,
      decidedByName: entity.decidedBy?.name ?? null,

      event: EventModelTransformer.fromEntity(entity.event),
      user: RegularUserTransformer.fromEntity(entity.user),

      volunteerId: entity.user?.volunteer?.[0]?.id ?? null,

      createdOn: entity.createdOn,
      updatedOn: entity.updatedOn,
    };
  }

  static toEntity(model: CreateEventRSVPOptions): EventRSVPEntity {
    const entity = new EventRSVPEntity();

    entity.going = model.going;
    entity.mention = model.mention;
    entity.status = model.status ?? null;
    entity.decidedById = model.decidedById ?? null;
    entity.decidedOn = model.decidedOn ?? null;
    entity.eventId = model.eventId;
    entity.userId = model.userId;

    return entity;
  }
}

// #501: the NGO's list of registrations
export type FindManyEventRegistrationsOptions = {
  organizationId: string;
  status: EventRegistrationStatus;
  eventId?: string;
} & IBasePaginationFilterModel;

export interface IEventRegistrationListItem {
  id: string;
  status: EventRegistrationStatus;
  rejectionReason?: string;
  decidedOn?: Date;
  decidedByName?: string;
  createdOn: Date;
  event: { id: string; name: string; startDate: Date };
  user: { id: string; name: string; email: string };
  volunteerId?: string;
  // the person's status in the organization, null when not a volunteer there
  volunteerStatus?: string;
}
