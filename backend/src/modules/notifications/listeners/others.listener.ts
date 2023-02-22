import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { AnnouncementExceptionMessages } from 'src/modules/announcement/exceptions/announcement.exceptions';
import { OrganizationExceptionMessages } from 'src/modules/organization/exceptions/exceptions';
import { GetOneAnnouncementUseCase } from 'src/usecases/announcement/get-one-announcement.usecase';
import { GetOrganizationUseCaseService } from 'src/usecases/organization/get-organization.usecase';
import { EVENTS } from '../constants/events.constants';
import SendAnnouncementEvent from '../events/others/send-announcement.event';

@Injectable()
export class OthersListener {
  constructor(
    private readonly exceptionsService: ExceptionsService,
    private readonly getOrganizationUseCase: GetOrganizationUseCaseService,
    private readonly getOneAnnouncementUseCase: GetOneAnnouncementUseCase,
  ) {}

  @OnEvent(EVENTS.OTHER.SEND_ANNOUNCEMENT)
  async sendSendAnnouncementEvent(
    payload: SendAnnouncementEvent,
  ): Promise<void> {
    const { organizationId, announcementId } = payload;
    // 1. Retrieve the organization data
    const organization = await this.getOrganizationUseCase.execute(
      organizationId,
    );

    // 2. Throw exception if organization not found
    if (!organization)
      this.exceptionsService.notFoundException(
        OrganizationExceptionMessages.ORG_001,
      );

    // 3. Retrive the announcement data
    const announcement = await this.getOneAnnouncementUseCase.execute({
      id: announcementId,
      organizationId,
    });

    // 4. Throw exception if announcement not found
    if (!announcement)
      this.exceptionsService.notFoundException(
        AnnouncementExceptionMessages.ANNOUNCEMENT_001,
      );

    // TODO: 5. Retrieve the target data
    // TODO: 6. Throw exception if target not found
    // TODO: 7. Send push notification to target with announcement link
  }
}
