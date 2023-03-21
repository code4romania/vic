import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { JSONStringifyError } from 'src/common/helpers/utils';
import { Repository } from 'typeorm';
import { ActionsArchiveEntity } from '../entities/actions-archive.entity';
import { ActivityLogExceptionMessages } from '../exceptions/actions-archive.exceptions';
import {
  ActionsArchiveTransformer,
  ITrackActionEventModel,
  TRACK_ACTION_EVENT,
} from '../models/actions-archive.model';

@Injectable()
export class ActionsArchiveEventListener {
  private logger = new Logger(ActionsArchiveEventListener.name);

  constructor(
    @InjectRepository(ActionsArchiveEntity)
    private readonly actionsArchiveEntity: Repository<ActionsArchiveEntity>,
  ) {}

  @OnEvent(TRACK_ACTION_EVENT)
  async onEvent(event: ITrackActionEventModel): Promise<void> {
    try {
      await this.actionsArchiveEntity.save(
        ActionsArchiveTransformer.toEntity({
          actionType: event.actionType,
          authorId: event.author.id,
          resourceType: event.resourceType,
          resourceId: event.resourceId,
          changes: event.changes,
        }),
      );
    } catch (err) {
      this.logger.log({
        ...ActivityLogExceptionMessages.TRACK_ACTION_ARCHIVE_001,
        error: JSONStringifyError(err),
      });
    }
  }
}
