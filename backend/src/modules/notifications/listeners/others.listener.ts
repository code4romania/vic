import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { JSONStringifyError } from 'src/common/helpers/utils';
import { AnnouncementExceptionMessages } from 'src/modules/announcement/exceptions/announcement.exceptions';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { GetOneAnnouncementUseCase } from 'src/usecases/announcement/get-one-announcement.usecase';
import { GetManyVolunteersUseCase } from 'src/usecases/volunteer/get-many-volunteers.usecase';
import { EVENTS } from '../constants/events.constants';
import SendAnnouncementEvent from '../events/others/send-announcement.event';

@Injectable()
export class OthersListener {
  private readonly logger = new Logger(OthersListener.name);

  constructor(
    private readonly getOneAnnouncementUseCase: GetOneAnnouncementUseCase,
    private readonly getManyVolunteersUseCase: GetManyVolunteersUseCase,
    private readonly volunteerFacade: VolunteerFacade,
  ) {}

  @OnEvent(EVENTS.OTHER.SEND_ANNOUNCEMENT)
  async sendAnnouncementEvent(payload: SendAnnouncementEvent): Promise<void> {
    try {
      const { organizationId, announcementId, targetIds } = payload;
      // 1. Retrive the announcement data
      await this.getOneAnnouncementUseCase.execute({
        id: announcementId,
        organizationId,
      });

      // 2. Retrieve the target data
      let volunteers: IVolunteerModel[] = [];
      if (targetIds?.length > 0) {
        // give me targeted volunteers
        volunteers = await this.volunteerFacade.findAllActiveByDepartmentIds(
          targetIds,
        );
      } else {
        // give me all
        volunteers = (
          await this.getManyVolunteersUseCase.execute({
            limit: 0,
            page: 0,
            organizationId,
            status: VolunteerStatus.ACTIVE,
          })
        ).items;
      }

      // 3. get all volunteers email
      const targetMails: string[] = [];
      volunteers.forEach((volunteer) =>
        targetMails.push(volunteer.volunteerProfile.email),
      );
      // TODO: 3. Send push notification to target with announcement link
    } catch (error) {
      this.logger.error({
        ...AnnouncementExceptionMessages.ANNOUNCEMENT_004,
        error: JSONStringifyError(error),
      });
    }
  }
}
