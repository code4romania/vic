import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { GetOneAnnouncementUseCase } from 'src/usecases/announcement/get-one-announcement.usecase';
import { GetManyVolunteersUseCase } from 'src/usecases/volunteer/get-many-volunteers.usecase';
import { EVENTS } from '../constants/events.constants';
import SendAnnouncementEvent from '../events/others/send-announcement.event';

@Injectable()
export class OthersListener {
  constructor(
    private readonly getOneAnnouncementUseCase: GetOneAnnouncementUseCase,
    private readonly getManyVolunteersUseCase: GetManyVolunteersUseCase,
    private readonly volunteerFacade: VolunteerFacade,
  ) {}

  @OnEvent(EVENTS.OTHER.SEND_ANNOUNCEMENT)
  async sendSendAnnouncementEvent(
    payload: SendAnnouncementEvent,
  ): Promise<void> {
    const { organizationId, announcementId, targetIds } = payload;
    // 1. Retrive the announcement data
    const announcement = await this.getOneAnnouncementUseCase.execute({
      id: announcementId,
      organizationId,
    });

    // 2. Retrieve the target data
    const targetsMails: string[] = [];
    if (targetIds.length === 0) {
      const volunteers = await this.getManyVolunteersUseCase.execute({
        limit: 0,
        page: 0,
        organizationId,
        status: VolunteerStatus.ACTIVE,
      });

      volunteers.items.map((volunteer) =>
        targetsMails.push(volunteer.volunteerProfile.email),
      );
    } else {
      const volunteers =
        await this.volunteerFacade.findAllActiveByDepartmentIds(targetIds);

      volunteers.map((volunteer) =>
        targetsMails.push(volunteer.volunteerProfile.email),
      );
    }
    // TODO: 3. Send push notification to target with announcement link
  }
}
