import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { AnnouncementStatus } from 'src/modules/announcement/enums/announcement-status.enum';
import { AnnouncementExceptionMessages } from 'src/modules/announcement/exceptions/announcement.exceptions';
import { AnnouncementFacade } from 'src/modules/announcement/services/announcement.facade';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { GetOneAnnouncementUseCase } from './get-one-announcement.usecase';

// VIC 2.0 (#504): an active volunteer answers an announcement the app shows them (active, inside its
// display period), with a comment, once.
@Injectable()
export class RespondToAnnouncementUseCase implements IUseCaseService<string> {
  constructor(
    private readonly announcementFacade: AnnouncementFacade,
    private readonly getOneAnnouncementUseCase: GetOneAnnouncementUseCase,
    private readonly volunteerFacade: VolunteerFacade,
    private readonly exceptionsService: ExceptionsService,
  ) {}

  async execute({
    announcementId,
    userId,
    comment,
  }: {
    announcementId: string;
    userId: string;
    comment: string;
  }): Promise<string> {
    const announcement = await this.getOneAnnouncementUseCase.execute({
      id: announcementId,
    });

    const now = new Date();
    const visible =
      announcement.status === AnnouncementStatus.ACTIVE &&
      new Date(announcement.displayStartDate) <= now &&
      (!announcement.displayEndDate ||
        new Date(announcement.displayEndDate) >= now);

    const volunteer = await this.volunteerFacade.find({
      userId,
      organizationId: announcement.organizationId,
    });

    if (!visible || volunteer?.status !== VolunteerStatus.ACTIVE) {
      this.exceptionsService.badRequestException(
        AnnouncementExceptionMessages.ANNOUNCEMENT_006,
      );
    }

    if (await this.announcementFacade.hasResponded(announcementId, userId)) {
      this.exceptionsService.badRequestException(
        AnnouncementExceptionMessages.ANNOUNCEMENT_007,
      );
    }

    return this.announcementFacade.createResponse({
      announcementId,
      userId,
      volunteerId: volunteer.id,
      comment,
    });
  }
}
