import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { ActionsArchiveEntity } from '../entities/actions-archive.entity';
import { ActionsResourceType } from '../enums/action-resource-types.enum';
import { ActionsType } from '../enums/action-types.enum';

export const TRACK_ACTION_EVENT = 'track.action';

export interface ITrackActionEventModel {
  actionType: ActionsType;
  author: IAdminUserModel;
  resourceType: ActionsResourceType;
  resourceId: string;
  changes: unknown;
}

export type CreateActionArchiveOptions = Pick<
  ITrackActionEventModel,
  'actionType' | 'resourceType' | 'resourceId' | 'changes'
> & { authorId: string };

export class ActionsArchiveTransformer {
  static toEntity(action: CreateActionArchiveOptions): ActionsArchiveEntity {
    const entity = new ActionsArchiveEntity();

    entity.action = action.actionType;
    entity.authorId = action.authorId;
    entity.resourceType = action.resourceType;
    entity.resourceId = action.resourceId;

    entity.changes = action.changes;

    return entity;
  }
}
