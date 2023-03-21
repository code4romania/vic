import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ITrackActionEventModel,
  TRACK_ACTION_EVENT,
} from './models/actions-archive.model';

@Injectable()
export class ActionsArchiveFacade {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  trackEvent(data: ITrackActionEventModel): void {
    this.eventEmitter.emit(TRACK_ACTION_EVENT, data);
  }
}
