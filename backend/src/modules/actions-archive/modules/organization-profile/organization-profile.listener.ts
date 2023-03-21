import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActionsArchiveEntity } from '../../entities/actions-archive.entity';
import { UpdateResourceEvent } from '../../events/base.events';
import {
  ActionsArchiveType,
  ActionsArchiveTransformer,
  ActionsResourceType,
} from '../../models/actions-archive.model';
import { ORGANIZATION_PROFILE_EVENTS } from './organization-profile.model';

@Injectable()
export class OrganizationProfileListener {
  constructor(
    @InjectRepository(ActionsArchiveEntity)
    private readonly actionsArchiveEntity: Repository<ActionsArchiveEntity>,
  ) {}

  @OnEvent(ORGANIZATION_PROFILE_EVENTS.ALL)
  async onEvent(event: UpdateResourceEvent): Promise<void> {
    console.log(event);
    if (event instanceof UpdateResourceEvent) {
      await this.actionsArchiveEntity.save(
        ActionsArchiveTransformer.toEntity({
          action: ActionsArchiveType.UPDATE,
          authorId: event.createdBy.id,
          organizationId: event.createdBy.organizationId,
          resourceType: ActionsResourceType.ORG_PROFILE,
          resourceId: event.id,
          diff: event.diff,
        }),
      );
    }
  }
}
