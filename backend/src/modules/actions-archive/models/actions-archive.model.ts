import { IBaseModel } from 'src/common/interfaces/base.model';
import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { ActionsArchiveEntity } from '../entities/actions-archive.entity';
import {
  TrackedEventData,
  TrackedEventName,
} from '../enums/action-resource-types.enum';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { NewsType } from '../enums/news-type.enum';
import {
  BaseUserTransformer,
  ICommonUserModel,
} from 'src/modules/user/models/base-user.model';
import {
  IOrganizationModel,
  OrganizationTransformer,
} from 'src/modules/organization/models/organization.model';

export const TRACK_ACTION_EVENT = 'track.action';

export interface IActionArchiveModel extends IBaseModel {
  id: string;
  author: ICommonUserModel;
  organization: IOrganizationModel;
  eventName: TrackedEventName;
  eventData: TrackedEventData[TrackedEventName];

  changes?: unknown;
}

export type CreateActionArchiveOptions = Pick<
  IActionArchiveModel,
  'eventName' | 'eventData' | 'changes'
> & {
  author: IRegularUserModel | IAdminUserModel;
  organizationId: string;
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

      author: BaseUserTransformer.fromEntity(entity.author),

      organization: OrganizationTransformer.fromEntity(entity.organization),

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

    entity.organizationId = action.organizationId;

    entity.changes = action.changes;

    return entity;
  }
}
