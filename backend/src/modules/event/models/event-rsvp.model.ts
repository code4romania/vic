import { IBaseModel } from 'src/common/interfaces/base.model';
import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';
import {
  IRegularUserModel,
  RegularUserTransformer,
} from 'src/modules/user/models/regular-user.model';
import { EventRSVPEntity } from '../entities/event-rsvp.entity';
import { EventModelTransformer, IEventModel } from './event.model';

export interface IEventRSVPModel extends IBaseModel {
  id: string;
  going: boolean;
  mention?: string;

  event: IEventModel;
  user: IRegularUserModel;

  volunteerId: string;
}

export type CreateEventRSVPOptions = Pick<
  IEventRSVPModel,
  'going' | 'mention'
> & {
  eventId: IEventRSVPModel['event']['id'];
  userId: IEventRSVPModel['user']['id'];
};

export type UpdateEventRSVPOptions = Pick<IEventRSVPModel, 'going'>;

export type FindEventRSVPOptions = Partial<
  Pick<IEventRSVPModel, 'id'> &
    Pick<CreateEventRSVPOptions, 'eventId' | 'userId'>
>;

export type FindManyEventRSVPOptions = Partial<
  Pick<IEventRSVPModel, 'going'> & {
    branchId: string;
    departmentId: string;
    roleId: string;
  }
> & { eventId: string } & IBasePaginationFilterModel;

export class EventRSVPModelTransformer {
  static fromEntity(entity: EventRSVPEntity): IEventRSVPModel {
    if (!entity) return null;
    return {
      id: entity.id,

      going: entity.going,
      mention: entity.mention,

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
    entity.eventId = model.eventId;
    entity.userId = model.userId;

    return entity;
  }
}
