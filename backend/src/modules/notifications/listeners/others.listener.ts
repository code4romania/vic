import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { GetOneAnnouncementUseCase } from 'src/usecases/announcement/get-one-announcement.usecase';
import { GetOrganizationUseCaseService } from 'src/usecases/organization/get-organization.usecase';
import { GetManyVolunteersUseCase } from 'src/usecases/volunteer/get-many-volunteers.usecase';
import { In } from 'typeorm';
import { EVENTS } from '../constants/events.constants';
import SendAnnouncementEvent from '../events/others/send-announcement.event';

@Injectable()
export class OthersListener {
  constructor(
    private readonly getOrganizationUseCase: GetOrganizationUseCaseService,
    private readonly getOneAnnouncementUseCase: GetOneAnnouncementUseCase,
    private readonly getManyVolunteersUseCase: GetManyVolunteersUseCase,
    private readonly volunteerFacade: VolunteerFacade,
  ) {}

  @OnEvent(EVENTS.OTHER.SEND_ANNOUNCEMENT)
  async sendSendAnnouncementEvent(
    payload: SendAnnouncementEvent,
  ): Promise<void> {
    const { organizationId, announcementId, targetIds } = payload;
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
    const targetsMails: string[] = [];
    if (targetIds.length === 0) {
      await this.getManyVolunteersUseCase
        .execute({
          limit: 9999,
          page: 1,
          organizationId,
          status: VolunteerStatus.ACTIVE,
        })
        .then((volunteers) => {
          volunteers.items.map((volunteer) =>
            targetsMails.push(volunteer.volunteerProfile.email),
          );
        });
    }

    if (targetIds.length !== 0) {
      await this.volunteerFacade
        .getMany({
          organizationId,
          status: VolunteerStatus.ACTIVE,
          volunteerProfile: {
            departmentId: In(targetIds),
          },
        })
        .then((volunteers) =>
          volunteers.map((volunteer) =>
            targetsMails.push(volunteer.volunteerProfile.email),
          ),
        );
    }
    // TODO: 4. Send push notification to target with announcement link
  }
}
