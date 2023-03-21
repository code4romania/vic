import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActionsArchiveEntity } from '../../entities/actions-archive.entity';
import {
  CreateResourceEvent,
  UpdateResourceEvent,
  DeleteResourceEvent,
} from '../../events/base.events';
import {
  ActionsArchiveType,
  ActionsArchiveTransformer,
  ActionsResourceType,
} from '../../models/actions-archive.model';
import { ORGANIZATION_STRUCTURE_EVENTS } from './organization-structure.model';

@Injectable()
export class OrganizationStructureListener {
  constructor(
    @InjectRepository(ActionsArchiveEntity)
    private readonly actionsArchiveEntity: Repository<ActionsArchiveEntity>,
  ) {}

  @OnEvent(ORGANIZATION_STRUCTURE_EVENTS.ALL)
  async onEvent(
    event: CreateResourceEvent | UpdateResourceEvent | DeleteResourceEvent,
  ): Promise<void> {
    console.log(event);
    if (event instanceof CreateResourceEvent) {
      await this.actionsArchiveEntity.save(
        ActionsArchiveTransformer.toEntity({
          action: ActionsArchiveType.CREATE,
          authorId: event.createdBy.id,
          organizationId: event.createdBy.organizationId,
          resourceType: ActionsResourceType.ORG_STRUCTURE,
          resourceId: event.id,
        }),
      );
    }
    if (event instanceof UpdateResourceEvent) {
      await this.actionsArchiveEntity.save(
        ActionsArchiveTransformer.toEntity({
          action: ActionsArchiveType.UPDATE,
          authorId: event.createdBy.id,
          organizationId: event.createdBy.organizationId,
          resourceType: ActionsResourceType.ORG_STRUCTURE, // TODO: il bag in usecase?
          resourceId: event.id,
          diff: event.diff,
        }),
      );
    }
    if (event instanceof DeleteResourceEvent) {
      await this.actionsArchiveEntity.save(
        ActionsArchiveTransformer.toEntity({
          action: ActionsArchiveType.DELETE,
          authorId: event.createdBy.id,
          organizationId: event.createdBy.organizationId,
          resourceType: ActionsResourceType.ORG_STRUCTURE,
          resourceId: event.id,
          diff: event.diff,
        }),
      );
    }
  }
}
