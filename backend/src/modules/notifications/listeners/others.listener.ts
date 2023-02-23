import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { GetOneAnnouncementUseCase } from 'src/usecases/announcement/get-one-announcement.usecase';
import { GetOrganizationUseCaseService } from 'src/usecases/organization/get-organization.usecase';
import { EVENTS } from '../constants/events.constants';
import SendAnnouncementEvent from '../events/others/send-announcement.event';

@Injectable()
export class OthersListener {
  constructor(
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

    // 2. Retrive the announcement data
    const announcement = await this.getOneAnnouncementUseCase.execute({
      id: announcementId,
      organizationId,
    });
    console.log(organization, announcement);

    // TODO: 3. Retrieve the target data
    // TODO: 4. Throw exception if target not found
    // TODO: 5. Send push notification to target with announcement link
  }
}
