import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { AnnouncementStatus } from 'src/modules/announcement/enums/announcement-status.enum';
import { AnnouncementExceptionMessages } from 'src/modules/announcement/exceptions/announcement.exceptions';
import {
  IAnnouncementModel,
  UpdateAnnouncementOptions,
} from 'src/modules/announcement/models/announcement.model';
import { AnnouncementFacade } from 'src/modules/announcement/services/announcement.facade';
import { assertDisplayPeriod } from './create-announcement.usecase';
import { GetOneAnnouncementUseCase } from './get-one-announcement.usecase';

// Edits the content and the display period; status changes go through
// ChangeAnnouncementStatusUseCase. Archived announcements are read-only.
@Injectable()
export class UpdateAnnouncementUseCase
  implements IUseCaseService<IAnnouncementModel>
{
  constructor(
    private readonly announcementFacade: AnnouncementFacade,
    private readonly exceptionsService: ExceptionsService,
    private readonly getOneAnnouncementUseCase: GetOneAnnouncementUseCase,
  ) {}

  public async execute(
    id: string,
    updateData: Omit<
      UpdateAnnouncementOptions,
      'status' | 'publishedOn' | 'archivedOn' | 'targetedVolunteers'
    >,
  ): Promise<IAnnouncementModel> {
    const announcement = await this.getOneAnnouncementUseCase.execute({ id });

    if (announcement.status === AnnouncementStatus.ARCHIVED) {
      this.exceptionsService.badRequestException(
        AnnouncementExceptionMessages.ANNOUNCEMENT_002,
      );
    }

    assertDisplayPeriod(
      updateData.displayStartDate ?? announcement.displayStartDate,
      updateData.displayEndDate === undefined
        ? announcement.displayEndDate
        : updateData.displayEndDate,
      this.exceptionsService,
    );

    return this.announcementFacade.update(id, updateData);
  }
}
