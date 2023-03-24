import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { ActionsArchiveEntity } from '../entities/actions-archive.entity';
import {
  TrackedEventData,
  TrackedEventName,
} from '../enums/action-resource-types.enum';

export const TRACK_ACTION_EVENT = 'track.action';

export interface ITrackActionEventModel {
  author: IAdminUserModel;

  eventName: TrackedEventName;
  eventData: TrackedEventData[TrackedEventName];

  changes?: unknown;
}

export type CreateActionArchiveOptions = Pick<
  ITrackActionEventModel,
  'eventName' | 'eventData' | 'author' | 'changes'
>;

export class ActionsArchiveTransformer {
  static toEntity(action: CreateActionArchiveOptions): ActionsArchiveEntity {
    const entity = new ActionsArchiveEntity();

    entity.eventName = action.eventName;
    entity.eventData = action.eventData;

    entity.authorId = action.author.id;

    entity.changes = action.changes;

    return entity;
  }
}
