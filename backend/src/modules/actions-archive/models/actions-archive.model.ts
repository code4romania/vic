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
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { NewsType } from '../enums/news-type.enum';

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
  'eventName' | 'eventData' | 'changes'
> & {
  author: IRegularUserModel | IAdminUserModel;
};

export type FindManyActionsArchiveOptions = {
  organizationId: string;
  volunteerId?: string;
  author?: string;

  actionStartDate?: Date;
  actionEndDate?: Date;
} & IBasePaginationFilterModel;

export type FindManyNewsOptions = {
  userId: string;
  events: TrackedEventName[];
  type: NewsType;
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
