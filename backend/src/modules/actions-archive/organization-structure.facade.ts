import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActionsArchiveEventsMap } from './events/all-events.interface';

@Injectable()
export class ActionsArchiveFacade {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  trackEvent<Name extends keyof ActionsArchiveEventsMap>(
    name: Name,
    data: ActionsArchiveEventsMap[Name],
  ): void {
    this.eventEmitter.emit(name, data);
  }
}
