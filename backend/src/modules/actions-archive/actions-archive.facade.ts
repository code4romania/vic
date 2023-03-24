import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IAdminUserModel } from '../user/models/admin-user.model';
import { TrackedEventData } from './enums/action-resource-types.enum';
import {
  CreateActionArchiveOptions,
  TRACK_ACTION_EVENT,
} from './models/actions-archive.model';

@Injectable()
export class ActionsArchiveFacade {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  trackEvent<EventName extends keyof TrackedEventData>(
    eventName: EventName,
    eventData: TrackedEventData[EventName],
    author: IAdminUserModel,
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
}
