import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { IAdminUserModel } from '../user/models/admin-user.model';
import { TrackedEventData } from './enums/action-resource-types.enum';
import {
  CreateActionArchiveOptions,
  FindManyActionsArchiveOptions,
  IActionArchiveModel,
  TRACK_ACTION_EVENT,
} from './models/actions-archive.model';
import { ActionsArchiveRepository } from './repositories/actions-archive.repository';
import { IRegularUserModel } from '../user/models/regular-user.model';

@Injectable()
export class ActionsArchiveFacade {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly actionsArchiveRepository: ActionsArchiveRepository,
  ) {}

  trackEvent<EventName extends keyof TrackedEventData>(
    eventName: EventName,
    eventData: TrackedEventData[EventName],
    author: IAdminUserModel | IRegularUserModel,
    changes?: unknown,
  ): void {
    const event: CreateActionArchiveOptions = {
      eventName,
      eventData,
      author,
      changes,
    };
    this.eventEmitter.emit(TRACK_ACTION_EVENT, event);
  }

  async findMany(
    findOptions: FindManyActionsArchiveOptions,
  ): Promise<Pagination<IActionArchiveModel>> {
    return this.actionsArchiveRepository.findMany(findOptions);
  }
}
