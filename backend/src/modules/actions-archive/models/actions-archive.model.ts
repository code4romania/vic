import { IBaseModel } from 'src/common/interfaces/base.model';
import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';
import {
  AdminUserTransformer,
  IAdminUserModel,
} from 'src/modules/user/models/admin-user.model';
import { ActionsArchiveEntity } from '../entities/actions-archive.entity';
import {
  TrackedEventData,
  TrackedEventName,
} from '../enums/action-resource-types.enum';

export const TRACK_ACTION_EVENT = 'track.action';

export interface IActionArchiveModel extends IBaseModel {
  id: string;
  author: IAdminUserModel;

  eventName: TrackedEventName;
  eventData: TrackedEventData[TrackedEventName];

  changes?: unknown;
}

export type CreateActionArchiveOptions = Pick<
  IActionArchiveModel,
  'eventName' | 'eventData' | 'author' | 'changes'
>;

export type FindManyActionsArchiveOptions = {
  organizationId: string;
  authorId?: string;

  actionStartDate?: Date;
  actionEndDate?: Date;
} & IBasePaginationFilterModel;

export class ActionsArchiveTransformer {
  static fromEntity(entity: ActionsArchiveEntity): IActionArchiveModel {
    return {
      id: entity.id,

      author: AdminUserTransformer.fromEntity(entity.author),

      eventName: entity.eventName,
      eventData: entity.eventData,

      changes: entity.changes,

      updatedOn: entity.updatedOn,
      createdOn: entity.createdOn,
    };
  }

  static toEntity(action: CreateActionArchiveOptions): ActionsArchiveEntity {
    const entity = new ActionsArchiveEntity();

    entity.eventName = action.eventName;
    entity.eventData = action.eventData;

    entity.authorId = action.author.id;

    entity.changes = action.changes;

    return entity;
  }
}
